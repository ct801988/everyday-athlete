import { it, expect } from "vitest";
import {
  Duration,
  Timer,
  readyTimer,
  startTimer,
  finishTimer,
  remaining,
  clock,
} from "../../src/local/timer";
import { createDataset, validate, LegacyDataset } from "../../src/local/model";
import { makeBackup, readBackup, digest } from "../../src/local/backup";
function legacy() {
  const d = createDataset("foundation", "2026-10-19", [1, 3, 5]);
  return LegacyDataset.parse({
    ...d,
    schemaVersion: 1,
    preferences: { rir: false, unit: "lb" },
    view: { ...d.view, timer: { deadline: null, paused: 30 } },
  });
}
it.each([5, 30, 60, 80, 90, 120, 180, 3600])("accepts duration %i", (n) =>
  expect(Duration.parse(n)).toBe(n),
);
it.each([0, 4, 6, NaN, Infinity, 3605, -5, 60.5])("rejects duration %s", (n) =>
  expect(Duration.safeParse(n).success).toBe(false),
);
it("start is manual and idempotent; stop discards the run", () => {
  const t = readyTimer();
  const run = crypto.randomUUID();
  const started = startTimer(t, 1000, run);
  expect(started.deadline).toBe(121000);
  expect(startTimer(started, 5000, crypto.randomUUID())).toEqual(started);
  expect(readyTimer(started.selectedSeconds)).toEqual(t);
});
it("deadline calculation skips throttled callbacks and clamps at zero", () => {
  const t = startTimer(readyTimer(80), 1000, crypto.randomUUID());
  expect(remaining(t, 2500)).toBe(79);
  expect(remaining(t, 99000)).toBe(0);
  expect(clock(80)).toBe("1:20");
});
it("completion requires matching run and deadline; replay cannot duplicate claim", () => {
  const id = crypto.randomUUID(),
    t = startTimer(readyTimer(5), 1000, id);
  expect(finishTimer(t, crypto.randomUUID(), 9000)).toEqual(t);
  expect(finishTimer(t, id, 5000)).toEqual(t);
  const done = finishTimer(t, id, 6000);
  expect(done.status).toBe("ready");
  expect(done.completedRunId).toBe(id);
  expect(finishTimer(done, id, 9000)).toEqual(done);
});
it("invalid state cannot enter storage", () => {
  expect(Timer.safeParse({ ...readyTimer(), status: "running" }).success).toBe(
    false,
  );
  expect(Timer.safeParse({ ...readyTimer(), deadline: 1000 }).success).toBe(
    false,
  );
});
it("legacy paused migration preserves all workout data with explicit neutral defaults", () => {
  const old = legacy(),
    d = validate(old);
  expect(d.schemaVersion).toBe(2);
  expect(d.sessions).toEqual(old.sessions);
  expect(d.slots).toEqual(old.slots);
  expect(d.view.timer).toEqual(readyTimer());
  expect(d.preferences.timer).toEqual({
    preferredSeconds: 120,
    alert: "silent",
  });
  expect(old.view.timer.paused).toBe(30);
});
it("legacy live deadline survives; expired deadline returns Ready without sound", () => {
  const old = legacy();
  old.view.timer = { deadline: Date.now() + 60000, paused: 0 };
  const d = validate(old);
  expect(d.view.timer.deadline).toBe(old.view.timer.deadline);
  expect(validate(old)).toEqual(d);
  old.view.timer.deadline = Date.now() - 1000;
  expect(validate(old).view.timer).toEqual(readyTimer());
});
it("v1 checksums verified before migration and v2 backups roundtrip all timer fields", async () => {
  const old = legacy();
  const body = {
    format: "everyday-athlete-backup",
    formatVersion: 1,
    appVersion: "0.3.0",
    exportId: crypto.randomUUID(),
    exportedAt: new Date().toISOString(),
    dataset: old,
  };
  const backup = { body, checksum: await digest(body) };
  expect((await readBackup(JSON.stringify(backup))).body.dataset).toEqual(
    validate(old),
  );
  body.dataset.view.timer.paused = 35;
  await expect(readBackup(JSON.stringify(backup))).rejects.toThrow("checksum");
  const d = validate(old);
  d.preferences.timer = { preferredSeconds: 80, alert: "short-beep" };
  d.view.timer = readyTimer(90);
  expect(
    (await readBackup(JSON.stringify(await makeBackup(d)))).body.dataset,
  ).toEqual(d);
});
it("timer transitions never write performed records, suggestions or preferred duration", () => {
  const d = createDataset("foundation", "2026-10-19", [1, 3, 5]),
    before = structuredClone(d.sessions);
  d.view.timer = startTimer(readyTimer(80), 1000, crypto.randomUUID());
  d.view.timer = finishTimer(d.view.timer, d.view.timer.runId!, 90000);
  expect(d.preferences.timer.preferredSeconds).toBe(120);
  expect(d.sessions).toEqual(before);
});
it("retained legacy export remains readable by strict v1 parser", async () => {
  const { makeLegacyBackup } = await import("../../src/local/backup");
  const old = legacy(),
    b = await makeLegacyBackup(old);
  expect(LegacyDataset.parse(b.body.dataset)).toEqual(old);
  expect(b.body.appVersion).toBe("0.3.0");
  expect(await digest(b.body)).toBe(b.checksum);
});
it("populated legacy actuals, drafts, unknowns and audit survive normalization exactly", () => {
  const old = legacy(),
    s = old.sessions[0];
  old.revision = 1;
  s.revision = 1;
  s.actuals = [
    {
      id: crypto.randomUUID(),
      ordinal: 1,
      revision: 1,
      confirmed: true,
      values: {
        ...s.prescription.suggested,
        load: {
          kind: "external",
          value: 57,
          unit: "lb",
          basis: "per_dumbbell",
        },
      },
    },
  ];
  old.drafts[s.id] = {
    2: { values: { ...s.prescription.suggested, reps: 11 } },
  };
  old.audit = [
    {
      id: crypto.randomUUID(),
      revision: 1,
      time: new Date().toISOString(),
      action: "sets",
      before: "{}",
      after: "{}",
    },
  ];
  const d = validate(old);
  expect(d.sessions).toEqual(old.sessions);
  expect(d.drafts).toEqual(old.drafts);
  expect(d.audit).toEqual(old.audit);
  expect(d.sessions[0].actuals[0].values.rir).toBeNull();
  expect(d.sessions.at(-1)!.effort).toBeNull();
});
