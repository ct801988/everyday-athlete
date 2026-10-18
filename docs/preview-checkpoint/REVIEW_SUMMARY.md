# Owner-only iPhone preview — provisional checkpoint

Owner date: October17,2026 (America/Chicago). Working application: https://fitness-pilot-preview.thompson-chad1988.workers.dev/ . Temporary visible name Fitness App Preview. Internal working project Everyday Athlete. Review package is a source/evidence handoff, not a new release or deployment instruction.

**Status: the owner deployed the app and confirmed basic iPhone behavior. N04 is published with provisional verification; full acceptance remains incomplete.** Do not equate a working URL with every security, platform or recovery requirement passing.

## What worked

Owner reports: entries persist after reopening, JSON backup saves to Files, cached app reopens in Airplane Mode with prior entries, and same-file import leaves the same information visible. These are useful actual device observations, not automated certification. The physical device/model/iOS version were not collected. Same-file import is a limited duplicate/import check; no wiped-store, replacement, lost-device or cross-device recovery was performed. No user was instructed to delete browser data.

Agent ran25 live negative-access checks: root plus every published static file with no credential and an invalid synthetic credential, plus three sensitive/unknown paths without credentials. All25 returned401, transport succeeded, zero failures. This proves denial for those exact requests at that time. It does not prove authenticated byte fidelity, routing aliases, warmed-edge separation or hosted CPU budget. reports/live-preview contains the actual case results and owner-report record.

The existing local suite evidence remains:56unit,21SQL-WASM integration,11lab-browser,36local-browser and19standard preview cases passed;9skipped placeholders. New dashboard packaging:19native workerd/Chromium cases passed,3skipped;3copy-helper checks passed.165passes across reported suites,0final failures,12skipped placeholders with overlapping device/live/cloud limitations.25additional live negative-access checks are reported separately. No new test rerun was needed for this documentation-only checkpoint; existing failed attempts and corrections remain preserved.

## Product assessment

This is the actual functional foundation with synthetic workouts, deliberately basic forms and a rough workflow. It is not a polished consumer app or approved training program. Owner feedback: the current interface looks bad. That is an outstanding usability issue, not dismissed as a testing misunderstanding. The preview's purpose is now established; additional infrastructure is not the next priority.

Next recommendation: a separately authorized iPhone workout-usability/basic-timer milestone, based on the already documented U01–U03 proposal. Retain working logging, storage, backup and offline code; improve plain-language setup/weekday selection and workout layout, then the compact Ready/Running timer with X/reset and no Pause/Resume. Keep practical screen improvements bounded; obtain scope approval before code. Mobility and reusable exercise-library extensions follow in U04–U06 after timer review. No program prescriptions or media become authoritative before qualified content/evidence review. No new assignment begins automatically.

## Remaining acceptance gates

- Actual Workers Free subscription/add-ons and no incurred billable charges confirmed by account owner; provider request/CPU limits and hosted workload budget not independently verified.
- Authenticated edge payload/hash/functional verification, alternate/version URL inventory and warm shared-cache isolation not completed by agent. Exact native bundle passed local tests, not hosted certification.
- Real iPhone Add to Home Screen, Safari-vs-installed storage behavior, offline cold launch in installed mode, update/migration and version rollback, accessibility/VoiceOver, small-screen edge cases, interruptions and cross-tab conflict behavior remain untested on device.
- Backup download and same-file import are reported successful. Full replacement recovery/rollback, invalid-file rejection and mobile Files selection edge cases rely on local automated evidence until explicitly tested on device.
- Synthetic training only. No real program, family enrollment, cloud account/backup, payments or permanent branding. Native Supabase remains deferred, not waived.
- Retained authorized offline copies cannot be remotely revoked by password rotation. Workout data/backups are local and not encrypted external backup.

## Actions requiring owner approval

Review this provisional milestone and remaining verification gaps. Approve a scoped next implementation assignment before usability/timer work; confirm proposed default/migration/alert policies listed in the implementation proposal. Real training content and wider distribution have separate approval gates. N04 authorization already exists and is not requested again. No further edits, deployment, spending, remote Git or Winter Strong changes were made for this checkpoint.
