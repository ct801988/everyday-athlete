import { z } from "zod";
export const Duration = z
  .number()
  .int()
  .min(5)
  .max(3600)
  .refine((v) => v % 5 === 0, "Use five-second increments");
export const TimerPreferences = z
  .object({
    preferredSeconds: Duration,
    alert: z.enum(["silent", "short-beep"]),
  })
  .strict();
// Selected, preferred and prescribed durations are independent. No prescribed rest
// exists in the current synthetic fixtures; recommendations must remain unknown.
export const Timer = z
  .object({
    selectedSeconds: Duration,
    status: z.enum(["ready", "running"]),
    runId: z.string().uuid().nullable(),
    deadline: z.number().finite().nullable(),
    completedRunId: z.string().uuid().nullable(),
    completedAt: z.number().finite().nullable(),
  })
  .strict()
  .superRefine((t, c) => {
    if (
      (t.status === "running") !== (t.deadline !== null && t.runId !== null) ||
      (t.status === "ready" && (t.deadline !== null || t.runId !== null))
    )
      c.addIssue({ code: "custom", message: "Invalid timer state" });
    if ((t.completedRunId === null) !== (t.completedAt === null))
      c.addIssue({ code: "custom", message: "Invalid completion claim" });
  });
export type Timer = z.infer<typeof Timer>;
export const readyTimer = (selectedSeconds = 120): Timer => ({
  selectedSeconds: Duration.parse(selectedSeconds),
  status: "ready",
  runId: null,
  deadline: null,
  completedRunId: null,
  completedAt: null,
});
export function startTimer(t: Timer, now: number, runId: string): Timer {
  if (t.status === "running") return t;
  return Timer.parse({
    ...readyTimer(t.selectedSeconds),
    status: "running",
    runId,
    deadline: now + t.selectedSeconds * 1000,
  });
}
export function finishTimer(t: Timer, runId: string, now: number): Timer {
  if (t.status !== "running" || t.runId !== runId || t.deadline! > now)
    return t;
  return {
    ...readyTimer(t.selectedSeconds),
    completedRunId: runId,
    completedAt: now,
  };
}
export function remaining(t: Timer, now: number) {
  return t.status === "running"
    ? Math.max(0, Math.ceil((t.deadline! - now) / 1000))
    : t.selectedSeconds;
}
export function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
