import { it, expect } from "vitest";
import { createModel, validate, summary } from "../../src/m1/model";
import { record, lifecycle, undo } from "../../src/m1/actions";
import { makeLegacyBackup, MAX_BYTES, digest } from "../../src/local/backup";
import { createDataset } from "../../src/local/model";
import { parseBackup, exportBackup } from "../../src/m1/storage";
it("v1 backup signature is verified before migration", async () => {
  const d = createDataset("foundation", "2026-10-19", [1, 3, 5]);
  const raw = {
    ...d,
    schemaVersion: 1,
    preferences: { rir: false, unit: "lb" },
    view: { ...d.view, timer: { deadline: null, paused: 120 } },
  };
  const b = await makeLegacyBackup(raw);
  expect((await parseBackup(JSON.stringify(b))).legacy).toEqual(raw);
});
it("future schema, duplicate JSON keys, depth and byte limits fail closed", async () => {
  await expect(parseBackup('{"body":{},"body":{}}')).rejects.toThrow();
  await expect(parseBackup(" ".repeat(MAX_BYTES + 1))).rejects.toThrow();
  await expect(
    parseBackup("[".repeat(40) + "0" + "]".repeat(40)),
  ).rejects.toThrow();
  const b = await exportBackup(createModel());
  const future = { ...b.body, version: 4 };
  await expect(
    parseBackup(
      JSON.stringify({ body: future, checksum: await digest(future) }),
    ),
  ).rejects.toThrow("future");
});
it("maximum schema history still respects the existing backup node budget", async () => {
  const d = createModel();
  const base = d.sessions[0];
  d.sessions = Array.from({ length: 1000 }, () => {
    const s = structuredClone(base);
    s.id = crypto.randomUUID();
    s.prescription.id = crypto.randomUUID();
    for (const p of s.performances) {
      p.id = crypto.randomUUID();
      for (const r of p.rows) r.id = crypto.randomUUID();
    }
    return s;
  });
  d.view.session = d.sessions[0].id;
  expect(validate(d).sessions).toHaveLength(1000);
  await expect(exportBackup(d)).rejects.toThrow(/limit|MiB/);
});
it("prescribed full completion ignores extras, and undo recomputes finished state", () => {
  const d = createModel(),
    s = d.sessions[0];
  lifecycle(d, s, "begin", 1000);
  for (const p of s.performances)
    for (const r of p.rows) {
      r.draft = {
        weight: p.identity.loadKind === "external" ? "10" : "",
        amount: "8",
        rir: "",
      };
      record(s, p, r, 1100);
    }
  lifecycle(d, s, "finish", 1200);
  expect(s.status).toBe("finished_full");
  expect(summary(s).done).toBe(18);
  undo(s, s.performances[0].rows[0]);
  expect(s.status).toBe("finished_partial");
  expect(s.intervals[0].end).toBe(1200);
});
