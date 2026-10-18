# V2 converted-weight display correction — approval checkpoint
2026-10-18. Owner approved the V2 card structure, controls, coaching layout and lb/kg functionality as the established baseline. Only the converted-display formatting correction remains for approval. Photography/full Visuals media is a separate future milestone.

Branch: ea/visual-v2-exercise-cards, draft PR #4. Verified application source: d908122a9890b19a86494b2c09a7f308f1828059. Before-correction rollback: 8b4a50405e107d2f95021e2dd5229a8d6f5111da. Following documentation/evidence commits do not alter application behavior.

## Exact change and editing safeguard
Converted idle values use one decimal place, with unnecessary trailing zeroes removed: 20 kg → 44.1 lb, 25.123456789 lb → 11.4 kg, 10 kg → 22 lb. Original-unit values retain their stored precision. Conversion math, stored measurements, load kinds/basis, draft unit tags, schema, migration and backup format are unchanged.

Focused converted inputs reveal full converted precision for deliberate editing. Focus/blur alone changes only React presentation state and never writes a rounded value or unit. An unchanged input event is ignored. Rep-only corrections reuse the original exact weight/unit, not the rounded idle display. Deliberately changing the weight still records the explicit new entry under its selected unit. No other visual changes were made. Settings accuracy text now describes 0.1 display rounding.

## Fresh executed verification
- Typecheck, lint, production build: PASS.
- Unit: 137 PASS / 0 FAIL / 0 SKIP.
- Integration: 21 PASS / 0 FAIL / 3 inherited native database-stack SKIP.
- M1/V2 browser: 17 PASS / 0 FAIL / 0 SKIP, including 320/390/412, axe accessibility, lifecycle/logging, migration, recovery, offline, backup, unit selection/conversion and precise editing.
- Prepared Pages/offline browser/build: 1 PASS / 0 FAIL / 0 SKIP, local only.
- Total distinct final cases: 176 PASS / 0 FAIL / 3 SKIP. Repeated/historical runs are not added.
- No new failures in this correction. Browser fixtures verify focus reveals full precision, blur restores 11.4, reps-only Save edit preserves exact original load object, reload/unit toggle restore native precision, and backup roundtrip is exact. Whole historical sessions remain unchanged by unit selection. No silent numeric rounding was added to record actions.
- Raw logs, JSON results and fresh native 320/390/412 pound/kg screenshots: reports/visual-v2-rounding.

The previous final-candidate ZIP is preserved as the pre-correction checkpoint; its three-decimal screenshots/settings text are superseded by this source and evidence. Existing V2 draft-tag rollback compatibility notes still apply: older strict readers may reject new tagged drafts. Preserve browser exports; never force an unsafe data downgrade.

## Safe resumption
STOP for owner approval of this small correction. Card layout is established: do not independently redesign it or begin media work. Inspect current branch HEAD, PR #4 and PROJECT_STATUS.md before another change. Physical iPhone, hosting/hostname approval, merge and publication remain pending. No deployment, costs, main changes or Winter Strong access/modification.
