import { z } from "zod";
import { lifecycle, record, undo, rowValues } from "./actions";
import * as db from "./storage";
import { Draft, type Model } from "./model";

// Small synchronous intent, not a second workout database. Removed only after
// IndexedDB commit. Receipts make a crash between commit and removal harmless.
const Intent = z
  .object({
    id: z.string().uuid(),
    dataset: z.string(),
    session: z.string(),
    action: z.enum([
      "begin",
      "resume",
      "pause",
      "finish",
      "edit-draft",
      "record-set",
      "undo-set",
      "weight-display-unit",
    ]),
    at: z.number().finite(),
    order: z.number().finite(),
    details: z
      .object({
        performance: z.string().optional(),
        row: z.string().optional(),
        draft: Draft.optional(),
        unit: z.enum(["lb", "kg"]).optional(),
      })
      .strict(),
    revision: z.number().int().nonnegative(),
  })
  .strict();
export type Intent = z.infer<typeof Intent>;
const prefix = () => `ea-m1-lifecycle:${db.DB_NAME}:`;
export function rawIntents() {
  const out: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (key.startsWith(prefix())) out[key] = localStorage.getItem(key);
  }
  return out;
}
let lastOrder = 0;
export function prepareIntent(
  model: Model,
  session: string,
  action: Intent["action"],
  details: Intent["details"] = {},
): Intent {
  const intent: Intent = {
    id: crypto.randomUUID(),
    dataset: model.id,
    session,
    action,
    at: Date.now(),
    order: (lastOrder = Math.max(Date.now(), lastOrder + 0.01)),
    details,
    revision: model.revision,
  };
  Intent.parse(intent);
  if (action === "record-set") {
    const s = model.sessions.find((s) => s.id === session),
      p = s?.performances.find((p) => p.id === details.performance),
      r = p?.rows.find((r) => r.id === details.row);
    if (!p || !r) throw Error("Set unavailable");
    rowValues(p, { ...r, draft: details.draft ?? r.draft }, model);
  }
  localStorage.setItem(
    prefix() + intent.id,
    JSON.stringify(Intent.parse(intent)),
  );
  return intent;
}
export function applyIntent(model: Model, intent: Intent) {
  if (model.id !== intent.dataset || model.revision < intent.revision)
    throw Error(
      "Pending workout action belongs to different records. Export recovery records before continuing.",
    );
  const session = model.sessions.find((s) => s.id === intent.session);
  if (!session)
    throw Error("Pending workout unavailable; original records retained.");
  if (intent.action === "weight-display-unit") {
    if (!intent.details.unit) throw Error("Missing weight unit");
    model.preferences.unit = intent.details.unit;
    return;
  }
  if (
    intent.action === "edit-draft" ||
    intent.action === "record-set" ||
    intent.action === "undo-set"
  ) {
    const p = session.performances.find(
        (p) => p.id === intent.details.performance,
      ),
      row = p?.rows.find((r) => r.id === intent.details.row);
    if (!p || !row)
      throw Error("Pending set unavailable; original records retained.");
    if (intent.action === "edit-draft") {
      if (!intent.details.draft) throw Error("Missing draft");
      row.draft = structuredClone(intent.details.draft);
    } else if (intent.action === "record-set") {
      if (intent.details.draft)
        row.draft = structuredClone(intent.details.draft);
      record(session, p, row, intent.at, model);
    } else undo(session, row);
    return;
  }
  lifecycle(
    model,
    session,
    intent.action,
    intent.at,
    intent.action === "finish",
  );
}
export function forgetIntent(intent: Intent) {
  localStorage.removeItem(prefix() + intent.id);
}
export async function recoverIntents(initial: Model): Promise<Model> {
  let model = initial;
  const intents: Intent[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (key.startsWith(prefix()))
      intents.push(Intent.parse(JSON.parse(localStorage.getItem(key)!)));
  }
  for (const intent of intents.sort((a, b) => a.order - b.order)) {
    model = await db.change(
      model,
      "lifecycle-intent",
      intent,
      (x) => applyIntent(x, intent),
      intent.id,
    );
    forgetIntent(intent);
  }
  return model;
}
