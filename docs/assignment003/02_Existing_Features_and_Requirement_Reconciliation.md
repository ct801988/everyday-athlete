# Baseline reuse and authority reconciliation

Version 1.0 • source inspection only; no new behavioral certification.

Authority: current user instruction and supplied DEC-011 handoff (Master v1.4, register v0.6, planning brief) supersede conflicting account-first planning for this pilot. Older documents remain historical evidence. Do not edit the supplied register or relabel unreviewed proposals as approved decisions.

| Requirement area | Current authoritative interpretation | Disposition |
|---|---|---|
| DEC-003/004/011 | React/TS stays; local use requires no account or Supabase; cloud optional later | Account-first pilot and cloud-as-prerequisite wording superseded |
| Assignment 002 acceptance | Local foundation provisionally accepted; native verification blocked | Preserve partial status; do not retroactively mark all of 002 passed |
| Next-step gate | DEC-011 explicitly authorizes 003 planning while cloud checks are deferred | Prior “complete native verification before any 003” recommendation superseded for local-only planning |
| DEC-005 | Free restricted pilot direction remains | Does not authorize distribution, hosting or tester enrollment now |
| DEC-006 | Reviewed evidence-informed, deterministic explainable coaching | Keep rule/evidence/input provenance and human content gate; no live AI |
| DEC-007 | Any-day start, preferred days, stable session sequence | Preserve missed sessions, actual dates and explicit rescheduling; recovery policy still review-dependent |
| DEC-008 | Weight/Reps/Done; optional per-set RIR default OFF | Suggestions never actuals; unknown RIR stays null and never solely blocks progression |
| DEC-009 | Canonical exercise overlay preserves workout state | Reuse component and accessible controls; media remain synthetic pending review |
| DEC-010 | Session-specific recommendation separate from optional actual effort | Null unknown; above-target actual never automatically rewarded or escalated |
| Program frequency | Foundation3 / Strength4 | Fit unchanged/pending review; no inferred approved detailed content |
| Historical master wording | Mandatory RIR, architecture/account questions and old no-code task boundaries appear in legacy sections | Apply explicit later approvals and DEC-011; no new conflict requiring owner arbitration found |

## Exact existing-versus-new inventory

| Feature / inspected source | Existing v0.2.0 capability | Assignment 003 proposed delta |
|---|---|---|
| React shell, `src/App.tsx` | Mobile inspection harness with synthetic login and server requests | Reuse shell/components; replace pilot entry and persistence calls through adapter, without deleting lab path |
| Domain contracts, `src/domain/contracts.ts` | Runtime data validation, session/load/effort concepts | Extend versioned local dataset, audit and backup contracts; preserve nulls/provenance |
| Device store, `src/data/client.ts` | IndexedDB v1 `drafts` store keyed by synthetic user, cached session/outbox/timer/RIR; last user marker in localStorage | Not complete durable history: add authoritative local sessions/actuals/history/schedules and transaction semantics; no fake “account” UI |
| Confirmation/correction/undo/bulk | UI + SQL RPC checks/receipts tested | Preserve behavior; enforce locally and test storage parity/failures |
| Schedule, `src/domain/scheduling.ts` | Date/sequence/revision functions; UI persists through API | Reuse functions and preview; persist locally; don't invent reviewed recovery spacing |
| Coaching, `src/domain/coaching.ts` | Pure synthetic deterministic rule proof | Reuse rules and tests; wire real local comparable history with explainability and approved-rule filtering; synthetic fallback clearly labeled |
| Overlay/timer | Canonical placeholder frames, focus/scroll/tab restoration; persisted deadline | Reuse; add restart/offline/update coverage, no inaccurate background alarm promise |
| Conditioning | Separate fixture session, target and optional actual; API storage | Persist separate local report revisions; optional unknown preserved; retain fixture labels |
| History/export | Acknowledged lab actuals; server JSON/CSV | Device-local multi-session history and full JSON backup; preserve safe CSV report |
| `server/`, SQL migration | PGlite synthetic service, RLS/RPC SQL proof, not real Supabase Auth | Retain isolated lab for tests/future reference; not required or silently started by local pilot |
| `scripts/backup.ts`, `restore.ts` | Node-only PGlite archive to a new directory | Preserve as lab tools; these are not browser backup/import and do not satisfy DEC-011 |
| Offline | Existing loaded-tab draft/outbox proof; no service worker/cold offline shell | Proposed cached app shell and device-authoritative mutations; test actual offline restart |
| Family separation | Synthetic account test contexts | Separate devices/browser profiles; no secure same-profile person switcher or account illusion |
| Program selection/content | Synthetic metadata/fixtures; Foundation3/Strength4, provisional Fit | Minimal selector; reviewed program versions required for actual pilot training; disabled pending content options explained |
| Tests | Historical 35 unit +21 SQL +11 browser passed; 3 native skipped | Retain original lab suites; add separate local adapter and browser suites; don't delete account tests to improve counts |

## Preservation and transition

Use the existing independent repository and a new assignment branch only after authorization. Keep `docs/approved/` unchanged and add the current handoff as a later authority source when implementing. Keep original lab database/store intact. No automatic conversion of synthetic Alice/Bob records into a person's real workout history. Offer clean local setup. Prior lab backups/draft stores may remain retained but unsupported for pilot import unless an explicit validated converter is later approved; explain this rather than discarding them. Domain set history and program identity must never be merged by display name alone.

No new research/architecture comparison or Winter Strong inspection is necessary for this delta. Prior scientific framework and native verification evidence remain valid within their original scope. A future cloud phase must review mapping of local subjects to authenticated owners, upload consent, conflicts, authorization and native restoration anew.
