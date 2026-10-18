# FITNESS PLATFORM — MASTER PRODUCT & DEVELOPMENT SOURCE
**Version:** 1.5  
**Prepared:** October 17, 2026  
**Updated:** October 17, 2026  
**Status:** Planning document for a new, separate multi-program fitness platform  
**Source of truth:** Decisions and concepts discussed during Winter Strong development. This is a product brief, not a claim that the future platform has been implemented.

## Approved October 17, 2026 update — DEC-011: no-login personal/family pilot

**This update overrides earlier account-first or mandatory Supabase language for the initial pilot.** The product owner explicitly approved **no login required to start, with optional accounts and cloud backup in a later phase**. The near-term purpose is personal use and possible family evaluation, not public multi-user launch.

- **Initial experience:** launch directly into lightweight program selection and today's activity. No email, password, registration, or cloud connection required.
- **Storage:** local-first, per device/browser profile. Preserve program selection, schedule, workouts, performed sets, progress and preferences across app restarts.
- **Data protection:** user-initiated export and validated import/restore must work before personal/family pilot. Explain risks of device loss, browser clearing, and switching devices. Do not imply local data is automatically backed up.
- **Privacy:** no centralized account data collection is needed for this pilot. Different devices have separate records; shared browser profiles are not securely separated.
- **Architecture:** retain React/TypeScript foundation and modular data contracts. Supabase may remain as isolated future-facing code but must not be required for local use. Native Supabase verification remains blocked, not passed; it is a prerequisite for later real cloud accounts.
- **Scope control:** keep the current Assignment 002 foundation, revise Assignment 003 planning and tests, and do not deploy publicly, incur costs, or start real-user enrollment without approval.
- **Unchanged:** safe explainable progression, three working-title programs, Foundation 3 days/week and Strength 4 days/week, flexible scheduling, optional advanced RIR, separate prescribed/draft/performed records, demonstration overlays, and conditioning effort distinctions.

**Current checkpoint:** Assignment 002 foundation provisionally accepted with reported 35 unit, 21 SQL integration and 11 browser tests passed. These do not yet validate new local-first persistence or backup/restore. Work must add and run those tests.

## 1. Executive vision
Build a mobile-first fitness platform that combines professional-quality workout programs, personalized program selection, progressive training prescriptions, straightforward performance logging, reliable exercise visuals, and practical adaptability for real life (travel, equipment, time, readiness). The product should serve a broad range of users—from beginners to experienced lifters, runners, and older adults—without becoming confusing or intimidating. A fitness brand first and a motivating message platform second.

**Core product promise:** A user should always know **what to do today, how to do it, what to record, and what to aim for next time.** Progress should be measurable but should not incentivize unsafe maximal effort or force progress during recovery or pain.

**Brand/name status: undecided.** Ideas discussed include *Everyday Athlete*, *Training Ground*, *Fitness Your Way*, and *Move Today, Strong Tomorrow*. The user likes the broad appeal of a motivational fitness brand; *Move Today, Strong Tomorrow* was a favored message but felt long. *Fitness Your Way* is also under consideration. Do not treat any as approved, legally cleared, or available; validate trademark, domain, and competing usage before branding.

## 2. Product principles
1. **Prescription, not just logging:** the platform proposes today's session and next targets based on a plan and performance history.
2. **Accessible language:** replace jargon or explain it inline, e.g. an `i` popup beside RIR (reps in reserve).
3. **Simple during a workout:** big tap targets, few steps, fast logging, mobile-first layout, readable thumbnails and form cues.
4. **Personalized but transparent:** show why a goal changed, and allow adjustment without losing the original prescription.
5. **Progress with recovery:** phase-aware progression, deloads, reasonable RIR targets, readiness and pain considerations.
6. **Equipment/time flexibility:** practical substitutes preserve movement intent and do not contaminate the original exercise's progression history.
7. **Visual consistency:** each exercise in the library uses a thumbnail from its demonstration sequence and a clear detail page; no mixed random emoji or generic arrows.
8. **Data ownership and trust:** durable records, backups, migration tests, export, privacy-by-design, and explicit differentiation of prescribed vs completed work.
9. **Build in phases:** ship a high-quality small product before adding breadth.

## 3. Existing prototype — Winter Strong
**Live prototype:** https://ct801988.github.io/winterworkoutapp/  
**GitHub repository:** https://github.com/ct801988/winterworkoutapp  
**Role:** Existing standalone 20-week home-gym workout application and design/logic reference. **Do not overwrite or repurpose this repository for the new product.**

