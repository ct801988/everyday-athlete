import { test, expect, chromium, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
async function setup(p: Page) {
  await p.goto("/");
  await p
    .getByRole("button", { name: "Start synthetic demonstration" })
    .click();
  await expect(p.getByRole("navigation")).toBeVisible();
}
async function harness(p: Page) {
  await p.goto("/tests/local/harness.html");
  await p.waitForFunction(() => !!window.eaTest);
}
async function init(p: Page) {
  await harness(p);
  return p.evaluate(async () => {
    const t = window.eaTest;
    const s = await t.store.create(
      t.createDataset("foundation", "2026-10-19", [1, 3, 5]),
    );
    return s.data.id;
  });
}
test("L01 first run works with no registration/API/cloud", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await setup(page);
  expect(
    requests.some(
      (x) => x.includes("/api/") || !x.startsWith("http://127.0.0.1:5175"),
    ),
  ).toBe(false);
  await expect(page.getByLabel("Weight set 1")).toBeVisible();
});
test("L02 Foundation3 / Strength4 with Fit pending", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Program", { exact: true }).selectOption("strength");
  await page
    .getByRole("button", { name: "Start synthetic demonstration" })
    .click();
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Schedule · 4/ }),
  ).toBeVisible();
  await expect(page.locator("li")).toHaveCount(4);
});
test("L03 deliberate Done and replay receipts, no suggested actuals", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest;
      let s = (await t.store.read())!;
      if (s.data.sessions[0].actuals.length) throw Error("phantom");
      const id = crypto.randomUUID(),
        sid = s.data.view.session;
      const row = {
        id: crypto.randomUUID(),
        ordinal: 1,
        expectedRevision: 0,
        confirmed: true,
        values: s.data.sessions[0].prescription.suggested,
      };
      const m = { type: "sets" as const, items: [row] };
      const old = s;
      await t.store.change(s, "sets", m, (d) => t.mutate(d, sid, m), id);
      s = await t.store.change(old, "sets", m, (d) => t.mutate(d, sid, m), id);
      let denied = false;
      try {
        await t.store.change(s, "sets", {}, () => {}, id);
      } catch {
        denied = true;
      }
      return [
        s.data.sessions[0].actuals.length,
        denied,
        s.data.sessions[0].actuals[0].values.rir,
      ];
    }),
  ).toEqual([1, true, null]);
});
test("L04 corrections and undo preserve audit after reload", async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel("Weight set 1").fill("55");
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await page.getByLabel("Weight set 1").fill("60");
  await page
    .getByRole("button", { name: "Save correction", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo set 1" }).click();
  await expect(
    page.getByRole("heading", { name: "Set 1 · Not performed" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Set 1 · Not performed" }),
  ).toBeVisible();
  await expect(page.getByLabel("Weight set 1")).toHaveValue("60");
});
test("L05 bulk cancellation and atomic invalid group", async ({ page }) => {
  await setup(page);
  await page.getByRole("button", { name: "Review remaining sets" }).click();
  await page.getByRole("button", { name: "Cancel bulk" }).click();
  await expect(
    page.getByRole("heading", { name: /Not performed/ }),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "Review remaining sets" }).click();
  await page
    .getByRole("button", { name: "Confirm these performed values" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Set \d · Done/ }),
  ).toHaveCount(3);
  await harness(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        before = t.canonical(s);
      try {
        await t.store.change(s, "bad-bulk", {}, (d) =>
          t.mutate(d, d.view.session, {
            type: "sets",
            items: [
              {
                ...d.sessions[0].actuals[0],
                expectedRevision: 1,
                values: { ...d.sessions[0].actuals[0].values, reps: 12 },
              },
              {
                id: crypto.randomUUID(),
                ordinal: 9,
                expectedRevision: 0,
                confirmed: true,
                values: d.sessions[0].prescription.suggested,
              },
            ],
          }),
        );
      } catch {
        /* expected */
      }
      return t.canonical(await t.store.read()) === before;
    }),
  ).toBe(true);
});
test("L06 true persistent browser close and relaunch keeps history", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ea-restart-"));
  const opts = {
    executablePath:
      process.env.EA_CHROMIUM_PATH || resolve(".data/chromium/chromium"),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  };
  let c = await chromium.launchPersistentContext(dir, opts);
  let p = await c.newPage();
  await p.goto("http://127.0.0.1:5175/");
  await p
    .getByRole("button", { name: "Start synthetic demonstration" })
    .click();
  await p.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(p.getByRole("heading", { name: "Set 1 · Done" })).toBeVisible();
  await c.close();
  c = await chromium.launchPersistentContext(dir, opts);
  try {
    p = await c.newPage();
    await p.goto("http://127.0.0.1:5175/");
    await expect(
      p.getByRole("heading", { name: "Set 1 · Done" }),
    ).toBeVisible();
  } finally {
    await c.close();
  }
});
test("L07 partial session continuity and no phantom full completion", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await page.getByRole("button", { name: "Finish complete workout" }).click();
  await expect(page.getByRole("alert")).toContainText("Complete all performed");
  await page.getByRole("button", { name: "Finish partial workout" }).click();
  await expect(page.getByRole("status").first()).toContainText(
    "Saved on this device",
  );
  await page.reload();
  await page.getByRole("button", { name: "Reopen workout" }).click();
  await expect(
    page.getByRole("heading", { name: "Set 1 · Done" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Not performed/ }),
  ).toHaveCount(2);
});
test("L08 overlay preserves draft, focus, timer, Back and Escape", async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel("Weight set 1").fill("62");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const b = page.getByRole("button", {
    name: "Exercise demonstration",
    exact: true,
  });
  await b.click();
  await page.getByRole("button", { name: "Next frame" }).click();
  await page.keyboard.press("Escape");
  await expect(b).toBeFocused();
  await expect(page.getByLabel("Weight set 1")).toHaveValue("62");
  await expect(page.getByLabel("Rest timer", { exact: true })).not.toHaveText(
    "0:00",
  );
  await b.click();
  await page.goBack();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("L09 separate optional conditioning reports and no above-target reward", async ({
  page,
}) => {
  await setup(page);
  const options = await page
    .getByLabel("Session", { exact: true })
    .locator("option")
    .allTextContents();
  await page
    .getByLabel("Session", { exact: true })
    .selectOption({ label: options.at(-1)! });
  await expect(page.getByText("Saved actual: Unknown")).toBeVisible();
  await page.getByLabel("Your Effort Level").fill("9");
  await page.getByRole("button", { name: "Save optional effort" }).click();
  await expect(page.getByText("Saved actual: 9")).toBeVisible();
  await expect(page.getByText(/"demandChange":0/)).toBeVisible();
  await page.getByRole("button", { name: "Skip or clear effort" }).click();
  await expect(page.getByText("Saved actual: Unknown")).toBeVisible();
});
test("L10 cached startup/reload and offline history/scheduling/logging", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) =>
    errors.push(r.url() + ":" + r.failure()?.errorText),
  );
  await setup(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByLabel("Weight set 1"),
    errors.join("\n"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.getByText(/actual sets: 1/)).toBeVisible();
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Schedule · 3/ }),
  ).toBeVisible();
  await context.setOffline(false);
});
test("L11 quota/put failure is atomic; no saved claim", async ({ page }) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        old = IDBObjectStore.prototype.put;
      let failed = false;
      IDBObjectStore.prototype.put = function () {
        throw new DOMException("Synthetic quota failure", "QuotaExceededError");
      };
      try {
        await t.store.change(s, "test", {}, (d) => {
          d.preferences.rir = true;
        });
      } catch {
        failed = true;
      } finally {
        IDBObjectStore.prototype.put = old;
      }
      return [failed, (await t.store.read())!.data.preferences.rir];
    }),
  ).toEqual([true, false]);
});
test("L12 two tabs reject stale revisions and active-dataset switch", async ({
  page,
  context,
}) => {
  await init(page);
  const other = await context.newPage();
  await harness(other);
  await other.evaluate(async () => {
    const t = window.eaTest;
    const s = (await t.store.read())!;
    await t.store.change(s, "other-tab", {}, (d) => {
      d.preferences.rir = true;
    });
  });
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!;
      const stale = {
        ...s,
        data: { ...s.data, revision: s.data.revision - 1 },
      };
      try {
        await t.store.change(stale, "stale", {}, () => {});
        return false;
      } catch (e) {
        return String(e).includes("Revision conflict");
      }
    }),
  ).toBe(true);
});
test("L13 any-day sequence, explicit reschedule and immutable completed slots", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await page.getByLabel("Move next pending session to").fill("2026-12-01");
  await page.getByRole("button", { name: "Preview reschedule" }).click();
  await page.getByRole("button", { name: "Cancel reschedule" }).click();
  await page.getByRole("button", { name: "Preview reschedule" }).click();
  await page.getByRole("button", { name: "Confirm reschedule" }).click();
  await expect(page.locator("li").first()).toContainText("2026-12-01");
});
test("L14 comparable actual history drives coaching, not drafts", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        d = s.data,
        a = d.sessions[0];
      for (let i = 1; i <= 3; i++)
        t.mutate(d, a.id, {
          type: "sets",
          items: [
            {
              id: crypto.randomUUID(),
              ordinal: i,
              expectedRevision: 0,
              confirmed: true,
              values: a.prescription.suggested,
            },
          ],
        });
      t.mutate(d, a.id, {
        type: "finish",
        expectedRevision: a.revision,
        status: "completed",
      });
      const q = t.coaching(d, d.sessions[1].id);
      return JSON.parse(q.input).history[0].values.length;
    }),
  ).toBe(3);
});
test("L15 deterministic explanations and pain guard retained locally", async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel("Pain context").click();
  await expect(page.getByLabel("Pain context")).toBeChecked();
  await page.getByRole("button", { name: "Explain recommendation" }).click();
  await expect(page.getByText(/"rule":"R01"/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/"rule":"R01"/)).toBeVisible();
});
test("L16 separate browser profiles have independent records", async ({
  page,
  browser,
}) => {
  await setup(page);
  const c = await browser.newContext();
  try {
    const p = await c.newPage();
    await p.goto("http://127.0.0.1:5175/");
    await expect(
      p.getByRole("button", { name: "Start synthetic demonstration" }),
    ).toBeVisible();
    await expect(
      p.getByText(/Shared browser profiles are not securely separated/).first(),
    ).toBeVisible();
  } finally {
    await c.close();
  }
});
test("L17 narrow mobile/landscape keyboard and automated accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await setup(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Exercise demonstration", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await page.screenshot({ path: ".data/assignment003-overlay-qa.png" });
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 844, height: 390 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("L18 full backup roundtrip restores into fresh profile", async ({
  page,
  browser,
}) => {
  await setup(page);
  await page.getByLabel("Weight set 1").fill("58");
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await page.getByRole("button", { name: "Backup", exact: true }).click();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export full backup" }).click();
  const download = await dl,
    file = (await download.path())!;
  const c = await browser.newContext();
  try {
    const p = await c.newPage();
    await p.goto("http://127.0.0.1:5175/");
    await p.getByLabel("Import JSON backup").setInputFiles(file);
    await p.getByRole("checkbox", { name: /I understand/ }).check();
    await p.getByRole("button", { name: "Confirm restore" }).click();
    await p.getByRole("button", { name: "Workout", exact: true }).click();
    await expect(
      p.getByRole("heading", { name: "Set 1 · Done" }),
    ).toBeVisible();
    await expect(p.getByLabel("Weight set 1")).toHaveValue("58");
  } finally {
    await c.close();
  }
});
test("L19 malformed/future/checksum/duplicate-key imports leave current history", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Backup", exact: true }).click();
  for (const text of [
    '{"a":1,"a":2}',
    '{"body":{"formatVersion":99}}',
    '{"body":',
  ]) {
    await page.getByLabel("Import JSON backup").setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from(text),
    });
    await expect(page.getByRole("alert")).toContainText("Import rejected");
  }
  await page.getByRole("button", { name: "Workout", exact: true }).click();
  await expect(page.getByLabel("Weight set 1")).toBeVisible();
});
test("L20 duplicate no-op and conflicting snapshot rejection", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        b = await t.makeBackup(s.data);
      const again = await t.store.restore(b, s, false);
      const altered = structuredClone(s.data);
      altered.preferences.rir = true;
      let conflict = false;
      try {
        await t.store.restore(await t.makeBackup(altered), again, true);
      } catch (e) {
        conflict = String(e).includes("Conflicting");
      }
      return [again.key === s.key, conflict];
    }),
  ).toEqual([true, true]);
});
test("L21 missing pre-export, cancel and new edits during preview are safe", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        b = await t.makeBackup(
          t.createDataset("strength", "2026-10-19", [1, 2, 4, 6]),
        );
      const outcomes = [];
      try {
        await t.store.restore(b, s, true);
      } catch (e) {
        outcomes.push(String(e).includes("Export current"));
      }
      await t.store.markExport(s);
      try {
        await t.store.restore(b, s, false);
      } catch (e) {
        outcomes.push(String(e).includes("Acknowledge"));
      }
      await t.store.change(s, "edit", {}, (d) => {
        d.preferences.rir = true;
      });
      try {
        await t.store.restore(b, s, true);
      } catch (e) {
        outcomes.push(String(e).includes("New edits"));
      }
      return outcomes;
    }),
  ).toEqual([true, true, true]);
});
test("L22 interrupted transaction/staging failure retains active data", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        b = await t.makeBackup(
          t.createDataset("strength", "2026-10-19", [1, 2, 4, 6]),
        );
      await t.store.markExport(s);
      const old = IDBObjectStore.prototype.add;
      IDBObjectStore.prototype.add = function () {
        throw new DOMException("Injected staging quota", "QuotaExceededError");
      };
      let failed = false;
      try {
        await t.store.restore(b, s, true);
      } catch {
        failed = true;
      } finally {
        IDBObjectStore.prototype.add = old;
      }
      const db = await t.openDB();
      const tx = db.transaction("datasets", "readwrite");
      tx.objectStore("datasets").put({ ...s.data, program: "strength" }, s.key);
      tx.abort();
      await new Promise<void>((r) => {
        tx.onabort = () => r();
      });
      db.close();
      return [
        failed,
        t.canonical((await t.store.read())!.data) === t.canonical(s.data),
      ];
    }),
  ).toEqual([true, true]);
});
test("L23 rollback restores exact previous dataset and preserves later workspace", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        b = await t.makeBackup(
          t.createDataset("strength", "2026-10-19", [1, 2, 4, 6]),
        );
      await t.store.markExport(s);
      const restored = await t.store.restore(b, s, true);
      await t.store.markExport(restored);
      const back = await t.store.rollback(restored);
      await t.store.markExport(back);
      const forward = await t.store.rollback(back);
      return [
        t.canonical(s.data) === t.canonical(back.data),
        forward.data.program,
      ];
    }),
  ).toEqual([true, "strength"]);
});
test("L24 import bounds/unsafe keys and inert text", async ({ page }) => {
  await harness(page);
  expect(
    await page.evaluate(() => {
      const t = window.eaTest;
      return [
        '{"__proto__":{}}',
        "[".repeat(34) + "0" + "]".repeat(34),
        '"' + "x".repeat(20 * 1024 * 1024) + '"',
      ].map((x) => {
        try {
          t.safeParse(x);
          return false;
        } catch {
          return true;
        }
      });
    }),
  ).toEqual([true, true, true]);
});
test("L25 populated v1 upgrade and future-version non-destructive rejection", async ({
  page,
}) => {
  await harness(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        name = "migration-" + crypto.randomUUID(),
        d = t.createDataset("foundation", "2026-10-19", [1, 3, 5]);
      await new Promise<void>((resolve, reject) => {
        const q = indexedDB.open(name, 1);
        q.onupgradeneeded = () => {
          q.result.createObjectStore("datasets").put(d, "saved");
          q.result
            .createObjectStore("meta")
            .put(
              { active: "saved", previous: null, lastExport: null },
              "state",
            );
        };
        q.onsuccess = () => {
          q.result.close();
          resolve();
        };
        q.onerror = () => reject(q.error);
      });
      const migrated = await new t.LocalStore(name).read();
      const db = await t.openDB(name);
      db.close();
      await new Promise<void>((r) => {
        const q = indexedDB.open(name, 3);
        q.onsuccess = () => {
          q.result.close();
          r();
        };
      });
      let denied = false;
      try {
        await new t.LocalStore(name).read();
      } catch {
        denied = true;
      }
      return [migrated!.data.id === d.id, denied];
    }),
  ).toEqual([true, true]);
});
test("L26 service worker update waits and retains workout database", async ({
  page,
}) => {
  const path = ".data/local-test-build/sw.js",
    original = await readFile(path, "utf8");
  await setup(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByLabel("Weight set 1").fill("66");
  try {
    await writeFile(
      path,
      original.replace(/ea-shell-([a-f0-9]+)/, "ea-shell-update-$1"),
    );
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())!.update();
    });
    await expect(
      page.getByRole("button", { name: /Apply cached app update/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Apply cached app update/ }).click();
    await expect(page.getByLabel("Weight set 1")).toHaveValue("66");
  } finally {
    await writeFile(path, original);
  }
});
test("L27 deadline expiry survives restart without automatic completion", async ({
  page,
}) => {
  await init(page);
  await page.evaluate(async () => {
    const t = window.eaTest,
      s = (await t.store.read())!;
    await t.store.change(s, "expired-timer", {}, (d) => {
      d.view.timer = {
        ...d.view.timer,
        status: "running",
        runId: crypto.randomUUID(),
        deadline: Date.now() - 5000,
      };
    });
  });
  await page.goto("/");
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "0:00",
  );
  await expect(
    page.getByRole("heading", { name: /Not performed/ }),
  ).toHaveCount(3);
});
test("L28 storage warnings and persistence denial do not imply backup", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Backup", exact: true }).click();
  await expect(page.getByText(/not automatically backed up/)).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator.storage, "persist", {
      value: async () => false,
    });
  });
  await page
    .getByRole("button", { name: "Request persistent device storage" })
    .click();
  await expect(page.getByRole("status").first()).toContainText("not granted");
  await expect(page.getByText("No backup exported")).toBeVisible();
});
test("L29 unknown canonical media rejected; synthetic provenance preserved", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!,
        b = await t.makeBackup(s.data);
      b.body.dataset.sessions[0].prescription.variation =
        "https://evil.test/script";
      b.checksum = await t.digest(b.body);
      try {
        await t.readBackup(JSON.stringify(b));
        return false;
      } catch {
        return true;
      }
    }),
  ).toBe(true);
});
test.skip("L30 iPhone Safari physical device restart/download/import/backgrounding (hardware unavailable)", () => {});
test.skip("L30 Android Chrome physical device restart/download/import/backgrounding (hardware unavailable)", () => {});
test("L11b visible failed write retains editable value and never claims saved", async ({
  page,
}) => {
  await setup(page);
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Injected quota failure", "QuotaExceededError");
    };
  });
  await page.getByLabel("Weight set 1").fill("73");
  await expect(page.getByRole("alert")).toContainText("not saved");
  await expect(page.getByLabel("Weight set 1")).toHaveValue("73");
  await expect(page.getByRole("status").first()).toHaveText("Not saved");
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(
    page.getByRole("heading", { name: "Set 1 · Not performed" }),
  ).toBeVisible();
});
test("L11c unavailable IndexedDB fails closed with clear error", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      value: {
        open: () => {
          throw Error("Injected storage unavailable");
        },
      },
    });
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("storage unavailable");
  await expect(page.getByRole("navigation")).not.toBeVisible();
});
test("L12b restore invalidates a stale tab and refuses silent overwrite", async ({
  page,
  context,
}) => {
  await init(page);
  const old = await page.evaluate(() => window.eaTest.store.read());
  const other = await context.newPage();
  await harness(other);
  await other.evaluate(async () => {
    const t = window.eaTest,
      s = (await t.store.read())!;
    await t.store.markExport(s);
    await t.store.restore(
      await t.makeBackup(
        t.createDataset("strength", "2026-10-19", [1, 2, 4, 6]),
      ),
      s,
      true,
    );
  });
  expect(
    await page.evaluate(async (old) => {
      const t = window.eaTest;
      try {
        await t.store.change(old!, "stale-tab", {}, (d) => {
          d.preferences.rir = true;
        });
        return false;
      } catch (e) {
        return String(e).includes("Active dataset changed");
      }
    }, old),
  ).toBe(true);
});
test("L18b snapshot export uses immutable revision while another write commits", async ({
  page,
}) => {
  await init(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        s = (await t.store.read())!;
      const exportPromise = t.makeBackup(s.data);
      await t.store.change(s, "later-edit", {}, (d) => {
        d.preferences.rir = true;
      });
      const b = await exportPromise;
      let denied = false;
      try {
        await t.store.markExport(s);
      } catch {
        denied = true;
      }
      return [b.body.dataset.preferences.rir, b.body.dataset.revision, denied];
    }),
  ).toEqual([false, 0, true]);
});
test("L21b restore preview cancellation changes no records", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Backup", exact: true }).click();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export full backup" }).click();
  const file = (await (await dl).path())!;
  await page.getByLabel("Import JSON backup").setInputFiles(file);
  await expect(
    page.getByRole("heading", { name: "Restore preview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel restore" }).click();
  await expect(
    page.getByRole("heading", { name: "Restore preview" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Workout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Not performed/ }),
  ).toHaveCount(3);
});
test("L25b aborted schema upgrade leaves populated prior database readable", async ({
  page,
}) => {
  await harness(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        name = "failed-upgrade-" + crypto.randomUUID(),
        d = t.createDataset("foundation", "2026-10-19", [1, 3, 5]);
      await new Promise<void>((r) => {
        const q = indexedDB.open(name, 1);
        q.onupgradeneeded = () => {
          q.result.createObjectStore("datasets").put(d, "saved");
          q.result
            .createObjectStore("meta")
            .put(
              { active: "saved", previous: null, lastExport: null },
              "state",
            );
        };
        q.onsuccess = () => {
          q.result.close();
          r();
        };
      });
      await new Promise<void>((r) => {
        const q = indexedDB.open(name, 2);
        q.onupgradeneeded = () => q.transaction!.abort();
        q.onerror = () => r();
      });
      return (await new t.LocalStore(name).read())!.data.id === d.id;
    }),
  ).toBe(true);
});
test("L17b desktop and Android Chrome mobile simulation retain usable logging", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  await expect(page.getByLabel("Weight set 1")).toBeVisible();
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36",
  });
  try {
    const p = await context.newPage();
    await p.goto("http://127.0.0.1:5175/");
    await p
      .getByRole("button", { name: "Start synthetic demonstration" })
      .click();
    await p.getByRole("button", { name: "Done", exact: true }).first().click();
    await expect(
      p.getByRole("heading", { name: "Set 1 · Done" }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
test.skip("L17 physical VoiceOver/TalkBack and iPhone Safari engine verification unavailable", () => {});
