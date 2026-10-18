# Everyday Athlete — Phase 0 Decision Register

**Version:** 0.7  
**Recorded:** October 17, 2026  
**Status:** DEC-001 through DEC-011 approved, with DEC-003 updated by DEC-011. Assignment 002 foundation is provisionally accepted; native Supabase verification remains blocked and is required before any cloud-account pilot.  
**Product working name:** Everyday Athlete (brand, domain, and trademark not cleared).

## Approved decisions

| ID | Decision | Status | Scope and constraints |
|---|---|---|---|
| DEC-001 | Initial audience | Approved | Adults seeking structured beginner-to-intermediate strength and general fitness; not a restriction on future categories. |
| DEC-002 | Initial programs | Approved | Three programs with working titles **Everyday Foundation**, **Everyday Strength**, **Everyday Fit**. Specific content, duration, exercise rules, equipment profiles, and qualified review remain open. |
| DEC-003 | Technical direction | Approved in principle; revised by DEC-011 | Web-first **React + TypeScript**, responsive/PWA experience. Local-first persistence for initial pilot; **Supabase optional in a later phase**. Preserve existing Assignment 002/003 source. Owner-only Cloudflare Workers Free preview is now authorized under N04 restrictions; no spending or wider release approved. |
| DEC-004 | Persistent accounts | **Superseded for initial pilot by DEC-011** | Cloud-backed individual accounts remain a potential later-phase capability, not an initial-pilot requirement. |
| DEC-005 | Release and budget | Approved | Start with a **free invitation-only pilot**. No subscriptions, paid infrastructure, public launch, or app-store submission authorized yet. |
| DEC-006 | Evidence-Based Intelligent Coaching | **Approved** | Core product requirement. Workouts and progression must be scientifically defensible, individualized within reviewed programming rules, traceable to evidence and the user's actual training data, and explainable in plain language. Architect a curated/versioned evidence base, deterministic testable coaching rules, user-context/performance model, and AI explanation layer. **Live conversational AI is excluded from the initial MVP unless the blueprint supplies compelling justification and the owner separately approves it.** AI must not invent evidence, diagnoses, user data, or unapproved prescriptions. |

| DEC-007 | Flexible Program Scheduling | **Approved for MVP** | Start programs on any day, choose preferred training days, and reschedule missed sessions without silently skipping prescribed sessions. Preserve workout sequence, appropriate recovery spacing, and distinct scheduled versus performed records. Detailed rules remain subject to review. |
| DEC-008 | Minimal Logging / Optional RIR | **Approved** | Default set tracking is weight, reps, completion; RIR hidden and not required, but optional advanced per-set tracking (default OFF; missing = null/unknown). Prefilled values are suggestions until user confirms they were performed. One-tap set completion with undo; deliberate confirmation of any bulk completion. Rule-based progression must function without RIR. |
| DEC-009 | In-Workout Exercise Demonstration Overlay | **Approved** | Modal/full-screen exercise reference overlays during workouts, with exercise images/cues from the shared canonical library; clear close returns to exact scroll/exercise/active tab with all drafts, sets, and timers intact. Library may use full reference view. Require mobile, accessibility, and state-preservation tests. |
| DEC-010 | Conditioning Effort Level (user-facing replacement for RPE) | **Approved** | Conditioning displays program/session-specific **Recommended Effort Level** (1–10 with description and feel cue) separately from post-session user-reported **Your Effort Level** (1–10). Plain-language info icon; never infer actual effort or treat above-target exertion as inherently better. Preserve DEC-008 optional RIR and DEC-009 overlays. Detailed UX/content review still required. |

| DEC-011 | No-login personal/family pilot; optional cloud accounts later | **Approved — supersedes DEC-004 for the initial pilot** | No email, password, registration, or Supabase service required to begin. Save workout and program data on each device, with tested export/import backup and clear data-loss warnings. Optional accounts/cloud backup/sync are deferred and require separate approval. Existing Supabase code may be preserved for later, but cannot block local use. |

## DEC-011 implementation requirements