### Program foundation
- Twenty weeks in five four-week phases: Foundation (1–4), Growth Volume (5–8), Strength (9–12), Specialization (13–16), Benchmark (17–20).
- Structured daily strength sessions, core, walking/cardio, mobility, rest and planned lighter weeks.
- Exercise targets include sets, rep/time ranges, RIR and week-specific directives.
- Existing library: 42 named exercises with three photo references each (126 image files).
- Current app navigation includes Workout, Program, Progress, Visuals, and Settings.

### Implemented or recently delivered V5/V5.1 features (verify in a fresh build before reuse)
- Recommended weight/rep goals based on previous logged performance using deterministic local rules.
- Previous workout reference; individual RIR fields per set and explanatory popup.
- Simplified **Weight** label; bodyweight notation such as `BW`, `BW+25` where appropriate.
- Rest timer; optional readiness input; workout completion summary.
- Travel substitutions for hotel room/no equipment, hotel gym/dumbbells, and full gym, with 15/30/45-minute options.
- Travel sessions distinguished from normal exercise progression.
- Workout data backup/import/export and legacy-data compatibility considerations.
- Visuals library V5.1 thumbnail update: first existing image shown in each exercise list row.

**Important implementation note:** The V5.1 thumbnail update was packaged separately after V5. The developer for the new platform should obtain the **latest actual GitHub repository** and inspect it; do not assume the older V5 complete ZIP contains the V5.1 UI. Deployment and real-device behavior require independent verification.

### Known prototype limitations and learnings
- Prototype is a static, client-side GitHub Pages web app with browser-local workout records; this is not a production multi-user backend.
- New travel-only movements may use text instructions and external demonstration searches rather than the full three-photo standard.
- Older workouts may not contain set-level RIR; never infer missing RIR or authorize aggressive progression from absent data.
- Service-worker caching can make an iPhone show older code after deployment; include cache versioning, update feedback and a reliable release checklist.
- The bottom navigation previously wrapped or behaved unexpectedly on iPhone; test small-screen layouts and tap targets.
- Exercise form pictures require human review for anatomical accuracy and exercise correspondence.
- Do not treat a logged exercise name, substitution, or completed checkbox as proof of safe form or adequate recovery.

## 4. Target audience and use cases
- **General fitness:** structured full-body and split programs, simple goals and exercise explanations.
- **Strength/hypertrophy:** weights, reps, per-set RIR, progressive overload, phase-specific plans.
- **Beginner/home gym:** program selection based on available equipment and days/week.
- **Traveling professionals:** hotel room, hotel gym, full gym, or outdoors; shorter workouts when needed.
- **Runners:** beginner 5K, 10K, half-marathon, marathon plans and appropriate run tracking.
- **Conditioning:** HIIT, circuits, bodyweight, interval timers.
- **Mobility and lower-impact fitness:** yoga, flexibility, recovery, and older-adult-appropriate programming.
- **Self-directed users:** eventually create and save custom programs and sessions.

## 5. Product modules

### A. Onboarding and program matching
Ask only questions that materially affect recommendations: primary goal, experience level, training days/week, available session time, equipment, preferred training environment, program duration, and relevant movement restrictions or exercise preferences. Provide a short list of fitting programs and a clear explanation of why. Allow users to skip or edit answers. Avoid medical diagnosis and do not promise injury-safe prescriptions.

### B. Program library
Offer curated, versioned programs with consistent structured data. Potential categories: strength, muscle gain, general fitness, dumbbell-only, barbell/home gym, bodyweight, HIIT, mobility, yoga, 5K, 10K, half marathon, marathon, hybrid strength/cardio, and lower-impact older-adult fitness. These are roadmap categories, **not** an instruction to build every program in V1.

### C. Daily workout experience
- Clear daily plan, exercise order, sets, target reps/time, target RIR, rest, exercise image link, and substitution controls.
- Display **Today's Recommended Goal** prominently, based on prior results and the program's phase.
- Display last comparable session's actual results, and the reason for today's prescription.
- Log each set independently: **Weight**, **Reps or duration**, **Actual RIR**. Bodyweight, assisted and weighted-bodyweight notation must be unambiguous; define per-dumbbell vs total load conventions.
- Small `i` next to RIR opens an explanation: *Reps in Reserve is how many additional clean reps you could have completed before failure. Example: 8 performed, 2 more possible → RIR 2.*
- Rest timer with suggested duration and easy adjustment; workout completion summary with goals met and suggested next targets.
- Support partial workouts, skipped sets, swaps, corrections and undo. Avoid treating unperformed sets as completed.

