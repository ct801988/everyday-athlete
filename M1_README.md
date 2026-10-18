# Everyday Athlete M1 review candidate — 0.5.0

Reconstructed after explicit owner approval from the verified pre-M1 c0e4045 source. This is synthetic software, not approved training instruction. No hosting or publication was changed.

## Run locally
Node >=22.12; use the committed lockfile:
```
npm ci
npm run dev -- --host 127.0.0.1
```
For offline inspection, use `npm run build` then `npx vite preview --host 127.0.0.1 --port 5175`. Use one consistent origin; changing hostname/port changes browser storage. A source ZIP is not an iPhone-hosted PWA.

## Verify
```
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run browser:prepare
npm run test:m1
npm run test:m1:pages
npm run build
npm run build:pages
```
`test:local` now runs current M1 browser checks. Old single-exercise UI assertions remain under `test:local:historical` for the historical source; they are not acceptance tests for this new interface. The separate laboratory backend suite is historical/deferred; three native Supabase integration checks remain explicitly skipped.

## Data, recovery and rollback
M1 reads legacy schema v1/v2 directly without writing its database. Conversion creates a separate M1 database/workspace, retains the exact original object (including original audit, prescription, IDs and drafts), and commits the active pointer atomically. Legacy active work becomes paused with unknown duration; it does not acquire a fictional Begin timestamp. Export before any restore or code/origin change.
Settings offers signed backup export, validated import preview and retained-workspace rollback. Identical import is a no-op. An unreadable/future schema stops on a recovery screen with raw export access; original storage is retained. Quota/invalid writes fail visibly. Drafts are not performance. Only Done commits actual values; undo and corrections are audited.
Original pre-M1 code cannot read v3 data. To inspect the original legacy state, keep its original database and run the original code from the retained bundle; that state does not include M1 edits. Preserve current M1 exports separately. Do not feed a v3 backup to old code or clear browser data as a rollback step.
Existing 20 MiB / 100,000 JSON-node / depth-32 backup limits remain. Histories below the schema's 1,000-session ceiling may still reach these byte/node limits. They are checked before writes/import; no silent pruning or limit weakening. Export regularly. Quota tests simulate failure; they do not certify every device's storage capacity.

## Boundaries
The main app blocks unapproved public hosts, including github.io. Future dedicated hostname approval is required before setting VITE_EA_APPROVED_HOST and before deployment. Local two-origin tests demonstrate browser isolation; they do not verify DNS, redirects or a future hosted origin. No deployment workflows are enabled.
Physical iPhone safe-area/software-keyboard, screen-lock/restart and audible beep checks remain pending. Desktop Chromium checks include three viewport widths, automated accessibility, offline reopen, draft/actual persistence, grouping, overlays and timer behavior. Exercise media remains explicitly unavailable/not reviewed. One manual superset group is supported; there are no automatic pairing suggestions. No real progression engine, onboarding, new programs, nutrition or M2 work was introduced.

See M1_TEST_RESULTS.md, M1_ACCEPTANCE_COVERAGE.md, PROJECT_STATUS.md and SOURCE_PROVENANCE_M1.md. Original source/history is retained in candidate Git bundles and the source recovery artifacts.
