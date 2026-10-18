import type { Session, SetValues, MutationEnvelope } from "../domain/contracts";
export async function api<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch("/api/" + url, {
    credentials: "same-origin",
    ...(body === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Request failed");
  return json as T;
}
export type DraftRow = { id: string; values: SetValues; edited: boolean };
export type DeviceState = {
  userId: string;
  sessionId: string;
  drafts: Record<number, DraftRow>;
  pending: MutationEnvelope[];
  timer: { deadline: number | null; paused: number };
  trackRir: boolean;
  snapshot: Session;
};
async function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("everyday-athlete-foundation", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(Error("Device storage unavailable"));
  });
}
export async function saveDevice(state: DeviceState) {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      tx.objectStore("drafts").put(state, state.userId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(Error("Device storage write failed"));
      tx.onabort = () => reject(Error("Device storage write aborted"));
    });
  } finally {
    db.close();
  }
}
export async function loadDevice(user: string): Promise<DeviceState | null> {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("drafts");
      const q = tx.objectStore("drafts").get(user);
      q.onsuccess = () => resolve(q.result ?? null);
      q.onerror = () => reject(Error("Device draft read failed"));
    });
  } finally {
    db.close();
  }
}
export function initialDevice(userId: string, s: Session): DeviceState {
  return {
    userId,
    sessionId: s.id,
    drafts: Object.fromEntries(
      [1, 2, 3].map((n) => [
        n,
        {
          id: s.actuals.find((a) => a.ordinal === n)?.id ?? crypto.randomUUID(),
          values:
            s.actuals.find((a) => a.ordinal === n)?.values ??
            structuredClone(s.prescription.suggested),
          edited: false,
        },
      ]),
    ),
    pending: [],
    timer: { deadline: null, paused: 0 },
    trackRir: false,
    snapshot: s,
  };
}
