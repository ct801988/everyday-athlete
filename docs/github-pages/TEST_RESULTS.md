# Executed verification — GitHub Pages evaluation v1.0

Executed locally 2026-10-18 from the current v0.4.0-candidate checkpoint, on a separate local evaluation branch. No GitHub-hosted workflow or Pages deployment was run. No remote repository was created or updated. No credentials or personal workout data were used.

| Check | Passed | Failed | Skipped | Evidence under reports/github-pages |
| --- | ---: | ---: | ---: | --- |
| Root Vite/offline build and separate Pages build | success | 0 | 0 | root-build.log; build.log; pages-artifact.json |
| Typecheck and ESLint | success | 0 | 0 | typecheck.log; lint.log |
| Unit regression + project-path validation | 94 | 0 | 0 | unit.log |
| SQL/PGlite integration regression | 21 | 0 | 3 | integration.log |
| Original lab browser regression | 11 | 0 | 0 | lab-regression.log; lab-browser.json |
| Preserved local/mobile/timer browser regression | 56 | 0 | 5 | local-regression.log; local-browser.json |
| Local Pages deployment simulation | 16 | 0 | 3 | pages-first.log; local-pages-verification.json |
| Workflow YAML/permission/guard inspection | 13 | 0 | 0 | workflow-static.log; workflow-static-checks.json |

**198 executed test cases passed, 0 failed, 11 skipped; 13 additional static workflow checks passed.** Builds/typecheck/lint are successful commands, not invented test counts. Existing native Supabase (3) and physical-device/assistive-tech (5) skips remain. The Pages suite separately skips authenticated GitHub read/write, hosted Actions/OIDC/Pages/environment execution and physical iPhone transfer (3). Repeated gap categories across suites are not independent proof. PGlite and the preserved lab credentials shim are not native Supabase authentication.

The Pages tests use two actual local HTTP origins and Chromium, a temporary persistent browser profile, real IndexedDB/Service Worker/Cache Storage, and synthetic JSON files. They verify exact subpath assets/manifest/SW scope, a schema-1 backup exported by the preserved old synthetic app and imported into the new app, stable IDs/actuals/unknown RIR and effort, namespaced database, no external/workout upload requests, offline logging/history/schedule, unchanged old-host history, genuine browser close/relaunch and offline reopening, new-format backup validation/duplicate import, failed import preservation, release-B activation, compatible release-A artifact rollback preserving workouts, rejected incomplete cache installation, no control over an unrelated path, static-only artifact and valid post-rollback backup.

The prepared workflow is NOT inside .github/workflows and cannot execute as delivered. Static checks parse YAML, verify full-SHA pins resolved from official public action repositories, read-only default token, job dependency and repository/main/PR/publication/public-access gates, environment name, scoped deploy token, immutable rollback SHA/main ancestry and static artifact-only publication. They do NOT prove that GitHub accepts/runs the workflow, runner/package availability, OIDC tokens, hosted artifact deployment, current required reviewers, billing controls, hosted CSP/MIME/HTTPS or account-specific Pages eligibility. Those are blocking live acceptance steps after connection and owner approval.

Development failure: the initial workflow pin-generation substitution matched ARTIFACT_SHA inside PAGES_ARTIFACT_SHA, leaving a malformed Pages action reference. The static pin assertion caught it; the reference was corrected to the independently resolved official upload-pages-artifact SHA. Final 13 checks passed. No Pages runtime scenario failed. Public action-ref network lookups were unauthenticated read-only metadata, not an authorized repository write proof.

The default root build still uses the original database name and root worker scope; path-scoped behavior is specific to the new Pages build. Root regressions pass, protected Worker source/configs were not changed, and the existing packaged/live Cloudflare preview was not replaced. The old 19+19 protected-package results remain historical checkpoint evidence, not new tests rerun or counted here. The original Winter Strong reference and live repository were not changed or accessed as an implementation source.

Limits: the local HTTP simulation is not GitHub's HTTPS/CDN/cache layer; offline behavior on actual iPhone Safari/PWA must be checked. It is not a live commercial hosting-policy or cost certification. GitHub connection discovery still reports installed=false with zero exposed repository tools. Repository read/write, hosted CI and first publication are unresolved, not passed.
