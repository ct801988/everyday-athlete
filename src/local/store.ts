import { validate, type Dataset } from "./model";
import {
  canonical,
  rejectConflicts,
  readBackup,
  safeParse,
  type Backup,
} from "./backup";
// Project paths share an origin on Pages. Namespace prevents accidental mixing;
// it is NOT an authorization boundary against other scripts on that origin.
const appBase = import.meta.env.BASE_URL;
export const DB_NAME =
  "everyday-athlete-local" + (appBase === "/" ? "" : "@" + appBase);
export const DB_VERSION = 2;
export type Meta = {
  active: string | null;
  previous: string | null;
  lastExport: { revision: number; dataset: string; at: string } | null;
};
export type Snapshot = { key: string; data: Dataset };
const empty = (): Meta => ({ active: null, previous: null, lastExport: null });
export async function openDB(name = DB_NAME) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const q = indexedDB.open(name, DB_VERSION);
    q.onupgradeneeded = () => {
      for (const n of ["datasets", "meta"])
        if (!q.result.objectStoreNames.contains(n))
          q.result.createObjectStore(n);
    };
    q.onerror = () =>
      reject(
        Error(
          "Device storage unavailable or unsupported future database version",
        ),
      );
    q.onblocked = () =>
      reject(Error("Close other app tabs to upgrade storage"));
    q.onsuccess = () => {
      q.result.onversionchange = () => q.result.close();
      resolve(q.result);
    };
  });
}
function request<T>(q: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    q.onsuccess = () => resolve(q.result);
    q.onerror = () => reject(q.error ?? Error("Storage request failed"));
  });
}
function completed(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(tx.error ?? Error("Device write aborted; not saved"));
    tx.onerror = () =>
      reject(tx.error ?? Error("Device write failed; not saved"));
  });
}
export class LocalStore {
  constructor(readonly name = DB_NAME) {}
  private async transaction<T>(
    mode: IDBTransactionMode,
    fn: (tx: IDBTransaction) => Promise<T>,
  ) {
    const db = await openDB(this.name);
    try {
      const tx = db.transaction(["datasets", "meta"], mode),
        done = completed(tx);
      try {
        const result = await fn(tx);
        await done;
        return result;
      } catch (e) {
        try {
          tx.abort();
        } catch {
          /* Already completed/aborted. */
        }
        await done.catch(() => {});
        throw e;
      }
    } finally {
      db.close();
    }
  }
  async preMigrationData(): Promise<unknown> {
    return this.transaction("readonly", async (tx) => {
      const info = await request(
        tx.objectStore("meta").get("preTimerMigration"),
      );
      if (!info?.key) throw Error("No pre-upgrade dataset retained");
      return request(tx.objectStore("datasets").get(info.key));
    });
  }
  async migrationInfo() {
    return this.transaction("readonly", (tx) =>
      request(tx.objectStore("meta").get("preTimerMigration")),
    );
  }
  async meta() {
    return this.transaction(
      "readonly",
      async (tx) =>
        ((await request(tx.objectStore("meta").get("state"))) as
          Meta | undefined) ?? empty(),
    );
  }
  async read(): Promise<Snapshot | null> {
    return this.transaction("readwrite", async (tx) => {
      const m =
        ((await request(tx.objectStore("meta").get("state"))) as
          Meta | undefined) ?? empty();
      if (!m.active) return null;
      const raw = await request(tx.objectStore("datasets").get(m.active));
      const data = validate(raw);
      if ((raw as { schemaVersion: number }).schemaVersion === 1) {
        const key = crypto.randomUUID();
        tx.objectStore("datasets").add(data, key);
        // Retain the exact old bytes plus the existing recovery pointer.
        tx.objectStore("meta").put(
          { key: m.active, previous: m.previous },
          "preTimerMigration",
        );
        tx.objectStore("meta").put(
          { ...m, active: key, previous: m.active, lastExport: null },
          "state",
        );
        return { key, data };
      }
      return { key: m.active, data };
    });
  }
  async create(data: Dataset) {
    const d = validate(data);
    return this.transaction("readwrite", async (tx) => {
      const m =
        ((await request(tx.objectStore("meta").get("state"))) as
          Meta | undefined) ?? empty();
      if (m.active)
        throw Error("Existing history: use validated restore instead");
      const key = crypto.randomUUID();
      tx.objectStore("datasets").add(d, key);
      tx.objectStore("meta").put({ ...m, active: key }, "state");
      return { key, data: d };
    });
  }
  async change(
    snapshot: Snapshot,
    action: string,
    payload: unknown,
    apply: (d: Dataset) => void,
    id = crypto.randomUUID(),
  ): Promise<Snapshot> {
    const fingerprint = canonical({ action, payload });
    return this.transaction("readwrite", async (tx) => {
      const m = (await request(tx.objectStore("meta").get("state"))) as Meta;
      if (m.active !== snapshot.key)
        throw Error("Active dataset changed; reload before editing");
      const d = validate(
        await request(tx.objectStore("datasets").get(m.active!)),
      );
      if (d.receipts[id]) {
        if (d.receipts[id] !== fingerprint)
          throw Error("Mutation ID payload mismatch");
        return { key: m.active!, data: d };
      }
      if (d.revision !== snapshot.data.revision)
        throw Error("Revision conflict: reload current device data");
      const capture = (v: Dataset) =>
        canonical({
          sessions: v.sessions,
          slots: v.slots,
          drafts: v.drafts,
          preferences: v.preferences,
          view: v.view,
          recommendations: v.recommendations,
        });
      const before = capture(d);
      apply(d);
      d.revision++;
      d.receipts[id] = fingerprint;
      d.audit.push({
        id: crypto.randomUUID(),
        revision: d.revision,
        time: new Date().toISOString(),
        action,
        before,
        after: capture(d),
      });
      validate(d);
      safeParse(
        JSON.stringify({
          body: {
            format: "everyday-athlete-backup",
            formatVersion: 1,
            appVersion: "0.3.0",
            exportId: crypto.randomUUID(),
            exportedAt: new Date().toISOString(),
            dataset: d,
          },
          checksum: "0".repeat(64),
        }),
      );
      tx.objectStore("datasets").put(d, m.active!);
      return { key: m.active!, data: d };
    });
  }
  async markExport(snapshot: Snapshot) {
    return this.transaction("readwrite", async (tx) => {
      const m = (await request(tx.objectStore("meta").get("state"))) as Meta;
      const d = validate(
        await request(tx.objectStore("datasets").get(m.active!)),
      );
      if (m.active !== snapshot.key || d.revision !== snapshot.data.revision)
        throw Error(
          "Data changed during export; export again before restoring",
        );
      m.lastExport = {
        dataset: d.id,
        revision: d.revision,
        at: new Date().toISOString(),
      };
      tx.objectStore("meta").put(m, "state");
    });
  }
  async restore(b: Backup, expected: Snapshot | null, ack: boolean) {
    b = await readBackup(JSON.stringify(b));
    return this.transaction("readwrite", async (tx) => {
      const m =
        ((await request(tx.objectStore("meta").get("state"))) as
          Meta | undefined) ?? empty();
      if ((expected?.key ?? null) !== m.active)
        throw Error("Active data changed during preview");
      const incoming = validate(b.body.dataset);
      if (m.active) {
        const current = validate(
          await request(tx.objectStore("datasets").get(m.active)),
        );
        if (current.revision !== expected!.data.revision)
          throw Error("New edits during preview; validate again");
        if (canonical(current) === canonical(incoming))
          return { key: m.active, data: current };
        rejectConflicts(current, incoming);
        if (!ack) throw Error("Acknowledge replacing the active workspace");
        if (
          m.lastExport?.dataset !== current.id ||
          m.lastExport.revision !== current.revision
        )
          throw Error("Export current data before restore");
      }
      const key = crypto.randomUUID();
      tx.objectStore("datasets").add(incoming, key);
      tx.objectStore("meta").put(
        { active: key, previous: m.active, lastExport: null },
        "state",
      );
      return { key, data: incoming };
    });
  }
  async rollback(expected: Snapshot) {
    return this.transaction("readwrite", async (tx) => {
      const m = (await request(tx.objectStore("meta").get("state"))) as Meta;
      const d = validate(
        await request(tx.objectStore("datasets").get(m.active!)),
      );
      if (m.active !== expected.key || d.revision !== expected.data.revision)
        throw Error("Revision conflict");
      if (!m.previous) throw Error("No pre-restore dataset");
      if (
        m.lastExport?.dataset !== d.id ||
        m.lastExport.revision !== d.revision
      )
        throw Error("Export current data before rollback");
      const key = m.previous,
        prior = validate(await request(tx.objectStore("datasets").get(key)));
      tx.objectStore("meta").put(
        { ...m, active: key, previous: m.active, lastExport: null },
        "state",
      );
      return { key, data: prior };
    });
  }
}
export const store = new LocalStore();
