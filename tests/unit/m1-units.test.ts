import { describe, it, expect } from "vitest";
import {
  convertWeight,
  weightText,
  draftWeight,
  draftUnit,
  loadText,
  loadBasis,
  rowChanged,
} from "../../src/m1/units";
import {
  createModel,
  validate,
  migrate,
  valuesDraft,
} from "../../src/m1/model";
import { record, rowValues, comparable } from "../../src/m1/actions";
import { exportBackup, parseBackup } from "../../src/m1/storage";
import { createDataset } from "../../src/local/model";
describe("weight units without historical rewriting", () => {
  it("uses the existing lb default and accepts both existing preferences", () => {
    const d = createModel();
    expect(d.preferences.unit).toBe("lb");
    d.preferences.unit = "kg";
    expect(validate(d).preferences.unit).toBe("kg");
  });
  it("converts by the exact international pound factor and reverses", () => {
    expect(convertWeight(1, "lb", "kg")).toBe(0.45359237);
    expect(convertWeight(0.45359237, "kg", "lb")).toBe(1);
    expect(convertWeight(100, "lb", "kg")).toBeCloseTo(45.359237, 12);
    expect(convertWeight(20, "kg", "lb")).toBeCloseTo(44.0924524369755, 12);
  });
  it("rounds converted display only and preserves original precision and zero", () => {
    expect(weightText(100, "lb", "kg")).toBe("45.359");
    expect(weightText(100.123456789, "lb", "lb")).toBe("100.123456789");
    expect(weightText(0, "kg", "lb")).toBe("0");
  });
  it("records the typed kg value with metadata independent of prescription units", () => {
    const s = createModel().sessions[0],
      p = s.performances[0],
      r = p.rows[0];
    s.status = "active";
    s.intervals = [{ start: 1, end: null }];
    r.draft = { weight: "20.123456", weightUnit: "kg", amount: "8", rir: "" };
    record(s, p, r, 2);
    expect(r.actual?.load).toMatchObject({
      value: 20.123456,
      unit: "kg",
      basis: "per_dumbbell",
    });
    expect(p.identity.unit).toBe("lb");
    expect(draftWeight(p, r, r.draft, "lb")).toBe("44.365");
  });
  it("preserves old unitless draft behavior and malformed/empty entry validation", () => {
    const p = createModel().sessions[0].performances[0],
      r = p.rows[0];
    r.draft = { weight: "25", amount: "8", rir: "" };
    expect(rowValues(p, r).load).toMatchObject({ value: 25, unit: "lb" });
    r.draft.weight = "";
    expect(() => rowValues(p, r)).toThrow();
    r.draft.weight = "invalid";
    expect(() => rowValues(p, r)).toThrow();
  });
  it("keeps exact stored values through repeated preference toggles and rep-only edits", () => {
    const d = createModel(),
      s = d.sessions[0],
      p = s.performances[0],
      r = p.rows[0];
    s.status = "active";
    s.intervals = [{ start: 1, end: null }];
    r.draft = { weight: "25.123456789", amount: "8", rir: "" };
    record(s, p, r, 2);
    const before = structuredClone(r.actual);
    for (let i = 0; i < 20; i++) {
      d.preferences.unit = i % 2 ? "lb" : "kg";
      draftWeight(p, r, r.draft, d.preferences.unit);
    }
    expect(r.actual).toEqual(before);
    expect(rowChanged(p, r, r.draft)).toBe(false);
    r.draft.amount = "9";
    record(s, p, r, 3);
    expect(r.actual?.load).toEqual(before?.load);
  });
  for (const kind of [
    "bodyweight",
    "none",
    "assisted",
    "added_bodyweight",
  ] as const)
    it(`handles ${kind} without mixing reps/time and weight`, () => {
      const p = createModel().sessions[0].performances[0],
        r = p.rows[0];
      p.identity.loadKind = kind;
      p.identity.basis = "single_implement";
      r.draft = { weight: "10", weightUnit: "kg", amount: "8", rir: "" };
      const v = rowValues(p, r);
      expect(v.reps).toBe(8);
      expect(v.seconds).toBeNull();
      if (kind === "bodyweight" || kind === "none")
        expect(v.load).toEqual({ kind });
      else expect(v.load).toMatchObject({ kind, value: 10, unit: "kg" });
      expect(loadBasis(p)).not.toMatch(/total_bar|single_implement/);
      expect(loadText(v.load, "lb")).toBe(
        kind === "bodyweight"
          ? "Bodyweight"
          : kind === "none"
            ? "No added weight"
            : `22.046 lb ${kind === "assisted" ? "assistance" : "added"}`,
      );
    });
  it("does not convert exercise duration when switching weight units", () => {
    const p = createModel().sessions[0].performances.find(
        (p) => p.identity.modality === "time",
      )!,
      r = p.rows[0];
    r.draft = { weight: "", amount: "37.5", rir: "" };
    expect(rowValues(p, r).seconds).toBe(37.5);
    expect(rowValues(p, r).load).toEqual({ kind: p.identity.loadKind });
  });
  it("retains typed kg drafts and exact history across backup/export/import", async () => {
    const d = createModel(),
      s = d.sessions[0],
      p = s.performances[0],
      r = p.rows[0];
    s.status = "active";
    s.intervals = [{ start: 1, end: null }];
    r.draft = { weight: "12.3456789", weightUnit: "kg", amount: "8", rir: "" };
    record(s, p, r, 2);
    d.preferences.unit = "kg";
    const parsed = await parseBackup(JSON.stringify(await exportBackup(d)));
    expect(parsed.sessions).toEqual(d.sessions);
    expect(parsed.preferences.unit).toBe("kg");
  });
  it("preserves mixed-unit legacy actuals and drafts with explicit source units", () => {
    const old = createDataset("foundation", "2026-10-19", [1, 3, 5]),
      s = old.sessions[0];
    const v = structuredClone(s.prescription.suggested);
    if (!("unit" in v.load)) throw Error("expected weighted fixture");
    v.load.unit = "kg";
    v.load.value = 12.3456789;
    old.drafts[s.id] = { "1": { values: v } } as (typeof old.drafts)[string];
    const original = structuredClone(old);
    const d = migrate(old),
      p = d.sessions[0].performances[0],
      r = p.rows[0];
    expect(old).toEqual(original);
    expect(d.legacy).toEqual(original);
    expect(r.draft.weightUnit).toBe("kg");
    expect(rowValues(p, r).load).toEqual(v.load);
  });
  it("resolves old migrated actuals whose stored unit differs from prescription", () => {
    const p = createModel().sessions[0].performances[0],
      r = p.rows[0];
    r.actual = {
      load: { kind: "external", value: 20, unit: "kg", basis: "per_dumbbell" },
      reps: 8,
      seconds: null,
      rir: null,
      rirCapped: false,
    };
    r.draft = { weight: "20", amount: "8", rir: "" };
    r.confirmed = true;
    expect(draftWeight(p, r, r.draft, "lb")).toBe("44.092");
    expect(rowChanged(p, r, r.draft)).toBe(false);
    expect(rowValues(p, r).load).toEqual(r.actual.load);
  });
  it("only offers actual comparable completed history without changing its unit", () => {
    const d = createModel(),
      s = d.sessions[0],
      p = s.performances[0],
      h = structuredClone(s);
    h.id = crypto.randomUUID();
    h.status = "finished_partial";
    h.performedDate = "2026-10-18";
    h.performances[0].rows[0].actual = {
      load: { kind: "external", value: 20, unit: "kg", basis: "per_dumbbell" },
      reps: 8,
      seconds: null,
      rir: null,
      rirCapped: false,
    };
    h.performances[0].rows[0].confirmed = true;
    d.sessions.push(h);
    d.preferences.unit = "lb";
    expect(comparable(d, s, p)?.[0].load).toMatchObject({
      value: 20,
      unit: "kg",
    });
    expect(loadText(comparable(d, s, p)![0].load, "lb")).toBe("44.092 lb");
    expect(valuesDraft(comparable(d, s, p)![0]).weightUnit).toBe("kg");
  });
});

