import { test, expect } from "@playwright/test";
test("atomic legacy migration preserves original, conflicts, duplicate retry, backups and rollback", async ({
  page,
}) => {
  await page.goto("/tests/local/m1-harness.html");
  await page.waitForFunction(() => !!window.m1Test);
  const results = await page.evaluate(async () => {
    const a = window.m1Test;
    const old = a.legacy.createDataset("foundation", "2026-10-19", [1, 3, 5]);
    const saved = JSON.stringify(old);
    const initial = await a.initialize(old);
    const migrated = await a.read();
    if (JSON.stringify(migrated?.legacy) !== saved)
      throw Error("Legacy changed");
    const id = crypto.randomUUID();
    const next = await a.change(
      initial,
      "draft",
      { value: 1 },
      (d) => {
        d.sessions[0].performances[0].rows[0].draft.amount = "8";
      },
      id,
    );
    const retry = await a.change(
      initial,
      "draft",
      { value: 1 },
      () => {
        throw Error("Must not rerun");
      },
      id,
    );
    if (retry.revision !== next.revision) throw Error("Duplicate");
    let conflict = false;
    try {
      await a.change(initial, "stale", {}, () => {});
    } catch {
      conflict = true;
    }
    if (!conflict) throw Error("No stale conflict");
    let aborted = false;
    try {
      await a.change(next, "abort", {}, (d) => {
        d.sessions = [];
      });
    } catch {
      aborted = true;
    }
    if (!aborted || (await a.read())?.revision !== next.revision)
      throw Error("Atomicity");
    const b = await a.exportBackup(next);
    const roundtrip = await a.parseBackup(JSON.stringify(b));
    const same = await a.restore(next, roundtrip, next.revision);
    if (same.revision !== next.revision) throw Error("Duplicate import");
    const fresh = a.createModel("strength");
    await a.restore(next, fresh, next.revision);
    const rollback = await a.rollback(fresh, fresh.revision);
    if (rollback.id !== next.id) throw Error("Rollback");
    return {
      legacy: true,
      retry: true,
      conflict,
      aborted,
      roundtrip: true,
      rollback: true,
    };
  });
  expect(results).toEqual({
    legacy: true,
    retry: true,
    conflict: true,
    aborted: true,
    roundtrip: true,
    rollback: true,
  });
});

test("migration quota/interruption leaves original database and active pointer intact", async ({
  page,
}) => {
  await page.goto("/tests/local/m1-harness.html");
  await page.waitForFunction(() => !!window.m1Test);
  expect(
    await page.evaluate(async () => {
      const a = window.m1Test;
      const old = a.legacy.createDataset("foundation", "2026-10-19", [1, 3, 5]);
      await new a.legacyStorage.LocalStore().create(old);
      const original = JSON.stringify(await a.rawLegacy());
      const add = IDBObjectStore.prototype.add;
      IDBObjectStore.prototype.add = function () {
        throw new DOMException("Simulated quota", "QuotaExceededError");
      };
      let rejected = false;
      try {
        await a.initialize();
      } catch {
        rejected = true;
      } finally {
        IDBObjectStore.prototype.add = add;
      }
      if (
        !rejected ||
        (await a.read()) !== null ||
        JSON.stringify(await a.rawLegacy()) !== original
      )
        throw Error("Migration loss");
      const migrated = await a.initialize();
      return (
        migrated.legacy && JSON.stringify(await a.rawLegacy()) === original
      );
    }),
  ).toBe(true);
});
test("restore interruption retains current workspace and audit stays bounded on repeated drafts", async ({
  page,
}) => {
  await page.goto("/tests/local/m1-harness.html");
  await page.waitForFunction(() => !!window.m1Test);
  expect(
    await page.evaluate(async () => {
      const a = window.m1Test;
      let current = await a.initialize();
      for (let i = 0; i < 120; i++) {
        current = await a.change(current, "draft", { i }, (d) => {
          d.sessions[0].performances[0].rows[0].draft.amount = String(i);
        });
      }
      if (JSON.stringify(current).length > 150000)
        throw Error("Audit inflation");
      const before = JSON.stringify(current);
      const other = a.createModel("strength");
      const add = IDBObjectStore.prototype.add;
      IDBObjectStore.prototype.add = function () {
        throw new DOMException("Interrupted restore", "AbortError");
      };
      try {
        await a.restore(current, other, current.revision);
      } catch {
        /* expected */
      } finally {
        IDBObjectStore.prototype.add = add;
      }
      return JSON.stringify(await a.read()) === before;
    }),
  ).toBe(true);
});