### D. Progressive overload engine
- Start with a baseline when no comparable history exists.
- Double progression: generally earn reps within the prescribed range before increasing load. Example: 185 lb × 8/8/7 → aim for 8/8/8 before increasing; once all sets reach the phase's upper target at appropriate RIR, consider the smallest practical load increase.
- Different progression rules by program type, exercise, phase, available weight increments and time-based vs rep-based movements.
- Use **per-set RIR**, not a single exercise-level value; RIR estimates are subjective and should not be the sole decision signal.
- Do not automatically increase after missed, incomplete, substituted, pain-limited, deload or benchmark sessions. Missing RIR is unknown, not zero or target RIR.
- Preserve prescribed target, actual performance, modification reason, exercise identity and source session separately.
- Allow user override with an explanation; do not shame users for reducing loads.
- Support future personal records and trends without overemphasizing one-rep maximums.

### E. Exercise reference library
- Canonical exercise ID, name, movement pattern, muscles, equipment, variations, substitutions, form cues, and contraindication cautions where relevant.
- Three accurate images (start / movement / finish) where available; one small first-image thumbnail in every library list row.
- Search/filter by name, muscle group, equipment, and movement type.
- Reuse the same images across programs; no duplicate media per workout.
- Maintain review status for each illustration; do not publish unreviewed images as authoritative form instruction.
- External tutorial links may be supplemental, not a replacement for consistent in-app demonstrations.

### F. Travel Mode / workout adaptation
User chooses available environment/equipment (hotel room/no equipment, hotel gym/dumbbells, full gym, eventually outdoors) and available time (initially 15/30/45 minutes). System builds a **preview** from predefined movement-pattern substitutions and exercise priorities. Preserve primary squat/hinge/push/pull/unilateral/core or conditioning intent where feasible. A short workout prioritizes the highest-value work rather than arbitrarily truncating the list. Users explicitly accept the modified session and can return to the original.

Record the modified workout separately from the original prescription. **Never use bodyweight split-squat results to calculate the next barbell squat load.** Repeated travel exercises can maintain their own histories. New movement images should be added to the canonical library once, with consistent review standards.

### G. Timers and conditioning
Phase 1: rest timer and straightforward time-based sets. Later: HIIT interval timer, EMOM, AMRAP, Tabata, warm-up countdown and audio/haptic cues where device support permits. Timers must handle mobile backgrounding and pauses robustly.

### H. Progress and reporting
Workout consistency, completed vs planned sessions, strength trends by exercise, rep/load changes, training volume when meaningful, per-set RIR patterns, program completion, and optional body measurements. Distinguish travel-modified workouts from skipped workouts and full prescribed workouts. Avoid misleading comparisons across different exercises or equipment.

### I. Custom workout builder (later phase)
Users choose exercises, order, sets, targets, rest and recurrence, save templates and optionally combine with program schedules. Reuse canonical exercise and tracking components. Defer advanced auto-program generation until core tracking is dependable.

## 6. Safety, quality and accessibility
- Never present exercise substitutions as medically validated for an individual; include simple pain stop/modify guidance and encourage professional assessment for persistent or worsening symptoms.
- No requirement to reach 0 RIR or failure. Respect recovery phases and sensible training loads.
- Large touch targets, high contrast, clear labels, readable small screens, keyboard and screen-reader support, reduced-motion preference, offline-safe error states.
- Clear distinction between educational exercise information and medical advice.
- Photo/video rights and licensing must be documented; do not assume AI-created or web-sourced images can be redistributed without review.

## 7. Technical direction — proposed, not yet decided
**Recommended:** separate repository and architecture, with Winter Strong as a reference implementation. Start with a mobile-first responsive web app/PWA. Choose framework and backend only after agreeing on requirements and expected scale; avoid rewriting simply for fashion.

**Data model concepts:** users, profiles, equipment, programs, program versions, weeks, sessions, prescribed exercises, canonical exercises, exercise variations, media, set prescriptions, actual sets, session modifications, readiness checks, progression recommendations, and audit/history. Stable IDs and versioned programs are essential. Keep data portable with JSON/CSV export where appropriate.

