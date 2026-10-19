# V2.1 — implementation in progress

Owner authorization: upload Pasted text(5).txt, 2026-10-19. Bounded reliability/usability milestone. No merge, publication, live-site changes, publisher changes, costs or Winter Strong access.

Branch ea/v2-1-reliability-usability, base 5c9e0f8b1b8882705a024e0a08fc12275f35bf21; deployed comparison/rollback 89d087e5746eb36b5763b8356e2204de864e7622. Base differs from deployed code only in saved documentation/evidence. Preserve source draft PRs #1–#5.

Source findings (not yet fixed/tested at this checkpoint):
- Global src/styles.css nav margin 18px 0 survives on fixed bottom-nav, producing an actual 18px scrolling gap.
- db.change already waits for IndexedDB transaction completion before React model update. Immediate click/reload can interrupt a queued uncommitted Pause; current UI has no durable lifecycle intent recovery. Also each individual queued write sets Saved even when later writes remain, and failures are swallowed before completion callbacks.
- Restore requires exportedRevision equal current revision; QA exported then finished (changed revision), so restore correctly rejects but error appears in page behind modal. Restore/rollback bypass mutation queue; no explicit success/no-change status.

Next: focused baseline reproductions, safe small lifecycle intent journal without changing workout schema, honest queue/save state and serialized restore UI. Then approved timer/stopwatch/navigation/group/summary changes, tests and package. Stop if significant migration risks appear. No tests claimed at this initial checkpoint. Do not deploy this branch.
