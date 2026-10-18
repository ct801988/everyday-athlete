# Review candidate: clearer iPhone workout screen and compact rest timer

The approved bounded milestone is complete as v0.4.0-candidate. **It has not been deployed. Your existing Cloudflare preview and its workout data have not been changed.**

The screen uses a calmer hierarchy inspired by the supplied Winter Strong V5.1 reference, with exercise cards, clear Weight/Reps controls, explicit Done/corrections, saved-set progress and bottom navigation. All workout and media content remains synthetic.

The floating timer uses manual Start and immediate X/Stop & Reset, no Pause/Resume, the approved duration controls and separate locally saved preference. Default is 2:00 and Silent. Optional Short beep is a single sound; interrupted/restored expiry is visual-only. Prescribed rest remains unknown because no program rest content is approved. No timer action records a workout set.

Existing local history, scheduling, no-login/offline operation, backups and password protection are preserved by the implementation and exercised tests. Migration retains the pre-upgrade dataset and offers an old-format backup export. Older code cannot read the new format directly, so rollback instructions include compatible data.

Actual results: production/protected builds, typecheck and lint passed; 208 tests passed, 0 failed and 14 skipped; 4 additional artifact checks passed. Physical iPhone/Android and native Supabase gaps are explicit. Screenshot simulations are not real-device certification. See TEST_RESULTS and KNOWN_ISSUES_AND_APPROVALS.

Open REVIEW.html in the ZIP for screenshots, then review REQUIREMENTS_AND_UX, MILESTONE_HANDOFF and ROLLBACK_AND_RECOVERY. The package includes source, lockfile, test evidence, candidate bytes and complete local Git history. No user credentials or workout data are included.

Next approval: accept this candidate or request revisions before a separately authorized replacement of the owner-only preview. No next assignment has started.
