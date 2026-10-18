# Assignment 002 native verification: alternative execution plan

17 October 2026. Status: **blocked on this host; not executed**. This bounded follow-up is already authorized. A supported execution environment is the remaining dependency. No Assignment 003 work is authorized.

## Environment finding

`reports/native-followup/environment-probe.json` records this run's commands, exit codes and output. Docker/dockerd/Podman/Supabase CLI and local engine sockets are absent. All effective and bounding capabilities are zero. Only UID 0 is mapped. `unshare --user --map-root-user true` failed with Operation not permitted. The already installed PostgreSQL 18.4 binary executes, but `initdb` refuses root. No system users, daemon installation, root bypass or repeated privilege workarounds were attempted. Installing a CLI alone cannot supply these missing privileges.

The documented experimental native Supabase runtime also requires non-root PostgreSQL (or an existing usable non-root account). That prerequisite fails here. Its process isolation is weaker than containers, so the preferred alternative is a disposable local Linux VM with a working Docker Engine. Neither PGlite nor the synthetic cookies/claim shim verifies GoTrue, JWT signatures, Storage or native restoration.

## Required host and costs

Use an existing private Linux workstation or disposable Ubuntu 24.04 VM operated as an ordinary non-root user, with working Docker Engine/Compose, Node >=22.12, npm, Git, curl, Python 3, tar, and matching PostgreSQL client tools. Recommend 4 CPU cores, 16 GB RAM and 40 GB free disk as a planning allowance, not a measured minimum. Permit registry/image downloads. Use a host-only VM network, deny inbound connections from other machines, and check all published ports before adding fixtures. Do not attach a public IP, tunnel or public preview. Container ports may bind all interfaces by default; local URLs alone do not establish isolation.

Expected external service spend: **$0 using existing equipment and free Docker Engine**. No hosted Supabase account, email provider or GitHub remote is needed. Use the stack's local mail capture service for recovery emails. Paid hardware/VM rentals or licensed software purchases would require separate approval. Local passwords, signing secrets and server-only keys are generated on the target machine, kept out of source/reports; never paste them into chat. Browser code receives only the local URL and publishable/anon key.

## Preserve project and initialize a disposable verification worktree

The package includes `everyday-athlete-history.bundle` beside the source folder, preserving the original foundation commit and this follow-up history. With an existing repository, retain it and create a worktree; with only the package, restore the bundle as below. Commands below are **planned and unexecuted here**. Run them on the supported host. No `supabase login`, `link`, `db push`, Git remote push, or hosted provisioning is required.

```bash
# From the extracted ZIP's top directory, only if restoring the repository:
git clone everyday-athlete-history.bundle everyday-athlete-restored
cd everyday-athlete-restored
# This is a local-file clone; remove its local origin to retain a no-remote repo.
git remote remove origin
# On an existing repo, start here instead:
git status --short
git worktree add -b assignment-002-native-verification ../everyday-athlete-native HEAD
cd ../everyday-athlete-native
npm ci
node --version
npm --version
docker version
docker info
# CLI version observed in npm registry for this plan; pin and record on target.
npm install --save-dev --save-exact supabase@2.121.0
npx supabase --version
npx supabase init
```

`supabase/config.toml` is not delivered yet. `init` creates it in the new worktree, retaining the existing migrations. Review it before startup: unique project ID `everyday-athlete-002-native`, unused ports, local-only redirect allowlist, captured email only, no external Auth provider, no seed that invokes lab bootstrap. Retain exact CLI/image digests/config versions. Check that service exposure is confined to the private VM before continuing.

```bash
npx supabase start
npx supabase status
# This exposes only schema, not synthetic claim injection:
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
  -v ON_ERROR_STOP=1 -c "select version(); select to_regclass('public.sessions');"
```

CLI normally applies migrations on initial start. If `public.sessions` is missing on this **fresh disposable** instance, inspect migration discovery/CLI logs before proceeding. Do not reapply the non-idempotent baseline over existing tables. A controlled fallback on a verified empty public schema is `psql ... -v ON_ERROR_STOP=1 -f supabase/migrations/001_foundation.sql`. Do not run `scripts/lab-bootstrap.sql`, `Database.init()/seedRaw()` or `npm run db:native` against this stack. The lab seed inserts skeletal auth.users and is incompatible with real Auth provisioning.

## Native integration work still to implement

Keep WASM lab paths explicitly test-only. Add a separate native client/adapter using real Supabase Auth and user bearer JWTs through REST/RPC. Reuse domain logic, migrations, prototype and existing tests. Verify tokens through Auth/JWKS or the trusted Supabase gateway; decoding claims alone is insufficient. Never trust a body-supplied user ID or forward the synthetic cookie/claims setter. Privileged local fixture setup may use a server-only admin key, but authorization assertions must use Alice/Bob user tokens or anonymous requests, never a service-role client.

Create two fresh synthetic Auth users via the local admin API, with unique passwords; capture returned IDs and seed matching program/session fixtures with those IDs through an isolated server-only fixture utility. Label all content synthetic. Review actual native grants/default privileges, functions, ownership, RLS and exposed schemas: Supabase defaults may differ from the WASM lab. Add an additive migration for a **private test bucket**, such as `ea-verification-private`, with scoped owner-folder policies on storage.objects for SELECT/INSERT/UPDATE/DELETE, both USING and WITH CHECK as applicable. Cover overwrite/upsert and move/copy semantics. No final consumer file-storage feature is implied.

Implement native test harness and recovery callback before claiming the commands below exist. Suggested script names are **future work**, not delivered commands: `test:native`, `test:native:browser`, `native:fixtures`, `native:backup`, `native:restore`. Capture redacted HTTP status/response assertions and test counts; never log bearer tokens, passwords, reset URLs, signing keys or admin keys.

