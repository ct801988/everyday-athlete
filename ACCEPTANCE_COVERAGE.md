# Assignment003 acceptance coverage

Actual local results are in reports/assignment003/acceptance-cases.json. No inferred manual passes.

| Planned ID | Executed coverage | Disposition |
|---|---|---|
| L01 | L01 first run works with no registration/API/cloud | Automated passed |
| L02 | L02 Foundation3 / Strength4 with Fit pending | Automated passed |
| L03 | L03 deliberate Done and replay receipts, no suggested actuals | Automated passed |
| L04 | L04 corrections and undo preserve audit after reload | Automated passed |
| L05 | L05 bulk cancellation and atomic invalid group | Automated passed |
| L06 | L06 true persistent browser close and relaunch keeps history | Automated passed |
| L07 | L07 partial session continuity and no phantom full completion | Automated passed |
| L08 | L08 overlay preserves draft, focus, timer, Back and Escape | Automated passed |
| L09 | L09 separate optional conditioning reports and no above-target reward | Automated passed |
| L10 | L10 cached startup/reload and offline history/scheduling/logging | Automated passed |
| L11 | L11 quota/put failure is atomic; no saved claim; L11b visible failed write retains editable value and never claims saved; L11c unavailable IndexedDB fails closed with clear error | Automated passed |
| L12 | L12 two tabs reject stale revisions and active-dataset switch; L12b restore invalidates a stale tab and refuses silent overwrite | Automated passed |
| L13 | L13 any-day sequence, explicit reschedule and immutable completed slots | Automated passed |
| L14 | L14 comparable actual history drives coaching, not drafts | Automated passed |
| L15 | L15 deterministic explanations and pain guard retained locally | Automated passed |
| L16 | L16 separate browser profiles have independent records | Automated passed |
| L17 | L17 narrow mobile/landscape keyboard and automated accessibility; L17b desktop and Android Chrome mobile simulation retain usable logging | Automated passed; manual/device deferred |
| L18 | L18 full backup roundtrip restores into fresh profile; L18b snapshot export uses immutable revision while another write commits | Automated passed |
| L19 | L19 malformed/future/checksum/duplicate-key imports leave current history | Automated passed |
| L20 | L20 duplicate no-op and conflicting snapshot rejection | Automated passed |
| L21 | L21 missing pre-export, cancel and new edits during preview are safe; L21b restore preview cancellation changes no records | Automated passed |
| L22 | L22 interrupted transaction/staging failure retains active data | Automated passed |
| L23 | L23 rollback restores exact previous dataset and preserves later workspace | Automated passed |
| L24 | L24 import bounds/unsafe keys and inert text | Automated passed |
| L25 | L25 populated v1 upgrade and future-version non-destructive rejection; L25b aborted schema upgrade leaves populated prior database readable | Automated passed |
| L26 | L26 service worker update waits and retains workout database | Automated passed |
| L27 | L27 deadline expiry survives restart without automatic completion | Automated passed |
| L28 | L28 storage warnings and persistence denial do not imply backup | Automated passed |
| L29 | L29 unknown canonical media rejected; synthetic provenance preserved | Automated passed |
| L30 | No physical-device execution available | Deferred / skipped |


The matrix traces the planning IDs to implemented tests; it does not certify every manual subcondition. L01–L29 automated paths include supporting unit/SQL/lab regressions. L17 manual screen reader and L30 physical devices remain skipped. Mobile touch/viewport simulation is distinct from Safari/WebKit engine verification. Physical clock changes, OS crash/power-loss and full production durability are not certified. No training-content review is implied.

Preserved domain tests continue to cover schedule date/DST/immutable-completion rules, RIR-independent progression, partial/mixed/protocol guards, effort no-escalation and CSV escaping. Native cloud tests remain a separate future gate. Historical full-blueprint coverage remains under docs/history/assignment002/ACCEPTANCE_COVERAGE.md.

