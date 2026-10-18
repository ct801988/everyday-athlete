# Assignment 003 — No-login local-first pilot foundation

Version 1.0 • proposed for explicit owner approval • 17 October 2026.

## Outcome and limits

A person opens the app without registration, makes a minimal program choice, sees the next prescribed session, records actual work deliberately, resumes after interruption, and can export and restore a complete device-local backup. Each family member uses their own device or browser profile. This is a bounded personal/family pilot candidate, not a public consumer launch or a cloud account system.

This is an incremental extension of Assignment 002 React/TypeScript/Vite code at commit `a4c90778e9e13ed84bb5f2d8531b78a011f4d62f`. Retain the independent repository, history, domain contracts, scheduling/coaching functions, canonical overlays and tests. Do not rebuild the foundation or reopen the completed scientific/architecture assessment. The new work is durable local storage, a no-login path, recoverability, and the minimum UI needed to join those pieces.

## Proposed implementation scope

- Launch into a short program/setup flow without email, password, synthetic-user selection or API availability. Returning visits resume the existing program/session. No account CTA blocks use.
- Foundation is 3 days/week; Strength is 4. Fit remains visibly pending content review and cannot masquerade as an approved training plan. Program descriptions, dates, equipment/units and optional preferred days are sufficient; no new exhaustive questionnaire or account profile.
- Preserve today's workout, suggested-versus-performed distinction, Weight/Reps/Done, optional advanced RIR OFF by default, explicit bulk confirmation, undo/corrections, partial completion, flexible schedules, history, timer and demonstration overlay.
- Make completed records, program/schedule choices, drafts, revisions/audit, effort reports, coaching provenance and preferences authoritative in IndexedDB. A server must not be needed to confirm or reload a workout.
- Make history useful across multiple sessions: planned versus performed dates, actual records with corrections, and comparable-history inputs to deterministic coaching. Avoid new dashboards, leaderboards or novel training rules.
- Keep the conditioning demonstration path and separate recommended/actual Effort Level. Optional actual effort stays null when absent. Conditioning screens remain synthetic until reviewed session content/targets are approved; no invented Fit program.
- Provide full versioned JSON backup download and validated restore with preview, exact-duplicate detection, collision rejection, atomic activation and rollback. CSV remains a convenience report, not a recovery format.
- Add device-save feedback and recovery warnings. A local save is not a file backup. Show the last export time and remind users without claiming that downloading a file proves it was stored safely.
- Plan a locally served app shell with offline reload after an initial successful load. Cache only app assets and approved bundled content; durable records stay in IndexedDB. Add a narrowly scoped service worker if approved with this plan; test update/migration safety. No deployment or remote installation is implied.

## Architecture to implement after approval

Keep existing domain modules and UI components. Introduce a typed persistence boundary with explicit queries and transactional commands: read sessions/history/program state, confirm/correct/undo, complete/reopen, save/reschedule, record/clear effort, save drafts/preferences, export/restore. Enforce runtime contracts at this boundary. The browser adapter owns IndexedDB and is the sole authority for the local pilot. Keep the lab HTTP/PGlite adapter and tests separately runnable for regression; do not route local mode through `/api/me`, `/api/login`, `/api/mutate`, `/api/export` or a test claim shim.

Use a local dataset ID and subject ID for ownership/portability; these are namespacing identifiers, not authenticated identities. Preserve their origin when restoring. Future cloud mapping must be explicit and separately reviewed. No auth token or future cloud ownership is generated from these IDs. Reuse audit/idempotency semantics from the SQL lab; reimplement their enforcement transactionally in the local adapter and prove parity rather than assuming SQL tests cover IndexedDB.

No mandatory new runtime library is required; native IndexedDB with a small wrapper is the default. Any small dependency choice is reversible but must be pinned and license-reviewed. No network analytics, live AI, remote fonts/media, paid service, cloud backup or synchronization is included.

## Milestones and reviewable outputs

| Milestone | Work and deliverables | Exit evidence / dependency |
|---|---|---|
| P01 Baseline and contracts | Branch in existing repo; preservation inventory; versioned local store, persistence boundary and dataset ownership contracts; test fixtures | Original suites reproducible; no destructive migration; proposed schema/backup contracts implemented against synthetic data |
| P02 Local persistence | Transactional actuals/audit/receipts, drafts, program/schedule/preferences, conditioning and history; quota/failure handling; two-tab revision checks | L01–L12, L25–L27; no login/API needed; durable-save feedback only after commit |
| P03 No-login journey | Minimal setup → today's session → summary/history/settings; Foundation3/Strength4; preserve overlay/timer and all logging behavior | L01–L09, L13–L17; synthetic previews labeled; program content gate remains explicit |
| P04 Backup and recovery | JSON export, full validation, preview, restore into new dataset, atomic switch, retained previous dataset and rollback; CSV separate | L18–L24, L28–L29 and real-browser recovery rehearsal; source data unchanged on failed import |
| P05 Offline and resilience | Asset cache, offline restart on supported installed/served origin, update/migration safeguards; accessibility/mobile work | L10–L12, L26–L30; real intended-device results or named blockers |
| P06 Integrated verification and handoff | Full build/typecheck/lint/test rerun, source ZIP, README, reports, known issues, rollback guide, six-part handoff | P01–P05 evidence complete; no silent skip of local data-loss cases; owner review before pilot distribution |

P01 → P02 → P03 → P04 → P05 → P06 is the verification sequence. Content review may proceed independently; missing content must not block storage engineering with synthetic fixtures, but blocks claiming actual training/pilot readiness. Pilot distribution/device access is a separate release dependency. No date or duration estimate is asserted without implementation measurements.

## Exclusions

Cloud accounts/authentication/recovery, hosted Supabase, cloud Storage/backup/sync, cross-device merges, secure profiles within one browser, family dashboards, remote monitoring, analytics, payments, public launch, app stores, live conversational AI, full program authoring/content production, Travel Mode expansion, running/HIIT breadth, physiological sensors and production deployment. Preserve existing synthetic examples instead of creating unreviewed authoritative programs. Do not add an in-app destructive wipe operation in this assignment.

## Deliverables and definition of done

Deliver actual source ZIP with preserved Git history, lockfile, setup/run instructions and stable-origin guidance; tested local adapter, schema/migrations, synthetic fixtures, backup schema/sample synthetic backup, restoration/rollback instructions; actual machine-readable test counts and failure history; local demonstration if supported; scope reconciliation, known issues and milestone handoff. Include actual local browser and intended-device evidence or blockers. Do not include real workout records, credentials, node_modules or screenshots containing private data.

Technical completion requires no sign-in/network dependency for the core path, successful restart and backup/restore tests, truthful transactional-save feedback, no corruption on import/write/update failure, and preserved DEC-006/007/008/009/010 behavior. Cloud test deferrals do not block this local-only gate. Critical local persistence/recovery failures do. Technical completion alone does not authorize family enrollment or make synthetic programs reviewed training content.

## Authorization checkpoint

Approve the bounded P01–P06 plan and proposed defaults in document 05 before implementation. No implementation has started. After implementation, stop for owner review; do not deploy, distribute, enroll testers, expand scope or begin Assignment 004 automatically. Native cloud verification is mandatory again before any later cloud-account pilot and remains an uncompleted Assignment 002 cloud work item.
