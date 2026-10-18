# V1 media inventory and integration plan
Inspected supplied WinterStrong_V5_1_Final_Reference.zip locally only. No live Winter Strong access. 42 named entries, 126 PNGs: each referenced file exists and is readable; dimensions and SHA-256 are listed in reports/visual-v1/MEDIA_INVENTORY.csv. Start-frame visual inspection covered supported one-arm row, back squat, flat dumbbell bench press, and side plank; this is not a technique certification of any sequence.

| Current synthetic record | Available reference candidate | Mapping decision |
|---|---|---|
| synthetic-db-press | ex-15: DB bench / weighted vest push-up; flat DB bench image visible | Potential only. Synthetic record does not pin flat/incline/overhead; combined reference title needs separation. Hold for exact variant + rights/technique review. |
| demo-row | ex-00 supported one-arm row; ex-08 chest-supported row | Potential only. Current record lacks support/unilateral definition. No arbitrary choice. |
| demo-squat | ex-04 barbell back squat | Potential only. Barbell/rack matches equipment, but current generic squat is not an exact back-squat variant declaration. |
| demo-push | Combined ex-15; ex-33 scapular push-up plus | No verified standard-push-up match. Scapular push-up is a different movement; do not substitute. |
| demo-hold | ex-34 side plank | No match to generic timed hold; side plank must remain a distinct variant. |
| demo-mobility | ex-01 hip switches, ex-12 wall slides, ex-39 open book | Different movements; cannot bind a generic interval to one arbitrarily. |
| demo-cardio | No matching conditioning demonstration sequence established | Keep unavailable. |

No reference image has been integrated into the app. Possession of the ZIP is not a rights grant or a qualified technique review. No licensing, model/property releases, redistribution terms, or qualified approval record was established during this audit. Prior generated-image provenance alone would not certify technique or variant identity. The supplied source also groups alternative movements under some names; those must be resolved before binding media.

Integration path after review: identify exact canonical variant without rewriting historical records; document rights owner/permission and review scope/version; review all ordered positions and per-frame captions together; set media approval only for that exact variant/version; render thumbnail from the same sequence; verify offline inclusion and overlay state. The existing MediaFrame[] model supports ordered 3+ production frames with no fixed maximum. This milestone retains not-reviewed frames with unavailable URLs and concise pending captions.

Significant V1 visual deviation: the concepts depend on photography. The refined layout reserves appropriately sized thumbnail/sequence areas but deliberately does not fake photographic fidelity. There is no claim that this placeholder candidate is the final image-led visual design.
