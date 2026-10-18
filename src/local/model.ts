import { z } from "zod";
import {
  Prescription,
  SetValues,
  EffortReport,
  UUID,
} from "../domain/contracts";
import {
  prescription,
  conditioningPrescription,
  canonicalExercise,
} from "../domain/fixtures";
import { schedule } from "../domain/scheduling";
import { Timer, TimerPreferences, readyTimer } from "./timer";
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(s + "T12:00:00Z");
    return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s;
  });
export const Row = z
  .object({
    id: UUID,
    ordinal: z.number().int().min(1).max(20),
    revision: z.number().int().nonnegative(),
    confirmed: z.boolean(),
    values: SetValues,
  })
  .strict();
export const LocalSession = z
  .object({
    id: UUID,
    slot: z.string().nullable(),
    prescription: Prescription,
    status: z.enum(["active", "partial", "completed"]),
    performedDate: date.nullable(),
    context: z.object({ pain: z.boolean(), tired: z.boolean() }).strict(),
    revision: z.number().int().nonnegative(),
    actuals: z.array(Row).max(20),
    effort: EffortReport.nullable(),
    effortRevision: z.number().int().nonnegative(),
  })
  .strict();
export type LocalSession = z.infer<typeof LocalSession>;
export const SlotSchema = z
  .object({
    id: z.string(),
    ordinal: z.number().int().positive(),
    originalDate: date,
    plannedDate: date,
    status: z.enum(["pending", "completed", "partial", "skipped"]),
    revision: z.number().int().nonnegative(),
  })
  .strict();
const Draft = z.object({ values: SetValues }).strict();
export const LegacyDataset = z
  .object({
    schemaVersion: z.literal(1),
    id: UUID,
    subject: UUID,
    revision: z.number().int().nonnegative(),
    program: z.enum(["foundation", "strength"]),
    start: date,
    timezone: z.string().refine((s) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: s });
        return true;
      } catch {
        return false;
      }
    }),
    weekdays: z.array(z.number().int().min(0).max(6)),
    slots: z.array(SlotSchema).max(200),
    sessions: z.array(LocalSession).max(1000),
    drafts: z.record(z.string(), z.record(z.string(), Draft)),
    preferences: z
      .object({ rir: z.boolean(), unit: z.enum(["lb", "kg"]) })
      .strict(),
    view: z
      .object({
        tab: z.enum(["Workout", "Schedule", "History", "Backup"]),
        session: UUID,
        timer: z
          .object({
            deadline: z.number().finite().nullable(),
            paused: z.number().finite().nonnegative(),
          })
          .strict(),
      })
      .strict(),
    audit: z
      .array(
        z
          .object({
            id: UUID,
            revision: z.number().int().positive(),
            time: z.string().datetime(),
            action: z.string().max(100),
            before: z.string().max(100000),
            after: z.string().max(100000),
          })
          .strict(),
      )
      .max(30000),
    receipts: z.record(z.string(), z.string().max(100000)),
    recommendations: z
      .array(
        z
          .object({ session: UUID, input: z.string(), output: z.string() })
          .strict(),
      )
      .max(1000),
    content: z
      .object({
        synthetic: z.literal(true),
        review: z.literal("not-reviewed"),
        exerciseId: z.literal("synthetic-db-press"),
        exerciseVersion: z.literal(1),
        ruleVersion: z.literal("foundation-rules-1.1"),
        evidence: z.tuple([z.literal("E01"), z.literal("E02")]),
      })
      .strict(),
  })
  .strict();
