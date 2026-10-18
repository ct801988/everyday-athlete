# Assignment002 — Application Foundation execution plan
Planv1.0 •17 October2026 • **Awaiting explicit approval; no execution started.**

## Goal and authority
Build a reproducible, isolated foundation that proves private persistence, confirmed-vs-suggested tracking, scheduling contracts and testable coaching boundaries using synthetic data. Deliver a downloadable source build and actual test evidence for strategy review. This is not the complete external MVP. Authoritative direction: current01/10, approved DEC-001–010 and this assignment's explicit scope after owner approval. Prior research/ADR stays intact. The referenced Pre-Assignment002 Handoffv0.5 ZIP is unavailable; verify it against this plan before claiming final source completeness. Do not assume it contains only the four approvals repeated in chat.

Approval of this plan would authorize the bounded work below, not payments, production deployment, public signup or Assignment003. Changes in scope return as a concrete proposal for owner decision.

## Proposed architecture to approve
React + TypeScript browser-first application shell, Vite build tooling, portable TypeScript domain modules and Supabase-compatible Postgres/Auth/Storage contracts. Local Supabase stack with isolated synthetic users for integration tests when runtime supports it; no hosted project required for002. Pin actual compatible versions and lockfile during execution after checking environment/official docs, not by assuming today's container already has the toolchain. No Capacitor/Expo/native stores, vector database, live AI or second backend framework.

Proposed boundaries: UI shell/test harness → typed domain contracts → repository/storage adapter → transactional Postgres persistence and RLS. Browser IndexedDB draft/outbox adapter separate from authoritative persisted actuals. Trusted local server path recomputes/validates recommendation provenance; client cannot author approval state, tenant ownership or authoritative coaching conclusions. Shared pure domain rules are dependency-light and injectable for deterministic clocks/UUIDs. Separate feature/data/content modules and stable IDs; no monolithic Winter Strong copy. No exercise images/code copied until rights resolved; use clearly labeled neutral test placeholders and authored synthetic fixtures.

## Separate repository and work isolation
After approval, create one **new local Git repository**, tentative name `everyday-athlete-foundation`, in its own directory. It must not be a branch, worktree, fork, subdirectory or remote of Winter Strong. Record absolute paths and verify remotes before any operation. Existing Winter Strong repo/deployment are read-only references and need not be opened or fetched for002. No GitHub repository creation or push in002; remote ownership/privacy/name requires a separate owner instruction. Use a clear source snapshot/tag and changelog for the deliverable; secrets, dependencies, build output and real user records excluded from Git/source ZIP.

## Bounded implementation scope

| Work package | Included | Definition of done |
|---|---|---|
| F01 Reproducible shell | Package/lockfile, TypeScript, basic responsive navigation shell, test runner, lint/typecheck/build scripts | Fresh documented setup builds; semantic placeholder screens clearly labeled development-only |
| F02 Canonical contracts | Program/version,3-day Foundation/4-day Strength metadata, prescribed/draft/confirmed actual, nullable RIR, load types, schedule slots/revisions, evidence/rule provenance and separate conditioning scale/target/report | Runtime validation and serialization tests; no fabricated training content or mandatory effort |
| F03 Isolated persistence/auth | Local schema migrations and synthetic auth users, ownership constraints/RLS, trusted write path, versioned content read boundary | A/B/anonymous negative tests via unprivileged clients, privilege escalation denied |
| F04 Mutation/draft proof | Explicit confirm, edit/correction/undo, exercise-scoped exact-value bulk transaction; device outbox, receipts and conflict handling | Duplicate request safe; stale writes rejected; no phantom completion or silent overwrite |
| F05 Schedule domain proof | Any-day start, preferred weekdays, stable sequence/slot IDs, reviewed-policy parameters represented by synthetic constraints | Foundation3/Strength4 slots; week carryover/no skips; recovery conflict surfaced, no calendar-driven completion |
| F06 Coaching contract proof | Pure deterministic interface, synthetic approved-status fixtures, no-RIR progression and pain/partial/phase guards; CND-R01 context-only effort response | Replayable output/version/input IDs; no invented effort/citation or above-target automatic escalation |
| F07 Minimal state-preservation harness | One synthetic workout with editable suggested rows, Done/undo, rest deadline and canonical-reference placeholder modal; test-only effort-report form | Runnable local vertical slice tests draft/actual/overlay/timer contracts without claiming final UX or reviewed media |
| F08 Restore/portability proof | Local synthetic database reset/migration/restore, JSON/CSV contract samples and schema version | Synthetic round-trip retains nulls, prescription/report separation and tenant policies; no production recovery claim |
| F09 Handoff | Source ZIP, setup README, results, manifest/changelog, known issues, rollback notes, milestone summary | Required files verified, build/test failures disclosed, explicit stop |

