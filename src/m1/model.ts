import { z } from "zod";
import { SetValues, UUID } from "../domain/contracts";
import { SlotSchema, validate as validateLegacy } from "../local/model";
import { Timer, TimerPreferences, readyTimer } from "../local/timer";
export const Draft = z
  .object({
    weight: z.string().max(20),
    amount: z.string().max(20),
    rir: z.string().max(5),
  })
  .strict();
const Identity = z
  .object({
    id: z.string(),
    version: z.number().int().positive(),
    variant: z.string(),
    equipment: z.array(z.string()),
    modality: z.enum(["reps", "time"]),
    loadKind: z.enum([
      "external",
      "bodyweight",
      "none",
      "assisted",
      "added_bodyweight",
    ]),
    basis: z.enum([
      "total_bar",
      "per_dumbbell",
      "single_implement",
      "machine_stack",
    ]),
    unit: z.enum(["lb", "kg"]),
    category: z.string(),
  })
  .strict();
export type Identity = z.infer<typeof Identity>;
export const PlannedSet = z
  .object({
    id: z.string(),
    target: z.string(),
    suggested: SetValues.nullable(),
  })
  .strict();
export const Exercise = z
  .object({
    id: z.string(),
    identity: Identity,
    name: z.string(),
    sets: z.array(PlannedSet).max(20),
  })
  .strict();
const Prescription = z
  .object({
    id: z.string(),
    version: z.literal(1),
    program: z.string(),
    phase: z.string(),
    synthetic: z.literal(true),
    exercises: z.array(Exercise).max(30),
  })
  .strict();
const Row = z
  .object({
    id: z.string(),
    plannedSetId: z.string().nullable(),
    origin: z.enum(["prescribed", "added_set", "added_exercise"]),
    draft: Draft,
    actual: SetValues.nullable(),
    confirmed: z.boolean(),
    revision: z.number().int().nonnegative(),
    recordedAt: z.number().finite().nullable(),
  })
  .strict();
const Performance = z
  .object({
    id: z.string(),
    prescriptionExerciseId: z.string().nullable(),
    identity: Identity,
    name: z.string(),
    origin: z.enum(["prescribed", "added_exercise", "substitution"]),
    group: z.string().nullable(),
    rows: z.array(Row).max(20),
  })
  .strict();
const Session = z
  .object({
    id: z.string(),
    prescription: Prescription,
    status: z.enum([
      "planned",
      "active",
      "paused",
      "finished_full",
      "finished_partial",
    ]),
    legacyStatus: z.string().nullable(),
    legacyRevision: z.number().int().nonnegative().nullable(),
    performedDate: z.string().nullable(),
    slot: z.string().nullable(),
    performances: z.array(Performance).max(30),
    intervals: z
      .array(
        z
          .object({
            start: z.number().finite(),
            end: z.number().finite().nullable(),
          })
          .strict(),
      )
      .max(2000),
    durationQuality: z.enum(["known", "unknown", "review"]),
    correction: z
      .object({
        seconds: z.number().finite().nonnegative(),
        at: z.number().finite(),
        reason: z.string().min(1),
      })
      .strict()
      .nullable(),
    lastSeen: z.number().finite().nullable(),
  })
  .strict();
export const Model = z
  .object({
    schemaVersion: z.literal(3),
    id: UUID,
    subject: UUID,
    revision: z.number().int().nonnegative(),
    program: z.enum(["foundation", "strength"]),
    sessions: z.array(Session).min(1).max(1000),
    slots: z.array(SlotSchema).max(200),
    legacy: z.unknown().nullable(),
    preferences: z
      .object({
        rir: z.boolean(),
        unit: z.enum(["lb", "kg"]),
        timer: TimerPreferences,
      })
      .strict(),
    timer: Timer,
    view: z
      .object({
        tab: z.enum(["Workout", "Program", "Visuals", "Progress"]),
        session: z.string(),
        collapsed: z.record(z.string(), z.boolean()),
      })
      .strict(),
    audit: z
      .array(
        z
          .object({
            id: z.string(),
            at: z.number(),
            action: z.string(),
            session: z.string().nullable(),
            before: z.string(),
            after: z.string(),
          })
          .strict(),
      )
      .max(30000),
    receipts: z.record(z.string(), z.string()),
  })
  .strict();
