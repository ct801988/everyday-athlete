# Pages access preflight — publication still disabled

The owner chose public GitHub Pages with no app login/password. See [current setup and approval checkpoint](docs/pages-access/SETUP_AND_CHECKPOINT.md) and [follow-up handoff](docs/pages-access/MILESTONE_HANDOFF.md). GitHub still reports not installed/exposed here; authenticated branch/commit/PR writes and hosted CI remain blocked pending installation and the exact new repository URL. No remote/site/settings changed.

Local follow-up: Pages build/typecheck/lint passed; 17 Pages browser checks passed with 3 skips; 13 static workflow checks passed. Synthetic sibling-path testing demonstrates that separate repositories on one github.io hostname do not isolate IndexedDB. Secret-pattern audit found no high-confidence matches; limitations and reviewed synthetic literals are documented. No production authentication is added, and no Winter Strong code/site is touched. Historical v1.0 recommendation below is superseded by the owner's Pages choice; its publication restrictions remain.

---

# GitHub Pages evaluation and workflow preparation — v1.0

**Not published. No GitHub remote or repository was created.** GitHub is discoverable but not installed/exposed in this Work session, so authenticated repository read/write and hosted Actions/Pages execution remain unverified. Read [recommendation](docs/github-pages/RECOMMENDATION.md), [setup/permissions](docs/github-pages/SETUP_AND_PERMISSIONS.md), [actual results](docs/github-pages/TEST_RESULTS.md) and [approval checkpoint](docs/github-pages/APPROVAL_CHECKPOINT.md).

The current implementation checkpoint is the preserved v0.4.0 mobile/timer candidate. This preparation adds a separate project-path Pages build; the Cloudflare preview and historical candidate files remain unchanged. Source control and hosting are separate decisions: GitHub-based updates can retain Cloudflare's password protection. Ordinary personal Pages would be public; privacy removal is NOT approved.

Developer reproduction: `npm ci`; `npm run browser:prepare`; `npm run typecheck`; `npm run lint`; `npm run test:unit`; `npm run test:integration`; `npm run test:browser`; `npm run test:local`; `npm run build:pages`; `npm run test:pages`. Run browser suites sequentially. Default project path is /fitness-pilot-preview/; set EA_PAGES_BASE only to the approved lowercase repository path. Pages artifact is .data/pages-build. `python3 scripts/verify-pages-workflow.py` requires PyYAML 6.0.3 for local static inspection only. Hosted CI does not require that optional Python checker. The workflow is inert at deployment/github-pages/pages.yml.disabled; do not activate it or enable publication flags before approval. Full-SHA action pins were resolved from official public GitHub repositories. There are no deployment tokens/passwords in the template.

Local Pages testing uses two loopback HTTP servers (5190/5191), synthetic records, real Chromium/IndexedDB/cache and temporary profile data. It tests cross-origin legacy-backup import, browser restart/offline use, update/compatible rollback and failed-cache safety. It does NOT publish or prove GitHub's hosted APIs, authentication, review settings, TLS/MIME behavior or physical Safari support. Backups are plaintext and must never go into GitHub or CI artifacts. See [data transfer/rollback](docs/github-pages/BACKUP_OFFLINE_AND_ROLLBACK.md).

The owner needs no Node.js or Terminal for normal use after a separately approved hosted release. The intended routine is Work develops/tests → PR → owner approves → automatic build → owner approves deployment → publish. That routine is conditional on proving repository writes and the host decision; it has not been demonstrated end-to-end yet.

---

## Prior checkpoint documentation (preserved)

# Everyday Athlete — mobile workout and timer candidate v0.4.0

**Working locally tested candidate; NOT deployed. The existing Cloudflare preview is unchanged.** Start at [review summary](docs/mobile-timer/REVIEW_SUMMARY.md), [milestone handoff](docs/mobile-timer/MILESTONE_HANDOFF.md), and [actual test results](docs/mobile-timer/TEST_RESULTS.md). Review screenshots in reports/mobile-timer/screenshots. All content is synthetic. Current authority is Decision Register v0.8. Older milestone statements below are historical; they do not authorize deploying this candidate.

