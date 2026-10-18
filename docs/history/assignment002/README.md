> **Native verification follow-up 01 (17 October 2026):** current outcome is [NATIVE_FOLLOWUP_HANDOFF.md](NATIVE_FOLLOWUP_HANDOFF.md). Native verification remains blocked on this host. See [NATIVE_VERIFICATION_PLAN.md](NATIVE_VERIFICATION_PLAN.md) for the supported-host continuation. The original foundation record below is retained.

# Everyday Athlete — Assignment 002 Foundation Lab

Version **0.2.0**, 17 October 2026. A working React/TypeScript/Vite local prototype with synthetic data, actual PostgreSQL-WASM row-level security, IndexedDB drafts/outbox, deterministic domain rules and test evidence. **Assignment 002 is partially complete: native Supabase Auth/Storage verification is blocked.** This is not a reviewed training program, production account system, external pilot or deployable release.

Start review with [MILESTONE_HANDOFF.md](MILESTONE_HANDOFF.md) and [BUILD_AND_TEST_RESULTS.md](BUILD_AND_TEST_RESULTS.md). The v0.5 handoff was verified; no material contradiction with the approved plan was found. All prior research is retained in `docs/approved/` without a new research kickoff. Winter Strong was not modified.

## Install and run

Prerequisites: Node.js >=22.12 (tested24.19.0), npm (tested11.9.0), normal package-registry access and a modern browser. Linux x64 was used for this run. No hosted account, cloud credentials, Docker or external spending needed for the **WASM SQL lab**. Docker/native PostgreSQL are still needed to complete the separate native verification milestone. Do not enter real user/health data.

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run db:migrate
```

For a single-command demonstration, run `npm start`. Alternatively, use two terminals from the extracted repository root:

```bash
npm run api
```

```bash
npm run dev
```

Open **http://127.0.0.1:5173/**. Both services bind loopback only. API:127.0.0.1:4174. Do not expose these ports or deploy this lab. The API automatically applies local bootstrap/application migrations and synthetic fixtures to `.data/pglite-v3` on its first start. The approved Supabase application migration and the lab-only Auth/role bootstrap are separate files.

Sign in with deliberately public, synthetic-only credentials:

| User | Password |
|---|---|
| alice | alice-local-only |
| bob | bob-local-only |

These are not production secrets or Supabase accounts. HTTP login verifies a test password, issues an opaque HttpOnly/SameSite cookie and routes requests through SQL RLS under an authenticated database role. The server supplies the verified synthetic user's claim. This **does not test GoTrue, signed JWT validation, refresh/recovery email or Supabase Storage**. The lab bootstrap's `auth.uid()` is a claims-context shim, explicitly not an authentication implementation.

## Inspect the prototype

1. Edit suggested weight/reps. They remain unperformed until **Done**; RIR is hidden by default and optional under Advanced tracking.
2. Use Done, Save correction or Undo; choose **Sync to account** to persist queued mutations. Device-only and account-saved messages are distinct. No automatic set completion on blur, reload or viewing a demo.
3. Preview/cancel or explicitly confirm remaining-set bulk logging; only unconfirmed rows are included. SQL groups are atomic and retry-safe.
4. Start rest, edit a field, open the placeholder demonstration, change frames and close with X/Escape/Back. Input, scroll, tab, focus and timer deadline remain intact.
5. The conditioning fixture is a **separate session**. Its recommended target is read from that session's pinned prescription, not a UI default. Actual effort can be skipped, cleared or corrected independently; higher effort never earns a PR or higher demand.
6. Schedule tab shows synthetic Foundation3/Strength4-day contracts, arbitrary start/preferred weekdays, ordered slots and an explicit reschedule preview. The one-day gap is a synthetic test parameter, not a reviewed recovery prescription.
7. History/export show acknowledged account records. Sign out and sign in as Bob to inspect isolated records. Device drafts remain scoped to their original user.

Offline scope: after loading online, editing/confirming remains available in the open tab with an IndexedDB outbox. Reconnect and explicitly sync. Reload after connectivity returns restores drafts. No service worker, offline shell installation, background alarm or unrestricted offline multi-device merge is claimed. A fully offline cold start is a known limitation. Close the API before backing up its persistent lab directory.

## Run tests

```bash
npm run test:unit
npm run test:integration
```

Integration tests execute **actual PostgreSQL SQL/RLS/functions/transactions inside PGlite WASM**, with Alice/Bob/anonymous contexts. They are not JavaScript repository mocks; they are also not native database logins or a complete Supabase stack. Three explicit native/Auth/Storage cases are skipped as blocked, not passed.

Browser tests use Playwright. With normal Playwright browser access, install Chromium and set its executable path:

```bash
npx playwright install chromium
# Set EA_CHROMIUM_PATH to the installed Chromium executable if needed.
npm run test:browser
```

For the Linux environment where the standard browser CDN download failed, the pinned registry-packaged Chromium fallback worked:

```bash
npm run browser:prepare
npm run test:browser
```

`browser:prepare` decompresses a local binary and bundled assets under `.data/chromium` without changing ownership/system users. It requires `tar`. On other operating systems prefer Playwright's native browser and set `EA_CHROMIUM_PATH`; do not assume the Linux fallback is portable. Browser tests start loopback services if not already running. Use an isolated disposable lab directory for automated tests; tests manipulate synthetic records. Run tests sequentially to avoid concurrent access to the persistent PGlite directory. The in-memory SQL integration suite is isolated from the demo database.

Reports: `reports/unit.json`, `reports/integration.json`, `reports/browser.json` and log files. HTML traces/reports can be generated locally but are excluded from the delivered source. Tests emulate320/390px Chromium; no physical iPhone/Android or VoiceOver/TalkBack results are claimed. Automated axe scans found no serious/critical issues on the tested harness/overlay; that is not complete accessibility certification.

## Storage, migrations and restoration

- `supabase/migrations/001_foundation.sql`: application schema, RLS/grants, ownership-validating transactional RPCs and audit/history.
- `scripts/lab-bootstrap.sql`: isolated test-only Auth roles/context; never install as production Auth.
- `server/database.ts`: serialized SQL-lab transport, fixture seed, authorized reads/writes, export/snapshot.
- `src/domain/fixtures.ts`: two synthetic users, separate strength/conditioning session IDs, candidate program metadata, placeholder canonical media.
- [ROLLBACK_AND_RESTORE.md](ROLLBACK_AND_RESTORE.md): non-overwriting restore into a new local directory and rollback boundaries.

No general end-user import, production deletion/recovery operations, real program/media publishing, hosted infrastructure or remote repository was added. No live conversational AI. Future Supabase integration must reverify grants, JWT/role propagation, RPC authorization and Storage policies on the actual stack before real users.

## Source structure and authority

`src/domain/` contains strict runtime contracts, deterministic coaching and calendar logic. `src/data/` owns device state and API calls; `src/components/` owns the demonstration overlay. `src/App.tsx` is intentionally one bounded inspection harness, not the final consumer application. `server/` is a loopback SQL-lab service. `tests/` separates domain, SQL integration and browser evidence. Current source register/master, approved execution plan and retained scientific framework are in `docs/approved/`. [SOURCE_VERIFICATION.md](SOURCE_VERIFICATION.md) resolves historical no-code/pending-decision wording under the latest authorization.

The original Foundation/Strength detailed workout layouts still need qualified review at3/4 days/week; no extra real workout days were invented. Final effort anchors/cues, media rights/form accuracy, privacy/operations and release approval remain unresolved. See [KNOWN_ISSUES_AND_DECISIONS.md](KNOWN_ISSUES_AND_DECISIONS.md). Stop after this handoff: Assignment003 and any hosted/native release require explicit owner approval.
