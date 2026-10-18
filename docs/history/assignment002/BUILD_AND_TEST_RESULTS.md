> **Native verification follow-up 01 (17 October 2026):** current outcome is [NATIVE_FOLLOWUP_HANDOFF.md](NATIVE_FOLLOWUP_HANDOFF.md). Native verification remains blocked on this host. See [NATIVE_VERIFICATION_PLAN.md](NATIVE_VERIFICATION_PLAN.md) for the supported-host continuation. The original foundation record below is retained.

# Actual build and test results — Assignment002 /0.2.0

17 October2026. Final executed local suites: **67 passed,0 failed;3 native-stack checks blocked/skipped.** This does not mean the complete MVP or native Supabase security model has passed. Machine-readable results are in `reports/summary.json`, `unit.json`, `integration.json` and `browser.json`.

| Check | Actual result | Evidence / scope |
|---|---|---|
| Fresh `npm ci --audit=false` | Passed;185 packages installed in isolated clean copy | reports/clean-install.log |
| TypeScript typecheck | Passed | reports/typecheck.log and clean-typecheck.log |
| ESLint | Passed | reports/lint.log and clean-lint.log; generated report assets excluded |
| Production asset build | Passed | reports/build.log and clean-build.log; build is not a deployment |
| Prettier check | Passed | reports/format-check.log |
| Unit tests |35 passed /0 failed /0 skipped | contracts, modes, no-RIR progression, safety precedence, effort comparison, scheduling and CSV |
| SQL integration tests |21 passed /0 failed /3 blocked-skipped | Actual PostgreSQL-WASM SQL, RLS, grants, transactional functions, audit/idempotency, restore; not native Auth |
| Chromium browser tests |11 passed /0 failed | Desktop engine at mobile viewport sizes, HTTP auth/tenant access, one-tap/correction/undo/bulk, overlay/timer/drafts, offline queue, scheduling and conflict resolution |
| Fresh SQL-lab initialization | Passed after correction | reports/clean-migrate.log |
| Snapshot backup and restore into new directory | Passed | reports/backup.log, restore.log, restore-proof.json;4 synthetic sessions restored, no source overwrite |
| Runtime-dependency advisory audit |0 reported advisories at execution | reports/dependency-audit.json; runtime dependencies only, not proof of all security |
| Local demonstration | Ran successfully | reports/local-demo-check.json; internal QA screenshots excluded from deliverable |
| Native PostgreSQL/Supabase Auth/Storage | **Blocked, not passed** | reports/environment-blockers.json; three explicit pending cases |
| Physical mobile/VoiceOver/TalkBack | Not run | Deferred real-device/content UX validation |

## What security testing actually proves

Alice/Bob/anonymous contexts execute actual SQL grants/RLS and RPCs in a PostgreSQL engine compiled to WASM. Cross-user reads/parent links/RPC access are denied; direct publication and direct private writes are not granted; receipts deduplicate retries; stale edits conflict; a bad bulk item rolls back the group; invalid values are checked in SQL independently of frontend validation. The browser's local synthetic HTTP sessions also reject wrong passwords, cross-origin mutation and cross-account exports. Policy/grant evidence is in `reports/sql-security-evidence.json`.

The lab's claim context is injected by the trusted local service. Tests do not validate signed JWTs, native database credentials, GoTrue recovery/refresh, invitation delivery, hosted configuration or Storage object policies. Those are not replaced by mocks or claimed as passes: they remain explicit blockers to full F03/native F08 acceptance. No hosted fallback was provisioned.

## Failures encountered and corrected

Earlier browser runs returned3/8,5/8 and7/8 passing as browser flags, selectors and320px input sizing were corrected; the final expanded run is11/11. The original single-process browser option was unstable between contexts and was removed. A locator pointed at a nested label instead of its containing value; it was corrected. The overlay invoker is captured before awaiting device persistence, preserving focus on close. Conditioning reports were moved to separate conditioning-session IDs and targets are rendered from pinned prescription data.

Lint initially found missing/unused bindings, then unintentionally scanned generated third-party browser-report assets; source issues/configuration were corrected. Fresh-source initialization exposed missing parent-directory creation; the constructor now creates it and the clean initialization/build gates pass. See `reports/failure-history.json`. Native UID restrictions remain unresolved rather than bypassed; normal browser-CDN and tsx-CLI IPC failures were handled with local extraction and `node --import tsx` respectively.

## Environment and reproducibility

Node24.19.0/npm11.9.0; exact package versions in lockfile. Chromium153.0.8010.0 from a pinned registry package; PostgreSQL WASM version/policies in sql-security-evidence.json. Linux sandbox exposes only UID0; Docker/Supabase CLI absent. No non-root native PostgreSQL process could be started, and automatic system-user creation was not enabled. The clean-copy check used the delivered source structure without node_modules, build output or prior data. Run suites sequentially against disposable synthetic data; results are scoped to the recorded environment.

## Acceptance disposition

The independently executable foundation work and prototype are delivered. **Assignment002 remains partially complete because actual native Supabase Auth/Storage and native restore verification could not run.** Do not accept the external secure-account milestone, deploy, enroll users or start003 automatically. Consult ACCEPTANCE_COVERAGE.md for the distinction between implemented foundation cases and full blueprint/release cases.
