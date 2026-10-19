> SOURCING SUPERSEDED 2026-10-18: preferred first approach is owner-led photorealistic AI-generated instructional illustrations. The commissioned-photography budget was rejected; no budget is approved. See docs/exercise-media/ai-submission/REVISED_SOURCING_PLAN.md and IMAGE_SUBMISSION_SPEC.md. Preserve the technical architecture and storyboards below as planning references; do not treat the old sourcing recommendation as authorization.

# Exercise Media Integration Plan — approval required
2026-10-18. Planning/documentation only. Visual V2 is the owner-approved layout and functional UI baseline. Preserve source checkpoint 1901bcccabdb8ce8cae414d5ab862c15608aec5b (application source d908122a9890b19a86494b2c09a7f308f1828059), branch ea/visual-v2-exercise-cards / draft PR #4. No application changes, production image imports, generation, purchases or deployment in this assignment.

## 1. What is actually available
The supplied WinterStrong_V5_1_Final_Reference.zip was read locally; the live Winter Strong repository was not accessed. Its library.js indexes 42 named entries / 126 PNGs, exactly three per entry. ZIP CRC and decoding of all 126 passed; all 126 SHA-256 hashes match the prior V1 inventory. ASSET_INVENTORY.csv provides each path, order, source caption, dimensions and hash. REFERENCE_MAPPING.csv provides all 42 entry-level observations, ambiguity/mismatch flags and approval status.

Inspected the 42 start-frame previews and the full barbell-bench, side-plank and 90/90 sequences. This is a content triage, not qualified technique certification of 126 frames. Files are photographic-looking; verified camera-photo provenance is not supplied. Rights to use/modify/redistribute in EA, attribution obligations and applicable releases remain unverified for ALL entries. Zero assets are production-approved. Presence in the ZIP is not a license or proof of accuracy.

Images range from 305–499px wide and 254–503px high. Many are undersized for sharp large mobile demonstrations; several include clipped/mixed panels. Request high-resolution originals or properly licensed replacement photography rather than treating upscaling as new detail.

## 2. Mapping decisions and missing materials
| Source | Observed mapping / disposition |
|---|---|
| ex-05 Barbell bench press | Three inspected frames depict a flat barbell-bench sequence; reasonable simple-pilot candidate, held for provenance, technique, caption and owner approval. |
| ex-15 DB bench / weighted vest push-up | Preview depicts flat DB bench; combined title must be split. It cannot approve the push-up alternative. |
| ex-00 / ex-08 row entries | Supported/unilateral versus chest-supported variants need separate exact bindings; current generic demo-row cannot choose one automatically. |
| ex-04 Barbell back squat | Preview shows front-held bar placement. Do not map to back squat. |
| ex-10 / ex-11 | Previews show DB overhead pressing, inconsistent with their chin-up / close-grip-triceps labels. Hold. |
| ex-14 / ex-26 / ex-27 / ex-29 | Bench-press, wall-slide or standing previews conflict with the indexed split-squat, hanging-raise, incline-press or lying-extension labels. Hold. |
| ex-34 Side plank | Full sequence switches forearm → hand → forearm support. Unsuitable as one consistent side-plank variant without replacement/review. |
| ex-38 Suitcase carry | Preview shows loads in both hands; do not substitute a bilateral carry for unilateral suitcase carry. |
| ex-01 90/90 hip switches | Inspected three-frame seated sequence; not a hip CAR. Cannot fill the CAR gap. |
| Hip CAR | No named/matched sequence found. Needs a new exact-variant, reviewed photographic sequence and captions. |

Other entries remain candidates or ambiguous, not approved mappings; see the complete CSV. Source equipment/category fields and captions are often generic and must not be imported blindly. Do not import source swaps, training advice or programs.

Current M1 exercise IDs are generic synthetic records (press, row, squat, push, timed hold, mobility, conditioning). None is automatically approved for a reference image. Pin exact new media variant IDs only after owner review, retaining historical exercise identities and prescription/performed records. Generic historical exercises keep placeholders when no exact match exists. Conditioning and generic mobility/hold records currently have no verified exact photo match.

## 3. Reusable sequence structure
Reuse the existing canonical MediaFrame[] architecture: stable frame ID, order, URL, concise caption and approval state; no maximum array length. Add a versioned media manifest alongside exercise content, not a workout-history migration. Proposed fields:
- sequence ID/version, exact exercise+variant ID, equipment, body-area/type/category tags, side/direction where applicable;
- explicit thumbnailFrameId / reviewed crop; thumbnail and full demonstration reference the same approved sequence;
- ordered frames: stable ID/order, photo asset URL, dimensions/hash, movement-stage label, one short caption and useful alt text;
- per-asset provenance/license reference, attribution/release requirements, rights clearance and whole-sequence technique/caption review;
- owner approval of an immutable sequence version/hash set. Changed images/captions/variant invalidate approval until re-reviewed.

