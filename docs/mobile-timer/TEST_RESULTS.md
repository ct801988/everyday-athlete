# Actual verification — v0.4.0-candidate

Executed locally on 2026-10-18, Node 24.19.0; TypeScript 6, Vite 8, Vitest 5, Playwright 1.64.1 and Chromium 153. Native Worker tests use Wrangler 4.151.1/workerd over loopback HTTPS with ephemeral random credentials. These are executed results, not planned acceptance assertions. Raw logs/JSON are in reports/mobile-timer.

| Final check | Passed | Failed | Skipped | Evidence |
| --- | ---: | ---: | ---: | --- |
| Production build + protected dashboard bundle | success | 0 | 0 | build-dashboard.log; generated package metadata |
| Typecheck | success | 0 | 0 | typecheck.log |
| ESLint | success | 0 | 0 | lint.log |
| Unit contracts, coaching, backup, Worker and timer | 82 | 0 | 0 | unit.log |
| PGlite SQL/integration regression | 21 | 0 | 3 | integration.log |
| Original lab browser regression | 11 | 0 | 0 | lab-browser.log/json |
| Local-first + mobile timer browser acceptance | 56 | 0 | 5 | local-final-verified.log; local-browser.json |
| Protected static Worker runtime/browser | 19 | 0 | 3 | protected-static.log and protected-static/native-browser.json |
| Protected embedded dashboard Worker/runtime/browser | 19 | 0 | 3 | protected-dashboard.log and protected-dashboard/native-browser.json |
| Exact candidate/hash/copy-helper artifact checks | 4 | 0 | 0 | review-artifact-checks.json |

208 test cases passed, 0 failed and 14 skipped across the six test suites; 4 additional artifact checks passed. Build/typecheck/lint are separate successful commands, not invented test counts. Duplicate scenario coverage across suites is intentional; these are executed cases rather than unique product requirements.

Three integration skips concern native Supabase authentication/JWT, native storage authorization and native restoration, still deferred for this local-only pilot. Five local/browser skips identify physical iPhone Safari/PWA, Android and assistive-technology gaps (some appear in both inherited and new tests). Three skips per protected-package suite concern live edge/account-cost settings and physical platform testing. Skipped cases were NOT run or treated as passes. Owner's earlier v0.3.2 device observations do not certify this candidate.

The 36 preserved local acceptance tests still pass. New T01–T22 cover defaults/presets/custom values, deliberate start and no phantom actuals, locked running edits, immediate reset/cancellation, preference/selection independence, single sound invocation, Silent, blocked-audio fallback, visual-only restored/background expiry, elapsed-time calculation with throttled callbacks, overlays/session/tab continuity, full backup restoration, legacy migration retention and failure atomicity, offline reload/logging, fixed dock/targets/accessibility, two-tab at-most-once completion, canonical conditioning mapping and focused-field clearance. T16/17 are explicit hardware skips. The old L08 timer control name and L27 expired output assertions were updated solely for the approved new behavior; unrelated regressions remain.

Automated axe checks found zero violations on the tested expanded timer and overlay. Width/height simulations: 320×740, 390×844, 412×915 and 844×390 plus inherited desktop/Android Chromium emulation. Logged target bounds are at least 44×44 CSS px; normal dock height 74px. Screenshots are synthetic local builds. There is no physical Safari/Android, VoiceOver/TalkBack, locked-screen or Dynamic Type certification. Web Audio instrumentation verifies one oscillator invocation and reset suppression, not physical speaker output. Background visibility is simulated; it is not a real iOS suspension test.

Protected-package checks deny every known application asset without credentials, fail closed with missing configuration, reject alternate/query/encoded/unknown paths, preserve auth-before-assets and private/no-store headers, verify manifest/icons/JS/CSS/service worker, no data upload endpoints/telemetry, controlled offline cache updates, password rotation and duplicate-backup restore. Previously cached offline copies deliberately remain available after rotation. Live deployed edge configuration and free-plan limits are not proved by local runtime tests.

## Failures found and resolved during development

- Initial typecheck exposed an inherited expired-timer test constructing the removed paused field; it now constructs the approved Running state. Initial lint found an unused backup envelope schema; exports now validate through it. A later new QA script needed its browser navigator global declared. Final commands pass.
- First combined browser run: 50 passed, 1 failed, 5 skipped. Preference-reload assertion reloaded before the selection write committed. Timer writes now participate in pending-write/unload protection; the test waits for the saved selected value before reload. Subsequent run: 51 passed, 5 skipped.
- An intermediate expanded suite recorded 54 passed, 1 failed, 5 skipped. Its throttled-clock test advanced virtual time before the Start transaction committed, so the run correctly started at the later time. It now explicitly waits for Running before advancing time. Final 61-case run: 56 passed, 5 skipped, no failures/flakes. Retained initial JSON/logs document the failure; they are not the final acceptance evidence.

No unresolved automated test failure remains in the delivered candidate. Manual/device and future-native-cloud limitations are in KNOWN_ISSUES_AND_APPROVALS.md. No production deployment or paid service was used to obtain these results.
