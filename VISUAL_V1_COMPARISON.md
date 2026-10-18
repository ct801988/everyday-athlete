# Visual refinement — V1 comparison and review gate
Baseline/rollback: 370f555f1a075e54ee604277bd8ef31cc33d564d on ea/workout-session-m1 (PR #2). Refinement: ea/m1-visual-refinement, based on that exact candidate. Separate branch chosen so V1 cannot replace the candidate or its rollback point.

References inspected: all written Workout UX v0.9 visual specs/corrections; Workout_Concept_4_Illustrative.png (final refined board); a_clean_high_fidelity_product_ui_ux_mockup_image.png (single-scroll refined concept). Written rules override accidental mockup numbers/navigation/finish labels. No protected Nike/UA assets or designs copied.

| Area | Original candidate | V1 change | Significant remaining difference from concepts |
|---|---|---|---|
| Header | Large EA badge, uppercase name, reconstruction label | Compact wordmark, own SVG icon, Settings, quieter saved state | Synthetic preview notice retained; no invented phase/session number/time estimate |
| Exercise headers | Numbered squares, dense technical labels | Thumbnail-shaped labeled media slots; title, set count, equipment; recognizable info/collapse icons | NO approved photography. This is the largest fidelity gap and remains unresolved pending media review |
| Logging | Large rounded boxes and stacked guidance | Split Previous/Target strip, aligned rows, full-width Add Set, subtle green recorded/completed states | 44px touch controls are taller than drawn mockup rows; numeric targets absent because real prescriptions are unapproved |
| Navigation | Generic symbols and filled tiles | Consistent own SVG icons and blue selected state | Same four tabs and no extra routes |
| Timer | Box-shaped dock, bulky chrome | Pill-shaped dock, compact controls, expanded radial ring, blue/amber/green | Accessible touch targets retained; actual phone keyboard/lock/sound unverified |
| Reference overlay | Three small generic boxes and implementation paragraphs | Large horizontally scrollable ordered frames; concise per-frame labels; optional details | Photos/captions unavailable rather than invented form instruction |
| Library | Plain list/filter presentation | Compact media-led rows, category chips, search and equipment/body-area filters | Chips rather than complete category-tile catalog; no production media |
| Finish | Text-first choices | Factual summary grid with actual counts and explicit partial choices | No unapproved mood/coaching/volume/achievement metrics copied from artwork |

Assessment: layout, hierarchy, palette, controls and states are closer to the approved concepts. V1 is NOT a photographic or pixel-exact match and is NOT submitted as final visual approval. No arbitrary imagery was added to create that impression. All photo slots are labeled Media pending.

Native captures (390px wide; standard viewports 844px tall): 01 header + expanded card; 02 full continuous scroll; 03 completed/collapsed; 04 expanded timer; 05 running; 06 complete; 07 info overlay; 08 library/categories; 09 search; 10 partial summary. The collapsed Ready timer is visible in 01/03. Screenshot fixtures deliberately log synthetic values in an isolated test browser; they are not user achievements or production prescriptions. Before image is the original 390px v0.5.0 capture. 320/412 screenshots are produced by the regression suite.

V1 feedback requested: hierarchy/density, exercise-card proportions, timer, library/overlay and summary appearance. Final photo-led appearance cannot be judged until reviewed exact-variant imagery is available. STOP HERE for owner visual feedback. Optional polish, further approved adjustments and final release ZIP belong to V2. No merge, deploy, hostname/DNS configuration, external costs or Winter Strong changes.