Production validation requires at least three reviewed photographs, unique ordered IDs, complete captions, exact variant/equipment consistency and rights/technique/owner approval. There is NO fixed maximum. Reviewer sets the necessary positions and adds frames wherever instructional value requires them. Keep an optional future educational/anatomy extension separate; no anatomy-library implementation now. Illustrations never replace the main photos.

## 4. Small proposed pilot, after plan approval
Two exercises only:
1. Flat barbell bench press: 3-frame sequence prototype, using ex-05 only if rights/provenance and all-frame technique review clear; otherwise obtain approved real photographs. Preview labels: setup, reviewed movement position, completion. These labels are NOT yet instructional captions.
2. A precisely specified supported hip CAR: start with an 8-slot storyboard to prove variable length, then let the technique reviewer choose the actual necessary count and views. No existing reference sequence qualifies. Direction/side and all important positions must be defined before photography. The draft manifest uses neutral phase labels, not unreviewed exercise instructions.

PILOT_MANIFEST_PROPOSAL.json demonstrates 3 versus 8 ordered caption slots with null URLs and unapproved status. It is a proposal, not runtime content. Production captions will be brief actionable language, typically one short sentence per photo, approved together with the image. Three images is a floor, not a standard forced on every movement.

The pilot may use isolated review/test fixtures for workout-card previews and the Visuals overlay. It must not add a real program/prescription, rewrite existing workouts or bind barbell-bench media to a dumbbell-press record. No generated or imported production images before approval.

## 5. Bounded integration once approved assets exist
- Preserve V2 card geometry: compact thumbnail only. No full-width photos inside logging cards.
- Existing overlay currently always renders placeholders, even though frame URLs/review fields exist. Implement a shared approved-media resolver and real image rendering; do not assume dropping files into a folder enables imagery.
- Overlay: large uncropped demonstration image, swipe/scroll-snap sequence, position indicator, short caption; accessible previous/next controls and optional details. Close restores exact scroll, focus, drafts, completed states and timer/session state.
- Visuals: same canonical sequence/resolver, existing six categories (Full Body, Lower Body, Upper Body, Core, Mobility & Flexibility, Cardio & Conditioning), search/equipment filters; add a simple exercise-type metadata filter only within approved pilot scope. No duplicated media per program.
- Only approved versioned same-origin photo assets enter build/offline manifests. Cache/backup storage remain separate; workout JSON references stable exercise/media IDs, not embedded base64 photos. Plan actual byte budgets and quota/failure fallback; do not impose an arbitrary frame-count maximum.
- Unapproved/missing/withdrawn media stays clearly unavailable; do not show it as instruction. Asset load failures show a clear fallback without affecting logging.

## 6. Validation and approvals
Before an asset can be instructional: identify copyright/source and permission terms (including redistribution/attribution and applicable releases), verify genuine photo provenance, exact exercise/equipment/variation, all positions/range, image-caption accuracy and whole-sequence technique review. Owner approves final images/captions. These are evidence gates; no claim that this plan establishes legal clearance or technique safety.

Pilot tests: 3/8/>8 frame support; minimum-three production rule; ordering/caption/thumbnail consistency; approval/withdrawal/mismatch/missing-file fail-closed behavior; keyboard/screen-reader/switch controls; alt text and contrast; 320/390/412 layouts; exact overlay state/scroll restoration; offline first-load/reopen/cache update/failure; no media payload in workout backups; full M1/V2 logging, lifecycle, units/precision, supersets, migration, recovery, timers and backup regression. Capture 390px workout, overlay and Visuals pilot screenshots for owner review. Physical iPhone acceptance remains separate and unverified.

Approval sequence: (A) approve this plan and two exact pilot variants; (B) supply/authorize a bounded photo source with rights/provenance evidence plus technique/caption review; (C) approve pilot assets/captions before enabling instructional rendering; (D) review implemented pilot screenshots/tests before expanding. No bulk generation, purchase or full library import is authorized. Any paid acquisition requires separate explicit approval.

## Current evidence and stopping point
This task reran archive CRC, all-image decoding, inventory/hash checks and inspected source/preview images. Application tests were NOT rerun for this documentation-only plan; previous V2 verification remains 176 passed / 0 failed / 3 skipped, historical and unchanged. No new claims of device testing or deployment.

STOP for owner plan approval. Keep all PRs draft; preserve V2 and rollback history. No main merge, deployment/publication, hostname/hosting changes, costs, live Winter Strong access, M2, adaptation, nutrition, real prescriptions or complete anatomy/media library.
