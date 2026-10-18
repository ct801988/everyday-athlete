# Pages access preflight — owner direction accepted

Current owner direction supersedes the v1.0 recommendation to retain Cloudflare hosting: proceed toward a separate Everyday Athlete GitHub Pages development preview, publicly accessible, with no app accounts/passwords. Publication, automatic production deployment, costs and Cloudflare retirement remain prohibited. The source is the preserved v1.0 evaluation / commit 1497ee8 and v0.4.0 application. Winter Strong is neither modified nor used as implementation source.

## The immediate blocker

The GitHub plugin discovery again reports installed=false; this session exposes no GitHub repository tools and has no gh CLI. A GitHub installation/connection was offered. That does not install it, authorize a repository, or prove writes. No authenticated account/repository probe, branch, remote commit or PR can honestly be reported as successful. No remote was created/configured locally.

One-time owner steps:
1. Install GitHub in this Work session. Use direct GitHub authorization, not Google. Do not paste tokens/passwords in chat.
2. Select ONLY the separate Everyday Athlete repository if the authorization UI supports selected repositories; exclude Winter Strong and “all repositories.” If the UI cannot offer the desired restriction, stop rather than accepting broad access. Connecting a read-only app alone may not provide writes; capability testing comes next.
3. Supply the exact new repository URL. Proposed repository name is everyday-athlete; availability and account owner are unverified. If creating it yourself before the write proof, a private repository with an initial README and Pages OFF is a reversible staging choice, not a public-source or paid-service decision. Do not enable Actions/deployment during that bootstrap. No repeated manual code upload is planned.
4. For eventual free personal Pages, source generally must be public. The owner has approved public website access, not explicitly disclosure of all source/history. Confirm source visibility before any public upload or visibility change. An already-eligible paid GitHub plan could keep source private without a new purchase; that plan is unverified. No upgrade is authorized.

Minimum intended write scopes: selected repository only; Metadata read, Contents read/write, Pull requests read/write; Actions read when inspecting runs; Workflows write only if editing workflow files. No Administration, unrelated private repositories, secrets-management, deletion or account/org admin. Prefer an installed App/restricted secure credential; only consider a short-lived repository-selected fine-grained token through a secure credential channel if the actual integration lacks writes. Never request a token in a chat message. Branch rules are required because Contents write does not inherently prevent direct pushes to main.

## Authorized write proof once connected and target is confirmed

Read authenticated identity, exact owner/repository, default branch/HEAD and visible permission capabilities. Restrict all calls to the approved target. Create ea/access-verification from its current HEAD; commit a harmless verification markdown file with a known content hash; read the commit/file back; open a draft PR against the default branch and report branch/commit/PR URL. Do not merge, force push, delete anything, change repository visibility/settings or enable Pages. If the connection is read-only, report failure precisely; do not claim that a successful login proves commits. If the repository is empty, obtain/perform the authorized initial default-branch bootstrap before creating the proof branch.

## Storage-isolation gate

A new repository under the SAME owner.github.io hostname is a new path, not a new origin. The current app uses a path-specific database/cache namespace and service-worker scope, which prevents accidental mixing. It does NOT block another script on the same origin from reading the app's IndexedDB. The new synthetic PG17 test demonstrates that a sibling path can read its two synthetic performed sets. That is a passed test of a real limitation, not a passed confidentiality guarantee.

A root-scoped existing service worker may also affect a new sibling app. The actual Winter Strong URL, deployed worker scope and third-party scripts were NOT accessed or inspected; live isolation cannot be certified. Do not infer the hostname from past account names. At publication planning, supply/confirm the intended host strings; no Winter Strong access is needed for a hostname comparison. If both hosts match, either explicitly accept a shared-origin trust boundary for this pilot or approve a distinct free GitHub account/organization origin or an existing separately controlled custom domain. No new account, organization, domain or service is created by this proposal. Distinct hostname is the stronger isolation choice. Path naming is not a substitute.

## Final publication checkpoint

Keep pages.yml.disabled outside .github/workflows; publication flag unset/false; Pages disabled. After write proof, prepare a CI-only PR and verify the hosted React/TypeScript build and test runs without uploading/deploying a Pages site. Confirm $0 controls before any hosted jobs on private repositories. Check reviewers/environment support, exact repository/public-source choice and intended hostname. Require owner review of exact release commit, successful hosted CI, backup-transfer plan and storage-isolation decision before separately enabling publishing. Do not merge/publish merely because GitHub access works.

Long-term path remains: Work branch/commit/tests/PR → owner approves → merge and automatic build → approved publish policy/environment → Pages publication. No per-release file upload/copying is required once the secure write path and workflow are proven. This handoff does not start that deployment step.