export const Dataset = LegacyDataset.extend({
  schemaVersion: z.literal(2),
  preferences: LegacyDataset.shape.preferences.extend({
    timer: TimerPreferences,
  }),
  view: LegacyDataset.shape.view.extend({ timer: Timer }),
}).strict();
export type Dataset = z.infer<typeof Dataset>;
export function normalize(raw: unknown): Dataset {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "schemaVersion" in raw &&
    raw.schemaVersion === 1
  ) {
    const old = LegacyDataset.parse(raw);
    const timer = readyTimer();
    // Paused timers never resume. Only a future running deadline is retained.
    if (
      old.view.timer.deadline !== null &&
      old.view.timer.deadline > Date.now()
    ) {
      timer.status = "running";
      timer.deadline = old.view.timer.deadline;
      // Deterministic identity makes repeated reads/imports of the same v1 equal.
      timer.runId = old.id;
    }
    return Dataset.parse({
      ...old,
      schemaVersion: 2,
      preferences: {
        ...old.preferences,
        timer: { preferredSeconds: 120, alert: "silent" },
      },
      view: { ...old.view, timer },
    });
  }
  return Dataset.parse(raw);
}
export function validate(raw: unknown): Dataset {
  const d = normalize(raw),
    ids = new Set<string>();
  const unique = (id: string) => {
    if (ids.has(id)) throw Error("Duplicate record ID");
    ids.add(id);
  };
  if (
    new Set(d.weekdays).size !== (d.program === "foundation" ? 3 : 4) ||
    d.weekdays.length !== new Set(d.weekdays).size
  )
    throw Error("Invalid program frequency");
  let previous = "";
  d.slots.forEach((s, i) => {
    unique(s.id);
    if (s.ordinal !== i + 1 || s.plannedDate < previous)
      throw Error("Invalid schedule sequence");
    previous = s.plannedDate;
  });
  for (const s of d.sessions) {
    unique(s.id);
    if (s.slot && !d.slots.some((x) => x.id === s.slot))
      throw Error("Dangling session slot");
    if (
      s.prescription.programId !== d.program &&
      s.prescription.modality === "strength"
    )
      throw Error("Program mismatch");
    if (
      s.prescription.variation !==
      (s.prescription.modality === "strength"
        ? canonicalExercise.id
        : "synthetic-walk")
    )
      throw Error("Unknown canonical content");
    if (s.prescription.modality === "strength" && s.effort)
      throw Error("Strength cannot contain conditioning effort");
    const ord = new Set();
    for (const a of s.actuals) {
      unique(a.id);
      if (
        ord.has(a.ordinal) ||
        a.ordinal > s.prescription.setCount ||
        a.revision < 1
      )
        throw Error("Invalid actual ordinal/revision");
      ord.add(a.ordinal);
    }
    if (
      s.status === "completed" &&
      s.actuals.filter((a) => a.confirmed).length !== s.prescription.setCount
    )
      throw Error("Incomplete performed records");
  }
  if (!d.sessions.some((s) => s.id === d.view.session))
    throw Error("Dangling active session");
  for (const [sid, rows] of Object.entries(d.drafts)) {
    const s = d.sessions.find((x) => x.id === sid);
    if (!s) throw Error("Dangling draft");
    for (const n of Object.keys(rows))
      if (!/^\d+$/.test(n) || +n < 1 || +n > s.prescription.setCount)
        throw Error("Invalid draft ordinal");
  }
  d.audit.forEach((a) => {
    unique(a.id);
    if (a.revision > d.revision) throw Error("Audit revision ahead");
  });
  for (const q of d.recommendations) {
    if (!d.sessions.some((s) => s.id === q.session))
      throw Error("Dangling coaching input");
    JSON.parse(q.input);
    JSON.parse(q.output);
  }
  return d;
}
export function createDataset(
  program: "foundation" | "strength",
  start: string,
  weekdays: number[],
): Dataset {
  const slots = schedule({
    start,
    weekdays,
    days: program === "foundation" ? 3 : 4,
    count: program === "foundation" ? 3 : 4,
    minimumGapDays: 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const sessions: LocalSession[] = slots.map((slot) => ({
    id: crypto.randomUUID(),
    slot: slot.id,
    prescription: {
      ...structuredClone(prescription),
      id: crypto.randomUUID(),
      programId: program,
    },
    status: "active",
    performedDate: null,
    context: { pain: false, tired: false },
    revision: 0,
    actuals: [],
    effort: null,
    effortRevision: 0,
  }));
  sessions.push({
    id: crypto.randomUUID(),
    slot: null,
    prescription: structuredClone(conditioningPrescription),
    status: "active",
    performedDate: null,
    context: { pain: false, tired: false },
    revision: 0,
    actuals: [],
    effort: null,
    effortRevision: 0,
  });
  return validate({
    schemaVersion: 2,
    id: crypto.randomUUID(),
    subject: crypto.randomUUID(),
    revision: 0,
    program,
    start,
    weekdays,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    slots,
    sessions,
    drafts: {},
    preferences: {
      rir: false,
      unit: "lb",
      timer: { preferredSeconds: 120, alert: "silent" },
    },
    view: {
      tab: "Workout",
      session: sessions[0].id,
      timer: readyTimer(),
    },
    audit: [],
    receipts: {},
    recommendations: [],
    content: {
      synthetic: true,
      review: "not-reviewed",
      exerciseId: "synthetic-db-press",
      exerciseVersion: 1,
      ruleVersion: "foundation-rules-1.1",
      evidence: ["E01", "E02"],
    },
  });
}
