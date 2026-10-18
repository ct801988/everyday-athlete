# Proposed real-iPhone verification sheet

**Not executed.** Use owner-only synthetic records after the hosting method and distribution are approved. Record device model, iOS version, Safari version if available, Home Screen mode, URL/origin, app commit/build hash, gate version, test date, tester, outcome and evidence. Mark Pass/Fail/Blocked/Not run for each row. No family enrollment or real training evaluation.

Apple's current instructions describe Safari Share → Add to Home Screen, with Open as Web App where offered (H10). The checklist validates this app; documentation alone does not certify behavior.

| ID | Action | Required observation |
|---|---|---|
| IP01 | Open exact HTTPS URL in normal Safari, not Private Browsing | Trusted HTTPS; no provider signup, Node, Terminal or app-store account |
| IP02 | Fresh browser with no preview password; request root and known JS/sw/manifest paths | All network asset paths denied/challenged; no public alias or warm-cache bypass |
| IP03 | Wrong then correct shared credentials | Wrong denied; correct opens synthetic app; no workout account created |
| IP04 | First setup and return | Foundation3/Strength4 metadata, Fit pending; selection/start/preferences survive reopen |
| IP05 | Add to Home Screen using Safari Share; open icon | Correct neutral name/icon and usable layout; no unreviewed program appears approved |
| IP06 | Compare Safari-tab history with Home Screen history | Record actual sharing/isolation behavior; never assume they share storage. If separate, tested explicit JSON transfer explains it |
| IP07 | Launch from icon after Safari is closed | App opens normally; any credential prompt is documented and usable |
| IP08 | Inspect Weight/Reps/Done, body/load labels and numeric keyboard | No clipping, tiny targets or obscured controls; suggestions remain unperformed |
| IP09 | Edit draft, Done once, correction, Undo; reload | Exactly one intentional record/revision; accurate audit/current state; original performed date preserved |
| IP10 | Cancel then confirm exact-value bulk logging | Cancel writes none; confirm records only displayed remaining sets |
| IP11 | RIR OFF; optional RIR on/off and blank | Hidden/default optional; null unknown after restart/export/restore |
| IP12 | Finish partial/reopen; close and relaunch | No phantom sets; draft/actual/history persist. Wait for saved acknowledgement |
| IP13 | Start timer; open/close/carousel/Back exercise overlay | Values/tab/exercise/scroll/focus remain; deadline continues; no unexpected navigation |
| IP14 | Lock phone/background Safari briefly then longer | Record actual timer suspension behavior; no false completion or promise of background notification |
| IP15 | Reschedule with preview/cancel/confirm | Ordered sessions and actual dates survive; missed sessions not silently skipped |
| IP16 | Synthetic conditioning target/report/skip/correct | Program/session target unchanged; absent actual unknown; above-target report earns no increased demands |
| IP17 | Cache online; turn on airplane mode; reload in Safari | Previously cached shell, logging, history, scheduling and Why work without network |
| IP18 | Close/relaunch Home Screen app offline | Actual offline cold launch tested separately; credential/storage behavior recorded |
| IP19 | Reconnect after offline changes | Exactly one saved local record; no surprise upload, login or duplicate |
| IP20 | Open two tabs, edit same record; change/restore in one | Stale writer conflicts; other tab cannot silently overwrite or retain wrong active dataset |
| IP21 | Export JSON in Safari and Home Screen | File download/picker works; record destination and actual readable nonempty file. On My iPhone versus iCloud choice is explicit |
| IP22 | Restore that file into a separate normal browser/device test context | Preview/acknowledgement; exact IDs/actuals/drafts/nulls/schedule/provenance preserved; no automatic merge |
| IP23 | Import duplicate, malformed, unsupported and conflicting synthetic files | Duplicate no-op; invalid/conflict rejected; prior active history unchanged |
| IP24 | Export current data, restore another dataset, then export and rollback | Prior dataset accurately recovered; later histories remain separate |
| IP25 | Save denied/quota/storage fault in controlled synthetic test | Honest unsaved error; no false saved badge; previous durable data remains. Never fill or clear a real phone just to force this |
| IP26 | Controlled app update while session/timer exists | Waits for explicit safe activation; drafts/history survive; gate/cache failure cannot erase records |
| IP27 | Rotate preview password and test fresh access plus cached offline copy | New network access denied with old credentials; cached offline app may still work, limitation documented |
| IP28 | VoiceOver, larger text, landscape, reduced motion and touch controls | Labels/announcements, modal focus/return and logging/restore controls usable without gestures alone |
| IP29 | Confirm network/privacy boundaries using developer-side evidence | No sets/backups sent to provider, no telemetry/third-party fetch; redacted logs contain no password/records |
| IP30 | Final reopen and externally retained backup rehearsal | Save/data-loss warning understood; final export validated; all blockers recorded before owner sign-off |

Do not clear the only copy of any real data to test IP25 or a clear-data warning. Use separate synthetic context and verified backup, with additional permission before destructive device operations. Private browsing is an unsupported durability mode and should be explained, not certified. Deleting an icon is not a reliable controlled data reset or a secure wipe.

Pass gate: IP01–IP24/IP26–IP30 required paths have actual acceptable outcomes; IP25 destructive platform forcing may remain a documented limitation if safe injection tests and backup rehearsals pass. Any unrecoverable data loss, public access bypass, broken restore, wrong-person silent merge or missing core offline startup stops release acceptance. No fabricated physical passes. Android Chrome gets an analogous follow-up only after explicit family-device scope authorization; no family testers are enrolled here.
