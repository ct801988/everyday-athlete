import type {
  EffortTarget,
  EffortReport,
  Prescription,
  SetValues,
} from "./contracts";
export type Exposure = {
  id: string;
  variation: string;
  protocol: string;
  phase: string;
  complete: boolean;
  daysAgo: number;
  pain: boolean;
  values: SetValues[];
};
export type CoachingInput = {
  prescription: Prescription;
  history: Exposure[];
  pain: boolean;
  tired: boolean;
  increment: number | null;
};
export function recommend(i: CoachingInput) {
  const p = i.prescription;
  const inputs = i.history.map((h) => h.id);
  const base = {
    engineVersion: "foundation-rules-1.1",
    programVersion: p.programVersion,
    inputs,
    evidence: ["E01", "E02"],
    synthetic: true,
    limits:
      "Synthetic rule proof; not a reviewed training prescription. Effort and technique are not inferred.",
  };
  const out = (
    rule: string,
    kind: string,
    reason: string,
    load: number | null = null,
    reps: number[] = [],
  ) => ({ ...base, rule, kind, reason, load, reps });
  if (i.pain || i.history.some((h) => h.pain))
    return out(
      "R01",
      "stop",
      "Pain context: stop affected work and seek appropriate assessment.",
    );
  if (p.phase === "recovery" || p.phase === "benchmark")
    return out("R05", "hold", "Follow this phase; no automatic increase.");
  const latest = i.history[0];
  if (latest && latest.daysAgo >= 14)
    return out(
      "R06",
      "reentry",
      "Return conservatively after a break; select a fresh baseline.",
    );
  if (
    !latest ||
    latest.variation !== p.variation ||
    latest.protocol !== p.protocol ||
    latest.values.length !== p.setCount
  )
    return out("R02", "baseline", "No matching prescription history.");
  if (latest.phase !== "normal")
    return out(
      "R02",
      "baseline",
      "Prior phase differs; establish a comparable baseline.",
    );
  if (i.tired || latest.values.some((s) => s.rir !== null && s.rir < 2))
    return out(
      "R07",
      "hold",
      "Reported adverse effort or tiredness: hold targets.",
    );
  const load = latest.values[0]?.load;
  const numeric = load?.kind === "external" ? load.value : null;
  if (
    latest.complete &&
    latest.values.every((s) => s.seconds !== null) &&
    i.history.length >= 2 &&
    i.history
      .slice(0, 2)
      .every(
        (h) =>
          h.complete &&
          h.protocol === p.protocol &&
          h.variation === p.variation &&
          h.phase === "normal" &&
          h.values.length === p.setCount &&
          h.values.every((s) => s.seconds !== null),
      )
  ) {
    const seconds = latest.values.map((s) => s.seconds!);
    const lowest = Math.min(...seconds);
    if (lowest < p.high)
      seconds[seconds.indexOf(lowest)] = Math.min(p.high, lowest + 5);
    return {
      ...out(
        "R10",
        "time",
        "Bounded timed-set progression; no external load inferred.",
      ),
      seconds,
    };
  }
  if (!latest.complete || latest.values.some((s) => s.reps === null))
    return out(
      "R03",
      "hold",
      "Incomplete confirmed performance; hold targets.",
      numeric,
    );
  if (
    latest.values.some((s) => JSON.stringify(s.load) !== JSON.stringify(load))
  )
    return out("R03", "hold", "Mixed loads require review.", numeric);
  if (
    latest.values.some((s) => (s.reps ?? 0) < p.low || (s.reps ?? 0) > p.high)
  )
    return out(
      "R02",
      "baseline",
      "Rep range mismatch; establish comparable performance.",
    );
  const qualifies = (h: Exposure) =>
    h.complete &&
    !h.pain &&
    h.daysAgo < 14 &&
    h.phase === "normal" &&
    h.variation === p.variation &&
    h.protocol === p.protocol &&
    h.values.length === p.setCount &&
    h.values.every(
      (s) =>
        s.reps === p.high &&
        (s.rir === null || s.rir >= 2) &&
        JSON.stringify(s.load) === JSON.stringify(load),
    );
  if (
    numeric !== null &&
    numeric > 0 &&
    i.history.length >= 2 &&
    i.history.slice(0, 2).every(qualifies) &&
    i.increment !== null &&
    Number.isFinite(i.increment) &&
    i.increment > 0 &&
    i.increment / numeric <= 0.05
  )
    return out(
      "R04",
      "load",
      "Two confirmed comparable exposures earned a bounded step; RIR is optional.",
      numeric + i.increment,
      Array(p.setCount).fill(p.low) as number[],
    );
  const reps = latest.values.map((s) => s.reps ?? p.low);
  const lowest = Math.min(...reps);
  if (lowest < p.high) {
    reps[reps.indexOf(lowest)]++;
    return out(
      "R08",
      "reps",
      "Add one rep to the lowest completed set; keep load.",
      numeric,
      reps,
    );
  }
  return out(
    "R11",
    "hold",
    "No eligible equipment step or second qualifying exposure.",
    numeric,
    reps,
  );
}
export function compareEffort(
  target: EffortTarget | null,
  report: EffortReport | null,
) {
  const base = {
    rule: "CND-R01",
    version: "1.0",
    demandChange: 0,
    achievement: false,
  };
  if (!target)
    return {
      ...base,
      status: "target_unavailable",
      reason: "No prescribed numeric target; none inferred.",
    };
  if (!report || report.value === null)
    return {
      ...base,
      status: "actual_unknown",
      reason: "Your Effort Level was not reported.",
    };
  if (
    target.scale !== report.scale ||
    target.scaleVersion !== report.scaleVersion
  )
    return {
      ...base,
      status: "not_comparable",
      reason: "Different scale versions; no conversion.",
    };
  const status =
    report.value > target.max
      ? "above_target_context"
      : report.value < target.min
        ? "below_target_context"
        : "within_reported_range";
  return {
    ...base,
    status,
    reason:
      status === "above_target_context"
        ? "Higher reported effort is context, not a reward or reason to increase training demands."
        : "Reported context only; no automatic demand change.",
  };
}
