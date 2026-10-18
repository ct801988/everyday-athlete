# Local-first backup, restore and rollback — v0.3.0

All steps use synthetic data until training/pilot approval. Browser database: `everyday-athlete-local`, physical IndexedDB version2, logical dataset schema1. The older `everyday-athlete-foundation` draft store and PGlite lab directory are untouched. This app provides no secure same-profile multi-user separation or cloud backup.

## Recovery rehearsal

1. In the same stable origin/profile, log one synthetic set, correct it, finish partial and leave an unconfirmed draft. Note dates, actuals and optional unknown fields.
2. Open Backup. Export full JSON and keep the downloaded file outside browser storage. Record its location. Backups are unencrypted; do not publicly share private history.
3. Open a different normal browser profile at the same app address, choose the JSON via Import, inspect preview, acknowledge origin/replacement and confirm. Verify the restored performed set, audit, draft, schedule, pinned prescription, null RIR/effort and session status. Resume the partial session.
4. On nonempty target data, export its current revision before confirming another restore. A later edit invalidates that export-for-restore check. Exact duplicates do nothing. Different same-revision payloads or pinned identities are rejected, not merged.
5. To return after a successful restore, export the now-active dataset, then deliberately choose Return to pre-restore data. Both workspaces remain distinct. Post-restore edits are not merged into the previous one. Export before further switches.

Failed parse/checksum/version/reference validation, missing acknowledgement/export, quota failure, interrupted transaction and stale previews leave the original active pointer/data intact. Previous datasets are retained without automatic destructive cleanup; storage consumption may eventually require a separately reviewed archival/cleanup workflow. Internal copies share the same browser/device failure domain and do not survive clearing/browser loss.

## Format and validation

Version1 JSON envelope contains app/format/schema versions, origin IDs, export time/ID, full dataset and SHA-256 checksum of canonical body. It preserves prescriptions separately from drafts/actuals, schedule/actual dates, preferences/timers, effort reports, audit/replay receipts and synthetic content/rule/evidence provenance. Checksum is corruption detection, not authenticity or encryption.

Limits: 20MiB UTF-8, nesting depth32, at most100,000 JSON value nodes, at most1000 sessions/20 actuals per session and30,000 audit events, plus strict field lengths/ranges. The JSON-node cap is intentionally more conservative than the planning record-count allowance. It can be reached well before those entity limits. Writes are refused before crossing the parser's exportable envelope budget; no silent audit pruning. Export is also self-checked against parser bounds. These are pilot guards, not a claim of large-volume capacity. Unsupported formats/future schemas, duplicate/unsafe keys, unknown canonical content, invalid references, contradictory identity/revision data and nonfinite/out-of-range values are rejected. Imported strings render as inert text; no imported script or media URL is fetched.

## Storage failures and updates

A saved badge follows transaction completion. If a write fails, prior durable state remains; attempted draft values stay visible as unsaved for correction or explicit discard. Do not close while Saving or while unsaved values are flagged. Requesting browser persistent storage may reduce eviction risk but is not a backup or guarantee. Private browsing is not supported for durable use. If storage is unavailable, the app reports an error and cannot claim a saved workout.

Database upgrade from the populated physical v1 layout to v2 and upgrade-abort preservation are tested. Future versions fail closed. No delete-and-recreate migration is used. Service-worker updates wait for explicit activation and do not erase IndexedDB. Keep the origin stable; changing a port/domain/browser profile creates a separate storage area.

## Code rollback and repository restoration

The delivery includes `everyday-athlete-history.bundle` alongside the source folder. Restore history into a **new directory** with `git clone everyday-athlete-history.bundle everyday-athlete-restored`, then `git -C everyday-athlete-restored remote remove origin` (the origin is only the local bundle path). Existing local repo history is already intact. Do not reset an existing working tree or database to demonstrate rollback.

Return to the Assignment002 tag only in an isolated worktree/profile; that version does not understand the new local store or browser JSON backups. Preserve/export local data before changing versions. No downgrade converter or Winter Strong import is supplied. Never point the lab claims bootstrap or database tools at a future real Supabase service.

## Deferred native recovery

Browser JSON restoration is not native PostgreSQL/Auth/Storage restoration. The latter remains unverified and mandatory before future cloud accounts. Retained `NATIVE_VERIFICATION_PLAN.md` describes that separate gate; DEC-011 removes it only as a prerequisite for this local-only software preview.
