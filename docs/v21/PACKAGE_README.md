# Everyday Athlete V2.1 — unpublished review candidate

Start with source/docs/v21/V21_REVIEW.md, source/docs/v21/README.md and source/V21_CHECKPOINT.md. This ZIP is for owner review, not permission to merge or deploy.

- Tested application source: ba54a5c2f59c22f496911cb3619f4497e71a8068, draft PR #6 on ea/v2-1-reliability-usability.
- Source/development authority: https://github.com/ct801988/everyday-athlete/pull/6 . Later review-checkpoint commit is identified in SOURCE_PROVENANCE.json; only docs/evidence differ from the tested application commit.
- Live comparison/rollback source remains89d087e5746eb36b5763b8356e2204de864e7622. The live preview was not updated.
- Final suites198 PASS /0 FAIL /3 inherited native integration SKIP. Four baseline reproductions and three supplemental recovery checks are separate and not added to candidate suite totals.
- Exact root-build artifact manifest SHA256:3815d15988bd0002176d81e23626ea0be9b1a241898d3c853c8e0c97bbab228d. This candidate/hash is NOT approved for publication.

## Contents

`source/` contains tracked application, legacy compatibility code, tests, lockfile/configuration, instructions and review documentation from the saved branch checkpoint. Historical report images/Git objects/dependencies are excluded; they remain in GitHub. `review/` contains current raw test JSON/logs and native-width before/after screenshots. `review-site/` is the exact static root build with release.json and PWA assets for technical review only. `SOURCE_PROVENANCE.json` records identities and fingerprints; `CHECKSUMS_SHA256.txt` covers all included payloads except itself.

Use Node24.19.0 and run npm ci --ignore-scripts, npm run browser:prepare, then node scripts/validate-v21.mjs from source/. For local interaction run npm run demo. Do not directly open index.html expecting an approved host, or upload review-site to the publisher. Deployment is a separate, exact release approval process with the owner's GitHub gate.

## Screenshots

Before: review/reports/v21-before/{320,390,412}-viewport.png and matching full-workout images use immutable deployed source89d087e in a local test build.
After: review/reports/v21/{320,390,412}-viewport.png and full workout/settings captures use the V2.1 candidate. The390px timer Ready/Running/Done, stopwatch, adjacent grouped cards, finished summary and release/audio Settings files are also included. Viewport images are320/390/412×844; full-page images are longer native-width scroll captures.

All screenshots are desktop Chromium emulation, not photographs of a physical iPhone and not screenshots of a new public deployment. Real Safari/Home Screen/keyboard/background/audio acceptance remains pending. Keyboard and visibility interruption simulations are explicitly test simulations.

Progress proposal screenshots use labelled fictional examples plus insufficient-history states and are NOT implemented in the app. Notification feasibility is a separate approval proposal, with primary-source links. No push permissions, backend, services or cost commitments were added.

## Owner review and rollback

Review the timer controls/completion hold, timed-set stopwatch, group adjacency/unlink and finish summary. The core V2 card layout remains the baseline. Export and verify records before any future approved update/rollback; recover pending V2.1 intents before switching to older code. Do not clear browser storage. Keep source PRs #1–#5 and publisher configuration untouched. No Winter Strong access/modification or unreviewed media integration occurred.

Stop for owner feedback. No merge, new release approval, workflow dispatch or deployment is authorized by this package.
