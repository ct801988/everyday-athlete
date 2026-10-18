# V1 verification
Fresh runs on refinement source: typecheck PASS, lint PASS, production build PASS; 117 unit PASS; 21 integration PASS / 3 inherited native Supabase SKIP; 11 M1 browser PASS; 1 Pages/offline PASS; 1 V1 capture/Visuals accessibility scenario PASS. Total executed cases: 151 PASS, 0 FAIL, 3 SKIP on the final runs (reruns not added).

Original migration, persistence, actual/draft, lifecycle, timer, offline, export/import/rollback and three-viewport accessibility checks remain in the M1 browser suite. 320/390/412 screenshots and no horizontal page overflow verified. Visuals has an additional axe check. Initial brighter blue contrast failed, then corrected and rerun. A prior origin-isolation test could inspect before initialization; the test now waits for the Begin control before inspecting storage. No storage behavior was changed to make tests pass.

The following files byte-match the rollback source: src/m1/model.ts, storage.ts, actions.ts, src/local/timer.ts, RestTimer.tsx, backup.ts and store.ts. App changes are presentation markup/copy only; draft fields, handlers, IDs and transitions are preserved. New category chips reuse the existing category filter state. Synthetic data used solely inside test contexts.

Desktop Chromium only. Physical iPhone software keyboard, safe area, sound, lock and process restart are not certified. V1 is awaiting visual feedback, not final V2 sign-off or a deployment candidate. Raw logs in reports/visual-v1; unchanged baseline evidence remains under reports/m1 except regenerated current M1 browser outputs.
