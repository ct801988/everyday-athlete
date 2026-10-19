# Isolated GitHub Pages publisher — NOT deployed

Source authority: ct801988/everyday-athlete. Publishing-only repository:
everyday-athlete-preview/everyday-athlete-preview.github.io. Exact app origin:
https://everyday-athlete-preview.github.io/ (root). No other applications belong
on this organization hostname. Public preview, not authenticated/private hosting.

## Owner setup, in order
1. Create the Free public publishing repository with README. Leave Pages disabled.
2. Grant the GitHub connection access only to that repository if needed. Organization
   owner/repository admin permissions are needed for settings; do not grant access to Winter Strong.
3. Review and install this template as .github/workflows/publish.yml in publishing
   repository main. Keep approved-releases.json empty until final deployment approval.
   This is infrastructure setup in the publishing repository, not a source/main merge.
4. Before enabling/running deployment, create github-pages environment with owner
   required reviewer; restrict deployment to main; disable admin bypass. For a sole
   reviewer leave Prevent self-review off to avoid blocking owner-triggered approval.
   Confirm these settings manually: workflow YAML alone does not enforce environment configuration.
5. Only after separate final authorization, enable Pages via GitHub Actions and HTTPS.
   Do not set custom domain, DNS, paid plan, analytics, Functions or Cloudflare.
6. Record exact reviewed source SHA, SHA-256 of reports/github-pages/pages-artifact.json,
   ownerApprovalRef and deploymentApproved:true in a reviewed approved-releases.json
   entry. Empty ledger deliberately prevents all releases. No secrets or workout data.
7. Run workflow manually with that source SHA, then approve the deployment job in GitHub.
   No development-push deployment exists. Every approved release automatically builds,
   tests, checks the exact artifact digest and publishes; no generated-file copying.

Example ledger shape (not an approval):
`[{"sourceSha":"<40 hex>","artifactManifestSha256":"<64 hex>","ownerApprovalRef":"<explicit approval reference>","deploymentApproved":true}]`

Source is public; publishing workflow reads it by exact SHA. It needs no cross-repo
write token, no personal access token, and never pushes to source. Local connector
workflow-write permission may be unavailable; owner may need to install the reviewed
workflow once in GitHub. The template is outside .github/workflows in source and cannot run.
Standard public Ubuntu runners only; Node 24.19.0 and lockfile pinned; action refs pinned.
Workflow is prepared/static-checked, not GitHub-executed until repository/setup exists.
Future PR CI may test every change but must have no Pages deployment permissions.

## Build and updates
Use EA_ISOLATED_PAGES=1, EA_PAGES_BASE=/,
VITE_EA_APPROVED_HOST=everyday-athlete-preview.github.io and EA_PAGES_RELEASE_SHA=<tested SHA>
with npm run build:pages. Root is refused without that exact opt-in. Legacy project
build defaults/validation remain separate. Manifest is standalone with root id/start/scope.
Only static compiled assets, icons, manifest, worker and release metadata are published;
no source ZIP, backups, keys or unreviewed exercise photographs.

The isolated worker never calls skipWaiting, even for ACTIVATE messages. Save and export,
then close every Safari tab and installed app window for this origin before reopening
online to apply an update. Existing controlled windows retain their version/session.
SW revision is in cached /release.json; deployment success alone does not prove iPhone
has switched versions. No origin-wide cache clearing or forced refresh instructions.
Initial root database is everyday-athlete-local-m1 on a NEW origin. Old EA data stays at
its old origin; export/explicit compatible import is required. WS backups are not EA imports.

## Validation / rollback
Read docs/ISOLATED_PAGES_CHECKPOINT.md for actual results. Browser test releases A/B use
identical application code and different release metadata to exercise actual SW replacement,
waiting, offline reopening and rollback. They do not validate a future schema-changing update.
No physical iPhone claims. Real Safari/installed-PWA storage, keyboard, background timer,
sound, update switching and persistence must be tested after final hosted approval.

Preserve every released source SHA, artifact hash list and deployment artifact. Export latest
EA records before rollback; use a data-compatible release only (current V2 reader supports
tagged draft units; older strict readers may reject them). Re-run workflow for an approved
compatible previous SHA/digest, approve gate, then close/reopen clients for SW replacement.
Never clear website data, downgrade storage, delete history or touch Winter Strong. Short-lived
Actions artifacts are not durable backups; retain the downloadable release package separately.
Expected $0 public Free Pages; remain within artifact/storage limits and avoid paid runners.
