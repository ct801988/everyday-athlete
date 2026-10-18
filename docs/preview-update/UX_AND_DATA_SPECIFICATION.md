# Approved UX requirements and proposed implementation contracts

Owner authority: October 17, 2026 update. Functional requirements are approved; schema details/transition defaults below are proposals, not implemented. Runtime data is unchanged in this release. No training-content approval is implied.

## Basic rest timer UX

A compact floating timer remains reachable when scrolling, switching exercises and doing supersets/nonsequential work. Reduce its measured vertical footprint approximately 20–25% where feasible by reducing padding/secondary content, never touch targets. Record baseline measurements before implementing; no numeric reduction is claimed now. Normal countdown text is dark, completion a subtle green indication with text; no flashing/aggressive animation. Respect reduced motion and safe-area insets. Collapsed view: time, Start in Ready or X/Stop & Reset in Running, and an accessible Expand control. Expanded view adds duration presets/custom selector and alert preference. Never expose Pause/Resume. Do not obstruct set controls/bottom navigation or steal focus; an exercise dialog appears above the timer, with state preserved on return. Reserve space/adjust dock placement rather than covering inputs or keyboard.

Ready → manual Start → Running. Deadline expiry → brief completed indication → Ready, resetting to selected duration. X from Running or completion immediately cancels deadline/pending alert and resets Ready. Starting, stopping, collapsing or changing a display never marks a set performed, changes session completion, scroll or drafts. No auto-start on Done. Repeated Start is idempotent for the same run; X is always one action, no confirmation. Workout pause/resume, interrupted upload recovery and other unrelated features remain unchanged.

Quick presets 30 seconds, 1 minute, 2 minutes and 3 minutes. Custom duration uses five-second increments, including 1:20/1:30. Proposed safe input bounds: 5 seconds–60 minutes, reviewed before implementation; reject invalid values rather than silently rounding. Changing selected duration while Running must not silently restart/shorten the run: proposed UI locks the selector until X returns Ready. Default preference changes affect the next selected timer, not a current run. An explicit “Use as my default” saves locally; suggestions never overwrite the preference.

Exactly Silent (initial default) and Short beep (one brief nonrepeating sound). No continuous ring, repeating notifications, alarm dismissal, vibration preference or third alert mode. Sound is best-effort after a deliberate user gesture; show a clear unavailable-audio message without changing Silent/Short beep semantics. Proposed completion handling: a foreground transition can emit one beep per run; returning after a background/locked-screen expiry shows completion without a delayed surprise beep. Background/locked-screen exact alerts cannot be guaranteed. Actual iPhone Safari and installed PWA tests are required, including mute/sound settings and interrupted audio.

Use absolute deadline and elapsed-time calculations, not decrement-on-interval. Recompute on visibility/focus/pageshow/restart; clamp display at zero. Handle clock changes explicitly and document residual wall-clock limitations (monotonic time while active, wall-clock persisted deadline after restart). No ongoing ticking writes to IndexedDB. Run identity/generation and completion-claim records prevent duplicate callbacks; X invalidates outstanding callbacks before resetting. Claim a run once across tabs using the existing transactional revision mechanism. Favor no duplicate over guaranteed audio after a crash between claim/play; document at-most-once delivery semantics. No service-worker repeated alarm. Overlay opening never reconstructs a timer/run.

Screen-reader labels include remaining time, Start, Stop and reset, selected duration and alert preference; no half-second live-region flood. Announce start/stop/completion once. Touch targets at least 44×44 CSS px, visible keyboard focus, sufficient contrast, small portrait/landscape screens, zoom/text enlargement and safe-area checks.

## Proposed timer schema (future schema version; not added now)

| Concept | Proposed fields | Ownership / invariant |
|---|---|---|
| Local preference | preferredDurationSeconds, alertPreference: silent/short-beep | Persistent local setting; initial proposed duration 120 seconds; recommendations never overwrite it |
| Prescribed rest | durationSeconds or range, betweenSets/betweenRounds, ruleId/version, evidenceIds, programVersion/session/exercise/phase context, reviewStatus | Pinned program/session recommendation, nullable if absent/unreviewed; no inference from performed data alone |
| Current selection/run | selectedDurationSeconds, status ready/running/completed, runId, startedAt, deadline, completedAt, completionClaim, expanded | Separate from preference and prescription; run identity persists, never creates actual workout records |

The prescribed duration/range must come from the actual specific workout/program, with compound/accessory type, objective, sets/reps/intensity, phase, supersets/circuits structure and applicable preferences included in deterministic inputs. User override changes selected value only; keep prescription and reason/provenance intact. Missing prescribed rest stays missing. No arbitrary generic range shown as approved advice.