**Backend decision:** Winter Strong's localStorage is fine for a single-person prototype, but a shared product will likely need authentication, account recovery, persistent cloud sync, privacy policy, deletion/export flows, secure access control and backup/restore. Make explicit decisions about offline use, sync conflict handling, and subscriptions before implementation.

**Build process:** source control, branch/review workflow, repeatable local setup, automated unit tests for progression and substitution rules, migration tests, visual/mobile tests, accessibility checks, deployment previews and release rollback. Do not overwrite live data or push untested updates straight to production.

## 8. Recommended phased roadmap
**Phase 0 — Product definition:** decide MVP audience, primary user journey, brand working name, scope, non-goals, data model, success criteria and prototype reuse. Produce wireframes and technical architecture decision record.

**Phase 1 — Functional MVP:** onboarding, a small high-quality set of programs (suggest 3–5, selected to prove different use cases), canonical exercise library, daily workout UI, per-set logging/RIR, rest timer, progress basics, and trustworthy program-aware progression. Include reliable export and testing. Mobile-first.

**Phase 2 — Adaptability:** Travel Mode, equipment/time substitution rules, readiness, session modification history, richer progress reports and broader exercise coverage.

**Phase 3 — Platform expansion:** more curated programs (including running and conditioning), advanced timers, custom workout builder, user accounts/cloud sync as needed, content management tools.

**Phase 4 — Commercial readiness:** branding/legal checks, usability testing with external users, analytics and consent, privacy/security review, payments only if business model warrants them, app-store strategy if justified.

**Prioritization caveat:** Because Winter Strong already demonstrates travel substitution, it may be economical to bring a *limited* version into Phase 1 if it does not delay reliable core logging. Roadmap order should be confirmed after inspecting actual reusable code.

## 9. Decisions still open
1. Final brand name and trademark/domain checks.
2. Initial target customer: general fitness beginners, intermediate lifters, travelers, or another narrow segment.
3. Which 3–5 programs should launch first and who will review their training quality.
4. Whether MVP needs accounts/cloud sync immediately or can pilot with local data.
5. Whether to retain plain JavaScript initially or move to a framework; evaluate cost, testing and maintainability.
6. Exercise image production, licensing, accuracy review and new-movement coverage.
7. Revenue model (free, freemium, paid subscription, coaching) and privacy requirements.
8. How personalized recommendations explain uncertainty and handle pain/readiness.
9. Scope of custom workout builder and running integration.
10. Ownership, hosting, operational costs, and maintenance expectations.

## 10. Work vs normal chat operating model
**Use a separate ChatGPT Project** titled provisionally *Fitness Platform Development*. Upload this source document to the Project and keep it updated as decisions change. Use normal chats for product choices, design critiques and approvals. Use **ChatGPT Work** for substantial bounded tasks: repository inspection, architecture, building one feature, testing, refactoring, preparing releases and creating reports. Work can carry out multi-step work, but **do not assume indefinite background development**; each assignment needs scope, acceptance criteria, deliverables and a completion review. Keep separate chats for product decisions, implementation, QA and branding if helpful. Maintain one updated master source document and a change log to prevent drift.

## 11. Suggested first Work assignment
> Review the attached Fitness Platform Master Source Document and the latest Winter Strong GitHub repository as a reference implementation. Do not change or deploy the Winter Strong repository. Produce: (1) a proposed MVP feature set and explicitly excluded features, (2) a user-flow map for onboarding → choosing a program → doing a workout → viewing progress, (3) a canonical data model for programs, exercises, sets and substitutions, (4) a comparison of two viable technical architectures with estimated complexity, (5) a staged implementation plan with testable acceptance criteria, and (6) a list of decisions requiring product-owner approval. Preserve the existing Winter Strong behavior as reference, distinguish verified code from assumptions, and do not begin production implementation until I approve the plan.

## 12. Handoff checklist
- [ ] Create new ChatGPT Project; upload this master document.
- [ ] Create separate GitHub repo for the new product; do not modify `winterworkoutapp`.
- [ ] Supply link/access to latest Winter Strong repo or an exported code ZIP when code reuse is needed.
- [ ] Decide MVP target audience and initial programs.
- [ ] Approve architecture and data model before implementation.
- [ ] Establish test and release procedures from day one.
- [ ] Record decisions in a changelog and update this master source after each major milestone.

---
**Document note:** This file captures project discussions and observed source-code structure. It does not certify that the current public deployment matches every feature or that any prospective product name is available. The next build team should independently verify the current code and requirements.


