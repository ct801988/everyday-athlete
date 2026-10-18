# Proposed local data and recovery contract

Version 1.0 • design for review, not an implemented schema or tested backup format.

## Device-local authority

Use a new versioned IndexedDB database, separate from the foundation's `everyday-athlete-foundation` v1 draft cache. Suggested database name: `everyday-athlete-local`; schemaVersion 1 initially. This protects old synthetic lab data and keeps migration explicit. No mandatory PGlite WASM payload or Node API is needed for the browser pilot. Store normalized data behind the adapter, with runtime validation and stable UUIDs.

| Proposed store | Required data / invariant |
|---|---|
| datasets / active metadata | Dataset ID, local subject ID, schema version, revision, created/updated timestamps, active pointer, migration provenance, import origin |
| programs / canonical references | Pinned program/exercise/rule/evidence versions, exact prescriptions needed to interpret history, review status and content IDs; no dangling references after restore |
| enrollment / schedules | Choice and frequency, timezone/date conventions, preferred days, stable ordered slot IDs, scheduled vs performed dates, revisions and reschedule history |
| sessions / actuals | Immutable prescription snapshot plus explicit performed values, completion status, separate row revisions; no automatic conversion of drafts into actuals |
| drafts / timer / preferences | Editable suggestions, unfinished session, UI tab/exercise/scroll where feasible, deadline/paused timer, units and optional RIR default OFF |
| effort reports | Session target lives with prescription; independently revised actual value/null, scale/version, source and time |
| audit / receipts | Correction/undo/session/schedule/import events, mutation ID and payload fingerprint, prior/revised values; atomic with mutation |
| recommendations | Rule/version, program/phase, comparable actual input IDs and revisions, evidence references, reason/uncertainty; no invented evidence |
| backup metadata | Last export attempt/successful file creation, restore fingerprint/time, validation version; no claim a file has been retained off-device |

Commit a user's deliberate Done action and audit/receipt in a single readwrite transaction. Show “Saved on this device” only after transaction completion. Suggested or edited values remain drafts until Done. Draft autosave may be debounced, but show pending/failed state; confirmed records must not wait on a long debounce. A failed write retains the edit and displays retry/export-recovery guidance without pretending it was durable. Do not silently fall back to volatile memory as though persistence succeeded.

Idempotency keys deduplicate the same deliberate mutation; a reused key with different payload is an error. Per-record expected revision plus dataset revision prevent stale-tab overwrites. Serialize conflicting writes transactionally; BroadcastChannel may notify other tabs but is not the concurrency lock. Restore and migrations acquire an exclusive logical operation lock with transactional revision checks; stale tabs must reopen/reload the active dataset. Keep outbox concepts only where meaningful for local commands; remove account sync requirements from the pilot journey.

Browser-profile boundaries are practical storage boundaries, not secure identity controls. Same-profile users and anyone with device access can access local records. No custom PIN/encryption or medical-grade confidentiality is claimed. Use no third-party telemetry; avoid personal identifiers beyond a local optional display label. Export may contain private training data. Scripts, backups and renderers must treat imported text as untrusted, never HTML or executable instructions.

## Full-fidelity backup format

Propose JSON with `format: everyday-athlete-backup`, independent `formatVersion`, schemaVersion, appVersion, export ID/time, dataset/subject origin IDs, source dataset revision, all relevant records and pinned interpretation/provenance. Include drafts and preferences; never include cloud credentials or synthetic session cookies. Derive a stable canonical serialization for content SHA-256 and a separate normalized dataset fingerprint for exact duplicate detection. A checksum detects corruption, not authenticity; it is not encryption or a signature.

Make export from a consistent transaction/snapshot at one dataset revision. Mark the export's source revision so later edits aren't accidentally represented as included. Do not clear pending drafts or modify performed history on export. Include program/prescription and canonical textual reference versions needed for offline interpretation; do not embed arbitrary remote code or fetch imported media URLs. Cache only approved bundled media. If a media version is unavailable, show a labeled unavailable reference without inventing form instruction. CSV is human-readable analysis only and does not support full restore; preserve formula-injection escaping.