F07 is a small developer verification surface, not final onboarding, polished workout UX, release candidate or new branding. Bulk confirmation and conditioning form exist only to verify data/state contracts. If this exceeds the owner's preferred foundation scope, revise F07 before authorization rather than silently building consumer features. Do not fill missing real FoundationC or StrengthD sessions; fixtures are visibly synthetic and non-prescriptive.

## Explicit exclusions
Production/live cloud configuration; public deployment/previews; paid services; GitHub remote creation/push; real user enrollment/data; production email/recovery delivery; complete onboarding/program selection/history dashboards; final exercise library/media; full real program authoring/clinical review; final design system; full offline multi-device synchronization; mobile app packaging; wearables/running/HIIT/Travel Mode; payments; live conversational AI; Winter Strong import/rewrite/modification. Privacy operations/deletion/email/live backup readiness remain later implementation gates; model their interfaces without claiming them delivered.

## Security and data invariants
No real secrets or user health data in fixtures. Local test credentials generated for isolated users only, documented as test-only; never request production credentials for this scope. Never put service-role credentials in frontend bundles or expose privileged mutations. Deny tenant cross-links with foreign keys and authorization, not UI filters alone. Validate server-side set quantities/load kinds/report bounds; suggestions/blur/overlay views never count as actuals. Signed-in identity owns all queued mutations; account switch cannot replay another user's queue. Evidence/program/rule publishing is privileged and immutable; client cannot mark content approved.

Actual conditioning effort is optional/null, independent of prescribed range/version; correcting it never edits the prescription. Null RIR does not block eligible strength progression. Known pain/adverse context still applies. Browser storage failure/network failure must show truthful persistence status. Optimistic revisions and idempotency receipts prevent double logging. Check note rendering/CSV formula injection, export boundaries and dependency/secret exposure. Fixture readiness labels are synthetic, never human-review certification.

## Scheduling policy for the foundation proof
Use template frequency3/4 and ordered stable session IDs, any start local date, timezone and preferred weekdays. Generate only on/after start; do not drop unfinished sessions across week boundaries. Synthetic minimum gap constraints are parameters, not a universal medical rule. Reject invalid count/recovery placement with reasons and next-feasible-date preview. Missed/partial status is explicit; rescheduling requires accepted revisions and preserves original plan/actuals. Final real recovery spacing, missed-day choice defaults, phase advancement after partial work and overload constraints require qualified content/owner sign-off before production scheduling. Foundation tests prove configurability and safe failure when policy is absent.

## Test plan and evidence required
Run fresh install/build/typecheck/lint plus unit/integration/browser suites on the actual delivered source. Capture command, environment/tool versions, commit/content/schema/rule versions, fixture setup, pass/fail counts, failures and evidence path. Do not turn skipped environment-dependent tests into passes. All critical tests below must pass for a complete002; environmental inability yields an explicitly incomplete milestone and a bounded unblock proposal.

