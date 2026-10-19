# Review and resume V2.1

Read V21_CHECKPOINT.md, V21_REVIEW.md, source commit metadata and raw validation evidence first. This is an unpublished candidate; live89d087e is unchanged.

## Local validation

Use Node24.19.0. In the source directory run:

```sh
npm ci --ignore-scripts
npm run browser:prepare
node scripts/validate-v21.mjs
```

If Chromium was installed elsewhere, set EA_CHROMIUM_PATH to that explicit executable. The validator runs typecheck, lint, unit, integration, full M1/V2/V2.1 browsers, project-path offline and isolated-root update/rollback. Three inherited integration tests require a native Supabase/database/login stack and remain explicitly skipped; do not claim them passed. See the final JSON for actual counts. The baseline-only config intentionally asserts the OLD18px gap and must run against89d087e, never count it as candidate acceptance. Before screenshots/reproduction evidence are included separately.

For interactive local use run npm run demo and open its localhost URL; use synthetic data in a separate browser profile. A Pages review build requires exact approved-host/root configuration as documented in existing isolated Pages instructions, but building locally is not release approval. Do not publish the review site folder, copy files into the publisher, change its allowlist, or run a publishing workflow.

## Backup review

Settings → Preview backup import reads/validates only. Review replacement counts. Confirm restore starts a safety backup download, then atomically replaces the active workspace and retains the previous workspace. Check that your browser actually saved the download; browser download completion cannot be guaranteed by an anchor click alone. No-change and cancel do not replace records. Restore retained M1 workspace exports current committed records and swaps the retained pointer; it does not merge histories. Failure leaves current valid workspace intact. Test with disposable data first.

## Stopwatch semantics

Only observed foreground time counts; no inferred effort during a suspended gap. Stop prefills Seconds and leaves Done explicit. Pause/background/overlay/card collapse/navigation interrupts and checkpoints last observed seconds conservatively. Same-tab checkpoint recovery can refill a draft; manual edits and explicit Done still decide recorded data. Subsecond timing, OS shutdown before observation and real-device suspension behavior have limits. Rest deadline and workout elapsed clock are separate.

## Rollback and safe resumption

Rollback comparison is deployed89d087e and preserved development5c9e0f8. No branch was replaced or force-pushed. Review changes via draft PR #6. Reverting source and publishing older code are separate actions requiring owner approval. Before any data-bearing rollback, finish/recover pending journal operations, wait for Saved, export and verify a backup; old V2 cannot replay V2.1 intents. Never delete journal or browser storage to get past recovery. Keep original/retained records and raw recovery export if recovery fails.

Do not clear website data. Existing service worker waits for all controlled windows to close before activation; no forced update into an active workout. The isolated version A/B tests use compatible code with distinct release identities, not a claim that every future schema downgrade is safe. Keep main and source draft PRs #1–#5, publisher protections/approval list, Winter Strong and media approvals untouched. Current milestone ends with candidate review, not deployment. Resume only from verified branch/commit and owner's next instruction.