The upgraded iPhone workout layout, compact floating Ready/Running timer, approved duration controls and single optional beep preserve the existing React/domain application. Schema-1 data and backups migrate with the original dataset retained; see [backup and rollback instructions](docs/mobile-timer/ROLLBACK_AND_RECOVERY.md). Native Supabase remains deferred for local-only use. No account, telemetry or cloud workout storage is added.

## Install, run and verify (developer instructions)

Requires Node >=22.12, npm and a supported desktop environment. No paid service, Cloudflare account or credentials are needed for local use. Run `npm ci`, then `npm run start` and open the displayed loopback URL. Only synthetic data should be used. Production-style local demo: `npm run demo`. Plain HTML file opening does not reproduce the app's secure-origin storage/service-worker behavior.

Run `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:integration`. Then `npm run browser:prepare`, `npm run test:browser`, `npm run test:local` sequentially. Browser tests need compatible Chromium/Linux libraries; integration uses PGlite and includes explicit native-stack skips. Native security claims must not be inferred from the lab shim.

For the protected undeployed candidate: `npm run build:dashboard`, `npm run test:preview`, `npm run test:dashboard`, then `node scripts/refresh-review-candidate.mjs`. These only build/test locally. Optional `EA_PREVIEW_EVIDENCE_DIR` selects a separate evidence directory. Local workerd tests require OpenSSL, Chromium and loopback ports 5180–5182; credentials are ephemeral in-memory fixtures. Do not run a deploy command. `review-candidate/worker.js` is the candidate, while `dashboard-candidate/` and `deployment-candidate/` retain older historical packages. Do not use a historical copy helper to deploy the upgrade.

## Opening on iPhone without developer tools

For now keep using the existing owner-only HTTPS preview; it has not been replaced. Review this package's screenshots on any device. After you separately approve candidate replacement, the same private HTTPS link can serve the upgrade: open it in Safari, enter the shared preview credentials, and optionally use Share → Add to Home Screen. No Node.js, Terminal, app-store installation or user account is required on your Mac/iPhone. Cached app updates require the explicit in-app update action. First export a backup to Files and verify it exists. The Worker password remains a runtime secret, never part of this ZIP. Physical Safari/Files/PWA tests for the new candidate are still pending.

Complete Git history is delivered as a bundle alongside the snapshot, with clone instructions in the rollback document. No remote is configured or created. Source archives exclude dependencies, browser binaries, temporary certificates and user data.

---

## Historical milestones (retained)

# Published owner-only preview checkpoint

**The owner deployed Fitness App Preview and reports that iPhone persistence, saving backup to Files, cached offline reopening and same-file import retain records.** This is a provisional checkpoint; full N04 security/cost/platform acceptance is incomplete. Start at docs/preview-checkpoint/REVIEW_SUMMARY.md and MILESTONE_HANDOFF.md.25live unauthorized/wrong-credential requests were rejected. No runtime code or deployment changed in this checkpoint.

The UI is a rough functional foundation, not the final design; all workout content remains synthetic. The next usability/basic-timer milestone needs separate approval. Current approved requirements: Decision Register v0.7/master v1.5/blueprint v1.4 plus the October17 owner UX update. Older status statements below and in earlier handoffs are historical snapshots.

# Owner-assisted dashboard preview package update

The owner has authorized N04 and a single-Worker packaging adjustment. The gate is live; **full application deployment and iPhone acceptance are NOT complete**. Start with dashboard-candidate/COPY_WORKER.html for copying the tested standalone Worker into Cloudflare. No developer tools, cloud database or Google access required. Preserve the existing PREVIEW_HOST and runtime PREVIEW_PASSWORD secret. See docs/preview-update/MILESTONE_HANDOFF.md for current status; older instructions below reflect earlier approval stages.

Developer reproduction: npm ci; npm run build:dashboard; npm run test:dashboard. These run locally; none deploys. Standard build:preview/test:preview remains available. Current deployment packaging has no external bindings. Run the suites sequentially. Do not add secrets to files. Native Supabase is deferred, not waived. New timer/mobility requirements are planning-only.

# Private iPhone preview preparation — v0.3.1

