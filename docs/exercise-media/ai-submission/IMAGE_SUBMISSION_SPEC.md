# Image submission specification — two-exercise AI pilot
Use this specification when sending selected assets from standard ChatGPT. Images are candidates for instructional use until the required reviews clear. Sending a ZIP does not itself authorize publication.

## 1. Exact IDs and filenames
These are proposed new media-content IDs, NOT aliases automatically attached to existing generic M1 exercises. Keep them unchanged unless an intentional variant change is agreed.

| Movement | exerciseId | variantId | sequence version | Filenames under images/ |
|---|---|---|---|---|
| Flat Barbell Bench Press | flat-barbell-bench-press | flat-bench-bilateral | v001 | flat-barbell-bench-press__flat-bench-bilateral__v001__001.png through __003.png |
| Supported Hip CAR | supported-hip-car | standing-right-forward | v001 | supported-hip-car__standing-right-forward__v001__001.png through __008.png initially |

For JPEG use .jpg; for WebP use .webp and record the actual filename. Use three-digit ordering, lowercase ASCII and hyphens; no spaces. Additional positions continue __009, __010, etc. There is NO frame-count maximum. Keep the right-hip/forward/support definition explicit in manifest metadata; do not silently change the side, direction or support. An alternate version/variant needs new identifiers/versioning, not overwriting the approved sequence. A completed sequence must have at least three approved frames.

Each frame ID is <exerciseId>__<variantId>__v001__f001 (then f002, etc.). Order is a separate integer. Renaming/reordering in the manifest must not silently change the depicted movement. Version the whole reviewed sequence when any photo/caption/thumbnail selection changes; record the changed frame and do not reuse old approvals.

## 2. Image quality and delivery targets
- Preferred master: landscape 4:3, about 2048×1536 pixels or larger native detail. If the generator supplies 1536×1024 (3:2) or another ratio, send that original and identify it; Work will assess/pad for display rather than stretch it or crop essential joints/equipment. Do not upscale a small image and describe it as newly detailed.
- Accepted static masters: PNG, JPEG (.jpg) or WebP. Send individual frames, not a collage, screenshot of the chat, animated GIF, video or SVG anatomy illustration. Keep original generator exports and provenance. No baked-in captions, frame numbers, arrows or labels; captions remain separate accessible text.
- Show the whole relevant movement: head/trunk/pelvis, working limbs, support, bench/bar/rack as needed. Keep subject, clothing, grip, apparatus and environment consistent. A different view must be declared; never fix anatomy, side or missing phases by automatic mirroring/generative interpolation.
- Work's future optimized derivatives: typically 1200–1600px wide, WebP, roughly 150–350KB per frame (up to about 500KB if clarity requires it); selected compact thumbnail 240–320px square, roughly 25–60KB. These are planning/quality targets, not requirements to damage an image to meet a byte cap. Owner may submit larger originals; Work handles derivatives after approval.
- Initial 11-frame pilot target: roughly 2–5MB of optimized display media, excluding archived masters; actual budget is confirmed after inspection. More reviewed frames remain supported. Split a large master submission into numbered ZIP parts if necessary instead of deleting needed phases. Originals and optimized versions stay traceable by hash/version.

## 3. Ordering, captions and thumbnail
Use submission-manifest.example.json as the template. Supply one concise plain-English caption per frame, normally one short sentence (aim 5–12 words, not a hard limit), and a brief alt-text description of what the image actually depicts. Preserve the B1–B3/H1–H8 planning order unless you explicitly identify a change and why. Draft storyboard captions remain unapproved until checked against the actual selected images.

Explicitly select thumbnailFrameId: propose bench frame f001 (top/setup) and hip frame f004 (lateral position) for review, or name your preferred recognizable frame. Work derives one safe thumbnail crop from that frame after approval; Workout and Visuals use the same canonical source. Do not supply an unrelated glamour image. Extra angles count as explicit ordered frames with their own captions, not hidden replacements.

## 4. Approval and provenance records
For every sequence/version, provide or mark pending:
- assetKind: ai-generated-instructional-illustration; generation provider/tool, model/version if available, generation date, original export filenames/asset IDs if available, prompt and edit/revision history;
- reference inputs: list any supplied source images and the basis for permission to use them; record none if no external image reference was used. Reference possession alone (including the Winter Strong ZIP) is not verified permission;
- applicable commercial-use terms URL, date/version, relevant evidence and review status; include known restrictions. Do not invent missing generation metadata, terms or approval. Work/owner verifies the actual tool/account/input terms before publication; photorealism does not establish copyright exclusivity or rights clearance;
- exact exercise/equipment/side/direction/support and consistency review; per-frame caption review and whole-sequence range/phase coverage;
- owner visual selection: date and reference to an explicit selection of these exact files/captions/thumbnail; qualified technique review: reviewer, relevant qualifications, date, scope, findings and approval/version. A ChatGPT visual selection is not qualified technique certification;
- owner integration authorization and later publication authorization are separate statuses. productionApproved stays false while any gate is missing. Private agreements/account details are not put in the public repository; use evidence IDs and private delivery for sensitive documents.

SHA-256 and actual dimensions can be filled by Work after receipt; null in the sample means unknown, not approved. Store release/consent evidence if identifiable real people or third-party likeness/reference inputs require it under applicable terms; do not falsely claim a synthetic character has a real-model release. No paid rights review or other services are authorized by this specification.

## 5. Packaging
Send one ZIP named EA_media-pilot_submission_v001.zip containing:

- manifest.json — completed template with exact filenames, captions, thumbnail choice and honest statuses;
- images/ — the individually named original files above;
- provenance/PROVENANCE.md — generation/edit record and reference-input list, with non-sensitive evidence references;
- approvals/REVIEW_STATUS.md — owner visual selections and current technique/terms review status (pending is valid);
- README.md — source tool, sequence/variant/count, intended changes from storyboard, missing items and any restrictions.

Do not include workout backups, node_modules, application source, credentials or unrelated images. Keep raw prompts/metadata privately if sensitive and provide appropriate evidence references. No actual images accompany this template. The package can be received for review while some approvals are pending, but must not render as approved instruction or be publicly redistributed on that basis.

## 6. Work acceptance checks after receipt
Verify hashes/dimensions/decode, manifest/file/order completeness and no duplicates/missing phases; exact variant/equipment/side/support; image-caption/alt/thumbnail agreement; consistency, provenance/terms and qualified review. Flag uncertain anatomy/occluded joints or unreliable CAR phases. Hold failed/incomplete sequences and ask for corrected media or real-video/photo review. Do not bind to generic synthetic exercise IDs or rewrite history.

After explicit integration approval, optimize from originals and test shared thumbnails, 3/8/>8 sequences, accessible swipe/buttons, state/scroll restoration, offline scoped caches/fallbacks, no embedded photos in workout backups, and all relevant M1/V2 regressions. V2 layout and data behavior remain established.