## 13. Approved product-direction update — minimal logging and exercise overlays (October 17, 2026)

**Authority:** The product owner's subsequent decisions supersede conflicting suggestions earlier in this document (especially mandatory per-set RIR). These are product requirements for the new Everyday Athlete application, **not** instructions to modify Winter Strong or begin production coding.

### DEC-008 — Simplified workout logging; RIR optional

- **Default strength-session inputs:** weight, repetitions, and set completion; no visible or required RIR field. RIR remains an optional advanced **per-set** tracking preference (default OFF), with `null` meaning unknown/not supplied; never infer RIR from weights, reps, checkmarks, or difficulty ratings.
- Show the exercise name, prescribed sets/rep range, prominent recommended goal, brief explanation or optional “Why?”, and editable rows for actual sets.
- Prefill **draft suggested** weights/reps from approved program rules and comparable previous sessions when data exists. Clearly distinguish suggestions from actually performed results.
- If actual performance matches the suggested values, one tap confirms a set; if it differs, users may change fields before confirming. Users can correct/undo entries and save/resume partial sessions. Unconfirmed draft values are **never** logged as completed.
- Optional **Mark All Complete** requires deliberate user confirmation that all listed sets were performed at the currently displayed values. Do not introduce unnecessary confirmation popups for normal one-tap single-set logging; consider safety of accidental bulk logging.
- Deterministic, evidence-informed progression works without RIR using completed actual reps/weight, comparable training history, program/phase targets, exercise specifics, load increments, incomplete/missed/modified sessions and fatigue or pain flags if provided. Missing RIR is not treated as a favorable readiness signal, nor as automatic failure.
- Never equate substitutions, prescribe automatic load jumps merely because sets are checked, or overwrite original prescriptions/performance histories. Explain why a target increased, held, or decreased; do not automatically encourage failure training.
- Optionally offer a sparse simple post-exercise difficulty question (easier than expected / about right / very difficult); do not require it and do not map it numerically to RIR. Advanced tracking can be opted into under Settings → Workout Tracking → Advanced Metrics → Track RIR.
- Design tracking schemas and UI to vary appropriately across running, HIIT, mobility, conditioning and other future modalities. Future tracking categories are not all approved for MVP.
- **UX acceptance target:** when draft suggestion matches actual work, a user can log a set with one tap; on small phone screens, logging is thumb-friendly with legible fields, undo and accurate state after interruption.
- The user-supplied RIR infographic is a **conceptual UX illustration, not medical advice, a universal RIR prescription, or production-ready media**. Its effort ranges and graphics require evidence and qualified-review checks before product publication.

### DEC-009 — In-workout exercise demonstration overlays

- Tapping an exercise's info/demonstration icon **during an active workout** opens a modal or mobile-appropriate full-screen overlay; do not navigate away from the workout or change the selected bottom tab.
- Use the canonical exercise ID and shared, approved reference assets to display the name, concise form instructions, and ideally three positions; support image swiping **and accessible non-gesture image controls**. Do not treat missing images as approved instructions.
- Provide obvious Close/X and expected Escape/back behavior; manage focus, modal labels, background interaction, scroll lock, and screen-reader announcements. For full-screen mobile treatment ensure back handling does not discard workout data.
- Closing returns to **the identical exercise and scroll position** and preserves unsaved edits, set completion, weight/reps, active timer state, and draft workout; reopening shows the same underlying exercise reference, not a duplicated copy.
- From the standalone Exercise Library, provide a fuller reference view using the **same canonical content**, with optional later-added video. Media licensing, training-form review and accessibility apply to both surfaces.
- **Acceptance tests:** open/close mid-set; enter draft edits, open/close and submit; preserve scroll and bottom tab; image carousel and close via swipe alternatives/keyboard/screen reader; check narrow phone landscape/portrait; timer continues as specified; no duplicate/phantom set records; no unexpected navigation.

### Approved for MVP — flexible scheduling (DEC-007)

A previous conversation proposed letting users select any start date and preferred training days, separating scheduled sessions from completed sessions while preserving recovery constraints. **DEC-007 is approved for MVP inclusion as of October 17, 2026.** Work must specify recovery-safe rescheduling, preferred days, sequence integrity, and scheduled versus performed records; detailed UX remains subject to review.

### Implementation governance

All of DEC-008 and DEC-009 belong in Work Assignment 001's **MVP design, screen specifications, data model, and acceptance criteria**. Work 001 is still a **blueprint only**. Before production logging/overlay implementation, the product owner must approve the final UX and underlying technical acceptance criteria. Do not modify Winter Strong.


