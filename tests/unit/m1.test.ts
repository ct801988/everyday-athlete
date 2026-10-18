import { describe, it, expect } from "vitest";
import { createDataset } from "../../src/local/model";
import { createModel, migrate, validate, summary } from "../../src/m1/model";
import { exportBackup, parseBackup } from "../../src/m1/storage";
import { makeBackup } from "../../src/local/backup";
describe("M1 contracts and reversible legacy conversion", () => {
  it("creates six prescribed exercises without completed work", () => {
    const d = createModel();
    expect(d.sessions[0].performances).toHaveLength(6);
    expect(summary(d.sessions[0])).toEqual({ planned: 18, done: 0, extras: 0 });
    expect(d.preferences.rir).toBe(false);
  });
  for (const version of [1, 2])
    for (const status of ["active", "partial", "completed"] as const)
      it(`preserves v${version} ${status} source and unknown duration`, () => {
        const d = createDataset("foundation", "2026-10-19", [1, 3, 5]);
        const s = d.sessions[0];
        s.status = status;
        if (status === "completed")
          s.actuals = Array.from(
            { length: s.prescription.setCount },
            (_, i) => ({
              id: crypto.randomUUID(),
              ordinal: i + 1,
              revision: 1,
              confirmed: true,
              values: { ...s.prescription.suggested, rir: null },
            }),
          );
        const raw =
          version === 2
            ? d
            : {
                ...d,
                schemaVersion: 1,
                preferences: {
                  rir: d.preferences.rir,
                  unit: d.preferences.unit,
                },
                view: { ...d.view, timer: { deadline: null, paused: 120 } },
              };
        const copy = structuredClone(raw);
        const m = migrate(raw);
        expect(raw).toEqual(copy);
        expect(m.legacy).toEqual(raw);
        expect(m.sessions[0].id).toBe(s.id);
        expect(m.sessions[0].performances).toHaveLength(1);
        expect(m.sessions[0].durationQuality).toBe("unknown");
        expect(m.sessions[0].intervals).toEqual([]);
        expect(m.sessions[0].legacyStatus).toBe(status);
        expect(m.sessions[0].legacyRevision).toBe(s.revision);
      });
  it("preserves different drafts and confirmed actuals", () => {
    const d = createDataset("foundation", "2026-10-19", [1, 3, 5]);
    const s = d.sessions[0];
    s.actuals = [
      {
        id: crypto.randomUUID(),
        ordinal: 1,
        revision: 2,
        confirmed: true,
        values: { ...s.prescription.suggested, rir: null },
      },
    ];
    d.drafts[s.id] = {
      "1": { values: { ...s.prescription.suggested, reps: 9 } },
    };
    const m = migrate(d);
    const r = m.sessions[0].performances[0].rows[0];
    expect(r.id).toBe(s.actuals[0].id);
    expect(r.draft.amount).toBe("9");
    expect(r.actual).toEqual(s.actuals[0].values);
    expect(r.actual?.rir).toBeNull();
  });
  it("roundtrips v3 backups", async () => {
    const d = createModel();
    expect(await parseBackup(JSON.stringify(await exportBackup(d)))).toEqual(d);
  });
  it("imports signed v2 backup", async () => {
    const d = createDataset("foundation", "2026-10-19", [1, 3, 5]);
    expect(
      (await parseBackup(JSON.stringify(await makeBackup(d)))).legacy,
    ).toEqual(d);
  });
  it("rejects corrupt and future data", async () => {
    expect(() => migrate({ schemaVersion: 4 })).toThrow();
    const b = await exportBackup(createModel());
    b.checksum = "0".repeat(64);
    await expect(parseBackup(JSON.stringify(b))).rejects.toThrow();
  });
  it("rejects duplicated identities and false completion", () => {
    const d = createModel();
    d.sessions[0].performances[1].id = d.sessions[0].performances[0].id;
    expect(() => validate(d)).toThrow();
    const e = createModel();
    e.sessions[0].status = "finished_full";
    expect(() => validate(e)).toThrow();
  });
});

import { lifecycle, elapsed, record, undo, GAP } from "../../src/m1/actions";
describe("M1 lifecycle truthfulness", () => {
  it("excludes paused gaps and includes active background time", () => {
    const d = createModel();
    const s = d.sessions[0];
    lifecycle(d, s, "begin", 1000);
    lifecycle(d, s, "pause", 11000);
    lifecycle(d, s, "resume", 100000);
    expect(elapsed(s, 105000).seconds).toBe(15);
    expect(summary(s).done).toBe(0);
  });
  it("flags long gaps and reversed clocks", () => {
    const d = createModel();
    const s = d.sessions[0];
    lifecycle(d, s, "begin", 1000);
    expect(elapsed(s, 1000 + GAP).review).toBe(true);
    expect(elapsed(s, 0).review).toBe(true);
    lifecycle(d, s, "pause", 0);
    expect(s.durationQuality).toBe("review");
  });
  it("refuses false full finish and resets rest", () => {
    const d = createModel();
    const s = d.sessions[0];
    lifecycle(d, s, "begin", 1000);
    expect(() => lifecycle(d, s, "finish", 2000)).toThrow();
    lifecycle(d, s, "finish", 2000, true);
    expect(s.status).toBe("finished_partial");
    expect(d.timer.status).toBe("ready");
  });
  it("records only deliberately valid values; correction and undo remain traceable", () => {
    const d = createModel();
    const s = d.sessions[0],
      p = s.performances[0],
      r = p.rows[0];
    expect(() => record(s, p, r, 10)).toThrow();
    lifecycle(d, s, "begin", 100);
    expect(() => record(s, p, r, 101)).toThrow();
    r.draft = { weight: "25", amount: "8", rir: "" };
    record(s, p, r, 102);
    expect(r.actual?.rir).toBeNull();
    expect(summary(s).done).toBe(1);
    r.draft.amount = "9";
    record(s, p, r, 103);
    expect(r.revision).toBe(2);
    undo(s, r);
    expect(r.actual?.reps).toBe(9);
    expect(summary(s).done).toBe(0);
  });
});
