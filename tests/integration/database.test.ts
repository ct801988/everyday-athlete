import { beforeAll, beforeEach, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { Database } from "../../server/database";
import {
  ALICE,
  BOB,
  ALICE_SESSION,
  BOB_SESSION,
  ALICE_CONDITIONING,
  values,
  conditioningPrescription,
} from "../../src/domain/fixtures";
import { type MutationEnvelope } from "../../src/domain/contracts";
const db = new Database();
const setId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const mutation = (ordinal = 1, id = setId): MutationEnvelope => ({
  id: crypto.randomUUID(),
  sessionId: ALICE_SESSION,
  payload: {
    type: "sets",
    items: [
      {
        id,
        ordinal,
        expectedRevision: 0,
        confirmed: true,
        values: structuredClone(values),
      },
    ],
  },
});
beforeAll(async () => {
  await db.init();
});
beforeEach(async () => {
  await db.exclusive(async () => {
    await db.engine.exec(
      "truncate public.actual_sets,public.effort_reports,public.audit_events,public.mutation_receipts,public.schedules,public.schedule_audit,public.recommendation_runs restart identity",
    );
    await db.engine.exec(
      "update public.sessions set status='active',revision=0",
    );
  });
});
afterAll(async () => {
  await db.close();
});
describe("Real PostgreSQL WASM engine: row authorization and transactional writes (not native Auth)", () => {
  it("Alice and Bob read only their own sessions under actual SQL RLS policies", async () => {
    expect(
      (await db.as(ALICE, (q) => q("select * from public.sessions"))).rows,
    ).toHaveLength(2);
    expect(
      (await db.as(BOB, (q) => q("select * from public.sessions"))).rows,
    ).toHaveLength(2);
    await expect(db.readSession(BOB, ALICE_SESSION)).rejects.toThrow(
      /accessible/,
    );
  });
  it("anonymous reads and mutation execution are denied by database grants", async () => {
    await expect(
      db.as(null, (q) => q("select * from public.sessions"), true),
    ).rejects.toThrow();
    await expect(
      db.as(
        null,
        (q) =>
          q("select public.apply_mutation($1,$2,$3)", [
            ALICE_SESSION,
            crypto.randomUUID(),
            JSON.stringify(mutation().payload),
          ]),
        true,
      ),
    ).rejects.toThrow();
  });
  it("RLS enabled on every private application table", async () => {
    const result = await db.engine.query<{
      relname: string;
      relrowsecurity: boolean;
    }>(
      "select relname,relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r'",
    );
    expect(result.rows.length).toBeGreaterThanOrEqual(9);
    expect(result.rows.every((r) => r.relrowsecurity)).toBe(true);
  });
  it("cannot insert/update private rows directly or publish content", async () => {
    await expect(
      db.as(ALICE, (q) =>
        q("update public.sessions set user_id=$1 where id=$2", [
          BOB,
          ALICE_SESSION,
        ]),
      ),
    ).rejects.toThrow();
    await expect(
      db.as(ALICE, (q) =>
        q("insert into public.program_versions values('evil',1,7,true,'{}')"),
      ),
    ).rejects.toThrow();
  });
  it("cross-user RPC session/set targeting is denied, even with guessed UUID", async () => {
    const m = mutation();
    m.sessionId = BOB_SESSION;
    await expect(db.mutate(ALICE, m)).rejects.toThrow(/accessible/);
    await db.mutate(ALICE, mutation());
    const other = mutation();
    other.sessionId = BOB_SESSION;
    await expect(db.mutate(BOB, other)).rejects.toThrow(/accessible/);
  });
  it("suggestions and read-only exports create no actual sets", async () => {
    const s = await db.readSession(ALICE, ALICE_SESSION);
    expect(s.actuals).toHaveLength(0);
    await db.export(ALICE);
    expect((await db.readSession(ALICE, ALICE_SESSION)).actuals).toHaveLength(
      0,
    );
  });
  it("duplicate commit-after-ack retry returns same receipt once", async () => {
    const m = mutation();
    const first = await db.mutate(ALICE, m);
    expect(await db.mutate(ALICE, m)).toEqual(first);
    expect(
      (await db.readSession(ALICE, ALICE_SESSION)).actuals[0].revision,
    ).toBe(1);
    expect(
      (await db.as(ALICE, (q) => q("select * from public.audit_events"))).rows,
    ).toHaveLength(1);
  });
  it("same idempotency key with different values is rejected", async () => {
    const m = mutation();
    await db.mutate(ALICE, m);
    if (m.payload.type === "sets") m.payload.items[0].values.reps = 9;
    await expect(db.mutate(ALICE, m)).rejects.toThrow(/mismatch/);
  });
  it("concurrent stale mutation conflicts without overwriting first actual", async () => {
    const results = await Promise.allSettled([
      db.mutate(ALICE, mutation()),
      db.mutate(ALICE, mutation()),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(
      (await db.readSession(ALICE, ALICE_SESSION)).actuals[0].revision,
    ).toBe(1);
  });
  it("correction and undo retain accurate event history", async () => {
    const m = mutation();
    await db.mutate(ALICE, m);
    if (m.payload.type !== "sets") throw Error();
    m.id = crypto.randomUUID();
    m.payload.items[0].expectedRevision = 1;
    m.payload.items[0].values.reps = 8;
    await db.mutate(ALICE, m);
    m.id = crypto.randomUUID();
    m.payload.items[0].expectedRevision = 2;
    m.payload.items[0].confirmed = false;
    await db.mutate(ALICE, m);
    const s = await db.readSession(ALICE, ALICE_SESSION);
    expect(s.actuals[0]).toMatchObject({ confirmed: false, revision: 3 });
    expect(s.actuals[0].values.reps).toBe(8);
    expect(
      (await db.as(ALICE, (q) => q("select * from public.audit_events"))).rows,
    ).toHaveLength(3);
  });
  it("invalid bulk group rolls back all rows and receipts", async () => {
    const m = mutation();
    if (m.payload.type !== "sets") throw Error();
    m.payload.items.push({
      ...m.payload.items[0],
      id: crypto.randomUUID(),
      ordinal: 4,
    });
    await expect(db.mutate(ALICE, m)).rejects.toThrow(/ordinal/);
    expect((await db.readSession(ALICE, ALICE_SESSION)).actuals).toHaveLength(
      0,
    );
    expect(
      (await db.as(ALICE, (q) => q("select * from public.mutation_receipts")))
        .rows,
    ).toHaveLength(0);
  });
  it("database validation blocks invalid actual values even bypassing the TypeScript adapter", async () => {
    const m = mutation();
    if (m.payload.type !== "sets") throw Error();
    m.payload.items[0].values.reps = -1;
    await expect(
      db.as(ALICE, (q) =>
        q("select public.apply_mutation($1,$2,$3)", [
          ALICE_SESSION,
          m.id,
          JSON.stringify(m.payload),
        ]),
      ),
    ).rejects.toThrow(/Invalid actual/);
  });
  it("effort actual may be null, corrected independently and hidden from Bob", async () => {
    await db.report(
      ALICE,
      ALICE_CONDITIONING,
      { value: null, scale: "synthetic-effort", scaleVersion: 1 },
      0,
    );
    await db.report(
      ALICE,
      ALICE_CONDITIONING,
      { value: 8, scale: "synthetic-effort", scaleVersion: 1 },
      1,
    );
    await db.report(
      ALICE,
      ALICE_CONDITIONING,
      { value: 6, scale: "synthetic-effort", scaleVersion: 1 },
      2,
    );
    const s = await db.readSession(ALICE, ALICE_CONDITIONING);
    expect(s.effort?.value).toBe(6);
    expect(s.effortRevision).toBe(3);
    expect(s.prescription).toEqual(conditioningPrescription);
    expect(
      (await db.as(BOB, (q) => q("select * from public.effort_reports"))).rows,
    ).toHaveLength(0);
  });
  it("invalid efforts rejected by runtime and SQL with previous valid state intact", async () => {
    await db.report(
      ALICE,
      ALICE_CONDITIONING,
      { value: 8, scale: "synthetic-effort", scaleVersion: 1 },
      0,
    );
    await expect(
      db.report(
        ALICE,
        ALICE_CONDITIONING,
        { value: 11, scale: "synthetic-effort", scaleVersion: 1 },
        1,
      ),
    ).rejects.toThrow();
    await expect(
      db.as(ALICE, (q) =>
        q("select public.apply_mutation($1,$2,$3)", [
          ALICE_CONDITIONING,
          crypto.randomUUID(),
          JSON.stringify({
            type: "effort",
            expectedRevision: 1,
            report: { value: 1.5, scale: "x", scaleVersion: 1 },
          }),
        ]),
      ),
    ).rejects.toThrow();
    expect(
      (await db.readSession(ALICE, ALICE_CONDITIONING)).effort?.value,
    ).toBe(8);
  });
  it("cannot finish all required work from suggestions or mutate finalized actuals without reopen", async () => {
    await expect(
      db.mutate(ALICE, {
        id: crypto.randomUUID(),
        sessionId: ALICE_SESSION,
        payload: { type: "finish", expectedRevision: 0, status: "completed" },
      }),
    ).rejects.toThrow(/Unconfirmed/);
    await db.mutate(ALICE, {
      id: crypto.randomUUID(),
      sessionId: ALICE_SESSION,
      payload: { type: "finish", expectedRevision: 0, status: "partial" },
    });
    await expect(db.mutate(ALICE, mutation())).rejects.toThrow(/Reopen/);
    await db.mutate(ALICE, {
      id: crypto.randomUUID(),
      sessionId: ALICE_SESSION,
      payload: { type: "reopen", expectedRevision: 1 },
    });
    await db.mutate(ALICE, mutation());
    expect((await db.readSession(ALICE, ALICE_SESSION)).status).toBe("active");
  });
  it("schedule revisions prevent stale overwrite and tenant reads are isolated", async () => {
    const data = [
      {
        id: "slot-1",
        ordinal: 1,
        plannedDate: "2026-10-21",
        status: "pending",
      },
    ];
    await db.as(ALICE, (q) =>
      q("select public.save_schedule($1,$2)", [0, JSON.stringify(data)]),
    );
    await expect(
      db.as(ALICE, (q) =>
        q("select public.save_schedule($1,$2)", [
          0,
          JSON.stringify([{ ...data[0], plannedDate: "2026-10-22" }]),
        ]),
      ),
    ).rejects.toThrow(/conflict/);
    expect(
      (await db.as(BOB, (q) => q("select * from public.schedules"))).rows,
    ).toHaveLength(0);
  });
  it("publishing a different program record does not rewrite pinned prescription", async () => {
    await db.engine.query(
      "update public.program_versions set version=2 where id='foundation'",
    );
    expect(
      (await db.readSession(ALICE, ALICE_SESSION)).prescription.programVersion,
    ).toBe(1);
  });
  it("physical SQL-lab snapshot restores records/nulls/provenance and RLS", async () => {
    await db.mutate(ALICE, mutation());
    await db.report(
      ALICE,
      ALICE_CONDITIONING,
      { value: null, scale: "synthetic-effort", scaleVersion: 1 },
      0,
    );
    const before = await db.export(ALICE);
    const snapshot = await db.snapshot();
    const restored = new PGlite({ loadDataDir: snapshot });
    await restored.waitReady;
    try {
      await restored.exec("begin");
      await restored.query(
        "select set_config('request.jwt.claim.sub',$1,true)",
        [ALICE],
      );
      await restored.exec("set local role authenticated");
      expect(
        (await restored.query("select * from public.actual_sets")).rows,
      ).toHaveLength(1);
      expect(
        (
          await restored.query<{ value: number | null }>(
            "select value from public.effort_reports",
          )
        ).rows[0].value,
      ).toBeNull();
      expect(before.synthetic).toBe(true);
      await restored.exec("rollback");
      await restored.exec("begin");
      await restored.query(
        "select set_config('request.jwt.claim.sub',$1,true)",
        [BOB],
      );
      await restored.exec("set local role authenticated");
      expect(
        (await restored.query("select * from public.actual_sets")).rows,
      ).toHaveLength(0);
      await restored.exec("rollback");
    } finally {
      await restored.close();
    }
  });
});
describe.skip("BLOCKED: native Supabase stack / database login verification", () => {
  it("native PostgreSQL login roles and real JWT validation require supported host or Docker", () => {});
  it("GoTrue email/password/recovery and JWT refresh require full local Supabase Auth", () => {});
  it("Supabase Storage object policies and native restore require full local stack", () => {});
});

describe("Additional database boundary tests", () => {
  it("strength session cannot store a conditioning effort report", async () => {
    await expect(
      db.report(
        ALICE,
        ALICE_SESSION,
        { value: 8, scale: "synthetic-effort", scaleVersion: 1 },
        0,
      ),
    ).rejects.toThrow(/conditioning session/);
  });
  it("SQL validator rejects missing load conventions independently of frontend", async () => {
    const m = mutation();
    const payload = JSON.parse(JSON.stringify(m.payload));
    delete payload.items[0].values.load.unit;
    await expect(
      db.as(ALICE, (q) =>
        q("select public.apply_mutation($1,$2,$3)", [
          ALICE_SESSION,
          m.id,
          JSON.stringify(payload),
        ]),
      ),
    ).rejects.toThrow(/Invalid actual/);
  });
  it("repeated schedule submission is idempotent without duplicate audit events", async () => {
    const data = [
      {
        id: "slot-1",
        ordinal: 1,
        plannedDate: "2026-10-21",
        status: "pending",
      },
    ];
    const first = await db.as(ALICE, (q) =>
      q("select public.save_schedule($1,$2)", [0, JSON.stringify(data)]),
    );
    const second = await db.as(ALICE, (q) =>
      q("select public.save_schedule($1,$2)", [0, JSON.stringify(data)]),
    );
    expect(second.rows).toEqual(first.rows);
    expect(
      (await db.as(ALICE, (q) => q("select * from public.schedule_audit")))
        .rows,
    ).toHaveLength(1);
  });
});
