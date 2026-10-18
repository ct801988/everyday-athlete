# Product requirements
Version 1.3 • 17 October 2026 • Proposed blueprint; not implementation approval.

## Outcome and audience
DEC-001–010 govern, including DEC-007 now explicitly approved by the owner in this conversation. These decisions govern this specification. Serve adults beginning or continuing general strength training who need a dependable answer to four questions: what to do today, how to perform it, what to record, and what to aim for next time. Fitness brand first, motivational message second. Name remains provisional.

The primary persona is a busy adult with two or three training days and dumbbells/bench access. The secondary persona has barbell experience and three 45–60 minute sessions. The external pilot is proposed as US-based, English-language, 18+, invitation-only; these are scope assumptions awaiting approval. Do not market this MVP as rehabilitation, sport preparation, pregnancy/postpartum programming, disease treatment, or a tailored frailty service. Age alone is not a diagnosis or exclusion criterion; fit the program to capabilities and refer unsupported needs.

## Requirements and traceability

| ID | Required behavior | Approval basis | Specification / acceptance |
|---|---|---|---|
| PR-01 | Invite, verify account, recover access; isolate records | DEC-004/005 | 04, 07; T-15–18 |
| PR-02 | Match goal, experience, equipment, days and time to eligible programs; explain mismatches | DEC-001/002 | 05/06; T-01 |
| PR-03 | Immutable enrolled program version with phase and planned session | DEC-002/006 | 04/06; T-12 |
| PR-04 | One-tap confirmed weight/reps/completion, draft prefills, undo; advanced RIR default OFF | DEC-004/008 | 04/05; T-02/03/31–35 |
| PR-05 | Deterministic, conservative recommendations from comparable actual history | DEC-006 | 15; T-04–11 |
| PR-06 | Canonical demonstration overlay in workout; reviewed media/cues; optional advanced RIR help | DEC-006/009 | 05/06/07; T-22/36–39 |
| PR-07 | Expandable Why explanation with rule, inputs, evidence and uncertainty | DEC-006 | 12–16; T-13/14 |
| PR-08 | Pause/resume, safe drafts, visible sync state, no silent conflict overwrites | DEC-004 | 03/04/05; T-19–21 |
| PR-09 | History/progress, export, deletion and account recovery | DEC-004 | 04/07; T-16/17/24 |
| PR-10 | Mobile accessibility, clock-based rest timer, release recovery | Master | 05/08/09; T-23/25 |

Requirements refer to numbered documents by prefix. All tests in 08 are proposed, except separately labeled reference/package checks.

## Product boundaries
Three curated program outlines, not a general workout generator. An enrollment has one active program, a defined reviewed program sequence and an immutable version. Flexible start dates/preferred weekdays are approved MVP scope under DEC-007; detailed recovery/conflict policies remain proposed. Switching archives the enrollment, retains its history and previews the next plan. No automatic catch-up doubling or calendar-driven load escalation. Exact exercise continuity, phase rules and confirmed actual work govern progression. Missing optional RIR does not block progression and never becomes an inferred effort value. A completed workout means the user explicitly ended it; a full prescription match requires separate validation of every required set.

Keep logging fast: default rows show Weight, Reps and Done; advanced per-set RIR is hidden, default OFF. Suggested draft values become actual only after deliberate Done. No per-set confirmation popup when values match; undo and correction preserve revision history. Bulk completion requires an exact-value confirmation. Demonstration overlays do not navigate away. Missing RIR remains null/unknown. Coaching is deterministic software with human-reviewed rules; the MVP does not need an LLM. All detailed programming below is review-pending and cannot be published merely because these documents exist.

## Proposed pilot outcomes
12–20 consenting adults across the three programs for six weeks; longer program completion is a later observation. Measure task success and data integrity before physiological outcomes. Recruitment, invitations and release remain unauthorized under this assignment.

| Measure | Proposed threshold | Denominator / collection |
|---|---|---|
| Data integrity | Zero confirmed lost acknowledged sets; zero cross-account exposures | Every pilot report and reconciliation sample; any occurrence pauses pilot |
| Onboarding | ≥80% enroll without staff intervention | All invited participants who begin onboarding; report n, dropouts and reasons |
| Workout usability | ≥90% complete first set entry + pause/resume unaided | Observed first-use participants, at least 10 |
| Why comprehension | ≥80% correctly paraphrase cause and limit | All tested users; at least two scenarios/user, count by user and scenario |
| Adherence | Median ≥70% planned sessions attempted over six weeks | All enrolled; retain withdrawals in reporting, separate modified/partial/full |
| Reliability | ≥99% mutation attempts acknowledged within 5s on stable test connection | Instrumented pilot attempts; offline attempts excluded and separately reported |
| Accessibility | Zero critical/serious blockers in tested journeys | Automated checks plus keyboard and assistive-technology review |