- First launch goes straight to lightweight program setup; no sign-in gate.
- Persist program choice, schedule, performed sets, history and progress on the same device; verify persistence after restart.
- Provide a user-initiated backup export and validated restore/import, including duplicate/conflict and malformed-file safeguards.
- Warn that deleting the app/browser data, losing the device, or switching devices can lose unsynced history; local data is not automatic cloud backup.
- Each family member should use their own device/browser profile; local-only data does not provide secure multi-user isolation on a shared browser profile.
- Keep prescribed, draft, and performed records distinct; preserve optional RIR and unknown effort values.
- Native Supabase Auth/Storage verification is deferred for the local-only pilot, **not passed or waived** for future cloud accounts.
- Change the Assignment 003 plan and tests accordingly. Do not implement, deploy, or enroll testers without explicit approval.

## Product commitments added by DEC-006

- **Science is foundational, not a decorative citation feature.** The initial programs and recommendations require documented principles and review standards.
- **Recommendations must be explainable:** record relevant rule ID/version, program phase, comparable performance inputs, reason, and supporting evidence, including uncertainty where appropriate.
- **Evidence hierarchy:** prioritize guidelines, position stands, systematic reviews/meta-analyses and well-conducted primary research; distinguish evidence from elite-athlete methods, expert practice, and hypotheses.
- **Knowledge governance:** references include source identity, publication/date, studied population, applicability, limitations, evidence confidence, licensing/access status, review dates, and approval status. Human review is required before publishing revised authoritative coaching rules.
- **Copyright/content rights:** do not copy protected textbooks, certification curricula, or paid course materials into a product without licenses. Use lawful references and independently authored summaries.
- **Safety:** never extrapolate elite sports training to beginners without suitability checks; no automatic exercise advice for undiagnosed pain; no assumptions from missing RIR, substituted movements, or partial sessions.
- **MVP experience:** reviewed programs; rule-based recommendations; concise optional **“Why this?”** explanations with traceable scientific rationale. Advanced conversational coaching is a future candidate, not an approved MVP feature.
- **Operational discipline:** evaluate AI hallucination rates, source fidelity, privacy, prompt injection, costs, and clinical/fitness scope before authorizing live AI.

## Standing boundaries

- Winter Strong is a **read-only reference**, not the new platform; do not modify its GitHub repository or live deployment.
- Everyday Athlete must use a new repository and separate deployment.
- The product owner approves major scope, architecture, external costs, branding commitments, and release decisions.
- Preserve the distinction between prescribed, prefilled draft, and performed sessions and between comparable and substituted exercises. Missing per-set RIR remains unknown, never inferred. RIR is not a default user-input requirement (DEC-008).
- Local pilot records require device-local persistence, portability, tested restore, and rollback planning. Cloud-account user isolation and native security testing become mandatory when cloud accounts are introduced.
- No production coding under Work Assignment 001.

## Open decisions and validation work

| ID | Item | Required output / decision |
|---|---|---|
| OPEN-001 | Final architecture | Compare React/PWA/Capacitor and Expo/React Native; validate Supabase, security, and mobile distribution. |
| OPEN-002 | MVP scope | Approve exact journeys, screens, core feature set, exclusions, acceptance tests, and definition of done. |
| OPEN-003 | Training program content | Approve detailed program outlines, duration, equipment assumptions, adaptations, periodization/progression rules, and named qualified reviewer criteria. |
| OPEN-004 | Exercise media | Verify available image rights, accuracy and future content production/publishing process. |
| OPEN-005 | Data and connectivity | Approve data model, explainability metadata, data isolation, drafts/offline, conflicts, exports, migrations, backups, and deletion. |
| OPEN-006 | Privacy and safety | Specify consent, data minimization, age eligibility, appropriate claims/disclaimers, review obligations, and security tests. |
| OPEN-007 | Pilot plan | Specify participants, success metrics, support, defect thresholds, and spending ceiling. |
| OPEN-008 | Brand | Name/domain/trademark validation remains separate and unapproved. |
| OPEN-009 | Work Assignment 001 | Execute read-only source audit and blueprint, incorporating DEC-006. |
| OPEN-010 | Evidence governance | Define eligible sources, review process, source licensing, evidence/confidence taxonomy, and who can approve training rules. |
| OPEN-011 | Coaching engine explainability | Approve evidence-to-rule mapping, provenance and logic audit, user-visible “Why?” patterns, uncertainty, and deterministic test examples. |
| OPEN-012 | Future conversational AI | Establish evaluation/safety/cost gates; do **not** include in initial MVP absent documented justification and separate owner sign-off. |
| OPEN-013 | Flexible program scheduling (DEC-007) | **MVP inclusion approved.** Work to specify start-date/week boundaries, missed days, workout order, recovery, and rescheduling UX; obtain approval of detailed behavior before feature implementation. |
| OPEN-014 | Minimal logging UX (DEC-008) | Owner approves detailed set-card layout, prefill/confirm/undo/bulk semantics, optional advanced RIR placement, and usability test results before implementation. |
| OPEN-015 | Exercise overlay UX (DEC-009) | Owner approves overlay flow, canonical media behavior, focus/screen-reader/gesture alternatives, exact-position return and state-persistence tests before implementation. |
| OPEN-016 | Conditioning Effort Level detailed UX (DEC-010) | **Post-workout actual effort input is optional; missing remains null/unknown (approved).** Still review scale anchors/feel cues, mobile selection control, partial-session behavior, and CND-01–12 before feature implementation; qualified reviewer approves programming targets. |

