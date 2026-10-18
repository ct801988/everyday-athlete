import { describe, it, expect } from "vitest";
import { createDataset, validate } from "../../src/local/model";
import {
  makeBackup,
  readBackup,
  safeParse,
  rejectConflicts,
  canonical,
} from "../../src/local/backup";
import { mutate, coaching } from "../../src/local/commands";
function dataset() {
  return createDataset("foundation", "2026-10-19", [1, 3, 5]);
}
it("L04 correction/reopen preserves original performed date", () => {
  const d = dataset(),
    s = d.sessions[0];
  s.performedDate = "2026-01-01";
  mutate(d, s.id, { type: "finish", expectedRevision: 0, status: "partial" });
  mutate(d, s.id, { type: "reopen", expectedRevision: 1 });
  mutate(d, s.id, { type: "finish", expectedRevision: 2, status: "partial" });
  expect(s.performedDate).toBe("2026-01-01");
});
describe("L02–L05,L09,L13–15,L19–20,L24,L27,L29 local contracts", () => {
  it("Foundation3 and Strength4; Fit cannot be selected", () => {
    expect(dataset().slots).toHaveLength(3);
    expect(
      createDataset("strength", "2026-10-19", [1, 2, 4, 6]).slots,
    ).toHaveLength(4);
    expect(() =>
      createDataset("foundation", "2026-02-30", [1, 3, 5]),
    ).toThrow();
  });
  it("keeps suggestions distinct and missing effort/RIR unknown", () => {
    const d = dataset();
    expect(d.sessions[0].actuals).toEqual([]);
    expect(d.sessions[0].prescription.suggested.rir).toBeNull();
    expect(d.sessions.at(-1)!.effort).toBeNull();
  });
  it("validates deliberate actuals, revisions, completion and conditioning boundary", () => {
    const d = dataset(),
      s = d.sessions[0];
    expect(() =>
      mutate(d, s.id, {
        type: "finish",
        expectedRevision: 0,
        status: "completed",
      }),
    ).toThrow();
    expect(() =>
      mutate(d, s.id, {
        type: "effort",
        expectedRevision: 0,
        report: { value: 5, scale: "synthetic-effort", scaleVersion: 1 },
      }),
    ).toThrow();
    mutate(d, s.id, {
      type: "sets",
      items: [
        {
          id: crypto.randomUUID(),
          ordinal: 1,
          expectedRevision: 0,
          confirmed: true,
          values: s.prescription.suggested,
        },
      ],
    });
    expect(s.actuals).toHaveLength(1);
    expect(() =>
      mutate(d, s.id, {
        type: "sets",
        items: [{ ...s.actuals[0], expectedRevision: 0 }],
      }),
    ).toThrow();
  });
  it("rejects duplicate keys, unsafe object keys, depth, syntax and oversized files", () => {
    for (const s of [
      '{"a":1,"a":2}',
      '{"__proto__":1}',
      '{"a":',
      "[1,]",
      "1 trailing",
      "[".repeat(34) + "0" + "]".repeat(34),
      '"' + "x".repeat(20 * 1024 * 1024) + '"',
    ])
      expect(() => safeParse(s)).toThrow();
  });
  it("roundtrips strict versioned backup and rejects checksum/format/future schema", async () => {
    const d = dataset(),
      b = await makeBackup(d);
    expect((await readBackup(JSON.stringify(b))).body.dataset).toEqual(d);
    b.checksum = "a".repeat(64);
    await expect(readBackup(JSON.stringify(b))).rejects.toThrow();
    await expect(readBackup('{"body":{"formatVersion":99}}')).rejects.toThrow();
    expect(() => validate({ ...d, schemaVersion: 99 })).toThrow();
  });
  it("rejects duplicate record IDs and malicious canonical content", () => {
    const d = dataset();
    d.sessions[1].id = d.sessions[0].id;
    expect(() => validate(d)).toThrow();
    const other = dataset();
    other.sessions[0].prescription.variation = "https://evil.test/x";
    expect(() => validate(other)).toThrow();
  });
  it("rejects contradictory same-revision data but permits coherent whole older snapshot", () => {
    const a = dataset(),
      b = structuredClone(a);
    b.preferences.rir = true;
    expect(() => rejectConflicts(a, b)).toThrow();
    b.revision = 1;
    expect(() => rejectConflicts(a, b)).not.toThrow();
  });
  it("coaching deterministic and pain context takes precedence without inferring optional values", () => {
    const d = dataset();
    expect(coaching(d, d.view.session)).toEqual(coaching(d, d.view.session));
    expect(JSON.parse(coaching(d, d.view.session, true).output).rule).toBe(
      "R01",
    );
    expect(canonical({ b: 1, a: 2 })).toBe(canonical({ a: 2, b: 1 }));
  });
});
