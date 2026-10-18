# Milestone handoff — mobile workout and basic rest timer v0.4.0-candidate

## 1. Completed versus approved scope

| Approved priority | Delivered status |
| --- | --- |
| iPhone interface first, Winter Strong quality reference | Complete local candidate: clearer hierarchy, synthetic exercise presentation, numeric controls, confirmed-set progress and bottom navigation. Reference read-only; independent React architecture preserved. |
| Approved compact timer | Complete with Ready/Running, manual Start, immediate X/reset/compact Ready, no Pause/Resume, 30/60/120/180 presets, 5–3600 second custom bounds in steps of 5, locked running options, 120 initial preference, Silent default or one short beep. |
| Data/offline/security continuity | Existing domain commands and workflow retained. Schema-1 reader/migration preserves actuals/drafts/history/unknowns and retains old dataset; backups/recovery/offline work in executed tests. Cloudflare gate unchanged and rebuilt package verified locally. |
| Synthetic only and exclusions | Preserved. No mobility, reviewed-content activation, cloud/account expansion, Winter Strong edits, costs, remote pushes, enrollment or deployment. |
| Tests and delivery | Executed evidence, screenshots, source/lockfile, complete Git history bundle, documentation and rollback supplied. Physical-device acceptance remains unverified. |

## 2. Actual build/test results

Build/typecheck/lint passed. Unit 82 passed; SQL integration 21 passed/3 skipped; original lab browser 11 passed; local/mobile browser 56 passed/5 skipped; protected static 19 passed/3 skipped; protected embedded 19 passed/3 skipped. Total 208 passed, 0 failed, 14 skipped; 4 additional package/copy checks passed. Development failures and remedies are recorded in TEST_RESULTS.md, with initial evidence retained. Native Supabase and physical devices were not silently substituted with mocks and called passed.

## 3. Files created or modified

Runtime: src/local/LocalApp.tsx, local.css, model.ts, backup.ts, store.ts; new timer.ts and RestTimer.tsx. Shared overlay and synthetic fixtures: src/components/DemoOverlay.tsx, src/domain/fixtures.ts. Tooling: package.json/lockfile, playwright.local.config.ts, ESLint ignores, protected-test evidence destination option, review candidate build/QA scripts. Tests: preserved acceptance.spec.ts with approved timer assertions updated; new mobile-timer.spec.ts and timer.test.ts. Artifacts: preview exact asset allowlist/manifests, review-candidate Worker/copy helper/hash metadata, reports/mobile-timer, docs/mobile-timer, Decision Register v0.8, current-authority pointer, README and changelog. Exact full lists and hashes are in SOURCE_MANIFEST.json and FILES_CHANGED.txt. Historical packages, research/architecture, native migrations and Git history remain.

## 4. Outstanding bugs, risks and decisions

No unresolved failing automated test. Real iPhone Safari/PWA/keyboard/safe-area/VoiceOver/sound/Files checks remain; no real-device certification. Cached offline copies cannot be revoked by rotating the shared password. Local browser records and exported JSON are not encrypted secure cloud backups. Device clock changes can alter restored countdown behavior. At-most-once audio may be dropped after a crash; background/restored expiry intentionally has no delayed sound. Native Supabase remains deferred until future cloud accounts. No approved rest recommendations or real programs were activated. See KNOWN_ISSUES_AND_APPROVALS.md.

## 5. Recommended next assignment

After owner review, separately authorize controlled replacement of the existing private preview with this exact reviewed candidate, preserve the same origin/secret and export current iPhone data first, then perform the physical-device checklist. Keep a compatible backup and old Worker ready; prefer forward repair if schema-2 data exists. Scope any fixes from actual device findings before adding more features. Mobility/program content remains a separate future authorization and qualified-content gate.

## 6. Owner approval required

Approve or request changes to this candidate's UI/timer and migration behavior. Explicit approval is required before replacing the current Cloudflare preview. No deployment, next assignment, real-program activation or family enrollment follows automatically. No paid service or permanent branding is proposed. This package is suitable for review in the project strategy conversation.
