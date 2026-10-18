# Actual results — Assignment003 / v0.3.0

17 October2026. **112 passed; 0 final failures; 6 skipped.** This is a local software-preview result, not training approval, physical-device certification or cloud authentication verification.

| Check | Actual result | Evidence |
|---|---|---|
| Clean dependency install | npm ci --audit=false passed,185 packages | reports/assignment003/install-final.log |
| TypeScript / ESLint / normal asset build | Passed, including current-source verification | *-final.log and *-current.log |
| Unit |44 passed (35 preserved +9 local contract tests),0 failed | unit.json / unit-final.log |
| PostgreSQL-WASM SQL integration |21 passed,0 failed,3 native-cloud skips | integration.json / integration-final.log |
| Preserved lab Chromium browser |11 passed,0 failed | lab-browser.json / lab-browser-final.log |
| Local real-IndexedDB Chromium browser |36 passed,0 failed,3 explicit device/accessibility skips | local-browser.json / local-browser-final.log |
| Synthetic backup sample | Generated, strict parser/checksum validation passed; no actual sets | fixtures/assignment003-backup.synthetic.json |
| Production bundle boundary | Test harness, lab credential and API-login markers absent | production-boundary.json |
| Source preservation | Original App/domain/overlay/server/SQL/regression files unchanged | preservation.json |
| Visual QA |320px overlay inspected internally; keyboard/axe/mobile layout automated checks passed | Screenshot excluded from deliverable |

## What ran

Local tests use actual browser IndexedDB transactions, persistent Chromium user-data directory close/relaunch, separate profiles, multi-tab revision/restore checks, parser and format validation, consistent snapshot export, full backup download/import roundtrip, quota-injected write/staging failures, explicit transaction abort, rollback, populated schema upgrade/failure/future-version guard, service-worker offline startup/reload and explicit update activation. Mobile narrow/landscape and Android touch/UA simulation run in Chromium, not iPhone Safari. Fault injection tests supplement normal engine execution; no real device power-loss or actual disk exhaustion is claimed.

All L01–L29 have executed automated scenarios. L17 also calls for manual screen-reader coverage that remains unrun. L30 physical iPhone Safari and Android behavior is explicitly skipped because devices/access are unavailable. No WebKit/Safari-engine, VoiceOver/TalkBack or Home Screen certification is claimed. Three original native Supabase Auth/JWT/Storage/restoration placeholders remain skipped/deferred per DEC-011. They are neither passed nor waived.

## Failures encountered and corrected

The first local pass was interrupted after an inaccessible exact selector label and a test that reloaded before Undo committed; explicit labels and transaction-aware assertions corrected these. Another interrupted pass exposed the shell intercepting the test-harness route; caching now targets app navigation paths only. A full pass then returned24 passed/5 failed/2 skipped: failures covered status-output selector ambiguity, deferred DOM-event reads reverting session/context changes, mobile intrinsic-width overflow, self-delivered tab notifications and offline asset cache lookup. Capturing event values synchronously, source-tagged tab messages, layout bounds and safe same-origin immutable-cache matching corrected them. A subsequent full pass returned27 passed/2 failed/2 skipped, then29 passed/0 failed/2 skipped. Additional failure-path cases expanded the final suite to36 passed/3 skipped.

An early lab-browser run returned10 passed/1 failed because simultaneous suites shared Playwright artifact directories and removed each other's traces. Local tests now use their own output directory, and final suites run sequentially: all11 original browser tests passed. One final-check attempt stopped at lint (unused test result assignment); corrected and the full pipeline then passed. These earlier/interrupted logs and full third/fourth JSON reports remain in reports/assignment003. No final failed case is reclassified as skipped. Final source review also corrected performed-date preservation during reopen/correction, with a new passing unit regression and another successful local-browser run.

## Limits and reproduction

Node24.19.0/npm11.9.0, pinned Chromium153.0.8010.0/Linux x64; package-lock pins dependency graph. Existing local SQL proof uses PostgreSQL-WASM, not native Supabase. Follow README test commands sequentially with synthetic profiles. No app code or credentials are provisioned in the cloud. The last UI hardening/CSS change was followed by a fresh local-browser run and current build/typecheck/lint checks; source hashes and package validation identify the delivered files. Source ZIP excludes engine data, screenshots/traces, dependencies and generated build directories.
