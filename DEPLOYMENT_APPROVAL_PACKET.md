# N03 — Owner-only iPhone preview deployment approval packet

17 October 2026 · v1.0 · Prepared for approval; **N04 has not started**.

## Requested decision

Approve a later, bounded N04 deployment to **Cloudflare Workers Free + Workers Static Assets**, using one stable `workers.dev` HTTPS hostname, a server-side shared preview password, and owner-only device verification. Approval of this packet does not approve training content, family enrollment, Assignment 004 or cloud accounts. Deployment must wait for explicit approval and a secure operator authorization method. No URL exists yet.

## Exact method and cost

The existing React app is built locally. A small Worker checks HTTPS, an exact configured hostname and HTTP Basic credentials before accessing ANY bundled asset. `assets.run_worker_first: true` is mandatory. Only the enumerated paths can be served; unknown paths have no SPA fallback. No Pages site, public bucket, Git integration, database, Supabase, analytics, remote workout API or external media is used. The deployment candidate is provided in `deployment-candidate/` inside the final ZIP; `deployment-assets.json` records exact public-file hashes.

Expected hosting cost: **$0 on Workers Free**, no custom domain. Cloudflare currently documents 100,000 Worker requests/day and 10 ms CPU per invocation on Free. Asset requests pass through the Worker and consume applicable Worker allowance. Requests, failed password attempts and updates can consume quota. Free-plan runtime limits may make the preview unavailable; no paid upgrade is authorized. CPU/quota sufficiency and the account's actual plan cannot be proved locally. Verify Free status, limits and no billable add-ons immediately before deployment; stop if payment or upgrade is required. No cost has been incurred in this assignment.

