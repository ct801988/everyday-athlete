import { DB_NAME as LEGACY_DB } from "../local/store";
import { canonical, digest, safeParse } from "../local/backup";
import { createModel, migrate, validate, type Model } from "./model";
export const DB_NAME = LEGACY_DB + "-m1";
const req = <T>(r: IDBRequest<T>) =>
  new Promise<T>((ok, no) => {
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  });
async function transact<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const open = indexedDB.open(DB_NAME, 1);
  open.onupgradeneeded = () => open.result.createObjectStore("workspaces");
  const db = await req(open);
  try {
    const tx = db.transaction("workspaces", mode);
    const done = new Promise<void>((ok, no) => {
      tx.oncomplete = () => ok();
      tx.onabort = tx.onerror = () =>
        no(tx.error ?? Error("Storage write aborted"));
    });
    try {
      const out = await fn(tx.objectStore("workspaces"));
      await done;
      return out;
    } catch (e) {
      try {
        tx.abort();
      } catch {
        /* already settled */
      }
      await done.catch(() => {});
      throw e;
    }
  } finally {
    db.close();
  }
}
export async function rawLegacy() {
  const q = indexedDB.open(LEGACY_DB);
  let created = false;
  q.onupgradeneeded = () => {
    created = true;
    q.transaction!.abort();
  };
  let db: IDBDatabase;
  try {
    db = await req(q);
  } catch (e) {
    if (created) return null;
    throw e;
  }
  try {
    if (!db.objectStoreNames.contains("meta")) return null;
    const tx = db.transaction(["meta", "datasets"], "readonly");
    const m = await req(tx.objectStore("meta").get("state"));
    return m?.active
      ? await req(tx.objectStore("datasets").get(m.active))
      : null;
  } finally {
    db.close();
  }
}
export async function read() {
  return transact("readonly", async (s) => {
    const key = await req(s.get("active"));
    if (!key) return null;
    return validate(await req(s.get(key)));
  });
}
export async function initialize(raw?: unknown) {
  const source = raw ?? (await rawLegacy());
  const d = source ? migrate(source) : createModel();
  safeParse(JSON.stringify(d));
  return transact("readwrite", async (s) => {
    const key = await req(s.get("active"));
    if (key) return validate(await req(s.get(key)));
    s.add(structuredClone(source ?? null), "legacy-original");
    s.add(d, d.id + ":initial");
    s.put(d.id + ":initial", "active");
    return d;
  });
}
export async function change(
  expected: Model,
  action: string,
  payload: unknown,
  apply: (d: Model) => void,
  id = crypto.randomUUID(),
): Promise<Model> {
  return transact("readwrite", async (s) => {
    const key = await req(s.get("active"));
    const d = validate(await req(s.get(key)));
    const fingerprint = canonical({ action, payload });
    if (d.receipts[id]) {
      if (d.receipts[id] !== fingerprint) throw Error("Mutation ID conflict");
      return d;
    }
    if (d.id !== expected.id || d.revision !== expected.revision)
      throw Error("Another tab changed records. Reload before editing.");
    const before = canonical(d.sessions);
    apply(d);
    d.revision++;
    d.receipts[id] = fingerprint;
    d.audit.push({
      id: crypto.randomUUID(),
      at: Date.now(),
      action,
      session: d.view.session,
      before,
      after: canonical(d.sessions),
    });
    validate(d);
    safeParse(JSON.stringify(d));
    s.put(d, key);
    return d;
  });
}
export async function exportBackup(d: Model) {
  validate(d);
  const body = { format: "everyday-athlete-m1", version: 3, dataset: d };
  const b = { body, checksum: await digest(body) };
  safeParse(JSON.stringify(b));
  return b;
}
export async function parseBackup(text: string): Promise<Model> {
  const x = safeParse(text) as {
    body?: { format?: string; version?: number; dataset?: unknown };
    checksum?: string;
  };
  if (!x.body || (await digest(x.body)) !== x.checksum)
    throw Error("Backup checksum mismatch");
  if (x.body.format === "everyday-athlete-m1") {
    if (x.body.version !== 3) throw Error("Unsupported future backup");
    return validate(x.body.dataset);
  }
  if (x.body.format === "everyday-athlete-backup")
    return migrate(x.body.dataset);
  throw Error("Unknown backup format");
}
export async function restore(
  expected: Model,
  incoming: Model,
  exportedRevision: number,
) {
  validate(incoming);
  safeParse(JSON.stringify(incoming));
  return transact("readwrite", async (s) => {
    const key = await req(s.get("active"));
    const current = validate(await req(s.get(key)));
    if (current.id !== expected.id || current.revision !== expected.revision)
      throw Error("Data changed after preview");
    if (canonical(current) === canonical(incoming)) return current;
    if (exportedRevision !== current.revision)
      throw Error("Export current records before restore");
    if (current.id === incoming.id && current.revision === incoming.revision)
      throw Error("Conflicting same-revision records");
    const next = crypto.randomUUID();
    s.add(incoming, next);
    s.put(key, "previous");
    s.put(next, "active");
    return incoming;
  });
}
export async function rollback(expected: Model, exportedRevision: number) {
  return transact("readwrite", async (s) => {
    const key = await req(s.get("active"));
    const d = validate(await req(s.get(key)));
    if (
      d.id !== expected.id ||
      d.revision !== expected.revision ||
      exportedRevision !== d.revision
    )
      throw Error("Export current records before rollback");
    const prev = await req(s.get("previous"));
    if (!prev) throw Error("No retained M1 workspace");
    const prior = validate(await req(s.get(prev)));
    s.put(key, "previous");
    s.put(prev, "active");
    return prior;
  });
}
