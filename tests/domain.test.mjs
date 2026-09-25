import test from 'node:test';
import assert from 'node:assert/strict';
import { meterEnergy } from '../src/modules/billing/domain/billing.ts';
import { generateVehicleLabel, validateVehicle } from '../src/modules/vehicles/domain/vehicle.ts';
import { calculateChargingSession } from '../src/modules/charging/domain/services/calculate-charging-session.ts';

test('automatic labels disambiguate duplicates including archived labels and case differences', () => {
  assert.equal(generateVehicleLabel('Hyundai', 'Ioniq 5', []), 'Hyundai Ioniq 5');
  assert.equal(generateVehicleLabel('Hyundai', 'Ioniq 5', ['hyundai ioniq 5', 'Hyundai Ioniq 5 2']), 'Hyundai Ioniq 5 3');
  assert.deepEqual(validateVehicle(' Hyundai ', 'Ioniq   5'), { brand: 'Hyundai', model: 'Ioniq 5' });
  for (const value of ['', ' '.repeat(4), 'a'.repeat(61), null]) assert.throws(() => validateVehicle(value, '5'));
});
test('meter energy follows billing direction and rejects invalid readings', () => {
  assert.equal(meterEnergy('PREPAID', 100, 91.25), 8.75);
  assert.equal(meterEnergy('POSTPAID', 100, 108.75), 8.75);
  assert.equal(meterEnergy('PREPAID', 10, 9.999), .001);
  for (const [type, before, after] of [['PREPAID', 10, 20], ['POSTPAID', 20, 10], ['PREPAID', 10, 10], ['PREPAID', -1, -5], ['POSTPAID', 0, 501], ['POSTPAID', NaN, 1], ['POSTPAID', 0, Infinity]]) {
    assert.throws(() => meterEnergy(type, before, after));
  }
});
test('off-peak costs and score remain unchanged across billing methods', () => {
  const input = { inputMode: 'KWH', startedAt: new Date('2026-09-24T22:00:00+07:00'), endedAt: new Date('2026-09-25T05:00:00+07:00'), energyKwh: 10, ratePerKwh: 1699, discountPercent: 30 };
  const result = calculateChargingSession(input);
  assert.equal(result.offPeakRatio, 1);
  assert.equal(result.savingsAmount, 5097);
  assert.equal(result.actualCost, 11893);
  assert.ok(result.shiftScore > .8 && result.shiftScore <= 1);
  const partial = calculateChargingSession({ ...input, startedAt: new Date('2026-09-24T21:00:00+07:00'), endedAt: new Date('2026-09-24T23:00:00+07:00') });
  assert.equal(partial.offPeakRatio, .5);
  assert.equal(partial.savingsAmount, 2548.5);
  for (const energyKwh of [0, .0001, -1, NaN, Infinity, 501]) assert.throws(() => calculateChargingSession({ ...input, energyKwh }));
});