**Prepared and locally tested; NOT deployed. N04 requires separate owner approval.** No Cloudflare account or resources were created. Start with [DEPLOYMENT_APPROVAL_PACKET.md](DEPLOYMENT_APPROVAL_PACKET.md) and [docs/preview/MILESTONE_HANDOFF.md](docs/preview/MILESTONE_HANDOFF.md). The accepted v0.3.0 application and history are preserved below. Other root milestone/test documents describe historical Assignment 003; current preparation evidence is under docs/preview/ and reports/preview-preparation/. Only synthetic workouts are supplied.

Developer-only local verification (the owner does not need these tools on their Mac):

```bash
npm ci
npm run typecheck
npm run lint
npm run build:preview
npm run test:unit
npm run test:integration
npm run browser:prepare
npm run test:browser
npm run test:local
npm run test:preview
```

The last command runs native local workerd and Chromium over loopback HTTPS, creates random in-memory credentials and a temporary certificate, and stops the test servers afterwards. Requires Linux-compatible Chromium, OpenSSL, Node >=22.12 and free loopback ports 5180–5182. It does not deploy or require Cloudflare credentials. Avoid running browser suites concurrently. Build the preview before running its tests. `wrangler.preview.jsonc` deliberately has no password or hostname: an ordinary unconfigured local start fails closed. Do not add credentials to it, `.env`, command arguments, frontend files or Git. Test evidence is in `reports/preview-preparation/`.

# Everyday Athlete — local-first software preview v0.3.0

Assignment 003 P01–P06 technical preview, 17 October 2026. **No registration, backend or cloud service is required. All workouts, effort targets, rules and exercise media remain synthetic and unreviewed. This is not approved training guidance or authorization to enroll family testers.**

Start review with `MILESTONE_HANDOFF.md`, `BUILD_AND_TEST_RESULTS.md` and `ACCEPTANCE_COVERAGE.md`. DEC-011 replaces account-first requirements for the local pilot. Native Supabase verification is still deferred, not passed or waived for future cloud accounts. The independent repository and original lab source/history/tests are preserved.

## Install and run on a development computer

Requires Node >=22.12 and npm; tested with Node24.19.0/npm11.9.0 on Linux x64. The initial dependency installation requires registry access. No hosted account, Docker, cloud credential or paid service is needed.

```bash
npm ci
npm run demo
```

Open **http://127.0.0.1:5175/** on that same computer, in a normal persistent browser profile. The command builds the production assets and serves them on loopback; it does not deploy. Keep the URL/port/browser profile stable: browser data belongs to its origin. Close with Ctrl+C. For development/HMR use `npm start` at http://127.0.0.1:5173/; this is a different data origin and does not enable the production offline shell. Do not mistake an empty store at a different port for deletion.

No app registration or login is shown. Choose Foundation3 or Strength4 synthetic demo and preferred weekdays. Only one demonstration week is supplied; it is not a complete training program. Fit selection remains disabled pending review, while the separate synthetic conditioning example remains available to inspect Effort Level behavior.

## Inspect working features

- Suggested values remain drafts. Edit Weight/Reps or timed duration; tap Done deliberately. Corrections, Undo, partial finish/reopen and exact-value bulk confirmation retain audit history. Wait for “Saved on this device” before closing; pending or failed writes are not durable. Invalid/failed draft edits remain visibly unsaved until corrected or explicitly discarded.
- Optional advanced per-set RIR defaults OFF; blanks remain unknown. Conditioning targets are pinned to the session, separate from optional actual effort; higher effort never automatically earns increased demand or praise.
- Switch among demonstration sessions. Open the shared exercise overlay, carousel/keyboard controls, Back/Escape and Close without losing draft, tab, scroll, focus or timer. Timer deadlines survive restart; background notifications/alarms are not guaranteed.
- Schedule preview and confirmation preserve session order/original dates. Missed sessions remain pending. The minimum-gap parameter is synthetic, not reviewed recovery guidance. History shows deliberate actuals, completed/partial status and dates; “Why this?” records deterministic synthetic explanations, inputs, context and evidence identifiers.
- Workouts, drafts, schedule, preferences, history and explanations live in IndexedDB. No automatic cloud requests/sync/analytics. Each person needs a distinct device/browser profile; same-profile data has no secure person isolation.

