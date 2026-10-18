# Proposed next implementation scope — approval required

This is a proposal, not authorization to start another assignment. Finish N04 security/cost checks and owner preview review first; if account access blocks N04, retain this proposal ready for review without implementing it.

| Milestone | Bounded deliverable | Exit gate |
|---|---|---|
| U01 Timer contracts/migration | Versioned preferences/rest selection/run state; legacy readers/fixtures; preserve prior dataset | Approve duration bounds/default, running-edit and restored-alert policies; migration/recovery tests |
| U02 Compact basic timer | Floating accessible Ready/Running UI, presets/custom, immediate X/reset, no Pause/Resume/no auto-start; Silent/single-beep | Unit/browser tests plus real iPhone acceptance with explicit audio limitations |
| U03 Timer regression/review | Full backup/offline/multi-tab/update/correction regression; evidence and milestone ZIP | Owner review before distributing upgraded build; no automatic hosting update |
| U04 Optional mobility | Independent movement/partial/daily participation and supplemental section; schema/migration/recovery | Synthetic-only content, no primary adherence penalty; approval of participation semantics |
| U05 Exercise library integration | Parameterized canonical overlays, modality fields, media mapping validators and incremental list/filter | Correct synthetic mapping/offline/state/a11y tests; reviewed real media/content remains separate |
| U06 Integrated handoff | Full evidence, source/history ZIP, changed files, bugs/risks, rollback and next scope | Owner approval before next assignment, distribution or content activation |

Prioritize U01–U03, then U04–U06. Preserve current React/components/tests and local persistence. No full workout-engine rewrite; strict local model extensions need focused migration changes. Native cloud verification remains deferred, not waived. No accounts, Supabase, cloud sync, analytics, advanced intervals, conversational AI, paid services, Winter Strong changes, real prescriptions or family enrollment. Science-based rest rules are framework/fixtures only until content/evidence review.

## Proposed acceptance additions — NOT EXECUTED

The following are test specifications for future implementation, not current pass claims. Existing passing tests are preserved; only conflicting basic-timer pause/resume expectations are superseded when implementation is authorized.

| ID | Area | Required result |
|---|---|---|
| T01 | Ready/Running controls | No Pause/Resume or auto-start after Done; manual Start begins selected duration. |
| T02 | Stop/reset | X during countdown immediately cancels, resets chosen duration/Ready without confirmation or workout write. |
| T03 | Expiry/reset race | X at expiry and queued audio callback cannot emit a late alert; repeated X/Start does not duplicate effects. |
| T04 | Duration presets | 30/60/120/180 seconds selectable, correctly displayed and used. |
| T05 | Custom validation | 1:20 and 1:30 accepted; five-second increments/bounds enforced; invalid/NaN/overflow rejected. |
| T06 | Separate concepts | Preference, pinned prescription and current selection differ without overwrite; user may ignore recommendation. |
| T07 | Preference durability | Default and Silent/Short beep survive restart/export/import; missing legacy preference handled explicitly. |
| T08 | Running edits | Duration edit cannot silently reset an active deadline; UI follows approved edit policy. |
| T09 | Silent | Initial/default Silent produces visual completion only, never audio/notification. |
| T10 | Single beep | Short beep plays once only after eligible user gesture; callback rerenders do not repeat it. |
| T11 | Multi-tab completion | Two same-origin tabs race on the same run: at most one alert; stale revisions detected. |
| T12 | Interruptions | Scroll, exercise switching, nonsequential completion and supersets retain one timer deadline and drafts. |
| T13 | Overlay | Open/close/Back/Escape/carousel preserve countdown, actuals, focus, tab and exact scroll. |
| T14 | Deadline accuracy | Throttled ticks, focus/visibility/pageshow, restart and expired timers recalculate from time, never negative. |
| T15 | Time discontinuity | Forward/back clock changes follow documented policy; no accidental duration extension or phantom actuals. |
| T16 | Audio platforms | Real iPhone Safari and installed PWA: foreground/background/locked screen, mute/interruption/autoplay restrictions logged honestly. |
| T17 | Responsive dock | 320/375/390 px and landscape/safe area/keyboard/zoom: no set/nav/dialog occlusion; measured height target without smaller targets. |
| T18 | Accessibility | Keyboard, VoiceOver/TalkBack, contrast, labels, >=44px targets and single completion announcements; no per-tick live spam. |
| T19 | Migration | v1 running/paused/expired fixtures to new Ready/Running contract; no auto-resume/beep; retained prior dataset and failure rollback. |
| T20 | Backup integrity | Strict malformed/duplicate/conflicting/unsupported-version rejection; new timer fields round trip; atomic restore and downgrade refusal. |
| T21 | Offline update | Offline start/reload/logging/audio asset; interrupted cache install leaves prior app; update preserves records and schema compatibility. |
| T22 | Recommendation gate | Unreviewed/missing rest rule not authoritative; reviewed fixture deterministic inputs/explanation/version; override preserved. |
| M01 | Optional placement | Supplemental section below primary, now/later, omission never penalizes primary adherence. |
| M02 | Independent partials | Movement completion/draft persists after reload/interruption without completing main workout or other movement. |
| M03 | Daily/weekly/cumulative | Unique session counts derive from explicit actuals; correction/undo/duplicate replay and timezone/week boundaries correct. |
| M04 | Primary mobility | Explicit primary-role fixture works separately from optional supplemental adherence. |
| M05 | Mobility safety/data | Unknown reps/holds remain unknown; target never becomes performed; no unreviewed prescription or fatigue claim. |
| M06 | Mobility recovery | Partial sessions/actuals/audit round trip, malformed/conflicting IDs rejected; atomic restore/rollback and multi-tab/offline work. |
| E01 | Canonical reference | Strength/mobility/flexibility/recovery open correct ID/version and corresponding reviewed or synthetic media, never prior exercise image. |
| E02 | Overlay reuse | Every movement preserves drafts/sets/timer/scroll/focus and supports keyboard/screen reader. |
| E03 | Asset governance | Missing/mismatched/unreviewed media clearly labeled, rights/review required; bundles/Worker allowlist/offline hashes consistent. |
| R01 | Preserved decisions | Run prior unit/integration/lab/local/preview suites; optional RIR/effort, suggestion/actual distinction, sequence, corrections/undo unchanged. |

## Owner checkpoints / recommended assumptions

Already approved: no Pause/Resume, manual Start, immediate X, presets/five-second selection, Silent/single short beep, separate rest concepts, advisory reviewed science, independent optional mobility. Do not request these decisions again.

Confirm as part of scoped implementation approval: proposed initial preferred duration 120 seconds, custom bounds 5 seconds–60 minutes, selection locked while Running until X, imported/legacy paused timer becoming Ready, expired/background/restored completion visual-only (no delayed beep), Monday-first participation week with stated timezone. These are documented defaults, not new authoritative prescriptions. If different defaults are chosen, update tests/contracts before implementation.

Separately approve qualified exercise/rest-content reviewer and evidence/rule/media/rights versions before real guidance is used. No candidate rest range is activated now. Real-device audible reliability may remain unavailable in background/locked-screen; accept documented limits rather than treating missing OS support as a passed guarantee. Any advanced interval engine or broader program expansion needs a later assignment.
