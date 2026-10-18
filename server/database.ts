import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  ALICE,
  BOB,
  ALICE_SESSION,
  BOB_SESSION,
  ALICE_CONDITIONING,
  BOB_CONDITIONING,
  prescription,
  conditioningPrescription,
} from "../src/domain/fixtures";
import {
  MutationEnvelope,
  Prescription,
  type Session,
  type ActualSet,
  type EffortReport,
} from "../src/domain/contracts";
export class Database {
  readonly engine: PGlite;
  private tail: Promise<unknown> = Promise.resolve();
  constructor(path?: string) {
    if (path) mkdirSync(dirname(resolve(path)), { recursive: true });
    this.engine = new PGlite(path);
  }
  async exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const task = this.tail.then(fn, fn);
    this.tail = task.catch(() => {});
    return task;
  }
  async init() {
    await this.engine.waitReady;
    await this.exclusive(async () => {
      const found = await this.engine.query<{ name: string }>(
        "select to_regclass('public.sessions') as name",
      );
      if (found.rows[0].name) return;
      await this.engine.exec(
        await readFile(resolve("scripts/lab-bootstrap.sql"), "utf8"),
      );
      await this.engine.exec(
        await readFile(
          resolve("supabase/migrations/001_foundation.sql"),
          "utf8",
        ),
      );
      await this.seedRaw();
    });
  }
  private async seedRaw() {
    await this.engine.query("insert into auth.users values($1),($2)", [
      ALICE,
      BOB,
    ]);
    for (const p of [
      { id: "foundation", days: 3 },
      { id: "strength", days: 4 },
      { id: "fit", days: 3 },
    ])
      await this.engine.query(
        "insert into public.program_versions values($1,1,$2,true,$3)",
        [
          p.id,
          p.days,
          JSON.stringify({
            synthetic: true,
            review: "not reviewed training content",
          }),
        ],
      );
    for (const [id, user] of [
      [ALICE_SESSION, ALICE],
      [BOB_SESSION, BOB],
    ])
      await this.engine.query(
        "insert into public.sessions(id,user_id,prescription) values($1,$2,$3)",
        [id, user, JSON.stringify(prescription)],
      );
    for (const [id, user] of [
      [ALICE_CONDITIONING, ALICE],
      [BOB_CONDITIONING, BOB],
    ])
      await this.engine.query(
        "insert into public.sessions(id,user_id,prescription) values($1,$2,$3)",
        [id, user, JSON.stringify(conditioningPrescription)],
      );
  }
  async as<T>(
    user: string | null,
    fn: (
      q: <R = Record<string, unknown>>(
        sql: string,
        args?: unknown[],
      ) => Promise<{ rows: R[] }>,
    ) => Promise<T>,
    anonymous = false,
  ) {
    return this.exclusive(async () => {
      await this.engine.exec("begin");
      try {
        await this.engine.query(
          "select set_config('request.jwt.claim.sub',$1,true)",
          [user ?? ""],
        );
        await this.engine.exec(
          anonymous ? "set local role anon" : "set local role authenticated",
        );
        const result = await fn((sql, args) => this.engine.query(sql, args));
        await this.engine.exec("commit");
        return result;
      } catch (e) {
        await this.engine.exec("rollback");
        throw e;
      }
    });
  }
  async readSession(user: string, id: string): Promise<Session> {
    return this.as(user, async (q) => {
      const s = await q<{
        id: string;
        prescription: unknown;
        status: Session["status"];
        revision: number;
      }>(
        "select id,prescription,status,revision from public.sessions where id=$1",
        [id],
      );
      if (!s.rows[0]) throw Error("Session not accessible");
      const sets = await q<ActualSet>(
        'select id,session_id,ordinal,revision,confirmed,actual_values as "values" from public.actual_sets where session_id=$1 order by ordinal',
        [id],
      );
      const effort = await q<{
        value: number | null;
        scale: string;
        scale_version: number;
        revision: number;
      }>(
        "select value,scale,scale_version,revision from public.effort_reports where session_id=$1",
        [id],
      );
      const e = effort.rows[0];
      return {
        ...s.rows[0],
        prescription: Prescription.parse(s.rows[0].prescription),
        actuals: sets.rows,
        effort: e
          ? { value: e.value, scale: e.scale, scaleVersion: e.scale_version }
          : null,
        effortRevision: e?.revision ?? 0,
      };
    });
  }
  async mutate(user: string, raw: unknown) {
    const m = MutationEnvelope.parse(raw);
    return this.as(
      user,
      async (q) =>
        (
          await q("select public.apply_mutation($1,$2,$3) as receipt", [
            m.sessionId,
            m.id,
            JSON.stringify(m.payload),
          ])
        ).rows[0],
    );
  }
  async report(
    user: string,
    sessionId: string,
    report: EffortReport,
    revision: number,
  ) {
    return this.mutate(user, {
      id: crypto.randomUUID(),
      sessionId,
      payload: { type: "effort", expectedRevision: revision, report },
    });
  }
  async export(user: string) {
    return this.as(user, async (q) => {
      const result: Record<string, unknown> = {
        schemaVersion: "foundation-1.2",
        synthetic: true,
      };
      for (const table of [
        "sessions",
        "actual_sets",
        "effort_reports",
        "audit_events",
        "schedules",
        "schedule_audit",
        "recommendation_runs",
      ])
        result[table] = (await q("select * from public." + table)).rows;
      return result;
    });
  }
  async snapshot() {
    return this.exclusive(() => this.engine.dumpDataDir("gzip"));
  }
  async close() {
    await this.tail;
    await this.engine.close();
  }
}
