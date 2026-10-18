# Decisions, risks and approval checkpoint

Version 1.0 • proposed defaults are recommendations, not approved DEC entries.

## Decisions requiring owner review

| Item | Recommendation | When needed |
|---|---|---|
| A01 Assignment 003 implementation | Approve P01–P06 as a bounded local-first engineering assignment; preserve lab mode/regression tests; no cloud work | Before coding |
| A02 Recovery behavior | Full JSON snapshot restore with preview, exact-duplicate no-op, conflicting-record rejection, atomic new-dataset activation, pre-restore export and one retained prior dataset; no merge | Approve with plan |
| A03 Supported pilot environment | Recommend desktop local execution as initial engineering demo; name intended phone/browser combinations before pilot acceptance. No `file://` guarantee | Before promising device pilot readiness |
| A04 Offline shell | Include narrowly scoped cached app assets and update safety after first load on a stable supported origin; no automatic hosting/distribution | Approve with plan |
| A05 Content and reviewer | Provide/approve detailed Foundation3 and Strength4 content, qualified reviewer, effort cues and exercise media. Fit remains pending. Synthetic fixtures can support implementation only | Before actual training/family evaluation |
| A06 Pilot release and participants | Review completed build/device/recovery results, then separately approve distribution method, participants, support and stop rules | After implementation; no enrollment now |

No repeated approval is needed for DEC-011's no-login direction, optional future accounts, established frequencies or optional effort/RIR. The current instruction supersedes the earlier recommendation that native checks must precede all Assignment 003 activity. No material unresolved source contradiction was found. Minor reversible adapter/file-organization details may be resolved during an authorized implementation.

## Documented planning assumptions

One local subject per browser profile; each family member uses their own device/profile. No secure same-profile family accounts. Export JSON is unencrypted, labeled sensitive, user-held, and has no automatic destination or upload. Proposed 20MiB/100,000-record import bounds are conservative defaults to validate, not a capacity promise. Plain CSV is not a backup. No lab Alice/Bob conversion or existing Winter Strong history import is included. Local baseline starts clean while old stores remain preserved. A stable origin is needed: hostname/port/browser profile changes can create a separate empty store. Application launch/phone installation remains dependent on a later approved distribution method.

Technical implementation can finish against labeled synthetic content, but that output must be called a local technical preview until approved training content and target-device tests exist. Do not call it “ready for personal workouts” solely because storage tests pass. Brand remains Everyday Athlete as working title; no new branding or legal clearance work is required here.

## Material risks and controls

| Risk | Control and residual limitation |
|---|---|
| Browser/device loss or clearing destroys both active and rollback data | Prominent warning, persistent-storage request, full portable export and separate-profile restore rehearsal; user must retain external backup |
| Shared browser exposes family history | Separate devices/profiles; clear privacy limitation. No security isolation is implied by local IDs |
| Failed write/restore corrupts actuals | Transactional audit+receipt, staging + atomic pointer switch, revision checks, fault tests; enough storage required to retain prior data |
| Offline/update failure hides app | Cache only versioned assets, update at safe point, compatibility/migration tests; platform offline behavior must be measured |
| New local adapter loses SQL safeguards | Contract parity suite and real IndexedDB tests, runtime validation, explicit ownership namespace and revision semantics |
| Synthetic training mistaken for reviewed coaching | Review labels persist, unreviewed programs not offered as authoritative training; qualified content gate |
| Above-target effort or inferred RIR drives unsafe increase | Keep independent optional actuals, null semantics, existing conservative rules and deterministic tests |
| Apparent scope escape into family sync/cloud | Separate-profile pilot only; no remote services, optional account infrastructure or secure family dashboards |
| No phone distribution currently approved | Local engineering demo first; owner later chooses cost-free private distribution/support method and tests actual devices |

## Proposed pilot evaluation after separate release approval

Initially the owner and explicitly approved adult family members on independent profiles/devices. Recommend completing at least two sessions per participant and one backup/restore rehearsal before expanding. Success: no unexplained data loss/phantom sets, successful cold restart and recovery on supported devices, understandable saved-versus-backup status, usable logging/overlays and accurate next-session sequence. These are proposed evaluation criteria, not completed results or permission to enroll anyone. Stop use for any unrecoverable data loss, wrong-person import accepted without warning, prescribed-as-performed defect or material coaching safety issue. Consent/privacy/support details remain part of release approval; do not collect centralized analytics.

## Approval wording for review

If satisfied, approve Assignment 003 P01–P06 and A02/A04 defaults for implementation only, with A03 device targets specified and A05/A06 retained as pre-pilot gates. This package itself does not grant that approval. No paid service, public deployment, remote push, real-user enrollment, irreversible operation or next major assignment is included.
