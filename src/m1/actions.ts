import { SetValues } from "../domain/contracts";
import { readyTimer } from "../local/timer";
import {
  summary,
  type Model,
  type Session,
  type Performance,
  type Row,
} from "./model";
export const GAP = 2 * 60 * 60 * 1000;
export function elapsed(s: Session, now: number) {
  let ms = 0;
  let review = s.durationQuality !== "known";
  for (const i of s.intervals) {
    const end = i.end ?? now;
    if (s.correction && end <= s.correction.at) continue;
    if (end < i.start) {
      review = true;
      continue;
    }
    ms += end - Math.max(i.start, s.correction?.at ?? i.start);
  }
  return {
    seconds: (s.correction?.seconds ?? 0) + Math.floor(ms / 1000),
    review:
      review ||
      (s.status === "active" &&
        s.lastSeen !== null &&
        (now - s.lastSeen >= GAP || now < s.lastSeen)),
  };
}
export function lifecycle(
  d: Model,
  s: Session,
  action: "begin" | "resume" | "pause" | "finish",
  now: number,
  partial = false,
) {
  if (action === "begin" || action === "resume") {
    if (s.status !== (action === "begin" ? "planned" : "paused"))
      throw Error("Session changed; reload");
    s.intervals.push({ start: now, end: null });
    s.status = "active";
    s.lastSeen = now;
    return;
  }
  if (!["active", "paused", "planned"].includes(s.status))
    throw Error("Session already finished");
  if (action === "pause" && s.status !== "active")
    throw Error("Only an active workout can pause");
  if (action === "finish" && summary(s).done < summary(s).planned && !partial)
    throw Error("Finish as partial or continue");
  const open = s.intervals.find((i) => i.end === null);
  if (open) {
    open.end = now;
    if (now < open.start) s.durationQuality = "review";
  }
  if (action === "finish") {
    const n = summary(s);
    if (n.done < n.planned && !partial)
      throw Error("Finish as partial or continue");
    s.status = n.done === n.planned ? "finished_full" : "finished_partial";
    s.performedDate = new Date(now).toISOString().slice(0, 10);
  } else s.status = "paused";
  d.timer = readyTimer(d.timer.selectedSeconds);
  s.lastSeen = now;
}
export function rowValues(p: Performance, r: Row) {
  const amount = Number(r.draft.amount);
  if (!r.draft.amount.trim()) throw Error("Enter actual reps or seconds");
  const weight = Number(r.draft.weight);
  const external = ["external", "assisted", "added_bodyweight"].includes(
    p.identity.loadKind,
  );
  if (external && !r.draft.weight.trim()) throw Error("Enter actual weight");
  const load = external
    ? {
        kind: p.identity.loadKind,
        value: weight,
        unit: p.identity.unit,
        basis: p.identity.basis,
      }
    : { kind: p.identity.loadKind };
  return SetValues.parse({
    load,
    reps: p.identity.modality === "reps" ? amount : null,
    seconds: p.identity.modality === "time" ? amount : null,
    rir: r.draft.rir.trim() === "" ? null : Number(r.draft.rir),
    rirCapped: false,
  });
}
export function record(s: Session, p: Performance, r: Row, now: number) {
  if (!["active", "finished_full", "finished_partial"].includes(s.status))
    throw Error("Begin or resume workout before recording");
  r.actual = rowValues(p, r);
  r.confirmed = true;
  r.revision++;
  r.recordedAt = now;
  recompute(s);
}
export function undo(s: Session, r: Row) {
  r.confirmed = false;
  r.revision++;
  recompute(s);
}
export function recompute(s: Session) {
  if (s.status.startsWith("finished"))
    s.status =
      summary(s).done === summary(s).planned
        ? "finished_full"
        : "finished_partial";
}
export function comparable(d: Model, s: Session, p: Performance) {
  return d.sessions
    .filter((x) => x.id !== s.id && x.status.startsWith("finished"))
    .flatMap((x) =>
      x.performances
        .filter(
          (q) => JSON.stringify(q.identity) === JSON.stringify(p.identity),
        )
        .map((q) => ({ session: x, p: q })),
    )
    .filter((x) => x.p.rows.some((r) => r.confirmed))
    .sort((a, b) =>
      (b.session.performedDate ?? "").localeCompare(
        a.session.performedDate ?? "",
      ),
    )[0]
    ?.p.rows.filter((r) => r.confirmed)
    .map((r) => r.actual!);
}
