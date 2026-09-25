import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

test('migration and Prisma multi-vehicle/billing regression', { timeout: 60000 }, async t => {
  const db = await PGlite.create();
  const migrations = readdirSync('prisma/migrations').filter(name => /^\d/.test(name)).sort();
  for (const name of migrations.slice(0, -1)) await db.exec(readFileSync(`prisma/migrations/${name}/migration.sql`, 'utf8'));
  await db.exec(`
    INSERT INTO "user" (id,name,email,"updatedAt","emailVerified") VALUES ('legacy','Legacy','legacy@example.test',now(),true), ('other','Other','other@example.test',now(),true), ('orphan','Orphan','orphan@example.test',now(),true);
    INSERT INTO wattup_profiles (id,"userId","updatedAt") VALUES ('profile','legacy',now());
    INSERT INTO vehicles (id,"userId",name,brand,model,"batteryCapacityKwh","plateNumber","updatedAt") VALUES ('original','legacy','Original nickname','Hyundai','Ioniq 5',72.6,'B 1234 EV',now());
    INSERT INTO charging_sessions (id,"userId","vehicleId","inputMode","startedAt","endedAt","durationMinutes","energyKwh","tokenAmount","discountedEnergyKwh","ratePerKwh","discountPercent","baselineCost","actualCost","savingsAmount","shiftScore","updatedAt") VALUES
      ('old','legacy',null,'TOKEN','2026-09-24 15:00','2026-09-24 16:00',60,10,16990,10,1699,30,16990,11893,5097,.9,now()),
      ('unassigned','orphan',null,'KWH','2026-09-24 15:00','2026-09-24 16:00',60,10,null,10,1699,30,16990,11893,5097,.9,now());
  `);
  const before = (await db.query(`SELECT "energyKwh", "actualCost", "savingsAmount", "ratePerKwh", "tokenAmount" FROM charging_sessions WHERE id='old'`)).rows[0];
  await db.exec(readFileSync(`prisma/migrations/${migrations.at(-1)}/migration.sql`, 'utf8'));
  await t.test('migration preserves legacy records, backfills only resolvable sessions and leaves unknown billing unset', async () => {
    assert.deepEqual((await db.query(`SELECT "energyKwh", "actualCost", "savingsAmount", "ratePerKwh", "tokenAmount" FROM charging_sessions WHERE id='old'`)).rows[0], before);
    const old = (await db.query(`SELECT "vehicleId", "billingType" FROM charging_sessions WHERE id='old'`)).rows[0];
    assert.equal(old.vehicleId, 'original'); assert.equal(old.billingType, null);
    assert.equal((await db.query(`SELECT "vehicleId" FROM charging_sessions WHERE id='unassigned'`)).rows[0].vehicleId, null);
    const vehicle = (await db.query(`SELECT * FROM vehicles WHERE id='original'`)).rows[0];
    assert.equal(vehicle.plateNumber, 'B 1234 EV'); assert.equal(Number(vehicle.batteryCapacityKwh), 72.6); assert.equal(vehicle.isPrimary, true);
  });
  const server = new PGLiteSocketServer({ db, port: 0, host: '127.0.0.1' });
  await server.start();
  // A disposable URL only: never read .env or connect to the configured database.
  process.env.DATABASE_URL = `postgresql://postgres:postgres@${server.getServerConn()}/postgres`;
  const { PrismaClient } = await import('../src/generated/prisma/client.ts');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  // PGlite has one connection; exercise real repositories through a single-client pool.
  globalThis.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }) });
  const { prisma } = await import('../src/shared/infrastructure/database/prisma.ts');
  const { mutateVehicle } = await import('../src/modules/vehicles/infrastructure/vehicle-service.ts');
  const { PrismaChargingSessionRepository } = await import('../src/modules/charging/infrastructure/prisma-charging-session.repository.ts');
  const { PrismaUserSetupRepository } = await import('../src/modules/onboarding/infrastructure/prisma-user-setup.repository.ts');
  const { PrismaDashboardRepository } = await import('../src/modules/dashboard/infrastructure/prisma-dashboard.repository.ts');
  const { PrismaAdminDashboardRepository } = await import('../src/modules/admin/infrastructure/prisma-admin-dashboard.repository.ts');
  const charging = new PrismaChargingSessionRepository();
  const setups = new PrismaUserSetupRepository();
  const base = { userId: 'legacy', vehicleId: 'original', inputMode: 'KWH', energyKwh: 10, startedAt: new Date('2026-09-24T22:00:00+07:00'), endedAt: new Date('2026-09-24T23:00:00+07:00') };
  try {
    await t.test('billing completion does not require vehicle onboarding', async () => {
      const setup = await setups.getChargingSetup('legacy');
      assert.equal(setup.hasVehicles, true); assert.equal(setup.billingType, null);
      await assert.rejects(charging.create(base), /Lengkapi/);
      await prisma.wattUpProfile.update({ where: { userId: 'legacy' }, data: { billingType: 'PREPAID' } });
      await assert.rejects(setups.setup('legacy', { vehicleBrand: 'X', vehicleModel: 'Y', electricityRate: 2000, billingType: 'POSTPAID', reminderEnabled: true }), /sudah selesai/);
      assert.equal((await prisma.vehicle.findUnique({ where: { id: 'original' } })).name, 'Original nickname');
    });
    let second;
    await t.test('multiple vehicles get unique labels and default changes are exclusive', async () => {
      await mutateVehicle('legacy', { action: 'edit', id: 'original', brand: 'Hyundai', model: 'Ioniq 5' });
      second = await mutateVehicle('legacy', { action: 'add', brand: 'Hyundai', model: 'Ioniq 5' });
      const third = await mutateVehicle('legacy', { action: 'add', brand: 'Hyundai', model: 'Ioniq 5' });
      assert.equal(second.name, 'Hyundai Ioniq 5 2'); assert.equal(third.name, 'Hyundai Ioniq 5 3');
      await mutateVehicle('legacy', { action: 'default', id: second.id });
      assert.equal(await prisma.vehicle.count({ where: { userId: 'legacy', isPrimary: true } }), 1);
      assert.equal((await setups.getChargingSetup('legacy')).vehicleId, second.id);
    });
    await t.test('ownership, archive and legacy token writes are rejected', async () => {
      for (const action of ['edit', 'archive', 'default']) await assert.rejects(mutateVehicle('other', { action, id: 'original', brand: 'X', model: 'Y' }), /tidak tersedia/);
      await assert.rejects(charging.create({ ...base, userId: 'other' }), /milik akunmu/);
      await assert.rejects(charging.create({ ...base, inputMode: 'TOKEN', tokenAmount: 100000 }), /tidak valid/);
      await assert.rejects(charging.create({ ...base, vehicleId: 'missing' }), /milik akunmu/);
    });
    await t.test('both meter directions save profile snapshots and ignore browser rate/billing/energy overrides', async () => {
      const prepaid = await charging.create({ ...base, inputMode: 'METER', meterBefore: 100, meterAfter: 90, energyKwh: 400, ratePerKwh: 1, billingType: 'POSTPAID' });
      assert.equal(prepaid.energyKwh, 10); assert.equal(prepaid.ratePerKwh, 1699); assert.equal(prepaid.billingType, 'PREPAID');
      await prisma.wattUpProfile.update({ where: { userId: 'legacy' }, data: { billingType: 'POSTPAID', electricityRate: 2000 } });
      const postpaid = await charging.create({ ...base, vehicleId: second.id, inputMode: 'METER', meterBefore: 100, meterAfter: 110 });
      assert.equal(postpaid.energyKwh, 10); assert.equal(postpaid.ratePerKwh, 2000); assert.equal(postpaid.billingType, 'POSTPAID');
      assert.equal(postpaid.shiftScore, prepaid.shiftScore);
      const unchanged = await prisma.chargingSession.findUnique({ where: { id: prepaid.id } });
      assert.equal(Number(unchanged.ratePerKwh), 1699); assert.equal(unchanged.billingType, 'PREPAID'); assert.equal(Number(unchanged.meterBefore), 100);
      await assert.rejects(charging.create({ ...base, inputMode: 'METER', meterBefore: 100, meterAfter: 90 }));
      await assert.rejects(charging.create({ ...base, inputMode: 'METER' }));
      assert.equal((await charging.create(base)).billingType, 'POSTPAID');
    });
    await t.test('dashboard and admin aggregate all vehicles, one user rank and one streak day', async () => {
      const dashboard = await new PrismaDashboardRepository().getUserDashboard('legacy', new Date('2026-09-25T00:00:00+07:00'));
      assert.equal(dashboard.streakDays, 1); assert.equal(dashboard.leaderboard.filter(v => v.userId === 'legacy').length, 1);
      assert.equal(dashboard.totalSavings, 5097 + 5097 + 6000 + 6000);
      const admin = await new PrismaAdminDashboardRepository().getDashboard(new Date('2026-09-25T00:00:00+07:00'));
      assert.equal(admin.participants.filter(v => v.userId === 'legacy').length, 1);
      assert.ok(admin.participants.find(v => v.userId === 'legacy').vehicleName.includes('Hyundai Ioniq 5 2'));
    });
    await t.test('new onboarding creates only brand/model and safely links unassigned legacy sessions', async () => {
      const setup = await setups.setup('orphan', { vehicleBrand: 'Wuling', vehicleModel: 'Air EV', electricityRate: 1699, billingType: 'POSTPAID', reminderEnabled: true });
      assert.equal(setup.vehicles.length, 1); assert.equal(setup.billingType, 'POSTPAID');
      const vehicle = await prisma.vehicle.findUnique({ where: { id: setup.vehicleId } });
      assert.equal(vehicle.name, 'Wuling Air EV'); assert.equal(vehicle.plateNumber, null); assert.equal(vehicle.batteryCapacityKwh, null);
      assert.equal((await prisma.chargingSession.findUnique({ where: { id: 'unassigned' } })).vehicleId, vehicle.id);
    });
    await t.test('streak counts days across vehicles even with more than 365 sessions in a day', async () => {
      const saved = await prisma.chargingSession.findUnique({ where: { id: 'old' } });
      const fields = { ...saved };
      delete fields.id;
      await prisma.chargingSession.createMany({ data: [
        { ...fields, id: 'previous-day', startedAt: new Date('2026-09-23T22:00:00+07:00'), endedAt: new Date('2026-09-23T23:00:00+07:00') },
        ...Array.from({ length: 366 }, (_, index) => ({ ...fields, id: `many-${index}`, vehicleId: index % 2 ? second.id : 'original' })),
      ] });
      const dashboard = await new PrismaDashboardRepository().getUserDashboard('legacy', new Date('2026-09-25T00:00:00+07:00'));
      assert.equal(dashboard.streakDays, 2);
      // Keep the archive assertions focused on their original fixtures.
      await prisma.chargingSession.deleteMany({ where: { id: { startsWith: 'many-' } } });
    });
    await t.test('challenge week reads all sessions instead of the recent-session limit', async () => {
      const { getCurrentWibWeekRange } = await import('../src/shared/domain/wib-date.ts');
      const { start } = getCurrentWibWeekRange(new Date());
      const fields = { ...await prisma.chargingSession.findUnique({ where: { id: 'old' } }) };
      delete fields.id;
      await prisma.chargingSession.createMany({ data: Array.from({ length: 60 }, (_, index) => ({
        ...fields, id: `week-${index}`, startedAt: start, endedAt: new Date(start.getTime() + 3600000),
      })) });
      const sessions = await charging.findCurrentWeekByUserId('legacy');
      assert.equal(sessions.filter(session => session.id.startsWith('week-')).length, 60);
      await prisma.chargingSession.deleteMany({ where: { id: { startsWith: 'week-' } } });
    });
    await t.test('archiving retains session relations and selects a replacement default', async () => {
      await mutateVehicle('legacy', { action: 'archive', id: second.id });
      await assert.rejects(charging.create({ ...base, vehicleId: second.id }), /milik akunmu/);
      const saved = await prisma.chargingSession.count({ where: { vehicleId: second.id } }); assert.equal(saved, 1);
      assert.equal((await setups.getChargingSetup('legacy')).vehicles.some(v => v.id === second.id), false);
      assert.equal(await prisma.vehicle.count({ where: { userId: 'legacy', isPrimary: true } }), 1);
      const recent = await charging.findRecentByUserId('legacy', 10);
      assert.ok(recent.some(v => v.vehicleId === second.id && v.vehicleLabel === second.name));
      const active = await prisma.vehicle.findMany({ where: { userId: 'legacy', archivedAt: null } });
      for (const vehicle of active) await mutateVehicle('legacy', { action: 'archive', id: vehicle.id });
      const setup = await setups.getChargingSetup('legacy'); assert.equal(setup.hasVehicles, true); assert.equal(setup.vehicles.length, 0);
      const replacement = await mutateVehicle('legacy', { action: 'add', brand: 'Hyundai', model: 'Ioniq 5' });
      assert.equal(replacement.isPrimary, true); assert.equal(replacement.name, 'Hyundai Ioniq 5 4');
    });
    await t.test('HTTP APIs require verified authentication and ignore browser identity/rate/billing overrides', async () => {
      globalThis.wattupTestAuth = true;
      const { POST: saveCharging } = await import('../src/app/api/charging-sessions/route.ts');
      const { POST: saveVehicle } = await import('../src/app/api/vehicles/route.ts');
      const { PATCH: saveProfile } = await import('../src/app/api/profile/route.ts');
      const request = (path, body, method = 'POST', origin = 'http://localhost') => new Request(`http://localhost/api/${path}`, {
        method, headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify(body),
      });
      for (const [handler, path, method] of [[saveCharging, 'charging-sessions', 'POST'], [saveVehicle, 'vehicles', 'POST'], [saveProfile, 'profile', 'PATCH']]) {
        globalThis.wattupTestSession = null;
        assert.equal((await handler(request(path, {}, method))).status, 401);
        globalThis.wattupTestSession = { user: { id: 'legacy', emailVerified: false } };
        assert.equal((await handler(request(path, {}, method))).status, 403);
        globalThis.wattupTestSession.user.emailVerified = true;
        assert.equal((await handler(request(path, {}, method, 'https://other.example'))).status, 403);
      }
      const setup = await setups.getChargingSetup('legacy');
      const body = { ...base, vehicleId: setup.vehicleId, userId: 'other', ratePerKwh: 1, electricityRate: 1, billingType: 'PREPAID' };
      const response = await saveCharging(request('charging-sessions', body));
      assert.equal(response.status, 201);
      const result = (await response.json()).data;
      assert.equal(result.userId, 'legacy'); assert.equal(result.ratePerKwh, 2000); assert.equal(result.billingType, 'POSTPAID');
      assert.equal((await saveCharging(request('charging-sessions', { ...body, inputMode: 'TOKEN', tokenAmount: 100000 }))).status, 400);
      assert.equal((await saveCharging(request('charging-sessions', { ...body, vehicleId: 'original' }))).status, 400);
      const foreign = (await setups.getChargingSetup('orphan')).vehicleId;
      assert.equal((await saveCharging(request('charging-sessions', { ...body, vehicleId: foreign }))).status, 400);
      assert.equal((await saveVehicle(request('vehicles', { action: 'archive', id: foreign }))).status, 400);
      assert.equal((await saveProfile(request('profile', { billingType: 'INVALID', electricityRate: 1699 }, 'PATCH'))).status, 400);
      assert.equal((await saveProfile(request('profile', { billingType: 'PREPAID', electricityRate: 1699 }, 'PATCH'))).status, 200);
      assert.equal((await setups.getChargingSetup('legacy')).billingType, 'PREPAID');
      assert.equal((await prisma.chargingSession.findUnique({ where: { id: result.id } })).billingType, 'POSTPAID');
    });
    await prisma.$disconnect();
    await t.test('database rejects a second active default and archived defaults', async () => {
      await assert.rejects(db.exec(`INSERT INTO vehicles (id,"userId",name,"isPrimary","updatedAt") VALUES ('bad','legacy','Bad',true,now())`), /unique/);
      await assert.rejects(db.exec(`UPDATE vehicles SET "isPrimary"=true WHERE id='original'`), /check constraint/);
    });
  } finally { await prisma.$disconnect(); await server.stop(); await db.close(); }
});
