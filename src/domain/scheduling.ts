import { z } from "zod";
export const ScheduleRequest = z
  .object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    weekdays: z.array(z.number().int().min(0).max(6)),
    days: z.number().int().min(1).max(7),
    count: z.number().int().min(1).max(200),
    minimumGapDays: z.number().int().min(1).max(7),
    timezone: z.string().min(1),
  })
  .strict();
export type Slot = {
  id: string;
  ordinal: number;
  originalDate: string;
  plannedDate: string;
  status: "pending" | "completed" | "partial" | "skipped";
  revision: number;
};
const day = (s: string) => {
  const d = new Date(s + "T12:00:00Z");
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== s)
    throw Error("Invalid calendar date");
  return d;
};
const date = (d: Date) => d.toISOString().slice(0, 10);
const plus = (s: string, n: number) => {
  const d = day(s);
  d.setUTCDate(d.getUTCDate() + n);
  return date(d);
};
export function schedule(raw: z.input<typeof ScheduleRequest>): Slot[] {
  const q = ScheduleRequest.parse(raw);
  new Intl.DateTimeFormat("en", { timeZone: q.timezone });
  if (new Set(q.weekdays).size !== q.days || q.weekdays.length !== q.days)
    throw Error("Select exactly the program frequency of distinct weekdays");
  day(q.start);
  const sorted = [...q.weekdays].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    const gap = (sorted[(i + 1) % sorted.length] - sorted[i] + 7) % 7 || 7;
    if (gap < q.minimumGapDays)
      throw Error(
        "Preferred days conflict with the synthetic recovery constraint",
      );
  }
  const slots: Slot[] = [];
  let cursor = q.start;
  for (
    let checked = 0;
    slots.length < q.count && checked < 1500;
    checked++, cursor = plus(cursor, 1)
  ) {
    if (q.weekdays.includes(day(cursor).getUTCDay()))
      slots.push({
        id: "slot-" + (slots.length + 1),
        ordinal: slots.length + 1,
        originalDate: cursor,
        plannedDate: cursor,
        status: "pending",
        revision: 0,
      });
  }
  if (slots.length !== q.count) throw Error("Unable to place all sessions");
  return slots;
}
export function reschedule(
  slots: Slot[],
  id: string,
  newDate: string,
  minGap: number,
  expectedRevision: number,
  preferredDays?: number[],
) {
  const idx = slots.findIndex((s) => s.id === id);
  if (idx < 0) throw Error("Unknown slot");
  const slot = slots[idx];
  if (slot.status === "completed")
    throw Error("Completed history is immutable");
  if (slot.revision !== expectedRevision)
    throw Error("Schedule revision conflict");
  day(newDate);
  if (idx && newDate < plus(slots[idx - 1].plannedDate, minGap))
    throw Error("Recovery or sequence conflict");
  const copy = structuredClone(slots);
  copy[idx] = { ...slot, plannedDate: newDate, revision: slot.revision + 1 };
  for (let i = idx + 1; i < copy.length; i++) {
    const earliest = plus(copy[i - 1].plannedDate, minGap);
    if (copy[i].plannedDate < earliest) {
      if (copy[i].status === "completed")
        throw Error("Would change completed history");
      let next = earliest;
      for (
        let n = 0;
        preferredDays?.length &&
        !preferredDays.includes(day(next).getUTCDay()) &&
        n < 7;
        n++
      )
        next = plus(next, 1);
      copy[i] = {
        ...copy[i],
        plannedDate: next,
        revision: copy[i].revision + 1,
      };
    }
  }
  return copy;
}