export type Model = z.infer<typeof Model>;
export type Session = Model["sessions"][number];
export type Performance = Session["performances"][number];
export type Row = Performance["rows"][number];
export const catalog = [
  {
    id: "synthetic-db-press",
    name: "Demo dumbbell press",
    category: "Upper Body",
    equipment: ["Dumbbells", "Bench"],
    modality: "reps",
    loadKind: "external",
    basis: "per_dumbbell",
  },
  {
    id: "demo-row",
    name: "Demo dumbbell row",
    category: "Upper Body",
    equipment: ["Dumbbells"],
    modality: "reps",
    loadKind: "external",
    basis: "per_dumbbell",
  },
  {
    id: "demo-squat",
    name: "Demo squat",
    category: "Lower Body",
    equipment: ["Barbell", "Rack"],
    modality: "reps",
    loadKind: "external",
    basis: "total_bar",
  },
  {
    id: "demo-push",
    name: "Demo bodyweight push",
    category: "Full Body",
    equipment: ["Bodyweight"],
    modality: "reps",
    loadKind: "bodyweight",
    basis: "single_implement",
  },
  {
    id: "demo-hold",
    name: "Demo timed hold",
    category: "Core",
    equipment: ["Bodyweight"],
    modality: "time",
    loadKind: "none",
    basis: "single_implement",
  },
  {
    id: "demo-mobility",
    name: "Demo mobility interval",
    category: "Mobility & Flexibility",
    equipment: ["Bodyweight"],
    modality: "time",
    loadKind: "none",
    basis: "single_implement",
  },
  {
    id: "demo-cardio",
    name: "Demo conditioning interval",
    category: "Cardio & Conditioning",
    equipment: ["Outdoors"],
    modality: "time",
    loadKind: "none",
    basis: "single_implement",
  },
] as const;
export function identity(
  item: (typeof catalog)[number],
  unit: "lb" | "kg" = "lb",
): Identity {
  return {
    id: item.id,
    version: 1,
    variant: item.id,
    unit,
    equipment: [...item.equipment],
    modality: item.modality,
    loadKind: item.loadKind,
    basis: item.basis,
    category: item.category,
  } as Identity;
}
const uid = () => crypto.randomUUID();
export const emptyDraft = () => ({ weight: "", amount: "", rir: "" });
export function performance(
  e: z.infer<typeof Exercise>,
  extra = false,
): Performance {
  return {
    id: uid(),
    prescriptionExerciseId: extra ? null : e.id,
    identity: structuredClone(e.identity),
    name: e.name,
    origin: extra ? "added_exercise" : "prescribed",
    group: null,
    rows: e.sets.map((s) => ({
      id: s.id,
      plannedSetId: extra ? null : s.id,
      origin: extra ? "added_exercise" : "prescribed",
      draft: emptyDraft(),
      actual: null,
      confirmed: false,
      revision: 0,
      recordedAt: null,
    })),
  };
}
export function demoSession(
  program: string,
  slot: string | null = null,
): Session {
  const exercises = catalog.slice(0, 6).map((item) => ({
    id: uid(),
    name: item.name,
    identity: identity(item),
    sets: Array.from({ length: 3 }, () => ({
      id: uid(),
      target:
        item.modality === "time"
          ? "Synthetic duration — enter seconds"
          : "Synthetic reps — enter actual",
      suggested: null,
    })),
  }));
  return {
    id: uid(),
    prescription: {
      id: uid(),
      version: 1,
      program,
      phase: "synthetic",
      synthetic: true,
      exercises,
    },
    status: "planned",
    legacyStatus: null,
    legacyRevision: null,
    performedDate: null,
    slot,
    performances: exercises.map((e) => performance(e)),
    intervals: [],
    durationQuality: "known",
    correction: null,
    lastSeen: null,
  };
}
export function createModel(
  program: "foundation" | "strength" = "foundation",
): Model {
  const s = demoSession(program);
  return validate({
    schemaVersion: 3,
    id: uid(),
    subject: uid(),
    revision: 0,
    program,
    sessions: [s],
    slots: [],
    legacy: null,
    preferences: {
      rir: false,
      unit: "lb",
      timer: { preferredSeconds: 120, alert: "silent" },
    },
    timer: readyTimer(),
    view: { tab: "Workout", session: s.id, collapsed: {} },
    audit: [],
    receipts: {},
  });
}
export function valuesDraft(
  v: z.infer<typeof SetValues>,
): z.infer<typeof Draft> {
  return {
    weight: "value" in v.load ? String(v.load.value) : "",
    amount: String(v.reps ?? v.seconds ?? ""),
    rir: v.rir === null ? "" : String(v.rir),
  };
}
export function migrate(raw: unknown): Model {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "schemaVersion" in raw &&
    raw.schemaVersion === 3
  )
    return validate(raw);
  const old = validateLegacy(raw);
  const sessions: Session[] = old.sessions.map((s) => {
    const p = s.prescription;
    const eid = p.id + ":exercise";
    const ident: Identity = {
      id: p.variation,
      version: 1,
      variant: p.variation,
      equipment: ["Legacy equipment — as recorded"],
      modality: p.suggested.seconds === null ? "reps" : "time",
      loadKind: p.suggested.load.kind,
      basis:
        "basis" in p.suggested.load
          ? p.suggested.load.basis
          : "single_implement",
      unit:
        "unit" in p.suggested.load
          ? p.suggested.load.unit
          : old.preferences.unit,
      category: "Legacy",
    };
    const sets = Array.from({ length: p.setCount }, (_, i) => ({
      id: p.id + ":set:" + (i + 1),
      target: "Legacy pinned target " + p.low + "–" + p.high,
      suggested: structuredClone(p.suggested),
    }));
    const ex = { id: eid, name: p.variation, identity: ident, sets };
    const perf = performance(ex);
    perf.id = s.id + ":performance";
    perf.rows = sets.map((set, i) => {
      const a = s.actuals.find((a) => a.ordinal === i + 1);
      const d = old.drafts[s.id]?.[i + 1];
      return {
        id: a?.id ?? set.id,
        plannedSetId: set.id,
        origin: "prescribed",
        draft: d
          ? valuesDraft(d.values)
          : a
            ? valuesDraft(a.values)
            : emptyDraft(),
        actual: a ? structuredClone(a.values) : null,
        confirmed: a?.confirmed ?? false,
        revision: a?.revision ?? 0,
        recordedAt: null,
      };
    });
    return {
      id: s.id,
      prescription: {
        id: p.id,
        version: 1,
        program: p.programId,
        phase: p.phase,
        synthetic: true,
        exercises: [ex],
      },
      status:
        s.status === "active"
          ? "paused"
          : s.status === "completed"
            ? "finished_full"
            : "finished_partial",
      legacyStatus: s.status,
      legacyRevision: s.revision,
      performedDate: s.performedDate,
      slot: s.slot,
      performances: [perf],
      intervals: [],
      durationQuality: "unknown",
      correction: null,
      lastSeen: null,
    };
  });
  return validate({
    schemaVersion: 3,
    id: old.id,
    subject: old.subject,
    revision: old.revision,
    program: old.program,
    sessions,
    slots: structuredClone(old.slots),
    legacy: structuredClone(raw),
    preferences: structuredClone(old.preferences),
    timer: readyTimer(old.view.timer.selectedSeconds),
    view: {
      tab:
        old.view.tab === "Workout"
          ? "Workout"
          : old.view.tab === "Schedule"
            ? "Program"
            : "Progress",
      session: old.view.session,
      collapsed: {},
    },
    audit: [],
    receipts: {},
  });
}
export function summary(s: Session) {
  const planned = s.prescription.exercises.flatMap((e) =>
    e.sets.map((x) => x.id),
  );
  const rows = s.performances.flatMap((p) => p.rows);
  return {
    planned: planned.length,
    done: planned.filter((id) =>
      rows.some((r) => r.plannedSetId === id && r.confirmed),
    ).length,
    extras: rows.filter((r) => !r.plannedSetId && r.confirmed).length,
  };
}
export function validate(raw: unknown): Model {
  const d = Model.parse(raw);
  const ids = new Set<string>();
  const unique = (id: string) => {
    if (ids.has(id)) throw Error("Duplicate record identity");
    ids.add(id);
  };
  for (const s of d.sessions) {
    unique(s.id);
    const prescriptionIds = new Set<string>();
    for (const e of s.prescription.exercises) {
      if (prescriptionIds.has(e.id))
        throw Error("Duplicate prescribed exercise");
      prescriptionIds.add(e.id);
      const setIds = new Set(e.sets.map((a) => a.id));
      if (setIds.size !== e.sets.length) throw Error("Duplicate planned set");
    }
    const ps = new Set(
      s.prescription.exercises.flatMap((e) => e.sets.map((r) => r.id)),
    );
    const linked = new Set<string>();
    for (const p of s.performances) {
      unique(p.id);
      const prescribed = s.prescription.exercises.find(
        (e) => e.id === p.prescriptionExerciseId,
      );
      if (
        p.origin === "prescribed" &&
        (!prescribed ||
          JSON.stringify(prescribed.identity) !== JSON.stringify(p.identity))
      )
        throw Error("Invalid exercise prescription identity");

      for (const r of p.rows) {
        unique(r.id);
        if (
          r.actual &&
          ((p.identity.modality === "time") !== (r.actual.seconds !== null) ||
            r.actual.load.kind !== p.identity.loadKind)
        )
          throw Error("Actual values mismatch exercise modality/load");
        if (r.confirmed && !r.actual)
          throw Error("Confirmed row needs actual values");
        if (r.plannedSetId) {
          if (
            !ps.has(r.plannedSetId) ||
            linked.has(r.plannedSetId) ||
            !prescribed?.sets.some((a) => a.id === r.plannedSetId) ||
            p.origin !== "prescribed"
          )
            throw Error("Invalid prescription link");
          linked.add(r.plannedSetId);
        }
      }
    }
    const open = s.intervals.filter((i) => i.end === null);
    if (open.length !== (s.status === "active" ? 1 : 0))
      throw Error("Invalid active intervals");
    if (s.status === "finished_full" && summary(s).done !== summary(s).planned)
      throw Error("Incomplete prescription");
  }
  if (!d.sessions.some((s) => s.id === d.view.session))
    throw Error("Invalid selected session");
  return d;
}
