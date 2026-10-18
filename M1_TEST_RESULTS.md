# M1 reconstruction — executed verification
2026-10-18. Candidate 0.5.0-m1-candidate. These are fresh reconstruction results, not the interrupted session's reported 206/8.

| Command / suite | Pass | Fail | Skip |
|---|---:|---:|---:|
| Unit (`npm run test:unit`) | 117 | 0 | 0 |
| Integration (`npm run test:integration`) | 21 | 0 | 3 |
| Current M1 browser (`npm run test:m1`) | 11 | 0 | 0 |
| Prepared Pages/offline (`npm run test:m1:pages`) | 1 | 0 | 0 |
| **Automated test cases total** | **150** | **0** | **3** |

Typecheck, lint, production/offline build and Pages build PASS. Logs are in reports/m1. Browser JSON reports contain exact scenario names and execution evidence. Three viewport scenarios include axe WCAG 2 A/AA checks with no violations. Screenshots: workout-320.png, workout-390.png, workout-412.png. Tested desktop Chromium, not physical iPhone.

Three skipped integration checks: native PostgreSQL login roles/real JWT, full GoTrue Auth/recovery/refresh, and Supabase Storage/native restore. They are explicitly skipped in the inherited database suite and are outside this no-login local pilot.

Browser evidence includes idempotent storage retry, cross-tab revision rejection, transaction abort, exact legacy object retention, simulated quota failure, interrupted restore, 120 repeated draft writes without full-session audit inflation, export/import/rollback; continuous multi-exercise logging, extras, manual grouping, pause/refresh/resume, partial finishing; silent default deadline completion/green/reset; overlay exact focus/scroll; offline reopen/export/import; independent localhost/127.0.0.1 origins retaining distinct datasets and unaffected original caches; prepared Pages path offline shell.

Unit boundary evidence includes v1/v2 statuses and signed backup conversion, nullable RIR, immutable source preservation, invalid future versions, corrupted signatures, duplicate keys, depth/byte/node budget rejection, wrong prescription links, complete/partial recomputation, reversed clocks, two-hour gap review, active/paused intervals and user duration corrections.

Pending, not claimed tested: physical iPhone software keyboard/safe-area and lock/process restart, audible beep under iOS restrictions, approved dedicated hostname/DNS/redirects and real-host update/rollback. Simulated quota failure is not measurement of device capacity. An initial test locator ambiguity was corrected; final reruns pass. No old-session 206/8 evidence was promoted to verified.

Historical single-exercise UI and full laboratory browser suites were not run against the replacement UI. Their source is retained for the historical app; current M1 commands are documented in M1_README.md. No public CI jobs or deployment were started.
