import { z } from "zod";
export const UUID = z.string().uuid();
export const Load = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("external"),
      value: z.number().finite().nonnegative(),
      unit: z.enum(["lb", "kg"]),
      basis: z.enum([
        "total_bar",
        "per_dumbbell",
        "single_implement",
        "machine_stack",
      ]),
    })
    .strict(),
  z.object({ kind: z.enum(["bodyweight", "none"]) }).strict(),
  z
    .object({
      kind: z.enum(["assisted", "added_bodyweight"]),
      value: z.number().finite().nonnegative(),
      unit: z.enum(["lb", "kg"]),
      basis: z.literal("single_implement"),
    })
    .strict(),
]);
export const SetValues = z
  .object({
    load: Load,
    reps: z.number().int().positive().max(999).nullable(),
    seconds: z.number().positive().max(86400).nullable(),
    rir: z.number().int().min(0).max(5).nullable(),
    rirCapped: z.boolean().default(false),
  })
  .strict()
  .superRefine((s, c) => {
    if ((s.reps === null) === (s.seconds === null))
      c.addIssue({
        code: "custom",
        message: "Exactly one of reps or seconds is required",
      });
    if (s.rirCapped && s.rir !== 5)
      c.addIssue({ code: "custom", message: "Only RIR 5 may mean 5+" });
  });
export type SetValues = z.infer<typeof SetValues>;
export const EffortTarget = z
  .object({
    min: z.number().int().min(1).max(10),
    max: z.number().int().min(1).max(10),
    scale: z.string().min(1),
    scaleVersion: z.number().int().positive(),
    descriptor: z.string(),
    feel: z.string(),
  })
  .strict()
  .refine((t) => t.min <= t.max, "Reversed effort range");
export type EffortTarget = z.infer<typeof EffortTarget>;
export const EffortReport = z
  .object({
    value: z.number().int().min(1).max(10).nullable(),
    scale: z.string().min(1),
    scaleVersion: z.number().int().positive(),
  })
  .strict();
export type EffortReport = z.infer<typeof EffortReport>;
export const Prescription = z
  .object({
    id: UUID,
    modality: z.enum(["strength", "conditioning"]),
    programId: z.string(),
    programVersion: z.number().int().positive(),
    sessionTemplateVersion: z.number().int().positive(),
    phase: z.enum(["normal", "recovery", "benchmark"]),
    variation: z.string(),
    protocol: z.string(),
    setCount: z.number().int().positive(),
    low: z.number().int().positive(),
    high: z.number().int().positive(),
    suggested: SetValues,
    effortTarget: EffortTarget.nullable(),
    synthetic: z.literal(true),
  })
  .strict()
  .refine((p) => p.low <= p.high, "Invalid rep range");
export type Prescription = z.infer<typeof Prescription>;
export type ActualSet = {
  id: string;
  session_id: string;
  ordinal: number;
  revision: number;
  confirmed: boolean;
  values: SetValues;
};
export type Session = {
  id: string;
  prescription: Prescription;
  status: "active" | "partial" | "completed";
  revision: number;
  actuals: ActualSet[];
  effort: EffortReport | null;
  effortRevision: number;
};
export const SetMutation = z
  .object({
    type: z.literal("sets"),
    items: z
      .array(
        z
          .object({
            id: UUID,
            ordinal: z.number().int().min(1),
            expectedRevision: z.number().int().nonnegative(),
            confirmed: z.boolean(),
            values: SetValues,
          })
          .strict(),
      )
      .min(1)
      .max(20),
  })
  .strict();
export const Mutation = z.discriminatedUnion("type", [
  SetMutation,
  z
    .object({
      type: z.literal("effort"),
      expectedRevision: z.number().int().nonnegative(),
      report: EffortReport,
    })
    .strict(),
  z
    .object({
      type: z.literal("reopen"),
      expectedRevision: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      type: z.literal("finish"),
      expectedRevision: z.number().int().nonnegative(),
      status: z.enum(["partial", "completed"]),
    })
    .strict(),
]);
export type Mutation = z.infer<typeof Mutation>;
export const MutationEnvelope = z
  .object({ id: UUID, sessionId: UUID, payload: Mutation })
  .strict();
export type MutationEnvelope = z.infer<typeof MutationEnvelope>;
export const Programs = [
  { id: "foundation", name: "Everyday Foundation", days: 3 },
  { id: "strength", name: "Everyday Strength", days: 4 },
  { id: "fit", name: "Everyday Fit", days: 3, provisional: true },
] as const;
export function csvCell(v: unknown) {
  const s =
    v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return (
    '"' + (/^[=+\-@\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"'
  );
}
export const ExerciseVersion = z
  .object({
    id: z.string(),
    version: z.number().int().positive(),
    name: z.string(),
    mediaState: z.literal("placeholder"),
    synthetic: z.literal(true),
  })
  .strict();
export const EvidenceReference = z
  .object({
    id: z.string(),
    sourceVersion: z.number().int().positive(),
    url: z.string().url(),
    status: z.enum(["candidate", "reviewed"]),
    reviewer: z.string().nullable(),
    limits: z.string(),
  })
  .strict();
export const RuleVersion = z
  .object({
    id: z.string(),
    version: z.string(),
    status: z.literal("synthetic_test_only"),
    evidence: z.array(EvidenceReference),
    parameters: z.record(z.string(), z.number()),
  })
  .strict();