## Additional approved program direction (October 17, 2026)

- **Everyday Foundation:** target **3 training days per week**.
- **Everyday Strength:** target **4 training days per week**.
- **Everyday Fit:** no new frequency decision in this approval; retain its prior provisional outline pending detailed review.
- Frequencies are product-direction decisions, **not** approval of particular exercises, sets, periodization, safety rules, or a rigid Monday-to-Sunday calendar. Work should reconcile blueprint documents that propose Foundation 2 days and Strength 3 days.
- **Conditioning effort:** `Your Effort Level` is optional after a workout; if skipped, store null/unknown and do not substitute `Recommended Effort Level`.
- This update does **not** authorize Assignment 002 coding, external spending, or public deployment.

## Next approval checkpoint — Work Assignment 001 blueprint sign-off / Assignment 002 boundary

1. Review verified Winter Strong source and ZIP findings and explicitly identify discrepancies or unverified behaviors.
2. Approve final platform architecture, data model, authorization, portability, and handling of interrupted sessions.
3. Approve the three detailed, evidence-informed program outlines and qualified content-review mechanism.
4. Approve scientific knowledge architecture, evidence-source governance, rule provenance, and initial “Why?” experience.
5. Approve the final one-tap set-entry design without mandatory RIR, bulk-confirmation safeguards, and exercise overlay behavior; verify mobile accessibility and unfinished-workout state preservation.
6. Confirm **no live conversational AI in MVP**, unless a specific evidence-based exception is separately proposed and approved.
7. Approve exact MVP screens/features/exclusions, test acceptance criteria, pilot success criteria, and expense limits.
8. Only afterward authorize the separate **Work Assignment 002: application foundation/scaffolding**.

**Not authorized:** production implementation, modification of Winter Strong, paid commitments, public deployment, commercial branding commitment, monetization, app-store submission, or live AI integration.

## Change log

- **2026-10-17 / v0.1:** Recorded DEC-001 through DEC-005; no implementation performed.
- **2026-10-17 / v0.2:** Recorded product-owner approval of DEC-006. Added evidence-based coaching requirements, source governance, coaching auditability, phased AI plan, and explicit initial-MVP exclusion for conversational AI without a later separately approved exception. Work Assignment 001 scope updated; no coding performed.
- **2026-10-17 / v0.3:** Recorded approved DEC-008 default simplified weight/reps/completion, RIR optional with null unknown, and DEC-009 in-workout exercise overlay. Recorded DEC-007 as proposed/not approved. Updated Work 001 scope and master v1.1; no production code.
- **2026-10-17 / v0.4:** Recorded DEC-010 approved conditioning Effort Level terminology and distinct recommended versus actual 1–10 metrics. Added review gate OPEN-016; master v1.2 and detailed DEC-010 blueprint addendum. No new code, launch or spending approved.


## DEC-010 incorporation note — current blueprint v1.1