| ID | Native test / expected evidence | Current status |
|---|---|---|
| N01 | Real password login for A/B; wrong password and anonymous private access denied | Not run |
| N02 | Real JWT via gateway/REST/RPC; forged signature, changed sub/role, malformed and naturally expired token denied | Not run |
| N03 | Refresh produces valid access, invalid/reused/revoked refresh handled per configured policy; re-auth after expiry works | Not run |
| N04 | Recovery mail captured locally; allowlisted callback; change password; old password fails; expired/replayed recovery links fail; no external email | Not run |
| N05 | A/B private row reads, filtering, export and every write RPC isolated; spoofed owner and unauthorized direct write/publication denied | Not run |
| N06 | Same-token retry deduplicates; divergent replay, concurrent correction and stale revision conflict; no phantom performed records | Not run |
| N07 | Storage A/B upload/read/list/update/delete/upsert isolated; cross-folder forged ownership and anonymous requests denied | Not run |
| N08 | Signed URL is bounded bearer access: works until expiry then fails; public URL cannot bypass private bucket; cross-user signing denied | Not run |
| N09 | Native app drafts/timer/overlay survive login refresh/recovery path; logout/account switching never attaches A outbox to B | Not run |
| N10 | Native database backup restored to separate fresh same-version stack; counts/nulls/audit/receipts/policies and restored account login verified | Not run |
| N11 | Storage bytes restored separately, SHA-256 matches; metadata/object ownership and A/B authorization reverified after restore | Not run |
| N12 | Complete existing regression suites plus native browser/security suites; report failures, retries, skips and native adapter scope | Not run |

The three old native skipped placeholders remain three skipped tests, not twelve newly executed tests. N01–N12 specify required future coverage, not results. Use short supported Auth TTL and wait until real expiry in the native harness; do not forge an expired token and call it a valid issued-token expiry test. Revoking a refresh token need not instantly revoke an already-issued access JWT: record actual configured semantics instead of assuming immediate logout invalidation. Exercise recovery and refresh separately.

## Backup and native restoration procedure

Preserve the source stack. Stop test mutations, record versions/config, snapshot counts/critical rows/policy definitions, and create checksummed backups. Never reset the source to demonstrate recovery. Back up database and object bytes independently: a SQL dump does not contain Storage file bodies. Preserve Auth schema data/identities and document signing-secret handling/re-authentication policy. Do not restore WASM snapshots into native Postgres.

For a same-version local proof, use the source database container and its own matching PostgreSQL client. Resolve and verify the source container ID with `docker ps`; export its name as `EA_DB_CONTAINER`. `EA_BACKUP_DIR` must be a new private directory. These are planned command templates, not executed results:

```bash
umask 077
mkdir -p "$EA_BACKUP_DIR"
docker exec "$EA_DB_CONTAINER" pg_dump -U postgres -d postgres \
  --format=custom --no-owner --no-privileges > "$EA_BACKUP_DIR/database.dump"
sha256sum "$EA_BACKUP_DIR/database.dump" > "$EA_BACKUP_DIR/database.dump.sha256"
```

This raw full dump includes managed internals and **must not be blindly loaded over a bootstrapped Supabase schema**. On the target, inspect `pg_restore --list`, verify same versions/roles/extensions, and create a reviewed restore list: restore public application schema/functions/data/grants and Auth/Storage data into their initialized matching schemas, excluding managed schema recreation/migration histories that conflict. Capture dependencies and sequence state. SQL grants omitted by the export flags must be reinstated by the approved application migration and reviewed policies; their post-restore verification is mandatory. Use `pg_restore --exit-on-error --single-transaction --use-list=... --dbname=...` only against a verified new disposable target. Exact list and invocation are implementation deliverables to validate there, not claimed ready-to-run recovery automation. If managed Auth/Storage restore errors occur, stop, retain evidence and correct the plan instead of suppressing errors.

Create a second independently configured CLI project in another directory with a different project ID and nonconflicting ports (e.g. API55321, DB55322, Studio55323, mail55324). Start its same-version services with a blank application schema. Preserve both stacks. Export object bytes through privileged **local** Storage API into an owner/path/hash manifest, retain bucket settings and policies, then re-upload to the target without unintentionally duplicating already-restored metadata. Select and test a coherent metadata+bytes restore sequence; never manipulate a live Storage filesystem blindly. Verify N10/N11 before claiming native restoration passed. Retain encrypted/private raw backups locally, publish only redacted evidence and hashes.

Finish by rerunning `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:integration`, and `npm run test:browser`, then the implemented native suites. Retain individual reports and failure histories. `npx supabase stop` stops each disposable local stack without requesting volume deletion. No destructive cleanup command is authorized by this plan. Retain backups pending review.

## Exit and approval gate

Accept this follow-up only after real Auth/JWT/RLS/Storage and restoration results are reviewed; all missing native cases must remain explicit blockers. The authorization already covers a bounded local native adapter and verification: it does not require a new product-direction decision. Required owner action is to provide/select access to the supported isolated local machine if this sandbox remains the execution venue. Any paid host, public exposure, remote push, real users, destructive source operation or Assignment 003 requires separate approval.

## Official references checked 17 October 2026

- https://supabase.com/docs/guides/local-development/cli/getting-started
- https://supabase.com/docs/guides/local-development/docker-and-native-runtimes
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/self-hosting/restore-from-platform
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/reference/javascript/auth-refreshsession

These support runtime prerequisites, RLS-based object access and recovery/refresh APIs. The isolated worktree, resource allowance, test matrix and restore-list workflow are engineering proposals, not vendor-verified commands for this particular application.
