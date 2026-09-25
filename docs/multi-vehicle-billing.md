# Multiple vehicles and electricity billing

Implemented on `feat/multi-vehicle-billing`. No commit, push, merge, deployment, production migration, or secret edits were performed.

## Behavior

- `/vehicles` provides brand/model-only vehicle creation and editing, automatic duplicate labels, default selection, archiving, and per-vehicle summaries. `/vehicles/[id]` shows totals and the ten most recent sessions. Archived vehicles remain available in history.
- Archiving the default selects the oldest remaining active vehicle. Archiving the last vehicle preserves dashboard/history access; a new active vehicle is required to charge again. Adding a replacement makes it the default.
- `/profile` edits electricity billing type and rate. New onboarding requires a billing choice. Existing accounts receive `/complete-profile` once, without repeating vehicle onboarding.
- Charging requires an owned, active vehicle and supports direct kWh or meter readings. PREPAID subtracts after from before; POSTPAID subtracts before from after. New TOKEN-purchase submissions are rejected.
- Billing type, electricity rate, discount, calculated values, and meter readings are saved with each new session. The server obtains profile values inside the save transaction; browser-supplied billing type, rate, and user ID are ignored.
- Mutations use a per-user row lock. A partial unique index enforces one active default; a check constraint disallows archived defaults. Labels reserve archived names as well, avoiding historical ambiguity.
- Dashboard, leaderboard, streak, challenge, and admin totals remain user-level. Streak history no longer truncates at 365 sessions; challenge reads the complete current WIB week instead of only 50 recent sessions.
- Existing score and off-peak formulas remain intact. The minimum new direct energy is 0.001 kWh, matching storage precision.
- A redundant mounted-state effect in the sign-out dialog was removed to fix the existing lint failure. Google/email authentication configuration and callbacks remain unchanged.

## Data preservation

Migration `20260925090000_multi_vehicle_billing` retains every legacy column, TOKEN enum value, and recorded financial value. It associates only sessions with a null vehicle ID when an original vehicle exists, and sets original vehicles as defaults before removing the one-vehicle constraint. Original names and optional battery/plate data are retained; edits only affect brand/model/generated name.

Legacy billing types remain null because there is no reliable evidence to infer them. Profile completion does not rewrite historical snapshots. Legacy sessions whose user has no vehicle remain unassigned until their first vehicle onboarding can safely associate them. The vehicle ID and billing snapshot columns stay nullable for these legacy records, while every new application save requires both.

## Verification

Use Node 22.15+ (verified here with Node 22.23.2).

- `npx prisma format` and `npx prisma validate`: passed.
- `npx prisma generate` and `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: all 16 tests passed, covering isolated SQL migration, real Prisma repository, domain, and HTTP authorization regression tests. The suite creates an in-memory PGlite database with a localhost socket; it does not load `.env` or connect to the configured database. Auth is stubbed only at the HTTP test boundary.
- `npm run build`: attempted; this environment restricts Turbopack worker port binding. Initial sandbox execution also blocked Google Fonts downloads.
- `npm run build -- --webpack`: production build passed. Build logs identified a pre-existing invalid `BETTER_AUTH_URL` lacking a URL scheme. Environment files were not changed.
- `git diff --check`: passed; changed files reviewed.

PGlite uses one connection and does not establish real PostgreSQL multi-client concurrency guarantees. Browser rendering, actual Google/email sign-in, and concurrent writes should be smoke-tested in staging with PostgreSQL before release. No live service was deployed or production database queried for testing.

## Manual rollout

1. Back up the production database and rehearse against a staging copy. Confirm the existing three migrations are applied with `npx prisma migrate status --config prisma7.config.ts`. The historical one-vehicle migration must already be compatible with the database; do not modify or bypass its checks.
2. Ensure `BETTER_AUTH_URL` is a full public URL with `https://`, and confirm existing Google callback and email settings. Keep existing secrets unchanged.
3. Build the new application using `npm ci`, `npx prisma generate`, and `npm run build` in your deployment environment. Use `npm run build -- --webpack` if the environment has the same Turbopack restriction. Run `npm test` and lint/type checks in CI.
4. Schedule a brief maintenance window and stop writes from every old application instance. The old Prisma client assumes a unique vehicle per user and is incompatible after multiple vehicles exist; avoid a mixed-version rolling release.
5. Apply `npx prisma migrate deploy --config prisma7.config.ts` using the normal production `DIRECT_URL`. The new migration is transactional and does not delete user records. It takes table/index locks; monitor it during the maintenance window.
6. Start the new application and smoke-test both login methods, one-time profile completion, add/edit/default/archive, both meter directions and direct kWh, history, challenge, leaderboard, and admin. Verify concurrent vehicle additions/default changes and archive-versus-charge on real PostgreSQL. Then reopen writes.
7. Prefer a forward fix if a problem appears. Do not restore the old one-vehicle unique index or old application once users have multiple vehicles. A database restore requires an explicit recovery plan for writes since the backup. Preserve the custom partial index and check constraint in future migrations.

No production rollout steps above have been executed.

## Changed files

- `docs/multi-vehicle-billing.md`
- `package-lock.json`
- `package.json`
- `prisma/migrations/20260925090000_multi_vehicle_billing/migration.sql`
- `prisma/schema.prisma`
- `src/app/(auth)/auth/continue/page.tsx`
- `src/app/(onboarding)/complete-profile/page.tsx`
- `src/app/(onboarding)/onboarding/page.tsx`
- `src/app/(user)/challenge/page.tsx`
- `src/app/(user)/layout.tsx`
- `src/app/(user)/profile/page.tsx`
- `src/app/(user)/sessions/new/page.tsx`
- `src/app/(user)/vehicles/[id]/page.tsx`
- `src/app/(user)/vehicles/page.tsx`
- `src/app/api/charging-sessions/route.ts`
- `src/app/api/onboarding/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/vehicles/route.ts`
- `src/app/globals.css`
- `src/modules/admin/infrastructure/prisma-admin-dashboard.repository.ts`
- `src/modules/auth/presentation/components/sign-out-button.tsx`
- `src/modules/billing/domain/billing.ts`
- `src/modules/billing/presentation/billing-form.tsx`
- `src/modules/charging/application/use-cases/create-charging-session.use-case.ts`
- `src/modules/charging/domain/repositories/charging-session.repository.ts`
- `src/modules/charging/domain/services/calculate-charging-session.ts`
- `src/modules/charging/infrastructure/prisma-charging-session.repository.ts`
- `src/modules/charging/presentation/components/charging-session-form.tsx`
- `src/modules/dashboard/infrastructure/prisma-dashboard.repository.ts`
- `src/modules/onboarding/application/use-cases/setup-user-profile.use-case.ts`
- `src/modules/onboarding/domain/repositories/user-setup.repository.ts`
- `src/modules/onboarding/infrastructure/prisma-user-setup.repository.ts`
- `src/modules/onboarding/presentation/components/user-setup-form.tsx`
- `src/modules/vehicles/domain/vehicle.ts`
- `src/modules/vehicles/infrastructure/vehicle-service.ts`
- `src/modules/vehicles/presentation/vehicle-controls.tsx`
- `src/server/dependencies.ts`
- `src/shared/infrastructure/http/user-api.ts`
- `src/shared/presentation/components/app-navigation.tsx`
- `tests/auth-stub.mjs`
- `tests/domain.test.mjs`
- `tests/integration.test.mjs`
- `tests/register.mjs`
