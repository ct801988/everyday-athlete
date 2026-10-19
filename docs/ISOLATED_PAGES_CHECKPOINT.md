# Isolated GitHub Pages preparation checkpoint
2026-10-19. Prepared, NOT DEPLOYED.
Source commit: 89d087e5746eb36b5763b8356e2204de864e7622
Source Git tree: 5a03c856d6375c34a20acaf3723f7c90a96f732d (local staged tree exactly matches remote saved tree).
Branch: ea/isolated-pages-preview
Draft PR: https://github.com/ct801988/everyday-athlete/pull/5
V2 rollback / untouched PR #4 branch: 539af797c56c3c1ac5a6158b6348079034ed6445.
Origin: https://everyday-athlete-preview.github.io/ — organization creation reported by owner; publishing repository not yet visible through authorized connection. No live HTTP/iPhone verification.

## Implemented
Exact dedicated-host/root opt-in, refusal of ct801988.github.io and unapproved sibling paths before importing application or opening records/worker; root manifest/icons/start URL; scoped versioned static cache; worker never forces activation. Waiting version applies only after all controlled app windows close. Existing V2 data contracts, prescribed/performed separation, migration, backup and logging behavior unchanged. Only UI modification is accessible rest-button name now includes its visible status/countdown; no styling/layout change.
Prepared inactive deployment/isolated-pages/publish.yml.template; not installed as executable workflow. Manual-only dispatcher, exact source SHA allowlist (empty), final-owner-approval evidence, tested artifact digest check, pinned action SHAs, standard Ubuntu runner, environment-gated separate deploy job. No token with cross-repo write permission needed: publisher reads public source. GitHub settings/reviewer policy must be configured by owner/admin; template alone cannot enforce them.

## Executed validation — final distinct totals
| Group | Pass | Fail | Skip |
|---|---:|---:|---:|
| Unit |139|0|0|
| Integration |21|0|3|
| M1/V2 browser |17|0|0|
| Existing Pages subpath/offline |1|0|0|
| Isolated root/update/rollback browser |3|0|0|
| Total |181|0|3|
Three integration skips are inherited native Supabase/database-login checks, not newly hidden failures.
Typecheck, lint, normal production build and exact-host root build PASS.
Separate static workflow validation PASS: YAML syntax, manual-only trigger, build dependency, protected environment reference, pinned actions and empty release allowlist. Workflow has not executed in GitHub; no Actions deployment/settings test claimed.
Browser evidence covers logging/timers/units/exact history, migration interruptions, offline, backup/import/recovery, 320/390/412 and axe. New actual-worker A/B release tests preserve whole stored workspace plus active/paused sessions and exact unfinished draft values through update, offline and compatible rollback. A/B have the same app code with different release metadata; this does NOT validate a future schema-changing update. Different localhost ports simulate isolated origins; actual GitHub HTTPS origins remain unverified.
Initial broad axe scan caught an existing timer visible-label/accessibility-name mismatch; corrected in App.tsx. Root suite and full 17-test V2 suite rerun and passed. Earlier failed run is not added to final totals.
Node v24.19.0. Existing dependency installation reused locally, with unchanged lockfile; clean npm ci on GitHub still pending. No physical iPhone, Safari, background sound or keyboard certification.

## Exact artifact
Built using source commit above, EA_ISOLATED_PAGES=1, EA_PAGES_BASE=/,
VITE_EA_APPROVED_HOST=everyday-athlete-preview.github.io.
Artifact hash-list SHA-256: b91602ae9822c2b5054ba2673c535a2b65c62bdc5d032ce6a56a3ad3c3585a6c.
release.json identifies source SHA and datasetSchema 3. Thirteen static files. No pilot photography or workout backup is in published payload. Build uses synthetic demo library; no prescriptions/media publication approved.
Minor existing Vite warning: extensionless TS imports may need explicit extensions if Vite later changes its config loader default; current build passes.

## Exact safe resumption / owner action
Owner creates public publishing repository everyday-athlete-preview/everyday-athlete-preview.github.io with README, leaves Pages disabled, and grants connection access only there if needed. Current toolset has no repository creation operation. Do not substitute another repo/organization or Cloudflare.
Once repository is visible: inspect initial SHA/settings; prepare reviewed publishing branch/PR containing workflow and empty ledger, preserving README. Workflow write/admin permissions may need owner authorization/clicks. Do NOT enable Pages, populate approved releases or run deployment before explicit final approval.
Owner/admin must configure github-pages reviewer/allowed-main policy (sole owner self-review permitted, admin bypass disabled). Verify protections, exact source/digest, public preview scope, HTTPS and Free plan before first dispatch.
Do not merge PR #4, PR #5 or other drafts. Main unchanged. No public preview is live. Keep exercise media separate and pending review.

## Update / rollback / iPhone
Save/export current EA, close all Safari tabs and installed app windows for this origin, reopen online for waiting worker activation, verify controlled /release.json. No forced activation, data clearing or mass unregister. Existing origin data stays in original origin; explicit compatible import only. Never import Winter Strong backups as EA.
Retain tested artifact and full source SHA with each approved release; compatible previous release can be redeployed through same gated workflow. Export latest data first, never blind schema downgrade. V2 tagged draft-unit readers must be preserved.
After eventual hosted approval: Safari online > Share > Add to Home Screen; test disposable data and verify Safari/standalone storage behavior on physical iPhone, keyboard/timer clearance, offline close/reopen, backup/restore and update. Browser storage durability is not guaranteed; retain exports.
No Winter Strong repository/application/deployment/user data was read or changed; only previously supplied reference evidence remains historical. No expenses, merge, infrastructure creation, publication or image integration this checkpoint.
STOP for repository creation/access, infrastructure review and final deployment authorization.
