import {
  SetValues,
  type Mutation,
  Mutation as ValidateMutation,
} from "../domain/contracts";
import { reschedule } from "../domain/scheduling";
import { recommend, type Exposure } from "../domain/coaching";
import type { Dataset } from "./model";
export function mutate(d: Dataset, sid: string, raw: Mutation) {
  const m = ValidateMutation.parse(raw),
    s = d.sessions.find((s) => s.id === sid);
  if (!s) throw Error("Unknown session");
  if (m.type === "sets") {
    if (s.status !== "active") throw Error("Reopen before correction");
    const ord = new Set();
    for (const item of m.items) {
      if (ord.has(item.ordinal) || item.ordinal > s.prescription.setCount)
        throw Error("Invalid set ordinal");
      ord.add(item.ordinal);
      const old = s.actuals.find((a) => a.ordinal === item.ordinal);
      if (
        (old?.revision ?? 0) !== item.expectedRevision ||
        (old && old.id !== item.id)
      )
        throw Error("Set revision conflict");
      if (
        d.sessions.some(
          (other) =>
            other.id !== s.id && other.actuals.some((a) => a.id === item.id),
        )
      )
        throw Error("Cross-session actual ID");
      const row = {
        id: item.id,
        ordinal: item.ordinal,
        revision: item.expectedRevision + 1,
        confirmed: item.confirmed,
        values: SetValues.parse(item.values),
      };
      if (old) s.actuals[s.actuals.indexOf(old)] = row;
      else s.actuals.push(row);
      d.drafts[sid] ??= {};
      d.drafts[sid][item.ordinal] = { values: row.values };
    }
  } else if (m.type === "effort") {
    if (s.prescription.modality !== "conditioning")
      throw Error("Conditioning session required");
    if (s.effortRevision !== m.expectedRevision)
      throw Error("Effort revision conflict");
    s.effort = m.report;
    s.effortRevision++;
  } else {
    if (s.revision !== m.expectedRevision)
      throw Error("Session revision conflict");
    if (m.type === "finish") {
      if (
        m.status === "completed" &&
        s.actuals.filter((a) => a.confirmed).length !== s.prescription.setCount
      )
        throw Error("Complete all performed sets first");
      s.status = m.status;
      s.performedDate ??= new Intl.DateTimeFormat("en-CA", {
        timeZone: d.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const slot = d.slots.find((x) => x.id === s.slot);
      if (slot) slot.status = m.status;
    } else {
      s.status = "active";
      const slot = d.slots.find((x) => x.id === s.slot);
      if (slot) slot.status = "pending";
    }
  }
  s.revision++;
}
export function move(d: Dataset, id: string, date: string) {
  const s = d.slots.find((s) => s.id === id);
  if (!s) throw Error("Unknown slot");
  d.slots = reschedule(d.slots, id, date, 1, s.revision, d.weekdays);
}
export function coaching(d: Dataset, sid: string, pain = false, tired = false) {
  const current = d.sessions.find((s) => s.id === sid)!;
  const history: Exposure[] = d.sessions
    .filter((s) => s.id !== sid && s.performedDate)
    .map((s) => ({
      id: s.id,
      variation: s.prescription.variation,
      protocol: s.prescription.protocol,
      phase: s.prescription.phase,
      complete: s.status === "completed",
      daysAgo: Math.max(
        0,
        Math.floor(
          (Date.now() - +new Date(s.performedDate! + "T12:00:00Z")) / 86400000,
        ),
      ),
      pain: s.context.pain,
      values: s.actuals
        .filter((a) => a.confirmed)
        .sort((a, b) => a.ordinal - b.ordinal)
        .map((a) => a.values),
    }));
  const input = {
    prescription: current.prescription,
    history,
    pain,
    tired,
    increment: 2.5,
  };
  return {
    session: sid,
    input: JSON.stringify({ datasetRevision: d.revision, ...input }),
    output: JSON.stringify(recommend(input)),
  };
}
