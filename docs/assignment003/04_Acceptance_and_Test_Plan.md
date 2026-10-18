# Assignment 003 proposed acceptance and verification

Version 1.0 • **all L-series tests below are planned, not executed**.

## Existing evidence and regression preservation

The recorded native follow-up ran 35 unit +21 PostgreSQL-WASM SQL integration +11 Chromium browser tests: 67 passed, 0 failed, 3 native placeholders skipped. Build/typecheck/lint passed. Source inspection and document consistency checks were performed for this planning task; no application build or tests were rerun because no application files changed. Existing results do not prove the new IndexedDB authority, no-login path, service worker or browser restore.

After implementation, run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:integration`, and `npm run test:browser` for the retained lab mode. Keep its synthetic auth/security cases isolated and useful. Add separately named local unit/integration/browser scripts, documenting exact final names in README; none exist yet. Run a cached production build on loopback for service-worker tests, not Vite HMR alone. Each adapter gets its own contract suite: a passing SQL transaction is not evidence of an IndexedDB transaction.

## Required acceptance matrix

| ID | Scenario / required assertion | Proposed level |
|---|---|---|
| L01 | Fresh profile opens setup, picks a permitted program, reaches today's workout without registration, synthetic credentials, API or cloud requests | Browser + network denial |
| L02 | Foundation3/Strength4 metadata and setup; Fit pending label; unreviewed content never appears approved | Unit + browser |
| L03 | Suggestions/draft edits create no performed set; one deliberate Done creates one actual; optional RIR default OFF/null; same retry does not duplicate | Local adapter + browser |
| L04 | Correct then Undo then restart: accurate current state and prior audit, no loss of prescription or duplicate completion | Adapter + browser |
| L05 | Bulk cancel writes nothing; explicit reviewed-value confirmation writes precisely selected rows atomically; bad row rolls all back | Adapter + browser |
| L06 | Setup/preferences/schedule/history/actuals persist across page reload and true browser close/relaunch using the same persistent profile | Browser persistent context |
| L07 | Partial workout resumes exact saved drafts/confirmed sets after interruption; finish/reopen doesn't invent omitted sets | Adapter + browser |
| L08 | Overlay open/close/Back/Escape/accessible carousel preserves tab/exercise/scroll/focus/drafts and timer; no phantom records | Browser + manual screen reader |
| L09 | Effort target pinned to conditioning session; actual optional/null, corrected independently, unrelated to strength RIR; above-target never rewards/escalates | Unit + adapter + browser |
| L10 | Open-tab offline edits and Done commit locally; restart cached app offline with complete history and no API; retry remains idempotent | Production-build browser |
| L11 | Disabled IndexedDB, denied persistence, quota/write abort produce honest failure state; no false saved badge or silent memory-only success | Fault-injected adapter + real browser |
| L12 | Two tabs edit same revision: stale command conflicts; receipts prevent replay; restore lock/revision protects against concurrent edits | Real IndexedDB multi-tab |
| L13 | Any-day start, exact3/4 preferred weekdays, missed sessions carry forward in order, explicit reschedule preview preserves completed actual dates | Unit + adapter + browser |
| L14 | History and next recommendation use only comparable deliberate actuals, honor partial/modified/pain/recovery guards; missing RIR alone doesn't block | Unit + adapter |
| L15 | Same inputs/versions give identical recommendation; persisted rule/evidence/input revisions explain result; no live AI/network | Unit + browser |
| L16 | Distinct browser profiles/devices have independent empty records; same-profile access limitation visible; no secure person-switcher claim | Two persistent profiles + manual |
| L17 | Minimal setup/returning launch, summary/history/settings work at320/390px and landscape with keyboard/focus/screen reader and reduced motion | Browser axe + intended-device manual |
| L18 | Export consistent dataset revision during concurrent save; fresh-profile restore preserves IDs, sets, nulls, audits, prescriptions, dates, preferences and comparable history | Adapter + browser roundtrip |
| L19 | Truncated/malformed/wrong format/future version/checksum mismatch, invalid ranges/IDs and duplicate JSON keys rejected before mutation | Parser unit + adapter + browser |
| L20 | Exact same backup twice makes no duplicate data; conflicting IDs/payloads rejected; valid older snapshot requires explicit whole-dataset preview/confirmation | Adapter + browser |
| L21 | Restore cancel, missing pre-export, cross-person acknowledgement omitted or new edits during preview leave active data unchanged | Adapter + browser |
| L22 | Quota exhaustion, process close or transaction abort during staging/activation leaves original active dataset readable; no half restore | Adapter fault injection + persistent browser |
| L23 | Switch back to pre-restore dataset recovers exact former history; both datasets remain distinct, later edits not silently merged | Adapter + browser |
| L24 | Oversized/deep/too-many-record files safely rejected; imported text is inert; CSV formula prefixes escaped; backup has no credentials | Parser + browser |
| L25 | Populated old schema upgrade preserves records; failed upgrade retains readable old version; future schema handled non-destructively | Real IndexedDB migration |
| L26 | Update while workout active waits for safe point; restarts retain state; service-worker cache/DB compatibility failures don't erase data | Production-build browser |
| L27 | Schedule timezone/DST and device clock changes preserve sequence/date identity; expired/restored timers don't restart or mark actuals | Unit + browser |
| L28 | Clear-data warning/backup reminder shown; storage-persistence denial doesn't imply backup; exported file recovery demonstrated on a separate profile | Browser + manual rehearsal |
| L29 | Imported or unavailable canonical media doesn't execute/fetch arbitrary URLs; synthetic content/review status survives export/restore | Unit + browser network checks |
| L30 | Intended iPhone/Safari and Android/Chrome pilot scenarios cover restart, file download/picker/import, storage lifecycle, offline shell and timer backgrounding | Manual actual devices; unrun cases explicit |

## Test execution and evidence requirements

Use only synthetic records for automation and recovery rehearsal. Capture exact commit/tool/browser/OS versions, commands, totals, failed assertions, retries, skips and fixture schemas. Preserve machine-readable outputs and initial failures when corrected. Avoid personal data in reports/backups/screenshots. Verify the ZIP by CRC, manifest hashes, and clean extraction/setup. Check source and dependency manifests contain no cloud credentials, unexpected network services or Winter Strong changes.

Browser integration must use actual IndexedDB, not only fake-indexeddb. Unit mocks may isolate faults but cannot satisfy restart, multi-tab atomicity or platform restoration. Test true persistent contexts rather than closing a tab and calling it a device restart. Manual physical-device checks are separate from Chromium viewport emulation. Access to missing devices or local secure contexts must be reported as a blocker for the corresponding pilot support claim.

Definition of technical pass: required local data integrity/recovery cases execute with no unresolved failures; regressions pass or their changes are reviewed and justified; no critical accessibility/data-loss defects. Record native tests as explicitly deferred per DEC-011, never green. A report may be technically partial if a required target platform cannot be tested. No fixed expanded test count is promised: report actual executed cases and parameterized counts after implementation.

## Future cloud gate, retained

Before accounts/cloud backup: real Supabase password/recovery/refresh/expiry and JWT validation, cross-user read/write/RPC and Storage authorization, native database plus object restoration, local-to-account consent/conflict behavior. Existing native verification plan remains the reference. It is deferred for this local pilot only; its three skips are not reclassified as passes or replaced by no-login tests.