Sources checked 17 October 2026: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Worker-first asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/), [secret bindings](https://developers.cloudflare.com/workers/configuration/secrets/). Provider documentation establishes intended behavior; it does not prove a future account's configuration.

## Plain-English owner setup (after approval only)

1. In a normal browser, create or use your Cloudflare administrator account; verify its email and enable multifactor authentication. This administrator account is separate from the app: using Everyday Athlete requires no user registration.
2. Select Workers Free. Do not select a paid subscription, register a domain, connect GitHub, add a database or enter payment details for this preview. If the dashboard will not allow the free route, stop for review.
3. Choose an available Workers subdomain; keep the final hostname stable because local data belongs to that browser origin.
4. Arrange a separately authorized operator deployment through an approved secure Cloudflare authorization flow. **Do not paste API tokens, account credentials or the preview password into this conversation.** No such operator access has been established yet. The operator runs the technical steps on a development machine; you do not install Node, use Terminal or developer tools on your Mac.
5. Generate a unique random password of at least 32 printable ASCII characters (maximum 128). Store it in a password manager and provide it only through the approved secure secret-entry mechanism. The username is `preview`. This is a shared access gate, not an Everyday Athlete account.

## Mandatory configuration

- Exactly one Worker with Static Assets bound only as ASSETS; no other storage/service bindings. All paths execute the Worker first. No separate public asset endpoint.
- `PREVIEW_PASSWORD` is an encrypted Worker secret; `PREVIEW_HOST` is the exact public hostname, without protocol/path/port. Missing/invalid values yield 503. Do not put the secret into source, environment files, CLI arguments, logs, screenshots or build artifacts.
- Disable version/preview URLs, extra routes/custom domains and development tunnels. Restrict any future alias to the same gate or reject it. Keep observability/logging off; never enable request-header logging. Do not override cache headers or add Cache Everything rules. Use provider-managed HTTPS and verify its certificate/HTTP behavior live.
- Worker responses set private/no-store at browser and CDN layers, Vary Authorization, strict CSP, no framing/CORS, no referrer and no search indexing. These headers do not prevent intentional service-worker Cache Storage after successful authorization.
- This is a minimal shared-password gate without account identity, built-in rate limiting, MFA for visitors or a reliable browser logout. A high-entropy secret is mandatory. Provider-level abuse controls may be assessed only if available free and compatible; no paid feature is assumed. Compromise: disable online access immediately and rotate the secret. Authorized cached copies are not remotely revocable.

## Operator deployment sequence — future N04 ONLY

Do not execute these commands during N01–N03. Use the pinned dependency, reviewed ZIP and deployment-candidate directory. Confirm checksums and Git revision first. Establish scoped, securely managed authorization outside chat; avoid persistent token files and remote Git. No public upload through a static-only dashboard flow is permitted because that could bypass the Worker.

1. Reconfirm Free account, no paid add-ons, chosen hostname and owner authorization. Verify this exact package's bundle/static hashes. If rebuilding, rerun all relevant tests and compare the generated manifest.
2. From the preserved source repository, an authorized operator can use `WRANGLER_SEND_METRICS=false npx wrangler deploy --config deployment-candidate/wrangler.jsonc` for an **initial blocked deployment** with no host or password. The source package's default config also has neither. Verify the public root and every asset return 503 before configuring access. No app content should be public during setup.
3. Set the password through the Cloudflare dashboard's encrypted Secret field or interactive `npx wrangler secret put PREVIEW_PASSWORD --config deployment-candidate/wrangler.jsonc`. Never pass its value as an argument or record terminal input. Keep PREVIEW_HOST absent until this is complete.
4. Set the public nonsecret PREVIEW_HOST binding to the approved exact hostname (dashboard, or a reviewed config copy outside the source package). Deploy that configuration. Retain Worker-first routing and all security settings; inspect the generated deployment configuration. Do not accidentally remove the secret binding on subsequent updates.
5. **Before sharing the URL**, use fresh clients to test every entry in the asset manifest without credentials, wrong credentials and correct credentials; repeat after warming caches. Verify hostname aliases/version URLs, HTTP/certificate, 401/503 handling, headers, direct JS/CSS/SW/manifest/icons and unknown/source paths. If a bypass is found, disable the Worker immediately. Prove the provider has no ungated asset URL; local workerd alone cannot establish this.
6. Run the owner iPhone checklist while online, then offline and after an update. Record actual iOS/device versions and results. Any Safari Basic-auth/Home Screen incompatibility requires a new bounded fix and review; do not weaken access protection. Do not enroll family members.

## Opening it on an iPhone

After the later deployment is approved, tested and shared with you: tap the HTTPS link in Safari, enter username `preview` and the shared preview password. Choose the clearly labeled synthetic demonstration; there is no app account. Wait for successful load and saved-state/offline readiness before disconnecting. To add a home-screen icon, use Safari Share → Add to Home Screen. Reopen that icon and test it separately: its storage/auth behavior must be confirmed on your actual iPhone. Export a full JSON backup to Files before significant use or changes; verify Files retained it. Clearing website data, private browsing, storage eviction, changing hostname or removing the installed web app may lose access to device-local records. Local data is not a secure external backup.

No working phone link is included in this packet because deployment is not authorized yet. Physical-device acceptance remains open. This preview is for software inspection; the workouts are unreviewed synthetic examples, not approved exercise prescriptions.

## Rollback and shutdown

Before an update, export and retain a JSON backup and record the current Worker version and exact asset manifest. Do not change origin or reset browser storage. Roll back Worker AND matching static assets together using the prior verified release; keep current access secret and Worker-first routing. For an urgent shutdown, remove PREVIEW_HOST or disable the Worker/route and verify new network requests fail closed. Never fall back to publicly serving static files. Password rotation denies future requests but does not erase cached app code or device data. Restoring an app backup uses the existing validation/preview/atomic activation/rollback controls; hosting rollback is not a workout-data restore. Do not delete website data to troubleshoot without a verified external backup. No native cloud restoration is claimed.

## Review evidence and remaining gates

See `docs/preview/TEST_RESULTS.md`, `SECURITY_AND_LIMITATIONS.md`, `REAL_DEVICE_CHECKLIST.md` and `MILESTONE_HANDOFF.md`. Local native runtime and Chromium evidence is complete for the tested cases; live Cloudflare routing, certificate, CDN behavior, account budget and physical iPhone Safari are unverified. The owner must approve N04, the exact account/hostname, secure operator access, and acceptance of persistent authorized offline copies before distribution. If those gates cannot be satisfied at $0, stop and return for approval.
