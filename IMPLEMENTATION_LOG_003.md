# Assignment 003 implementation log

Baseline: a4c90778e9e13ed84bb5f2d8531b78a011f4d62f, clean independent repository; new branch assignment-003-local-first. Assignment 002 App, domain modules, SQL migrations and regression test files retained.

## P01 — contracts and preservation

Added strict versioned local dataset/backup contracts, canonical checksums and duplicate-key-aware bounded JSON parser. Retained approved handoff copies and plan. No lab data automatically imported. No cloud/auth mapping. Initial typecheck/lint passed; existing +8 new unit tests passed (43 total). Native checks remain deferred, not passed.

## P02 — local transaction implementation

Added browser IndexedDB adapter, transaction-complete save semantics, dataset/record revision guards, receipt replay checks, correction/history audits, snapshot restore staging/atomic active-pointer switching and previous-dataset rollback. Browser database is separate from existing lab drafts. Uses an aggregate per dataset for atomicity and simple export at pilot scale, rather than premature per-entity stores; dataset/meta are separate stores. Explicit import/record limits apply; no high-volume scalability claim. Real IndexedDB tests are in progress, not yet certified.

## P03–P05 — integrated preview in progress

Added no-login local UI while preserving original lab App as a separate entry mode, reused overlay and domain scheduling/coaching. Added no-network asset-cache shell and separate test build/harness. Full browser security/persistence/recovery verification is in progress. Test-only harness is excluded from normal app builds.

No external costs, remote operations, deployment, real-user enrollment or Winter Strong modifications. Content remains synthetic software demonstration only.

## P02 closure

Real IndexedDB tests now verify atomic mutation/audit/receipt behavior, replay conflicts, stale tabs, write abort/quota safeguards and durable browser restart. Failed draft edits remain visible and flagged, with backup/update blocked until resolved. Ownership is local namespacing, not authentication.

## P03 closure

No-login setup/core screens are implemented. Reused the canonical overlay and domain contracts/functions. Captured DOM event values synchronously before async writes; fixed program/session/context persistence. Original lab source remains unchanged; entry and lab starter select mode explicitly. Current local browser scenarios pass, with a synthetic demonstration week only.

## P04 closure

Versioned JSON browser download/import, bounded duplicate-key-aware parser, SHA-256 corruption detection, reference/conflict validation, preview/cancel, pre-export check, atomic pointer activation and reversible retained datasets verified by browser tests. Added validated synthetic backup fixture. Parser budget is enforced before local writes to avoid creating non-exportable state. Aggregate snapshots intentionally trade large-volume scale for simple atomic pilot recovery; no capacity/pruning guarantee.

## P05 closure

Production offline shell tested with actual service-worker caching/startup/reload and explicit updates. Fixed navigation interception and Vary-sensitive immutable-asset cache lookup. Added responsive wrap bounds, stable tab-source notifications, keyboard/focus/axe checks and desktop/Android touch simulations. Physical iPhone/Android and VoiceOver/TalkBack are unavailable: three explicit local skips, not certified. Prior source log entries describe intermediate states; this section records completion.

## P06 closure

Fresh npm ci, typecheck, lint, build, 44 unit +21 SQL-WASM +11 preserved lab browser +36 local browser tests passed. Six explicit skips total:3 native cloud and3 device/accessibility. Historical failed/interrupted runs retained; final failures0. Sequential runs and separate artifact directories corrected a test-output collision. Current build excludes test harness/lab auth markers. README, recovery/iPhone guidance, changelog, known issues, coverage matrix, milestone handoff, manifests and source/history package prepared for review. No remote/cost/deployment/enrollment/Assignment004.

Final review correction: retained the original performed date across reopen/correction/finalization, added a specific unit regression, and reran unit/local browser/typecheck/lint/build successfully (44 unit,36 local browser; prior SQL/lab suites unchanged). Rollback clears only stale in-memory draft buffers after switching datasets.
