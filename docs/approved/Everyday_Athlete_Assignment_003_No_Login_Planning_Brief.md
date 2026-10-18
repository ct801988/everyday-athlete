# Everyday Athlete — Assignment 003 Planning Update (DEC-011)

**Authorization:** Planning only. Do not implement Assignment 003 without product-owner approval.

**Inputs:** Master Source v1.4, Decision Register v0.6, Assignment 002 Foundation v0.2.0 source and Native Verification Follow-up 01 handoff.

**Goal:** Revise the next development plan for a no-login, local-first personal/family pilot. Preserve working React/TypeScript code and existing tests; avoid rebuilding the foundation.

**Required scope:** no-login first launch; minimal program selection; Foundation (3 days/week), Strength (4 days/week), Fit content still pending review; today's workout; simple performed-set logging with optional advanced RIR; scheduling; exercise overlay and timer; conditioning recommended vs actual effort; history and conservative progression; persistent local records; validated export/import and recovery warnings.

**Verification plan:** specify tests for first-run without registration, reload/restart persistence, partial workout continuity, data isolation across distinct browser profiles, backup/restore roundtrip, malformed/duplicate imports, clear-data warning, undo, exercise overlay state, and regression of the existing 67 reported tests. Distinguish proposed tests from tests already executed.

**Cloud boundary:** Supabase Auth/Storage/JWT native checks remain blocked and are not needed to plan a local-only pilot; require completion before cloud accounts or real hosted user data. Keep future migration path documented, not implemented unless approved.

**Deliverables:** revised Assignment 003 plan, scope and milestone table, risks, acceptance criteria, exact existing-vs-new feature inventory, testing strategy, open owner decisions, and a sign-off checkpoint. Package in one ZIP with README. No external spending, hosted provisioning, public deployment, GitHub remote operations, real-user enrollment, or Winter Strong changes.