## Backup and recovery

In Backup, choose **Export full backup** and keep the JSON somewhere outside browser storage. The file is unencrypted and may contain private training records. The app can create a download but cannot verify that you retained it safely. CSV is a convenience report, not a full backup.

Import JSON → validation and preview → explicit acknowledgement → Confirm restore. On nonempty data, export the current dataset first and do not edit it afterward before confirming. Exact duplicate data is a no-op; conflicting same-revision records are rejected. Consistent snapshots are restored as a whole, never silently merged. Previous datasets remain stored; export the current dataset before using **Return to pre-restore data**. Failed validation, quota/transaction aborts and stale previews leave the active dataset unchanged. See `ROLLBACK_AND_RESTORE.md` for a rehearsal and limitations. `fixtures/assignment003-backup.synthetic.json` is a validated example containing no performed sets.

## Offline and updates

After a successful production load and service-worker installation, the shell and bundled assets are cached. Once controlled, offline startup/reload, logging, history, scheduling and explanations work on the tested Chromium environment. First-ever offline load cannot work. The app does not cache remote media or API responses. An available update waits for the explicit Apply button, disabled while writes/unsaved draft edits remain. Storage migrations preserve data or fail closed. Browser eviction, clearing, private sessions, device loss and unsupported browser behavior remain risks: local storage and the retained prior dataset are not external backups.

## How an iPhone could open it without developer tools

There is **no approved phone-accessible deployment/link yet**. `127.0.0.1` on your iPhone means the phone itself; it cannot reach this computer's loopback server. AirDropping the source ZIP or opening index.html in Files is not a supported installation method.

After you separately approve a distribution method, a developer can serve the tested static build at a stable HTTPS address, with no workout-data backend or required app account. You would open that link in Safari, optionally choose Share → Add to Home Screen, complete setup and let assets cache. No Node, terminal, Xcode or developer tools would be installed on the phone. Download backups to Files and choose the saved JSON when restoring. Each family device keeps its own records. A private LAN HTTPS setup is another possible later option but needs developer setup and trusted certificates; it is not configured here. No hosting, certificate installation, distribution or tester enrollment occurred. iPhone/Safari download, Home Screen/offline lifecycle and background behavior require real-device verification before relying on them.

## Run tests (sequentially)

```bash
npm run typecheck
npm run lint
npm run build
npm run test:unit
npm run test:integration
npm run browser:prepare
npm run test:browser
npm run test:local
```

Unit tests include original domain tests and local contracts. SQL integration executes actual PostgreSQL-WASM, retaining three explicit native skips. `test:browser` starts the original synthetic lab API and lab-mode UI; all existing tests are retained. `test:local` builds an isolated production-like app plus a test-only harness and runs real IndexedDB/service-worker/persistent-browser tests on loopback5175. The harness is excluded from normal builds. Do not use synthetic lab credentials/claims as production authentication.

Browser preparation uses the pinned Linux Chromium package (tar required). On other platforms, install Playwright Chromium and set `EA_CHROMIUM_PATH` to its executable. No real iPhone/Android/VoiceOver/TalkBack certification is claimed. Test reports and failure history are in `reports/assignment003/`. Do not run test suites against private records or concurrently in the same browser report/data directories.

For the preserved lab only: `npm run start:lab` starts the API and synthetic-login UI at5173. Its Node backup/restore tools remain lab-only and do not implement browser recovery. Old lab records are not automatically imported into local pilot storage. Original review documents are retained under `docs/history/assignment002/`; current approved register/master and research remain under `docs/approved/`.

## Boundaries and source

`src/local/` owns local contracts, bounded JSON backup parser/checksums, transaction adapter/commands and no-login UI. `src/domain/`, `src/App.tsx`, `src/components/DemoOverlay.tsx`, `server/`, SQL migrations and existing test files are preserved. Entry mode, scripts, lockfile root version and test configuration are updated. No new runtime dependency was required.

No spending, remote Git repository operation, public deployment, real-user enrollment, live AI, Winter Strong modification or Assignment004. Review known issues/content/device gates before approving any training pilot or distribution. Preserve the supplied Git bundle to recover repository history.
