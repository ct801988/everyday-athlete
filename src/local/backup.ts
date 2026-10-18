import { z } from "zod";
import { Dataset, LegacyDataset, validate } from "./model";
export const MAX_BYTES = 20 * 1024 * 1024;
export function canonical(x: unknown): string {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return "[" + x.map(canonical).join(",") + "]";
  return (
    "{" +
    Object.keys(x)
      .sort()
      .map(
        (k) =>
          JSON.stringify(k) +
          ":" +
          canonical((x as Record<string, unknown>)[k]),
      )
      .join(",") +
    "}"
  );
}
export async function digest(x: unknown) {
  const b = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical(x)),
  );
  return Array.from(new Uint8Array(b), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}
// Scan JSON before parsing: duplicate keys are otherwise silently overwritten by JSON.parse.
export function safeParse(text: string): unknown {
  if (new TextEncoder().encode(text).length > MAX_BYTES)
    throw Error("Backup exceeds 20 MiB");
  let i = 0,
    nodes = 0;
  const ws = () => {
    while (/\s/.test(text[i] ?? "") && i < text.length) i++;
  };
  const str = () => {
    const begin = i++;
    while (i < text.length) {
      if (text[i] === "\\") {
        i += 2;
        continue;
      }
      if (text[i++] === '"') return JSON.parse(text.slice(begin, i)) as string;
    }
    throw Error("Unterminated string");
  };
  const walk = (depth: number) => {
    if (depth > 32 || ++nodes > 100000)
      throw Error("Backup depth/record limit");
    ws();
    const c = text[i++];
    if (c === "{") {
      ws();
      const keys = new Set();
      if (text[i] === "}") {
        i++;
        return;
      }
      for (;;) {
        ws();
        if (text[i] !== '"') throw Error("Invalid object");
        const k = str();
        if (
          keys.has(k) ||
          ["__proto__", "constructor", "prototype"].includes(k)
        )
          throw Error("Duplicate or unsafe object key");
        keys.add(k);
        ws();
        if (text[i++] !== ":") throw Error("Invalid object");
        walk(depth + 1);
        ws();
        const end = text[i++];
        if (end === "}") return;
        if (end !== ",") throw Error("Invalid object");
      }
    } else if (c === "[") {
      ws();
      if (text[i] === "]") {
        i++;
        return;
      }
      for (;;) {
        walk(depth + 1);
        ws();
        const end = text[i++];
        if (end === "]") return;
        if (end !== ",") throw Error("Invalid array");
      }
    } else if (c === '"') {
      i--;
      str();
    } else {
      i--;
      const m =
        /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
          text.slice(i),
        );
      if (!m) throw Error("Invalid JSON value");
      i += m[0].length;
    }
  };
  walk(0);
  ws();
  if (i !== text.length) throw Error("Trailing JSON");
  return JSON.parse(text);
}
const Body = z
  .object({
    format: z.literal("everyday-athlete-backup"),
    formatVersion: z.literal(1),
    appVersion: z.enum(["0.3.0", "0.4.0-candidate"]),
    exportId: z.string().uuid(),
    exportedAt: z.string().datetime(),
    dataset: Dataset,
  })
  .strict();
const LegacyBody = Body.extend({ dataset: LegacyDataset });
const Envelope = z
  .object({ body: Body, checksum: z.string().regex(/^[a-f0-9]{64}$/) })
  .strict();
export type Backup = z.infer<typeof Envelope>;
export async function makeBackup(d: Dataset): Promise<Backup> {
  const body = Body.parse({
    format: "everyday-athlete-backup",
    formatVersion: 1,
    appVersion: "0.4.0-candidate",
    exportId: crypto.randomUUID(),
    exportedAt: new Date().toISOString(),
    dataset: validate(d),
  });
  const result = Envelope.parse({ body, checksum: await digest(body) });
  safeParse(JSON.stringify(result));
  return result;
}
export async function makeLegacyBackup(raw: unknown) {
  const body = LegacyBody.parse({
    format: "everyday-athlete-backup",
    formatVersion: 1,
    appVersion: "0.3.0",
    exportId: crypto.randomUUID(),
    exportedAt: new Date().toISOString(),
    dataset: LegacyDataset.parse(raw),
  });
  const result = { body, checksum: await digest(body) };
  safeParse(JSON.stringify(result));
  return result;
}
export async function readBackup(text: string): Promise<Backup> {
  const x = z
    .object({
      body: z.union([Body, LegacyBody]),
      checksum: z.string().regex(/^[a-f0-9]{64}$/),
    })
    .strict()
    .parse(safeParse(text));
  if ((await digest(x.body)) !== x.checksum)
    throw Error("Backup checksum mismatch");
  const dataset = validate(x.body.dataset);
  // Verify the original signed body before normalization. Re-hash the staged
  // representation so restore's second validation remains meaningful.
  const body = { ...x.body, dataset };
  return { body, checksum: await digest(body) };
}
export function rejectConflicts(a: Dataset, b: Dataset) {
  if (a.id !== b.id) return;
  if (a.subject !== b.subject) throw Error("Conflicting subject identity");
  if (a.revision === b.revision && canonical(a) !== canonical(b))
    throw Error("Conflicting dataset revision");
  for (const s of b.sessions) {
    const old = a.sessions.find((x) => x.id === s.id);
    if (!old) continue;
    if (canonical(s.prescription) !== canonical(old.prescription))
      throw Error("Conflicting pinned prescription");
    for (const row of s.actuals) {
      const prior = old.actuals.find((x) => x.id === row.id);
      if (prior && prior.ordinal !== row.ordinal)
        throw Error("Conflicting actual identity");
      if (
        prior &&
        prior.revision === row.revision &&
        canonical(prior) !== canonical(row)
      )
        throw Error("Conflicting actual revision");
    }
  }
}
