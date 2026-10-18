# Backup, migration and rollback

## Before any later owner-approved preview replacement

1. In the current iPhone preview open Backup → Export full backup → Save to Files. Confirm the JSON file exists outside Safari. Keep it unchanged and note the preview URL and current version. A download attempt alone is not proof that Files retained it.
2. Keep the existing Cloudflare secret and exact host configuration unchanged. Never copy the password into the application, Git, ZIP or chat. Candidate replacement is not authorized by this handoff.
3. Close other app tabs before a later update. On the same HTTPS origin, cached app updates wait for explicit “Apply cached app update”; saved records stay in the same IndexedDB database. Different origins/browsers/Home Screen contexts may expose different storage. Do not clear browsing data or unregister the app as a troubleshooting shortcut.

## What the candidate does on first open

The old schema-1 active dataset is validated, copied into schema 2, then atomically activated at a new key. Exact pre-upgrade data stays at the old key. Metadata also retains the previous pre-restore pointer. Failure aborts the entire transaction; it never falls back to empty history. Paused/expired legacy timers return Ready with an initial 2:00/Silent preference; workout records are unchanged. After upgrade export a new full backup. Backup → Export pre-upgrade v1 backup separately downloads the retained old dataset, suitable for the old app's strict reader. No user data is included in this deliverable.

## Restore with the candidate

Open Backup, choose the JSON file from Files, read the dataset/session/revision and conversion preview, and cancel if unexpected. Exact duplicates are no-ops. Conflicting identities/revisions/prescriptions are rejected. To activate another valid dataset, export current data first and acknowledge replacement. Activation is atomic and retains the previous dataset. No silent merge/overwrite occurs. To return to that previous dataset, first export the current data, then Return to pre-restore data. Failed validation, storage failure and stale-tab edits must not replace the active history. Reopen/reload device data only after keeping any unsaved corrections.

## Code rollback requires compatible data

Do not simply reinstall v0.3.2 against schema-2 data: the old strict validator will refuse it. Prefer a forward repair while keeping current data. If old code is required, preserve BOTH the current schema-2 export and pre-upgrade v1 export. A developer should rehearse restoring the v1 file in an isolated browser profile running the old Git tag, compare actuals/drafts/scheduling/unknown fields, and obtain owner approval before any live rollback. The v1 file omits post-upgrade work: this is disclosed data loss if chosen as the active workspace. Never silently discard those later records or down-convert them. Keep them for a later reviewed reconciliation.

The retained old dataset is an additional recovery copy on the same device, not a secure external backup. Clearing browser/site data deletes both. Browser-local data is not encrypted or isolated among people sharing the same browser profile. The shared preview password gates network assets; it does not revoke already cached offline copies or protect files exported to Files.

## Source/history recovery

The ZIP supplies the complete local Git history as everyday-athlete-history.bundle and an exact source snapshot. On a developer machine: `git clone everyday-athlete-history.bundle everyday-athlete`; select branch `mobile-workout-timer-candidate` or tag `mobile-workout-timer-v0.4.0-candidate`. The prior owner preview tag is `owner-iphone-preview-checkpoint-v0.3.2`; Assignment 003 remains in history. Use a separate checkout/profile for comparison. No remote exists or is required. Dependencies are restored with `npm ci`; no credentials are required for local synthetic testing.