These targets are design hypotheses, not achieved results or evidence of injury prevention. Do not use small pilot samples to claim fitness efficacy. Revisit thresholds with owner before recruitment.

## Definition of ready and done
Ready to implement requires owner sign-off on 10, named reviewer availability, exact content identifiers and load semantics, approved data/privacy decisions and a separate Work Assignment 002. Done for external MVP requires reviewed and rights-cleared content, all critical acceptance tests passing, restored backup rehearsal, no open severity-1/2 defects, support owner and pilot consent, release/rollback rehearsal, and explicit invitation-only release authorization.

## UX revision acceptance additions
DEC-008 target: one deliberate tap logs a performed set when the displayed suggestion matches reality, zero RIR prompts/default columns, zero phantom completions in interruption/overlay/retry tests. Proposed usability target: ≥90% of at least 10 first-use participants log a matching set unaided in one tap; record time and errors rather than inventing an achieved result. DEC-009 target: repeated demonstration open/close retains route, tab, exercise, exact background scroll, draft values and timer deadline; no duplicate actuals. Approve final set-card, bulk-confirmation and overlay UX before Assignment 002. T-31–39 in 08 specify these behaviors.

## PR-11 — Plain-language conditioning Effort Level (DEC-010)
For conditioning activities in scope, show **Recommended Effort Level**, a specific program/session/phase's reviewed single-point or range target on its versioned 1–10 scale, descriptor and brief feel cue. Capture **Your Effort Level**, actual self-reported overall session effort, after the session in a separately owned record. Offer optional accessible scale information without navigation or lost draft/timer state. Preserve prescription provenance; never infer actual effort or treat higher-than-target effort as a personal best, automatic success or automatic progression trigger. Strength Weight/Reps/Done and optional advanced RIR OFF remain unchanged.

PR-11 traces to04/05/06/15 and CND-01–12 in08. Everyday Fit walking is the first possible in-scope activity; no running/HIIT expansion is approved. Target values/cues require qualified content review. The owner has approved optional/skippable post-workout Your Effort Level; remaining OPEN-016 items concern exact controls, scale/cues and partial-session presentation. Missing reports stay null. Any prior general description of optional effort for walking is refined by DEC-010; effort still cannot be inferred from completion.

## Final direction updates and assignment governance
Approved in the latest owner message: Foundation3 training days/week; Strength4 training days/week; DEC-007 flexible scheduling in MVP; DEC-010 actual effort optional with null unknown. Fit frequency is unchanged. These explicit approvals supersede conflicting older frequency/optionality/scheduling requirements, including prior source addenda. The mentioned Pre-Assignment002 Handoffv0.5 ZIP was not available during this revision; no claim of reading or adopting unseen content. See current10 and18 for authority and assumptions.

PR-12: flexible enrollment start date and preferred weekdays preserve program session order, prescribed/performed identity, recovery constraints and schedule revisions. Never silently skip a session on calendar rollover or double workload after a missed day. Detailed scheduling defaults proposed in04/05/18 require plan approval.

Every assignment ends with a milestone handoff: completed vs approved scope; actual build/test results including failures; created/modified files; bugs/risks/unresolved decisions; recommended next assignment; actions requiring owner approval. Package source/deliverables and review summary for the strategy conversation, preserve decision register/product requirements authority and stop before the next major assignment. Major scope changes, paid services, production deployment and irreversible operations require explicit authorization.


## Authoritative October 17, 2026 UX and preview update

See Decision Register v0.7 and ../preview-update/UX_AND_DATA_SPECIFICATION.md. The owner-approved basic timer has Ready/Running only, optional brief completion; **no Pause/Resume controls**, no automatic set-triggered start, and immediate X/Stop & Reset without confirmation. Earlier timer pause/resume language is superseded for this component; workout/system pause behavior is unaffected. Presets/custom duration, separate preferred/prescribed/selected values, silent or single short beep, compact floating accessible controls and deadline accuracy are required. Scientific recovery rules remain unapproved until evidence/content review. Optional supplemental mobility and reusable reviewed exercise references are recorded for a later separately authorized implementation, with independent participation and no primary-adherence penalty.

Fitness App Preview is temporary visible naming; Everyday Athlete remains internal. Only minimal naming changes enter N04. No timer/mobility upgrade or unreviewed program content enters the preview candidate. Cloudflare owner-only Free deployment is authorized but requires secure account access, live security/cost checks and physical owner verification; no permanent branding, costs, family enrollment, Supabase or remote Git.
