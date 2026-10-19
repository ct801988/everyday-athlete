# Visual V2 — initial exercise-card review, 2026-10-18

STOP: awaiting owner screenshot feedback. This is an initial review checkpoint, not final V2 approval or a release candidate.

## Source and rollback
Branch: ea/visual-v2-exercise-cards, based on Visual V1 documentation checkpoint 27ce80a51f916d086356574635b1f16ab63e03c2. V1 source checkpoint 6b3feef151ac7b48f76c3e574203be0902faa623 and PR #3 remain unchanged/draft. M1 rollback remains 370f555f1a075e54ee604277bd8ef31cc33d564d on ea/workout-session-m1 / PR #2. Never force-push, merge, publish or alter Winter Strong.

## Changes and comparison
Only src/m1/App.tsx and src/m1/refinement.css change application presentation. Expanded cards use 84px left thumbnail placeholders (80px at 320px), exercise titles, existing set counts/modality, equipment/body category, information action, compact side-by-side Last Time/Today's Target, existing inline editable rows and Add Set. Manually collapsed completed cards retain their green completion cue; individual logged rows use blue. Inputs use 16px text to avoid iOS focus zoom. Timer behavior is unchanged; its floating bar moves up 15px to correct a measured overlap with navigation.

Written V2 requirements are the controlling reference. No separate approved V2 reference image was attached, so a direct pixel/reference-image comparison has NOT been performed. Do not claim exact mockup fidelity. Photography is the largest material deviation: clearly labeled non-instructional Media pending placeholders remain. No media has been approved for exact variant, rights and technique use; see VISUAL_MEDIA_PLAN.md. Existing unlimited ordered-frame/caption architecture is unchanged; this checkpoint does not certify production exercise media.

Synthetic prescriptions contain no numeric rep range or duration target, so the header accurately shows sets and modality. Target details read stored prescription target strings; no invented weights/ranges/progression. Added exercises without a prescription show No prescribed target. Last Time uses the unchanged comparable confirmed-record lookup. No-history screenshots contain no fabricated previous performance.

All cards remain on one continuous page. Collapse is manual; no automatic collapsing was added. Workout lifecycle, data model/actions/storage/migration, timers, extras, grouping, backup and offline modules are unchanged.

## Screenshots
reports/visual-v2 contains native-width PNGs for 320, 390 and 412px viewports (844px height), plus full-page continuous-scroll captures. Review the five 390px images: 01-expanded, 02-continuous, 03-completed-collapsed, 04-timed, 05-timer-clearance. The timed state includes adapted seconds entry; the full page also includes bodyweight logging. Screenshot interaction values (25 lb, 8 reps) are synthetic test inputs, not a prescription or owner history. 05 shows the existing collapsed rest timer above navigation. Floating content can pass behind the timer while scrolling; measured navigation separation and existing focus/overlay restoration are tested. Physical iPhone keyboard clearance remains unverified.

## Tests actually run for V2
- Typecheck: PASS. Lint: PASS. Production build: PASS.
- New 320/390/412 card scenarios: 3 PASS / 0 FAIL / 0 SKIP on final run; accessibility, overflow, target details, Done/undo, completion/collapse/value preservation and timer/nav separation.
- Existing M1 browser suite: 11 PASS / 0 FAIL / 0 SKIP on final run; migration/interruption, backup/restore, lifecycle/logging, grouping, timer, offline, responsive accessibility and origin isolation.
- Total current browser cases: 14 PASS / 0 FAIL / 0 SKIP. Do not add V1 counts or repeated runs.
- Initial runs failed due to absent Chromium, then a real timer/nav overlap (fixed), then capture-test sequencing (now waits for recorded Undo controls before the next set). These are disclosed, not included in final counts.
- Unit/integration and prepared Pages suite NOT rerun at this initial visual checkpoint; prior V1 151/0/3 evidence remains historical. Full relevant final regression and candidate packaging follow owner visual approval.
- Desktop Chromium emulation only. No physical iPhone testing or deployment claimed.

## Resume after owner feedback
Inspect remote branch/PR and PROJECT_STATUS.md before edits. Obtain the owner's screenshot feedback and any V2 reference image; implement only approved adjustments. Rerun relevant complete M1 validation with separate pass/fail/skip totals; produce final candidate ZIP/README, screenshots, known issues and rollback notes. No M2, hosting, merge, costs or publication without separate explicit approval.
