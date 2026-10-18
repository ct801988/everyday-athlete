# Milestone handoff — GitHub source/Pages evaluation v1.0

## 1. Completed versus scope

Completed the available-connection check, source-based Pages preparation, inert automated build/test/publication workflow, scoped offline/static artifact, local deployment simulation, backup/recovery/compatible rollback plan, permission/setup recommendation and approval gates. Authenticated repository read/write and actual hosted deployment could not be completed: GitHub is available but not installed/exposed in this session and no exact repository is authorized yet. Deployment was not authorized. These remain explicit blockers rather than reasons to simulate a successful remote run.

Implementation source: preserved commit 3f1959e5529640adc329df820f145a0fd4566ac9, v0.4.0 mobile/timer candidate. Current Cloudflare and Winter Strong were not modified. Product decisions, existing working features, research, tests and Git history are retained. No mobility, content, accounts, cloud storage, analytics, paid services or remote changes.

## 2. Actual build and tests, including failures

Root/Pages builds, typecheck and lint succeeded. Unit 94; SQL integration 21/3 skipped; lab browser 11; local/browser 56/5 skipped; local Pages 16/3 skipped. Total 198 passed, 0 final failures, 11 skipped. Thirteen workflow static checks passed. A malformed generated action pin was caught and corrected before delivery. TEST_RESULTS.md lists evidence, methods, skips and actual limitations. Remote access/write/Actions/OIDC/site and physical-iPhone checks are NOT passed.

## 3. Files

New: vite.pages.config.ts; scripts/pages-path.ts, build-pages.ts, test-pages.ts and verify-pages-workflow.py; tests/unit/pages.test.ts; deployment/github-pages/pages.yml.disabled; docs/github-pages; reports/github-pages. Modified: src/main.tsx for build-base-aware SW scope, src/local/store.ts for path-based Pages namespace with unchanged root storage, package.json scripts, tsconfig.json inclusion, README/changelog/current-requirements pending-evaluation pointer. Packaging metadata and exact files/hashes are included. Existing Cloudflare candidate bytes/configs and approved decision register are unchanged.

## 4. Outstanding risks and decisions

GitHub writes are unverified; connecting a read-only plugin would not solve publishing. Ordinary personal Pages drops shared-password protection and may require public source on GitHub Free. Private source is not private Pages. Other project sites share github.io origin; namespacing is not authorization. New origin/path needs deliberate backup/import; diverging hosts do not sync. Old schema-1 Cloudflare code cannot automatically consume all newer schema-2 backups. Physical Safari/Files/PWA and live hosting/billing/environment controls are unverified. Full source/history requires disclosure review before any public push.

## 5. Recommended next assignment

Approve exact separate GitHub owner/repo/visibility and restricted connection, then perform reversible branch/PR write proof and CI-only setup with deployment disabled. Recommended hosting remains the current protected Cloudflare Worker with a separately reviewed GitHub deployment path, achieving no-copy updates without changing preview privacy/origin. Pages is the prepared alternative only if public access is explicitly accepted. Return hosted CI evidence before initial publication approval.

## 6. Owner approvals

Approve repository creation/upload scope and access; choose private-Cloudflare versus public-Pages hosting; later approve exact release and migration after write/CI/environment/cost checks. No repository creation, public publication, irreversible change, paid plan, Cloudflare deletion, Winter Strong access or next development phase is approved or performed by this preparation. Stop at APPROVAL_CHECKPOINT.md.
