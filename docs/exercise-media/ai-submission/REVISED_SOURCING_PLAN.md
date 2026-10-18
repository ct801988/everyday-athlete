# Revised exercise-media sourcing plan — AI-first, no budget approved
2026-10-18. This owner instruction supersedes the commissioned/real-camera-photography-first recommendation. The earlier $1,500–$4,000 allowance was REJECTED, not approved. No photography, stock-license, supplier, paid-review or other external expense is authorized.

## Responsibilities and accepted direction
Standard ChatGPT: owner-led visual development, review and selection of original photorealistic AI-generated exercise sequences. ChatGPT Work: submission/manifest management, file and exact-variant mapping, image inspection/optimization, later approved React integration, thumbnails/overlay sequences, offline/fallback work, regression testing and GitHub checkpoints. Work will not independently generate or integrate production assets or expand the library.

Call the assets AI-generated instructional illustrations even if their visual style resembles photography. Do not label them camera photographs, medically validated, or automatically rights-cleared. Consistent subject, equipment, clothing, background, light and perspective are preferred; explicitly identify deliberate angle/variant/direction changes.

Preserve the existing bench B1–B3 and supported hip CAR H1–H8 storyboards as planning references, not fixed validated protocols. Bench starts with three positions. Hip CAR starts with eight positions for the previously proposed supported standing right-hip forward circle; the actual reviewed count/angles may change. Minimum production sequence: three approved frames, no fixed maximum. Reverse direction, another side, different support or equipment needs explicit mapping and review; never invent missing positions or automatically mirror images.

## Approval flow
1. Owner develops and selects candidate visuals in standard ChatGPT, then submits originals, captions and the records specified in IMAGE_SUBMISSION_SPEC.md.
2. Work checks file completeness, dimensions, sequence consistency, exact movement/variant, captions and provenance records; it does not promote a visual preference to qualified technique approval. Return missing or inconsistent frames for correction.
3. Owner-designated qualified technique reviewer evaluates every position and the whole movement arc. Applicable provider/tool commercial-use terms and reference-input permissions must be verified, with evidence recorded. No automatic rights grant or medical validation is inferred from AI generation. Review costs, if any, require separate explicit approval; unavailable review means the sequence stays held.
4. Owner approves the specific image/caption/thumbnail version for integration. Only then does Work implement the bounded pilot and its tests on a development branch. Keep source content separate from workout-history backups and generic synthetic records.
5. Before publication, complete all required technique, consistency, commercial-use/provenance and owner gates. Publication/hosting/merge approvals remain separate. If a movement cannot be illustrated reliably, hold it and propose real-video/photo review without acquiring or publishing anything.

## Technical boundary
The existing MediaFrame[] architecture supports variable-length ordered frames and per-frame captions. Keep one canonical sequence per exact variant, shared by Workout and Visuals. Retain compact V2 thumbnails and existing overlay geometry; do not redesign logging, timers, navigation or library. No workout schema/history/migration change is proposed for this sourcing revision.

Future approved integration still needs the resolver/approval gate, actual image rendering, accessible swipe/previous/next behavior, deterministic approved-media offline manifest and unavailable fallbacks described in the previous integration plan. Production image bytes never enter workout JSON exports. Previous source inventory stays reference-only; the Winter Strong ZIP does not establish image reuse or reference-input permissions.

## Current checkpoint
Documentation/submission templates only: no images generated, optimized, imported or integrated, no application changes or new application tests. Existing V2 source and test evidence remain unchanged (last verified 176 pass / 0 fail / 3 inherited skips, historical). Storyboards are preserved. STOP after delivering this plan and submission specification; await owner-supplied candidate assets and explicit next implementation instructions. No spending, supplier contact, merge/deployment/publication, hosting change, live Winter Strong access or M2.