Approved **conditioning Effort Level** is a targeted addendum to Blueprint v1.1, not a new kickoff. Apply `DEC010_Conditioning_Effort_Requirements_UX_Tests.md` to blueprint documents 01 (PR-11), 04 (separate prescribed/reported effort data), 05 (conditioning and post-workout UX), 06/15 (reviewed session-specific effort targets and coaching logic), 08 (CND-01–12 tests), and 09 (stage placement). Do not alter completed Winter Strong research or assume Work Assignment 002 has been authorized.

- **2026-10-17 / v0.5:** Owner approved DEC-007 for MVP; Foundation 3 days/week and Strength 4 days/week; optional actual conditioning effort with missing = null/unknown. Assignment 002 still requires explicit authorization.


**Change note (October 17, 2026):** DEC-011 records the owner's explicit approval of no-login onboarding with optional accounts/cloud backup later. Earlier account-first references are historical and are superseded for the initial pilot.


## Current owner update — October 17, 2026 (v0.7)

This section supersedes conflicting historical requirements, not working code. Earlier authorizations embedded in older notes are historical. DEC-001–011 remain intact, including optional RIR and optional actual effort. DEC-010 actual effort may be absent/null/unknown; no target substitution or automatic increase for above-target effort.

The following IDs are administrative additions to this register for the owner's approved requirements; their numbers are assigned here, not claimed to have been provided by the owner.

| ID | Decision | Status / authority |
|---|---|---|
| DEC-012 | Temporary preview naming and bounded N04 | Approved design/preview direction: visible browser title, app heading and manifest name **Fitness App Preview**; candidate Worker **fitness-pilot-preview**, availability unverified. Everyday Athlete remains internal. No domain purchase or permanent brand. N04 owner-only Free Worker deployment is authorized subject to existing security/cost gates and secure account access. |
| DEC-013 | Basic rest timer: Ready/Running, no Pause/Resume | Approved functional design; implementation NOT authorized in this task. Start manually; X/Stop & Reset cancels timer/alert, restores selected duration and returns compact Ready immediately, no confirmation. No auto-start after Done. Brief subtle green completion allowed. Exactly Silent (default) or one short nonrepeating beep. **Supersedes all earlier basic rest-timer Pause/Resume UI and acceptance requirements**, including the current demonstration. Does not remove workout pause/resume or advanced future systems. |
| DEC-014 | Optional mobility and reusable movement reference | Approved functional design, next milestone pending implementation approval. Supplemental mobility below primary workout; independent movement/partial/daily/weekly/cumulative tracking, now or later, no adherence penalty for omission; future mobility-primary sessions supported by model. Reusable strength/mobility/flexibility/recovery reference components with accurate reviewed mappings and state preservation. |

DEC-013 includes presets 30/60/120/180 seconds, custom five-second increments, three separate duration concepts (preferred, prescribed, selected), durable local preference, deadline-based reliability, compact floating UI with approximately 20–25% less height where practical without smaller accessible touch targets. Future workout-aware rest recommendations are deterministic, advisory, explainable, user-overridable and derived from reviewed prescribed data. The owner's candidate ranges are illustrative only; science/content approval remains a separate gate. No conversational AI, forced shorter rests or advanced interval timer in this basic implementation.

Full normative requirements and proposed tests: ../preview-update/UX_AND_DATA_SPECIFICATION.md and IMPLEMENTATION_PROPOSAL_AND_TESTS.md. N04 is in progress with owner-assisted dashboard deployment. Host fitness-pilot-preview.thompson-chad1988.workers.dev now serves the gate; a fresh unauthenticated live check returned401 after configuration was corrected. The full app is not yet deployed/verified. Owner approved embedding static assets in one gated Worker to avoid developer tools or a separate asset upload. No cloud workout data, new features or costs are authorized. Google account/services access is prohibited. Free-plan status, hosted CPU/alias behavior and physical iPhone acceptance remain unverified.


### Published preview verification checkpoint — owner reports, October17 evening

The owner has now deployed the embedded application and confirmed iPhone entry persistence, backup saving to Files, cached offline reopening and visible data retention after same-file import.25agent live negative-access checks returned401. These are limited observations; full N04 acceptance is still provisional pending remaining live/account/installed-device/recovery gates in ../preview-checkpoint/REVIEW_SUMMARY.md. No further product decisions or implementation permissions are inferred. The rough interface remains an open usability issue. No additional development or deployment is authorized by these test reports.