Illustrative ranges supplied by owner, **NOT approved exercise-science prescriptions**:

| Training type | Candidate only |
|---|---|
| Heavy compound strength | 2–5 minutes |
| General hypertrophy | 60–120 seconds |
| Accessory | 30–90 seconds |
| Muscular endurance | 30–60 seconds |
| Supersets | 60–120 seconds between rounds, as prescribed |
| HIIT/circuits | Follow programmed work/rest structure |

A future curated rule outputs value/range plus plain-language reason, evidence/review version and uncertainty. Never automatically shorten recovery for efficiency/intensity; no conversational AI. Rules and actual exercise/media content require qualified review and owner approval before authoritative display. Supersets/circuits/HIIT/endurance/timed holds are future-compatible contexts, not authorization to build an interval engine now.

## Mobility and exercise library

Supplemental mobility sits BELOW the primary workout, labeled optional, with “Do now” / “Do later” entry paths and independently saved partial completion. Skipping it never changes primary workout adherence, progression eligibility or penalties. Completion is deliberate per movement; drafts/recommended holds are not actuals. Daily session records show explicit complete/partial state; weekly and cumulative counts derive from unique session IDs and recorded dates/timezones, not arbitrary taps. Corrections/undo adjust counts deterministically. Proposed weekly UI shows Monday–Sunday with a stated locale/timezone; this is a display default to confirm. Future primary mobility sessions use primary role explicitly, not by treating all supplemental work as primary.

Proposed new entities: MobilitySession(id, role supplemental/primary, optional parentWorkoutId, programVersion, prescribedDate, performedDate/timezone, status, revision); MovementPrescription(id, exerciseId/version, order, reps or holdSeconds, rounds, side, reviewStatus); MovementActual(id, sessionId, prescriptionId, performed reps/seconds, deliberate completedAt, revision); MovementDraft separately; audit/receipts reused. A session is complete only under its pinned prescription completion policy; “finish partial” remains partial. Missing duration/reps stay unknown; a Done checkbox alone never invents actual seconds. Optional participation is not clinical mobility improvement or range-of-motion measurement.

Exercise references: stable exercise ID/version, modality strength/mobility/flexibility/recovery, equipment, instructions/cues, reps/hold prescriptions, cautions, content review status and media references. Media mapping includes exercise/variation/version, start/movement/finish role, asset ID/checksum, alternative text, rights/license and qualified review status. Reuse one canonical asset per movement, no filename guessing or copying all Winter Strong media. Missing/rejected media gets a clear labeled placeholder. Overlays accept an explicit canonical exercise prop instead of a hardcoded fixture and restore focus/scroll/drafts/timer unchanged. Search/filter and thumbnail list can be added incrementally; synthetic fixtures only until content approval.

## Persistence, backup, migration and offline contracts

Current IndexedDB database version 2 is distinct from dataset schemaVersion 1. Both are currently strict; additive fields without a deliberate migration will fail validation. Plan a versioned dataset + backup change and an IndexedDB bump only if object-store layout changes. Maintain a tested v1 reader, staged normalization, validation and atomic activation with prior dataset preserved. Do not mutate the sole good record in place or silently merge/overwrite.

Proposed v1 timer migration: preserve running deadline and legacy data in retained prior dataset; map legacy paused timer to Ready using explicit default, never auto-resume or emit a restored beep; warn in migration preview. Legacy dataset lacks preferred duration: propose 120 seconds and Silent, without claiming it was the user's historical choice. New imports preserve preference, prescribed/selected values, mobility partials, actuals/audit and unknowns separately; expired imported timers reset Ready without sound. Missing mobility in old backups means no mobility records, not failed adherence. Review these defaults before implementation.

Reuse duplicate/conflict detection, SHA-256 canonical hashing, size/depth/unsafe-key checks, immutable export snapshots, atomic dataset-pointer switch and rollback. Update conflict comparisons/CSV selection so new movement IDs do not collide with strength sets. Export prior-version backup before migration; restore preview reports conversions and unsupported versions. Old app builds must refuse newer data without destructive fallback. Code-only rollback after schema upgrade is unsafe: use a validated compatible dataset restore or a forward fix.

All approved local features work offline; future reviewed images/audio must be bundled and gated. Update precache, exact Worker allowlist and manifest hashes together; incomplete cache install cannot activate. Keep origin, IndexedDB name and stable IDs unchanged. Multi-tab stale writes and completion claims remain transactional. No Supabase, analytics, synchronization or cloud backup is introduced. Current N04 candidate has NONE of these future schema/feature changes.
