> **Native verification follow-up 01 (17 October 2026):** current outcome is [NATIVE_FOLLOWUP_HANDOFF.md](NATIVE_FOLLOWUP_HANDOFF.md). Native verification remains blocked on this host. See [NATIVE_VERIFICATION_PLAN.md](NATIVE_VERIFICATION_PLAN.md) for the supported-host continuation. The original foundation record below is retained.

# Rollback and restore — synthetic local foundation only

Never run these instructions against a live Supabase project or real user database. Stop the local API before file-based backup/restore; PGlite persistent directories must not be shared by independent writers.

## Synthetic snapshot

```bash
npm run db:backup
```

The script refuses to invent an absent source directory and writes a compressed SQL-engine data-directory snapshot under `.data/backups/`. The tested source directory is `.data/pglite-v3` (override via `EA_SQL_DIR`). Snapshots may contain synthetic local records; no passwords/session cookies are exported by the app's consumer JSON/CSV endpoints.

Restore into a **new directory that does not exist**:

```bash
npm run db:restore -- .data/backups/SQL_LAB_BACKUP.tgz .data/restored-lab
```

Set `EA_SQL_DIR=.data/restored-lab` when restarting the API. The restore script refuses to overwrite an existing directory. Inspect restored counts, prescription/report separation, nulls and user-RLS behavior; automated integration tests restore a snapshot into an isolated engine and verify Alice/Bob isolation. The manual script proof and backup hash are in `reports/restore-proof.json`. This is not native PostgreSQL/GoTrue/Storage restoration or a production RPO/RTO claim.

## Rebuild/reset and migration

The application migration and test Auth bootstrap reconstruct a **new empty synthetic SQL lab** on first start. To reset tests/demo without losing an existing lab, stop the API and choose a new unused `EA_SQL_DIR`; retain the old directory for rollback. Do not overwrite/downgrade existing data to make migration tests pass. The SQL integration suite independently starts an empty in-memory engine and applies the actual migration/fixtures. It does not mutate a real account.

There is one application schema baseline for this foundation. Future schema changes require ordered additive migrations, version compatibility, restoration tests and an explicit destructive-change review. This foundation has not proven upgrade migrations between production releases. Roll back code using the delivered source tag/snapshot only after confirming schema compatibility; preserve newer records, never blindly reset a database.

## Native verification blocker

The standalone native PostgreSQL starter is supplied for diagnostic reproduction on supported non-root hosts; it was blocked here by the UID namespace. It never enables automatic system-user creation. Full Supabase CLI/Docker, real JWT/Auth propagation, Storage object backups and credential/recovery restoration require a supported local environment and an approved follow-up verification task. No hosted fallback or costs were incurred.
