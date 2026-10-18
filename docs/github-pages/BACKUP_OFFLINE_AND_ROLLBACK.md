# Backup, offline behavior and rollback plan

## Moving origins is a deliberate data transfer

The current Cloudflare HTTPS hostname and a future owner.github.io project URL have different origins. Safari does not carry IndexedDB, service workers, cached assets or installed-app identity between them. A blank first screen on the new host does not mean Cloudflare history was deleted. Nothing in this preparation reads or changes the owner's iPhone data.

Before an approved migration: in the current Safari/installed preview export a full JSON backup to Files, locate/open its file entry and keep an unchanged copy. The app cannot prove that Files retained it. Export a second copy if convenient. Do not clear Safari data, delete the existing Home Screen app, delete Cloudflare, or enroll testers. Record the current host/version and keep its backup separately.

After owner-approved initial Pages publication: open the confirmed HTTPS project URL in Safari. Before creating a new demonstration dataset, use Import JSON backup, inspect dataset identity/session counts/revision/conversion notice, acknowledge and confirm. Old schema-1 files are checked before normalization; data becomes schema 2 using the already-tested migration. Confirm several known workouts, sets/load/reps, unknown RIR/effort, schedule sequence, timer preference and drafts. Suggestions must not become performed records. Export a new backup from Pages and keep the original Cloudflare backup. Do not assume Safari and Home Screen installation share storage; verify each intended context. Only then consider Add to Home Screen on the new origin, followed by another persistence/backup check.

Import into a nonempty workspace does not merge. Existing duplicate/conflict checks and export-before-replacement rules remain. Avoid logging on both hosts concurrently: once histories diverge, the app will not reconcile them automatically. Owner must select the active host and explicitly resolve any divergence; backups from both are retained. The local test transferred actual legacy-host JSON between two local origins, preserved IDs/unknowns, rejected invalid import and left the old host untouched. This does not verify a physical iPhone Files interaction.

Pages project paths share one owner.github.io origin. The preparation namespaces the Pages database by BASE_URL, retaining the unchanged database name for root Cloudflare builds. The Pages service worker/cache are scoped to the exact repository path and do not control an unrelated test path. This prevents accidental app/cache mixing; it does not make same-origin scripts from other repositories unable to read local databases. Other repositories' behavior was not inspected and Winter Strong was not accessed. Site renames, owner changes or custom domains can change origin/path/database namespace, so repeat the backup/import plan rather than silently renaming a live pilot.

## Offline and release behavior

Only static bundled app assets, neutral icons, manifest and release metadata are precached. There is no hosted workout database, sync, analytics, registration or backup endpoint. The build sets project-relative Vite paths and exact manifest/service-worker scope. Cache names include the project path hash. Other projects' caches are not deleted by this worker. A failed/incomplete install cannot activate; the last successful cache remains usable. First-ever offline startup still cannot work. Browser eviction/private mode/device loss may remove local history; offline cache is not external backup.

Updates wait for explicit in-app Apply cached app update; ongoing writes/unsaved drafts block that action through existing controls. A successful workflow/host deployment does not prove every device has updated: an old service worker can remain active until accepted. release.json identifies the built source SHA and schema for verification. Automatic builds do not mean forced updates during a workout. HTTP/CDN cache behavior and actual Safari/PWA update delivery need the live acceptance step; no such behavior is claimed from local testing alone.

## Code rollback

Select a previously tested **Pages-ready schema-compatible** main-history commit, and manually dispatch the prepared workflow from main with its full 40-character source_sha. Verification rebuilds/retests that revision; the deployment remains behind the same publication flags and owner environment approval. Old code without build:pages cannot be published using this rollback path. A revision can also be restored through a reviewed forward/revert PR. No force push, history rewrite or database deletion is required. Keep the corresponding immutable static artifact/manifest outside short-lived Actions storage if long-term reproducibility is needed; 1-day artifact retention is not permanent recovery.

Republishing a prior compatible artifact updates app files, not IndexedDB. Local browser tests verified release B activation, republishing release A, preservation of performed records and valid backup afterwards. An old cached client may require update/reload before the older compatible code is used. Keep current JSON exports before switching code.

Do NOT roll schema-2 data back to the v0.3.2/schema-1 application by merely replacing files. The old validator rejects newer data. Prefer a forward repair. If reverting to the unchanged Cloudflare origin, that origin retains its earlier independent records; post-migration Pages workouts do not automatically appear there, and its old code may not accept new backups. Preserve both datasets and obtain an explicit compatible-data/forward-code recovery plan. A pre-upgrade schema-1 backup excludes later work; choosing it is an explicit loss-of-later-records decision, never an automatic rollback.

## Owner real-device acceptance after separate publication approval

- Export/retain current Cloudflare backup in Files; confirm old preview still works.
- Verify new HTTPS URL, app title, no registration and explicitly approved public-access model.
- Import/preview/check known records and unknowns; export a new file; reject invalid import without data change.
- Safari portrait/landscape keyboard/touch/VoiceOver, numeric Done/correction/Undo, overlays and Ready/Running timer.
- Browser close/reopen; Add to Home Screen; verify whether history appears in the installed context and import there if required.
- Initial successful cache install, Airplane Mode startup/reload/logging/history/schedule/timer, restore/download where supported.
- Approved update while drafts exist; accepted update after saving; confirm records. Verify known compatible code rollback before relying on it.
- Stop on missing records, unexpected merge, failed persistence, uncontrolled public access, unexpected costs or an unapproved deployment. Keep Cloudflare intact until separately retired with explicit approval.
