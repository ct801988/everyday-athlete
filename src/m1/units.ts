import type { SetValues } from "../domain/contracts";
import type { Performance, Row, Model } from "./model";
export type WeightUnit = "lb" | "kg";
// International avoirdupois pound: exact kg factor. Never round stored loads.
export const KG_PER_LB = 0.45359237;
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit) {
  return from === to
    ? value
    : from === "lb"
      ? value * KG_PER_LB
      : value / KG_PER_LB;
}
export function weightText(value: number, from: WeightUnit, to: WeightUnit) {
  const n = convertWeight(value, from, to);
  // One decimal place for converted displays only; original-unit precision retained.
  return from === to ? String(value) : String(Number(n.toFixed(1)));
}
export function draftUnit(p: Performance, r: Row, model?: Model): WeightUnit {
  if (!r.draft.weightUnit && model?.legacy) {
    const source = model.legacy as {
      drafts?: Record<string, Record<string, { values: SetValues }>>;
    };
    const session = model.sessions.find((s) =>
      s.performances.some((q) => q.id === p.id),
    );
    const ordinal = p.rows.findIndex((q) => q.id === r.id) + 1;
    const prior = session
      ? source.drafts?.[session.id]?.[String(ordinal)]?.values
      : undefined;
    if (
      prior &&
      prior.load &&
      typeof prior.load === "object" &&
      "value" in prior.load &&
      (prior.load.unit === "lb" || prior.load.unit === "kg") &&
      String(prior.load.value) === r.draft.weight &&
      String(prior.reps ?? prior.seconds) === r.draft.amount
    )
      return prior.load.unit;
  }
  if (r.draft.weightUnit) return r.draft.weightUnit;
  // Old M1 migrated confirmed drafts mirror their actual's original unit.
  if (
    r.actual &&
    "value" in r.actual.load &&
    r.draft.weight === String(r.actual.load.value)
  )
    return r.actual.load.unit;
  return p.identity.unit;
}
export function draftWeight(
  p: Performance,
  r: Row,
  draft: Row["draft"],
  unit: WeightUnit,
  model?: Model,
  editing = false,
) {
  if (!draft.weight.trim() || !Number.isFinite(Number(draft.weight)))
    return draft.weight;
  const from = draft.weightUnit ?? draftUnit(p, r, model);
  return editing
    ? String(convertWeight(Number(draft.weight), from, unit))
    : weightText(Number(draft.weight), from, unit);
}
export function loadText(
  load: SetValues["load"],
  unit: WeightUnit,
  includeUnit = true,
) {
  if (!("value" in load))
    return load.kind === "bodyweight" ? "Bodyweight" : "No added weight";
  const suffix =
    load.kind === "assisted"
      ? " assistance"
      : load.kind === "added_bodyweight"
        ? " added"
        : "";
  return `${weightText(load.value, load.unit, unit)}${includeUnit ? " " + unit : ""}${suffix}`;
}
export function loadBasis(p: Performance) {
  if (p.identity.loadKind === "bodyweight") return "Bodyweight";
  if (p.identity.loadKind === "none") return "No added weight";
  if (p.identity.loadKind === "assisted") return "Assistance weight";
  if (p.identity.loadKind === "added_bodyweight") return "Added to bodyweight";
  return {
    total_bar: "Total weight, including bar",
    per_dumbbell: "Per dumbbell",
    single_implement: "Single weight",
    machine_stack: "Machine weight",
  }[p.identity.basis];
}
export function setText(v: SetValues, unit: WeightUnit, includeUnit = true) {
  return `${loadText(v.load, unit, includeUnit)} × ${v.reps ?? v.seconds}${v.seconds !== null ? " seconds" : " reps"}`;
}
export function rowChanged(
  p: Performance,
  r: Row,
  draft: Row["draft"],
  model?: Model,
) {
  if (!r.actual) return true;
  const v = r.actual;
  const sameWeight =
    !("value" in v.load) ||
    (draft.weight.trim() !== "" &&
      Math.abs(
        convertWeight(
          Number(draft.weight),
          draft.weightUnit ?? draftUnit(p, r, model),
          v.load.unit,
        ) - v.load.value,
      ) <=
        Math.max(1, v.load.value) * 1e-12);
  return (
    !sameWeight ||
    Number(draft.amount) !== (v.reps ?? v.seconds) ||
    (draft.rir.trim() === "" ? null : Number(draft.rir)) !== v.rir
  );
}