Proposed import limits for review: 20 MiB UTF-8 JSON; at most 100,000 total structured records and 50,000 actual-set records; depth at most 32; finite bounded fields and lengths. Check file size before parsing, parse safely, then validate format/version and every nested record. Limits are engineering defaults to test on target phones, not established capacity claims. Reject unsupported versions, truncated/corrupt input, type/range violations, invalid IDs, duplicate keys/record IDs, conflicting references, impossible revisions and oversized/deep input. Plain JSON.parse silently collapses duplicate object keys; choose a duplicate-key-aware parser or explicitly detect them before accepting. Do not merge based on filenames, labels or timestamp equality.

## Import and restore flow

1. Choose a file; warn that it can contain another person's private history. Read-only validation, checksum and all referential/invariant checks happen before any active-data change.
2. Preview origin, export date/revision, program/content status, counts, and whether the file is an exact duplicate, a different backup of this dataset, or another device/person. Explain that restore replaces the active workspace; it does not merge histories.
3. Exact known duplicate: display “Already present”; no added rows/audits, no duplicate completions. Same IDs with incompatible payloads: reject safely and explain conflict. A consistent older/newer full snapshot may be restored as a whole after explicit preview/confirmation; no automatic record-level overwrite or merge. Other-person/device restore requires explicit acknowledgement that its history will become active.
4. Before switching nonempty current data, require a successful current-state export download attempt plus explicit acknowledgement of restore. Browser APIs cannot prove the user retained that download; state that limitation. Retain the previous dataset internally as well, space permitting.
5. Stage validated records under a new immutable dataset version. Verify counts, checksums and references; use a single transaction to activate the staged dataset and record the restore event only if the original active revision has not changed. Detect stale tabs/current edits and ask to retry; do not overwrite them invisibly.
6. Quota, parse, interruption or validation failure leaves active data and its pointer untouched. If there is insufficient storage for staging and the previous dataset, refuse restore rather than deleting current data. On next launch discard only clearly uncommitted staging data through a tested recovery path.
7. Retain one previous active dataset for explicit “Return to pre-restore data” with preview. No automatic destructive cleanup of real history in this assignment. Rollback switches the active pointer transactionally; warn that post-restore changes remain in their own dataset rather than merging them. Export before another switch.
8. After activation, verify history/actuals/null effort/RIR/revisions/sequence and pinned prescriptions, then show restore counts and limitations. A fresh-browser-profile rehearsal must restore the backup and continue a session correctly without network.

A timer is not a performed record. Preserve paused duration; for a running timer retain its deadline and calculate elapsed time from it. If already expired after restart/restore, show finished without restarting or claiming a background notification fired. Warn if the device clock changed substantially; do not recalculate performed dates from a timer. Keep source timezone/date-only schedule semantics across devices and daylight-saving transitions; changes require explicit schedule preview.

## Migrations, storage loss and offline updates

Keep schema changes additive and versioned. Test upgrade rollback/failure on representative populated databases. Never delete stores to fix a migration. Detect unsupported future DB or backup versions and offer a clear non-destructive error/export path where possible. An internal recovery copy shares the browser's failure domain and is not an independent backup.

Explain during setup and Settings: “Your workouts are saved in this browser on this device. They are not automatically backed up. Clearing browser data, losing the device, using private browsing, changing browsers or switching devices may lose access. Export a backup and keep it somewhere safe.” Request `navigator.storage.persist()` where supported, show whether it was granted, and never call it a backup or guarantee against clearing/eviction. Handle missing IndexedDB/quota/private browsing explicitly. No unsupported claim of secure family-user isolation.

App assets and workout records have separate versioning. Defer applying an update until a safe user-confirmed point; persist drafts first. A failed update must preserve IndexedDB, offer prior compatible shell where feasible, and never mix unsupported schema/app versions. Cold offline startup is promised only after initial asset caching on a supported stable origin. Raw file:// use, changing localhost ports/origins, phone home-screen behavior and non-persistent private profiles need explicit support boundaries and tests. Service worker secure-context support does not imply remote deployment is authorized.

## Future cloud boundary

Preserve origin IDs, per-record revisions and provenance so a future migration can be designed. Do not implement account linkage, automatic upload, cloud backup, remote sync or credentials. Later cloud work requires owner authorization and native Auth/JWT/RLS/Storage/restore verification, privacy/consent and local-to-account ownership/conflict tests. No service-role key or synthetic claims transport belongs in the pilot browser bundle.
