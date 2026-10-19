# First isolated V2 preview — final deployment approval checkpoint
2026-10-19. NOT DEPLOYED; no workflow dispatch and no release approval added.

## Verified publishing state through GitHub connection
Publishing repository everyday-athlete-preview/everyday-athlete-preview.github.io.
Owner manually merged publishing PR #1; GitHub confirms merge and main commit 8b4f0ec36836838fd3c971e3968ca595af9b274c.
Approved-release list in this exact commit is []; candidate-release.json deploymentApproved=false, ownerApprovalRef=null. Workflow has workflow_dispatch only (no push/PR/schedule), exact publishing main job guard, empty release allowlist gate before source build, immutable source checkout, full tests, artifact manifest digest check, then dependent github-pages deployment environment job. Only deploy job has pages:write/id-token:write. Actions refs pinned.
Current latest runs contain only the earlier automatic README Pages build; no application publisher run occurred. ct801988 repository permission verified admin.
Environment and Pages admin settings are NOT exposed by this GitHub connection. Last evidence is owner-supplied screenshots: Pages Source GitHub Actions, HTTPS enforced, reviewer ct801988, prevent self-review OFF, admin bypass OFF, selected branch main only. Owner subsequently reported completing manual setup/merge. Do not describe these as fresh API/direct-browser verification. No cloud browser used for this checkpoint, per owner instruction. If settings changed, stop before release; do not weaken gates.
Merged approval-check JavaScript was executed locally against an empty release list: candidate SHA rejected, unknown valid SHA rejected, malformed SHA rejected; no digest produced. This is NOT a GitHub workflow dispatch or actual environment-gate execution.

## Exact candidate
Authoritative source repository: ct801988/everyday-athlete
Application source commit: 89d087e5746eb36b5763b8356e2204de864e7622
Application source tree: 5a03c856d6375c34a20acaf3723f7c90a96f732d
Source review branch: ea/isolated-pages-preview / draft PR #5.
V2 PR #4 remains draft and unmerged at 539af797c56c3c1ac5a6158b6348079034ed6445.
Deployment URL: https://everyday-athlete-preview.github.io/
Artifact manifest SHA-256 (workflow check): b91602ae9822c2b5054ba2673c535a2b65c62bdc5d032ce6a56a3ad3c3585a6c
Candidate ZIP SHA-256: f5105c5e001aa44fe8f39d76e6299ba8984e5db9666e1f6743665992e6717eac
ZIP: Everyday_Athlete_Isolated_Pages_Candidate.zip, 147161 bytes.
The exact saved ZIP was recovered, not rebuilt or replaced. CRC, all 13 payload-file hashes, release.json source/base/schema and artifact-manifest checksum freshly verified. Payload is compiled JS/CSS, index, three PWA icons, manifest, service worker and release metadata/.nojekyll. No exercise photography or workout backups.
Standalone root manifest uses / id/start/scope; approved host exact everyday-athlete-preview.github.io. Worker waits for all controlled clients to close, no forced activation. Separate origin isolates EA from Winter Strong origin storage and caches. No record migration occurs automatically across origins.

## Test evidence actually inspected
Existing tests executed 2026-10-19, recovered raw reports, NOT rerun or added together with prior runs:
139 unit PASS, 21 integration PASS, 3 integration SKIP (inherited native Supabase/database-login);
17 M1/V2 browser PASS, 1 Pages subpath/offline PASS, 3 root/update/rollback browser PASS.
Total 181 PASS / 0 final FAIL / 3 SKIP.
Previously executed typecheck/lint/production/root builds passed. Initial broad axe label mismatch corrected; final affected suites rerun passed.
Covers workout logging/lifecycle/timers, exact lb/kg/drafts/history, backup/import, migration/recovery interruption, offline, 320/390/412 and accessibility. New worker A/B tests use same application code with different release metadata; they validate replacement/waiting/offline/compatible rollback, not future schema-changing upgrades.
Latest fresh checks this checkpoint: candidate ZIP CRC and 13 file hashes; source/digest identity; merged allowlist reject cases and publishing/source PR metadata.
No physical iPhone, actual hosted application HTTPS, clean GitHub-runner dependency install or GitHub environment-gate execution claimed. The workflow reruns tests and checks the digest before publishing; any failure/digest mismatch must block release and be reported, not bypassed.

## Final authorization requested — not inferred
Approve the first public synthetic V2 preview for the exact source/digest/URL above, including adding a single explicit approved-release record and manually dispatching that release workflow on publishing main. Any release-record publishing PR/merge must be explicitly within that approval; no source PR #4/#5 merges. Owner still clicks the actual github-pages environment deployment approval in GitHub once checks pass.
Do not populate the allowlist or dispatch before this explicit approval. Do not approve the environment job automatically.
Expected cost $0 Free public Pages/standard public Ubuntu runner within applicable limits; no custom domain/DNS, paid services or Cloudflare. Source remains authoritative, no transfer or full-source duplication into publishing repo.

## iPhone / rollback after eventual approval
After eventual hosted checks pass, open exact URL in Safari, Share > Add to Home Screen, use disposable test data first, check lifecycle/units/keyboard/timers and offline close/reopen. Export existing EA and WS separately beforehand; do not import WS JSON into EA. Original-origin records stay there; only explicit compatible EA backup import.
Retain this compatible artifact/source/digest and each approved later release. Export current EA before rollback, deploy only data-compatible release through same approval process, close all app windows for worker switch, never clear website data or blindly downgrade record readers. No physical-device guarantee until owner tests.

Winter Strong repository/deployment/user data untouched by all actions here. No pilot image integration or media expansion; female Hip CAR Front-to-Back storyboard and Back-to-Front variant remain technique-review pending. No application source changes this checkpoint.
STOP for final deployment approval.