| Suite | Required coverage |
|---|---|
| Build | Lockfile install, TypeScript checks, lint, production asset build; no privileged secret in bundle |
| Domain | Null/partial RIR accepted, confirmed-vs-draft distinction, load basis/units/BW, pain/recovery precedence, substitutions/comparison isolation and deterministic replay |
| Schedule | SCH-01–05: any-day starts,3/4 frequency, carryover, no implicit skip/doubling, gap constraints, stable revisions/timezone/conflict |
| Persistence/security | Two synthetic users + anonymous; parent ownership/RLS on all new private entities; spoof publisher denied; report/export isolation |
| Mutation races | Retry after commit-before-ack; double tap; bulk atomic rollback; stale correction; undo after correction; explicit multi-device conflict |
| Conditioning | CND-01–08/10–12 data/terminology aspects, optional skip=null, range/version separation, no above-target reward/escalation, correction immutability |
| Browser vertical slice | Confirm suggested set, edit/undo, lose connection/resume, overlay open/close with unsaved input/timer/tab/scroll intact; representative320/390px layouts |
| Recovery/portability | Reset/reapply local migrations, restore synthetic snapshot, verify counts/nulls/provenance and tenant access; CSV safe export |

Automated keyboard/accessibility checks and manual keyboard review of the harness are in002. Full real-device iPhone/Android, VoiceOver/TalkBack, final effort-anchor comprehension, reviewed media and complete CND-09/DEC-009 user validation remain later gates unless actual devices become available within scope. Emulation is labeled emulation. Map relevant T-01–39/CND-01–12/SCH-01–05 to implemented, passed, failed, deferred and not applicable; do not claim the whole MVP acceptance suite passed from a foundation proof.

Representative002 E2E: synthetic userA opens a fixture plan, starts midweek, confirms one suggested set without RIR, edits another, opens/closes placeholder demo, loses connection and resumes, resolves retry, finalizes partial; actuals and original prescription stay distinct. A separate synthetic conditioning session skips actual effort, then records/corrects it; range remains unchanged and no demand increases. UserB cannot accessA's entities. Run on local test system only.

## Credentials, environment and cost assumptions
**Requested spending ceiling:$0.** No paid vendor/account/service action. No production credentials are needed. Local prerequisites to validate after approval: Git, compatible Node/package tooling, browser automation and a local Postgres/Supabase stack (usually container runtime support). This environment has not been qualified for002. If local stack/container support is unavailable, stop the affected integration work with evidence; do not silently replace required RLS/auth tests with mocks or provision a hosted service. Continue independent in-scope contract/shell work and report the missing proof. A local-only reproducible source bundle can still be delivered as incomplete; completion requires the real persistence tests.

No credentials should be pasted into the conversation or delivered ZIP. A future hosted integration would require approved project ownership/region, permitted connection mechanism, environment secret injection, email configuration and explicit approval even if the provider tier is free. Current vendor tariffs are not being re-researched or purchased; historical estimates in03 remain dated planning assumptions. Labor is not priced by this plan; if third-party paid work is needed, return an estimate for approval.

## Execution sequence and stop gates
1. After explicit plan approval and handoff verification, inspect environment, create isolated local repo and pin tooling; record baseline.
2. Implement contracts/synthetic fixtures and schema/RLS; run meaningful domain/tenant tests. Checkpoint report surfaces material gaps; routine reversible choices proceed within scope.
3. Implement draft/mutation/scheduling/coaching proofs and small harness; run suites, fix within scope, record remaining failures.
4. Package/reproduce setup/build/tests, deliver milestone and strategy review ZIP. **Stop. Do not start003 or deploy.**

Major scope/cost/production/irreversible change requires new owner authorization. No automatic continuation because tests pass. Recommended subsequent assignment is003 Core MVP Journey, scoped only after002 review and training-content/UX gates; its outline is not authorization.

## Deliverables and approval wording
Deliver source ZIP with README/setup/prerequisites/scripts, lockfile, source, migrations, synthetic fixtures/tests, environment example without secrets, changelog, rollback/restore instructions and file manifest. Include BUILD_AND_TEST_RESULTS.md, KNOWN_ISSUES_AND_DECISIONS.md, MILESTONE_HANDOFF.md and NEXT_ASSIGNMENT_PROPOSAL.md. Report checks not run and actual failures separately from plans. Make the full review package usable in the strategy conversation without relying on this chat.

**Approval requested:** authorize only Assignment002 F01–F09 as defined, using a new local repository and synthetic/local services, spending ceiling$0, no hosted service or deployment, with milestone handoff and stop. The missing v0.5 handoff must be supplied/verified first or the owner must explicitly designate this conversation-based consolidation as the execution authority. No further blanket blueprint “approval” is inferred.
