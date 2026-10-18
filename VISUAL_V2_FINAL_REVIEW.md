> Superseded formatting note: the owner has approved the V2 layout/unit baseline. Converted display now uses one decimal, with exact focused editing and stored precision preserved. See VISUAL_V2_ROUNDING_CHECKPOINT.md for the authoritative current source, 176/0/3 verification and approval stopping point. The three-decimal examples below describe the preserved pre-correction candidate.

# Visual V2 final candidate — owner visual approval pending

2026-10-18. Candidate only; no merge, hosting change, public release or deployment.

## Saved source and review
- Repository: https://github.com/ct801988/everyday-athlete
- Branch: ea/visual-v2-exercise-cards; draft PR #4: https://github.com/ct801988/everyday-athlete/pull/4
- Tested application source: 1fcde01483683deb8ac07c1711933cc4f83930ec. Later evidence/documentation commits do not change application behavior.
- Initial V2 rollback: 1a819b1dc29f4c0f661acdb74be793245564171d.
- Visual V1 rollback: 27ce80a51f916d086356574635b1f16ab63e03c2 (source/evidence 6b3feef151ac7b48f76c3e574203be0902faa623), PR #3 retained draft.
- M1 rollback: 370f555f1a075e54ee604277bd8ef31cc33d564d, PR #2 retained draft. No main or Winter Strong changes.

## Bounded refinements
Compact left-thumbnail cards and continuous inline logging are retained. Ordinary Done buttons now use restrained navy outlines; completed-set controls show a decorative check and explicit Undo, with blue feedback. Touch targets remain at least 44px for set controls. Last Time/Today's Target uses slimmer readable spacing. Beginner-facing load descriptions include Per dumbbell, Total weight including bar, Single weight, Machine weight, Bodyweight, Added to bodyweight and Assistance weight; internal enum names are not shown.

The single timer retains its countdown, manual Start, X reset, five-second adjustments, presets, silent/brief-beep preference and green completion. It is hidden while a set input has focus, without stopping/resetting its state, and returns after entry ends. This deliberately removes the floating control during keyboard entry. Navigation remains four tabs; Settings stays in the gear. No duplicated timer/navigation nodes were found while scrolling.

## Weight-unit behavior and data contract
Inspection found existing typed lb/kg actual loads and an existing preferences.unit field, but no conversion utility or Settings selector. Reused those contracts and the lb initial fallback; existing saved preferences are respected. No location inference or login was added. Any user can select kg or lb in Settings.

Weight (lb) or Weight (kg) labels the entry column. Entries retain their entered unit; actuals keep explicit value/unit/basis. Last Time, structured prescribed load details, recorded summaries and Progress use the display preference. Bodyweight/no-load, assistance and added bodyweight remain distinct; reps and seconds are not converted.

Conversion uses 1 lb = 0.45359237 kg. Converted views round to 0.001; stored values are never rounded by display. Original-unit values retain their stored precision. Rep-only corrections do not replace an exact stored load with its rounded display. Returning to the original unit restores the exact entry. A preference change only updates preferences/audit/revision, not sessions or prescription/actual records; browser tests compare whole persisted sessions before/after.

Small additive contract extension: optional draft.weightUnit, within schemaVersion 3. This is not a new database or destructive migration. It prevents an unconfirmed kg draft from being interpreted as lb after a preference change. Old v3 drafts without the tag still load; native identity units, matching original actuals, or matching retained legacy draft evidence resolve their units. Fresh legacy migration records each source draft unit. Original actuals, legacy payload/database, IDs, source history and immutable prescription meaning are preserved.

Compatibility: this candidate reads existing v1/v2 legacy and v3 M1 backups and round-trips new data accurately. Older application versions with strict draft validators may reject NEW tagged-draft backups. Do not roll back a browser containing new-format drafts to an older reader. Keep pre-update and current exports; never delete data or strip tags/relabel numbers to force an import. A data-compatible rollback needs a reviewed forward compatibility fix, not an unsafe downgrade.

