# Impact assessment against actual source

Baseline: Assignment 003 tag 77ba0a0 and preview preparation tag d1d0a3c. Inspection is of the actual React/local-first source; no Winter Strong changes or program-content import. The supplied V5.1 reference archive was inventoried read-only; its contents do not supersede current requirements. The supplied master v1.0 was read; later approved decisions override its mandatory-RIR/account/backend suggestions.

| Area | Actual implementation | Reuse | Required future change |
|---|---|---|---|
| Basic timer | src/local/LocalApp.tsx: inline rest section, fixed manual 60-second start, Pause/Resume, Date.now deadline and 500 ms render tick | Deadline calculation, persisted view state, act command/revision path | Compact floating component, Ready/Running, X/Stop & Reset, no Pause/Resume, selection/presets/custom/alerts |
| Timer state | src/local/model.ts: strict view.timer {deadline, paused}; preferences only rir/unit | Validated model, auditable commands, local durability | Separate preference/prescription/selection/run identity/completion claims; versioned migration, remove paused from new runtime contract |
| Other timers | Preserved src/App.tsx lab uses Start/resume rest and pause; timed actual sets are different | Regression/lab remains historical | Do not mass-delete “resume” in recovery/network/workout code. New basic timer acceptance excludes pause/resume; old tests remain baseline evidence |
| State preservation | DemoOverlay restores focus/scroll, dialogs, Escape/Back and frame carousel; local acceptance L08 checks draft/timer | Dialog shell and preservation tests | Pass canonical exercise identity, timer outside conditional exercise lifecycle, layer dock beneath dialog, new nonsequential/superset scenarios |
| Data persistence | IndexedDB datasets/meta, active/previous pointers, optimistic revisions and durable drafts | src/local/store.ts transactional write/activation/rollback | Evolve strict dataset/backup schemas; completion claims and mobility validation, no per-tick writes |
| Backup/recovery | Full versioned JSON, canonical digest, strict scanner, preview, conflicts, prior dataset and rollback | src/local/backup.ts and current recovery UX/tests | Old/new fixtures, preference/rest provenance/partial mobility round trip, migration preview, version-aware downgrade refusal |
| Offline/update | Bundled shell service worker, manual update activation; exact protected asset paths | build-offline/build-preview pipeline and cache tests | Add approved new assets atomically; test schema/update/rollback compatibility and audio offline; keep Worker gate |
| Mobility | No mobility entities/independent session UI or participation metrics in current local model | Local sessions, audit, receipts, history patterns; no automatic reuse of strict strength schema | Independent movement prescriptions/actuals/drafts, supplemental/primary role, optional participation statistics |
| Exercise library | Shared canonical domain fixture and reusable dialog shell, but DemoOverlay imports one synthetic exercise directly; local content fixes one exercise ID/version | IDs/contracts, cues, carousel, modal behavior | Multiple versioned movement types and validated media mapping; parameterized overlay; synthetic-first fixtures then separate content review |
| Progress/coaching | Deterministic synthetic rules, separate prescribed/actual, optional RIR/effort | Keep DEC-006/008/010 and evidence framework | Optional mobility never alters primary adherence/load increases; rest engine requires reviewed rules and explainable provenance |
| N04 distribution | Worker-first gated 10-file payload; no configured host or password | Access wrapper/security/allowlist and native workerd tests | Naming only now; no timer/mobility/schema/audio/prescription changes enter current candidate |

## Minimal preview changes made now

Visible browser/index title, local app h1 and manifest name/short_name are Fitness App Preview. Worker configuration uses fitness-pilot-preview (availability not verified). Internal package, database name, backup identity, canonical IDs and Everyday Athlete documentation remain unchanged. No origin has been deployed, so the rename did not move existing hosted device data. A future change to a used hostname would create a different browser store; keep the eventual origin stable.

Build outputs/hashes and the Worker asset allowlist must change together when the visible name changes. The service-worker cache version changes naturally from content hashing; native update tests retain workout state. No access algorithm, credential storage, schema, timer behavior or mobility feature was modified. The two h1 text replacements is an authorized naming edit; all other workout source is byte-preserved.

## Conflicting historical specifications

Current approved Decision Register v0.7, master v1.5 and blueprint v1.4 explicitly supersede older basic-timer pause/resume requirements. The attachment's “timers handle pauses” language and existing Pause/Resume buttons are historical for this basic timer. Existing tests referencing those controls are kept as evidence for the unchanged preview, not requirements for the proposed upgrade. Future acceptance replaces timer-control expectations without deleting unrelated workout pause, interruption/retry, or network-resume tests.

## Risks that prevent calling the proposal complete implementation

Timer alerts across tabs, rehydration and X/expiry races need transactional ownership and at-most-once semantics. Deadline persistence does not guarantee locked-screen sound. Compactness cannot be accepted by percent alone if it harms touch targets or covers inputs. Mobility participation must not masquerade as measured mobility improvement. Reviewed exercise identity/media mapping and rights remain separate content gates. None of these future properties has passed a test merely because it appears in this document.