## 14. Approved product-direction update — conditioning Effort Level (DEC-010; October 17, 2026)

**Authority:** Approved product direction; additive to DEC-006, DEC-008 and DEC-009. No code/deployment authorization. See `DEC010_Conditioning_Effort_Requirements_UX_Tests.md` for detailed requirements, data contract and test cases.

- Use the user-facing label **Effort Level**, not RPE, for conditioning intensity; internal analytics may retain RPE terminology if its precise 1–10 scale semantics are documented.
- Show **Recommended Effort Level** with a **program- and session-specific** target on a 1–10 scale, a plain-language intensity descriptor and a brief feel cue; e.g. `5–6 / 10 — Moderate` is illustrative, not a universal default.
- Allow the user to report **Your Effort Level**, separately, **after the conditioning session**, with a simple 1–10 mobile input; do not derive it from targets or telemetry and do not overwrite the original recommendation.
- Offer an optional, accessible information icon explaining easy-to-hard anchors in everyday language, without interrupting a workout or losing state.
- Higher actual effort than recommended is **not inherently better** and must not automatically trigger a progression increase, praise or performance achievement. Differences can inform **reviewed** coaching and recovery decisions with uncertainty.
- Recommended values and actual reports require separate persisted fields, program/rule provenance, correction/revision support and null unknown for absent user reports.
- Preserve **minimal strength Weight/Reps/Done**, RIR opt-in default OFF (DEC-008), and **in-workout exercise demonstration overlays** (DEC-009). This conditioning effort input does not become a required strength field.
- **Roadmap:** incorporate contracts/acceptance into current blueprint; implement when Everyday Fit walking or another approved conditioning screen is built; complex running/HIIT intensity features remain later unless separately approved.
- **Pending detailed UX review:** whether the post-session effort question is optional or required. Recommended approach: optional to minimize friction; no decision implied on this specific interaction. Scientific anchors/descriptors require qualified reviewer approval.

**Acceptance:** CND-01 through CND-12 in the DEC-010 addendum cover separation, ranges, null input, invalid values, safe recommendations, accessibility, correction, persistence, and plain-language audit.


## 15. Approved scope clarification — scheduling, program frequency, conditioning input (October 17, 2026)

- DEC-007 flexible program scheduling is **approved for MVP**. Programs may begin any day; users can set preferred training days and adjust missed sessions while preserving prescribed sequence, recovery, and actual completed dates.
- **Everyday Foundation: 3 training days/week. Everyday Strength: 4 training days/week.** Reconcile contrary 2-day/3-day draft blueprint outlines. Everyday Fit frequency remains unchanged and subject to detailed content review.
- DEC-010 **Your Effort Level** is optional after conditioning. If omitted, actual effort is **null/unknown**; never copy the recommendation into the actual field. Recommended effort remains workout-specific.
- Preserve DEC-008 simplified strength logging and optional RIR, DEC-009 overlays, and separate prescribed/draft/performed records.
- This is product-direction approval, not authorization to code, deploy, spend, or publish unreviewed programs.


## Change control — v1.4
DEC-011 supersedes previous mandatory account/cloud requirements for the initial personal/family pilot. Earlier passages about cloud authentication describe later-phase possibilities unless explicitly required for future cloud use.


## Authoritative October 17, 2026 UX and preview update

See Decision Register v0.7 and ../preview-update/UX_AND_DATA_SPECIFICATION.md. The owner-approved basic timer has Ready/Running only, optional brief completion; **no Pause/Resume controls**, no automatic set-triggered start, and immediate X/Stop & Reset without confirmation. Earlier timer pause/resume language is superseded for this component; workout/system pause behavior is unaffected. Presets/custom duration, separate preferred/prescribed/selected values, silent or single short beep, compact floating accessible controls and deadline accuracy are required. Scientific recovery rules remain unapproved until evidence/content review. Optional supplemental mobility and reusable reviewed exercise references are recorded for a later separately authorized implementation, with independent participation and no primary-adherence penalty.

Fitness App Preview is temporary visible naming; Everyday Athlete remains internal. Only minimal naming changes enter N04. No timer/mobility upgrade or unreviewed program content enters the preview candidate. Cloudflare owner-only Free deployment is authorized but requires secure account access, live security/cost checks and physical owner verification; no permanent branding, costs, family enrollment, Supabase or remote Git.
