# SQL application boundary

`migrations/001_foundation.sql` is the application schema/RLS/grants/RPC baseline. It expects Supabase-provided `auth.users`, `auth.uid()`, `authenticated` and `anon`. The isolated lab's separate `scripts/lab-bootstrap.sql` supplies only test roles and a trusted-server-injected claim context. It is not Supabase Auth/JWT and must not be installed as a production replacement.

Actual queries, RLS, permissions, foreign keys, transactional rollback, receipts, correction audit and snapshot restoration ran on the PostgreSQL WASM engine. Native Supabase compatibility is a design target, not a verified claim. No hosted project was provisioned. Review every security-definer function's ownership checks, fixed search_path and revoked default execution grants on the actual stack before any external use.