it("reads an old M1 untagged legacy kg draft without changing its saved data", () => {
  const old = createDataset("foundation", "2026-10-19", [1, 3, 5]),
    prior = old.sessions[0];
  const v = structuredClone(prior.prescription.suggested);
  if (!("unit" in v.load)) throw Error("weighted fixture required");
  v.load.unit = "kg";
  v.load.value = 17.123456;
  old.drafts[prior.id] = { "1": { values: v } };
  const d = migrate(old),
    p = d.sessions[0].performances[0],
    r = p.rows[0];
  delete r.draft.weightUnit;
  const before = structuredClone(d);
  expect(draftUnit(p, r, d)).toBe("kg");
  expect(draftWeight(p, r, r.draft, "lb", d)).toBe(
    weightText(17.123456, "kg", "lb"),
  );
  expect(rowValues(p, r, d).load).toEqual(v.load);
  expect(d).toEqual(before);
});
it("matches the same exercise across lb and kg prescription units", () => {
  const d = createModel(),
    s = d.sessions[0],
    p = s.performances[0],
    h = structuredClone(s);
  h.id = crypto.randomUUID();
  h.status = "finished_partial";
  h.performedDate = "2026-10-18";
  h.performances[0].identity.unit = "kg";
  const r = h.performances[0].rows[0];
  r.confirmed = true;
  r.actual = {
    load: { kind: "external", value: 20, unit: "kg", basis: "per_dumbbell" },
    reps: 8,
    seconds: null,
    rir: null,
    rirCapped: false,
  };
  d.sessions.push(h);
  expect(comparable(d, s, p)?.[0]).toEqual(r.actual);
});
