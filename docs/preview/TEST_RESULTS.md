# Actual verification evidence — 17 October 2026

Final checks ran against the preserved v0.3.0 source plus the preview wrapper. They are not hosted production or physical-device certification.

| Suite | Passed | Failed | Skipped | Evidence |
|---|---:|---:|---:|---|
| Unit, including 12 Worker checks | 56 | 0 | 0 | unit-corrected.json/log |
| PostgreSQL WASM integration | 21 | 0 | 3 | integration-final.json/log |
| Original lab browser regression | 11 | 0 | 0 | browser-final.log |
| Local-first browser acceptance | 36 | 0 | 3 | local-final.log |
| Native workerd + HTTPS Chromium preview | 19 | 0 | 3 | native-browser.json, preview-final.log |
| **Total test cases** | **143** | **0** | **9** | reports/preview-preparation/ |

Typecheck, lint, production app/preview build and Wrangler local deployment-bundle dry run passed (corresponding *-final.log). No remote deployment occurred. The dry run reports 12 directory entries; the manifest contains the 10 actual served files. Wrangler 4.151.1 and native workerd were used. Runtime frontend dependencies are unchanged; Wrangler was added as a pinned development dependency.

The three integration skips are native Supabase login/JWT roles, Auth recovery/refresh and Storage/native restoration. The three preserved local-suite skips cover unavailable device/engine/accessibility behavior. The three new skips are live Cloudflare edge/account verification, physical iPhone Safari/Home Screen/VoiceOver and physical Android/TalkBack. Some skipped placeholders overlap device limitations; these are test-case counts, not nine distinct features. All remain unproved rather than passed.

Native cases NG01–NG10 cover missing configuration, unauthorized direct access to every asset, exact authenticated payload hashes, warmed-cache isolation, malformed credentials, unknown/encoded/source paths, unsupported methods, headers/HEAD, secret rotation and absence of generated test credentials in files. NB01–NB09 cover no-login startup, manifest/icons, deliberate actuals and restart, real service-worker cache, offline startup/logging/schedule, backup/duplicate restore, controlled app update, cached-copy persistence after rotation and absence of upload/telemetry requests. Read the JSON for individual names/results.

## Failures encountered and corrected

- Initial local TLS probe failed because the self-signed loopback certificate was untrusted. An API test context was explicitly limited to local loopback with test-certificate tolerance.
- First browser preview run: 8 native cases and 3 browser checks passed before the service-worker certificate and dependent offline tests failed; the run was interrupted. The evidence retains that partial failure. Rerun with Chromium trust pinned to the temporary test certificate's public key passed all final preview cases. No system trust was modified.
- First lint scanned generated .wrangler runtime files and failed. Excluding that generated output fixed lint; application and Worker source remain linted.
- A later full regression unit run had 55 passes and 1 configuration-parser failure: strict JSON.parse rejected JSONC trailing commas. Removed the optional commas, preserving semantics; corrected full unit rerun passed 56/56. Both reports are retained.
- npm/proxy environment warnings are recorded in raw logs. No claim of dependency vulnerability audit, penetration test or live Free-tier CPU performance is made.

## Preservation checks

Git diff from baseline 77ba0a0287e0ee4d96c9d5088b72a7c5ed23c62e has no changes under src/, server/, supabase/, tests/browser/, tests/local/, tests/integration/ or scripts/build-offline.mjs. Existing domain/application behavior and tests remain intact. No remote is configured, no Winter Strong files were changed, and no cloud service/account was used. All exercise prescriptions/media remain synthetic.
