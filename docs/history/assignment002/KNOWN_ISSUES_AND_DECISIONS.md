> **Native verification follow-up 01 (17 October 2026):** current outcome is [NATIVE_FOLLOWUP_HANDOFF.md](NATIVE_FOLLOWUP_HANDOFF.md). Native verification remains blocked on this host. See [NATIVE_VERIFICATION_PLAN.md](NATIVE_VERIFICATION_PLAN.md) for the supported-host continuation. The original foundation record below is retained.

# Known issues, blockers and unresolved decisions

Assignment002 /0.2.0. This is a local synthetic proof, not release-ready software.

| Severity/status | Item | Impact / next action |
|---|---|---|
| Blocking assignment acceptance | No native Supabase stack in environment; Docker/CLI absent and native PostgreSQL cannot run under the sandbox's UID0-only mapping | F03 and native portion of F08 remain incomplete. Run actual local Supabase Auth/JWT/RLS/Storage and native restoration verification on a supported host before accepting the secure-account foundation |
| Blocking real users | Synthetic HTTP credentials/session service and claims-context bootstrap | Does not prove GoTrue/recovery/refresh email, invitation gating or native database login. Do not deploy/expose; replace with approved actual Auth transport and test it separately |
| Blocking content publication | New3-day Foundation and4-day Strength detailed content not reviewed | Qualified reviewer must redistribute weekly work/recovery and approve content; fixtures cannot become actual prescribed programs |
| Blocking release | Effort scale anchors/session cues, media rights/form accuracy, privacy/consent/deletion/operations not complete | Continue under prior blueprint review gates; optional effort, RIR OFF and no excess-effort reward are already approved |
| Known limitation | No offline shell/service worker | Open-tab offline queue works; fully offline cold reload/start is not supported. No full offline sync claim |
| Known limitation | Clock timer has no OS background notification guarantee | Deadline/paused state persist; real-device lock/background/clock-adjustment handling needs further release QA |
| Known limitation | Browser tests use Linux Chromium emulation | Physical iPhone/Android/VoiceOver/TalkBack remain deferred; no full accessibility certification |
| Foundation boundary | Schedule uses explicit synthetic gap parameter and shift-preview policy | Real recovery/partial-session phase rules and detailed UX need review. No universal recovery default or silent skip |
| Foundation boundary | Coaching is a tested portable interface and synthetic rule proof | Interactive API currently produces baseline context rather than a complete longitudinal coaching product; no clinical claim or validated real-program prescription |
| Foundation boundary | Conflict UI resolves one queued action at a time | Following queued edits are retained and may require additional explicit resolution. Do not claim general offline merge |
| Foundation boundary | All SQL-lab operations serialized on one WASM connection | Correctness proof, not native production concurrency/performance/load testing |
| Operations not implemented | Production account deletion/export jobs, managed backups, invitation/admin workflows, email, PWA update/rollback and production observability | Not silently added to foundation scope; remain future approved work |

Corrected during this assignment: initial mobile input overflow; React overlay focus-invoker capture; separate conditioning session identity; exact effort-label test locator; browser single-process test configuration instability; generated-report lint exclusions; direct-SQL validation of missing load conventions; schedule replay deduplication. A clean-checkout parent-directory startup defect and explicit conflict-choice draft restoration were also corrected. Initial failures and final executed results are recorded separately. No known unhandled critical failure remains in the final executed local suites, but untested native/Auth/Storage behavior is a blocker—not evidence of security correctness.