## Executed final verification
| Check | Passed | Failed | Skipped |
|---|---:|---:|---:|
| Unit (includes 19 new weight-unit cases) | 136 | 0 | 0 |
| Integration | 21 | 0 | 3 |
| M1/V2 browser: migration, lifecycle, logs, offline, backup, responsive accessibility, units, timer | 17 | 0 | 0 |
| Prepared Pages subpath/offline browser | 1 | 0 | 0 |
| Total distinct final automated cases | 175 | 0 | 3 |

Typecheck, lint, production build and prepared Pages build: PASS. Three integration skips are inherited native Supabase/database-stack checks, not newly skipped unit functionality. Do not count repeated attempts or historical V1 results again.

Units covered: selection in Settings, exact conversion and display rounding, original precision, kg actuals against lb prescriptions, repeated preference changes, rep-only correction, cleared-zero validation, comparable completed history across unit systems, suggested load displays, bodyweight/none/assisted/added loads, seconds independent of mass, exact backup round-trip, old v3 drafts, mixed-unit legacy migration and malformed optional legacy evidence.

Browser viewport checks: 320, 390, 412px; no horizontal page overflow and axe WCAG A/AA checks. Real UI tests confirm entire persisted sessions unchanged after selecting units, prior/target/Progress conversions, exact lb/kg stored loads after reload and backup parse, unique timer/nav and focused-input timer removal. Existing offline and migration/interruption/restore tests remain enabled.

Initial-run issues were resolved: decorative check text affected Undo's accessible name (now an aria-hidden SVG); two old assertions expected per-row units (updated to unit-column design); a new test used exact getByLabel on a nested select (changed to its accessible combobox role/name). One selector-timeout run was interrupted after diagnosis. A visibility-based focus guard produced incomplete timer text paint after reappearance in captured Chromium; using display:none during input focus corrected the screenshots. Initial logs are retained separately and are not the final totals.

Evidence: reports/visual-v2-final, reports/visual-v2 (updated continuous/completion/timed views), reports/m1 (current responsive captures and Pages JSON). Browser runs are local desktop Chromium, not GitHub Actions or physical iPhone certification.

## Screenshots and comparison
Updated native 390x844 screenshots: reports/visual-v2-final/390-pounds.png and 390-kilograms.png. The kg example includes a recorded synthetic 25.123456789 lb load shown as 11.396 kg and comparable synthetic history of 20 kg. These are automated-test fixture values, never owner records or production prescription recommendations. 320/412 versions are included; continuous/collapsed/timed captures remain in reports/visual-v2.

Written V2 requirements control this pass. No approved V2 reference image was attached, so exact image/mockup fidelity is not claimed. Imagery remains clearly labeled non-instructional Media pending; no arbitrary or unreviewed photos were inserted. No numeric ranges or progression advice were fabricated. Structured example targets appear only inside synthetic test fixtures; the ordinary demo prescription has no suggested weights.

## Known limitations and safe rollback
- Owner final visual approval is pending. The production exercise photo library, rights/technique/variant review and real training content remain unapproved.
- Physical iPhone keyboard, safe area, lock/background/restart, sound and actual hosted SW updates/rollback are unverified. Browser focus/viewport tests cannot certify those device behaviors.
- Floating controls can pass over unfocused content during scrolling; focused fields hide the timer and the page has bottom scroll clearance. Do not claim a physical-device keyboard test.
- Existing one manual superset-group limit and backup byte/node caps remain. No onboarding, substitutions, new programs, nutrition, progression or M2.
- Host guard still blocks unapproved hosts and github.io. Prepared /fitness-pilot-preview/ build is local evidence only. Dedicated hostname/root-path publication still needs separate approval and engineering.
- Preserve JSON backups separately from source. Before an approved future update, export current browser records. Source rollback uses a normal revert/development branch, no force-push; never blindly downgrade a workspace carrying new tagged drafts. No source rollback is an authorization to publish.

## Resumption
STOP for final visual feedback. Fetch the branch/PR #4 and verify current HEAD plus this tested source. Read PROJECT_STATUS.md, this review and test evidence. Implement only owner-approved corrections; rerun impacted checks and replace the review package. Keep PR #4 draft. Merge, deployment, hostname, hosting, costs and publication each remain separately gated by owner approval.
