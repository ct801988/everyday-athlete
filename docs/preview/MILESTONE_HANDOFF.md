# Milestone handoff — private iPhone preview preparation v0.3.1

## 1. Completed against approved scope

N01 complete: preserved baseline/history and product decisions, selected a single gated Free Worker/Static Assets topology, verified current provider documentation, documented cost/security/device limits. N02 complete for the available local environment: Worker-first access wrapper, allowlist, fail-closed secret/hostname handling, HTTPS/security headers, protected generated manifest/icons/SW, deterministic reviewed payload, native-runtime and browser tests. N03 approval packet prepared with account instructions, exact method/cost, future deployment/rollback procedure and owner device checklist. N04 is not started. No consumer MVP expansion or approved training content integration occurred.

## 2. Actual build/test outcomes

Final build, typecheck, lint and local Wrangler bundle succeeded. Tests: 143 passed, 0 failed, 9 skipped. Earlier failures and their corrections are retained and explained in TEST_RESULTS.md; skipped security/device properties are not accepted as passed. Native cloud account verification remains deferred. No hosted services were contacted for deployment or provisioning.

## 3. Files created or modified

Added preview/worker.ts and generated asset-paths.ts; wrangler.preview.jsonc; scripts/build-preview.mjs, probe-preview.mjs and test-preview.mjs; tests/unit/preview.test.ts; deployment-candidate/ reviewed bundled Worker/public assets/config/hashes; DEPLOYMENT_APPROVAL_PACKET.md; docs/preview/ security, results, device checklist and this handoff; reports/preview-preparation/ logs and JSON evidence. Modified README, package/lockfile, tsconfig, eslint ignores and .gitignore for preview-only tooling. Updated source manifest. The complete Git bundle preserves history. Exact changed paths are recorded in reports/preview-preparation/changed-files.txt.

## 4. Outstanding bugs, risks and decisions

No known failing local automated tests. Not verified: live CDN/alias protection, public TLS/HTTP behavior, actual Free-plan CPU/quota/account configuration, physical Safari/Home Screen/auth/storage/download/restore/update behavior and physical accessibility. Shared Basic access has no per-user identity, reliable logout, built-in attempt throttling or offline revocation. The approved offline shell intentionally remains usable after password changes. Device data/backups are not encrypted by this work. A hosted regression or iPhone-specific defect may require a bounded follow-up. Synthetic workouts are unsuitable for approved personal/family training evaluation. Native Supabase verification remains required before future cloud accounts.

## 5. Recommended next assignment

A separately approved N04: establish secure owner-account operator authorization, verify Workers Free settings, deploy this exact gated candidate initially blocked, enable the secret/exact host, prove live asset/cache/alias security, then conduct owner-only iPhone checks. Keep scope to software demonstration; no family users or new programs. Do not proceed automatically.

## 6. Actions requiring owner approval

Explicit N04 distribution/provisioning authorization; selection of account/subdomain and secure operator-access route; acceptance that password rotation cannot revoke existing offline copies; review of live security/cost checks and physical iPhone results before preview acceptance. Any spending, hosted workout storage, account login, new programs, wider testers or Assignment 004 requires separate approval.
