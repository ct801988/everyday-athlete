import { describe, it, expect } from "vitest";
import {
  SetValues,
  EffortTarget,
  EffortReport,
  Prescription,
  csvCell,
  Programs,
} from "../../src/domain/contracts";
import {
  values,
  prescription,
  conditioningPrescription,
} from "../../src/domain/fixtures";
import {
  recommend,
  compareEffort,
  type CoachingInput,
} from "../../src/domain/coaching";
import { schedule, reschedule } from "../../src/domain/scheduling";
const base = (): CoachingInput => ({
  prescription,
  history: [1, 2].map((n) => ({
    id: "exposure-" + n,
    variation: prescription.variation,
    protocol: prescription.protocol,
    phase: "normal",
    complete: true,
    daysAgo: n * 2,
    pain: false,
    values: Array.from({ length: 3 }, () => ({
      ...values,
      load: {
        kind: "external" as const,
        value: 100,
        unit: "lb" as const,
        basis: "total_bar" as const,
      },
      reps: 12,
    })),
  })),
  pain: false,
  tired: false,
  increment: 2.5,
});
describe("Runtime contracts and portability", () => {
  it("retains optional unknown RIR without replacing it with target", () =>
    expect(SetValues.parse(values).rir).toBeNull());
  it("rejects zero/negative/fractional reps and invalid capped effort", () => {
    for (const reps of [0, -1, 1.5])
      expect(() => SetValues.parse({ ...values, reps })).toThrow();
    expect(() =>
      SetValues.parse({ ...values, rir: 2, rirCapped: true }),
    ).toThrow();
  });
  it("distinguishes bodyweight, assistance, per-DB and total load", () => {
    expect(
      SetValues.parse({ ...values, load: { kind: "bodyweight" } }).load,
    ).toEqual({ kind: "bodyweight" });
    expect(() =>
      SetValues.parse({
        ...values,
        load: {
          kind: "external",
          value: -1,
          unit: "lb",
          basis: "per_dumbbell",
        },
      }),
    ).toThrow();
    expect(values.load).toHaveProperty("basis", "per_dumbbell");
  });
  it("validates timed vs reps without inventing an activity measurement", () => {
    expect(
      SetValues.parse({ ...values, reps: null, seconds: 20 }).seconds,
    ).toBe(20);
    expect(() => SetValues.parse({ ...values, seconds: 20 })).toThrow();
  });
  it("rejects prescribed invalid effort/ranges and preserves points", () => {
    expect(
      EffortTarget.parse({
        ...conditioningPrescription.effortTarget,
        min: 3,
        max: 3,
      }),
    ).toHaveProperty("min", 3);
    expect(() =>
      EffortTarget.parse({
        ...conditioningPrescription.effortTarget,
        min: 7,
        max: 5,
      }),
    ).toThrow();
  });
  it("rejects actual effort 0,11,fractions and keeps null", () => {
    for (const value of [0, 11, 1.5])
      expect(() =>
        EffortReport.parse({ value, scale: "x", scaleVersion: 1 }),
      ).toThrow();
    expect(
      EffortReport.parse({ value: null, scale: "x", scaleVersion: 1 }).value,
    ).toBeNull();
  });
  it("serializes nullable prescription exactly and keeps approved frequency metadata", () => {
    expect(
      Prescription.parse(JSON.parse(JSON.stringify(prescription))),
    ).toEqual(prescription);
    expect(Programs.slice(0, 2).map((p) => p.days)).toEqual([3, 4]);
  });
  it("escapes CSV formulas, quotes, null and nested units", () => {
    expect(csvCell("=CMD()")).toBe('"\'=CMD()"');
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell(null)).toBe('""');
  });
});
describe("Deterministic coaching guards", () => {
  it("earns bounded load increase without any RIR input", () => {
    const result = recommend(base());
    expect(result).toMatchObject({
      rule: "R04",
      load: 102.5,
      reps: [8, 8, 8],
      inputs: ["exposure-1", "exposure-2"],
    });
    expect(result).toEqual(recommend(base()));
  });
  it("pain overrides recovery, benchmark and no history", () => {
    for (const phase of ["normal", "recovery", "benchmark"] as const)
      expect(
        recommend({
          ...base(),
          prescription: { ...prescription, phase },
          history: [],
          pain: true,
        }),
      ).toMatchObject({ rule: "R01", load: null, reps: [] });
  });
  it("recovery and benchmark never increase", () => {
    for (const phase of ["recovery", "benchmark"] as const)
      expect(
        recommend({ ...base(), prescription: { ...prescription, phase } }).kind,
      ).toBe("hold");
  });
  it("partial exposure blocks an increase", () => {
    const i = base();
    i.history[0].complete = false;
    expect(recommend(i).rule).toBe("R03");
  });
  it("unknown optional RIR does not block; reported failure does", () => {
    const i = base();
    i.history[0].values[1].rir = 0;
    expect(recommend(i).rule).toBe("R07");
  });
  it("different exercise, protocol or set count establishes baseline", () => {
    for (const property of ["variation", "protocol"] as const) {
      const i = base();
      i.history[0][property] = "different";
      expect(recommend(i).rule).toBe("R02");
    }
    const i = base();
    i.history[0].values.pop();
    expect(recommend(i).rule).toBe("R02");
  });
  it("long break prompts a new conservative baseline", () => {
    const i = base();
    i.history[0].daysAgo = 15;
    expect(recommend(i)).toMatchObject({ rule: "R06", load: null });
  });
  it("large or invalid equipment steps do not escalate", () => {
    for (const increment of [10, -1, 0, Infinity, null])
      expect(recommend({ ...base(), increment }).rule).toBe("R11");
  });
  it("adds one rep only to the lowest completed set", () => {
    const i = base();
    i.history[0].values.forEach((s, n) => (s.reps = n === 2 ? 8 : 9));
    expect(recommend(i)).toMatchObject({
      rule: "R08",
      load: 100,
      reps: [9, 9, 9],
    });
  });
  it("mixed weights and tiredness do not cause progression", () => {
    const i = base();
    i.history[0].values[1].load = {
      kind: "external",
      value: 105,
      unit: "lb",
      basis: "total_bar",
    };
    expect(recommend(i).kind).toBe("hold");
    expect(recommend({ ...base(), tired: true }).kind).toBe("hold");
  });
  it("substitutions never advance original history", () => {
    const i = base();
    i.history = i.history.map((h) => ({ ...h, variation: "goblet" }));
    expect(recommend(i).load).toBeNull();
  });
  it("does not accept a different rep-range protocol as earned progression", () => {
    const i = base();
    i.history[0].protocol = "three-by-five";
    expect(recommend(i).rule).toBe("R02");
  });
});
describe("Conditioning context is not effort-rewarding", () => {
  const target = conditioningPrescription.effortTarget!;
  const report = (value: number | null) => ({
    value,
    scale: target.scale,
    scaleVersion: target.scaleVersion,
  });
  it("above-target actual effort never rewards or increases demands", () =>
    expect(compareEffort(target, report(8))).toMatchObject({
      status: "above_target_context",
      achievement: false,
      demandChange: 0,
    }));
  it("lower/matching/missing actuals cannot silently increase demands", () => {
    for (const value of [null, 2, 5, 6, 10])
      expect(compareEffort(target, report(value)).demandChange).toBe(0);
    expect(compareEffort(target, report(null)).status).toBe("actual_unknown");
  });
  it("no target means no fabricated default", () =>
    expect(compareEffort(null, report(8)).status).toBe("target_unavailable"));
  it("cross-scale/version comparison rejected", () => {
    expect(compareEffort(target, { ...report(8), scale: "other" }).status).toBe(
      "not_comparable",
    );
    expect(
      compareEffort(target, { ...report(8), scaleVersion: 2 }).status,
    ).toBe("not_comparable");
  });
  it("distinct session targets produce distinct comparisons without rewriting the report", () => {
    const r = report(4);
    expect(compareEffort({ ...target, min: 3, max: 3 }, r).status).toBe(
      "above_target_context",
    );
    expect(compareEffort(target, r).status).toBe("below_target_context");
    expect(r.value).toBe(4);
  });
});
describe("Ordered calendar contracts", () => {
  const q = {
    start: "2026-10-21",
    weekdays: [1, 3, 5],
    days: 3,
    count: 8,
    minimumGapDays: 1,
    timezone: "America/Chicago",
  };
  it("any-day start carries ordered slots into later weeks without skipping", () => {
    const s = schedule(q);
    expect(s.slice(0, 4).map((x) => x.plannedDate)).toEqual([
      "2026-10-21",
      "2026-10-23",
      "2026-10-26",
      "2026-10-28",
    ]);
    expect(s.map((x) => x.ordinal)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it("four-day Strength metadata and slots are not downgraded", () =>
    expect(
      schedule({ ...q, days: 4, weekdays: [1, 2, 4, 5], count: 4 }).length,
    ).toBe(4));
  it("rejects invalid frequency, duplicate weekdays, dates and timezone", () => {
    expect(() => schedule({ ...q, weekdays: [1, 1, 3] })).toThrow();
    expect(() => schedule({ ...q, days: 4 })).toThrow();
    expect(() => schedule({ ...q, start: "2026-02-30" })).toThrow();
    expect(() => schedule({ ...q, timezone: "Unknown/Invalid" })).toThrow();
  });
  it("reviewed fixture recovery constraint can reject bad placement", () =>
    expect(() =>
      schedule({ ...q, weekdays: [1, 2, 3], minimumGapDays: 2 }),
    ).toThrow(/recovery/));
  it("reschedules explicitly with stable identities/original dates and no completion", () => {
    const s = schedule(q);
    const m = reschedule(s, "slot-1", "2026-10-24", 1, 0);
    expect(m[0]).toMatchObject({
      id: s[0].id,
      originalDate: s[0].originalDate,
      plannedDate: "2026-10-24",
      status: "pending",
      revision: 1,
    });
    expect(m[1].plannedDate).toBe("2026-10-25");
    expect(s[0].plannedDate).toBe("2026-10-21");
  });
  it("conflicts, completed history and sequence inversion fail safely", () => {
    const s = schedule(q);
    expect(() => reschedule(s, "slot-1", "2026-10-24", 1, 1)).toThrow(
      /conflict/,
    );
    expect(() => reschedule(s, "slot-2", "2026-10-20", 1, 0)).toThrow();
    s[0].status = "completed";
    expect(() => reschedule(s, "slot-1", "2026-10-24", 1, 0)).toThrow(
      /immutable/,
    );
  });
  it("calendar dates survive DST without duplicate identities", () => {
    const s = schedule({
      ...q,
      start: "2026-10-30",
      weekdays: [0, 2, 4],
      count: 6,
    });
    expect(new Set(s.map((x) => x.plannedDate)).size).toBe(6);
    expect(s[1].plannedDate).toBe("2026-11-03");
  });
});

describe("Additional mode and safety boundaries", () => {
  it("timed sets progress duration without external load or guessed RIR", () => {
    const i = base();
    i.prescription = {
      ...prescription,
      low: 15,
      high: 25,
      suggested: {
        ...values,
        load: { kind: "bodyweight" },
        reps: null,
        seconds: 20,
      },
    };
    i.history = i.history.map((h) => ({
      ...h,
      values: h.values.map(() => ({
        ...values,
        load: { kind: "bodyweight" },
        reps: null,
        seconds: 20,
      })),
    }));
    expect(recommend(i)).toMatchObject({
      rule: "R10",
      load: null,
      seconds: [25, 20, 20],
    });
  });
  it("prior recovery phase cannot establish automatic progression", () => {
    const i = base();
    i.history[0].phase = "recovery";
    expect(recommend(i)).toMatchObject({ rule: "R02", load: null });
  });
  it("every safety override blocks escalation across complete history", () => {
    for (const flag of ["pain", "tired"] as const) {
      const i = base();
      i[flag] = true;
      expect(recommend(i).kind).not.toBe("load");
    }
  });
});
