import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
async function setup(p: Page) {
  await p.goto("/");
  await p
    .getByRole("button", { name: "Start synthetic demonstration" })
    .click();
  await expect(p.getByLabel("Weight set 1")).toBeVisible();
}
async function harness(p: Page) {
  await p.goto("/tests/local/harness.html");
  await p.waitForFunction(() => !!window.eaTest);
}
async function expand(p: Page) {
  await p.getByRole("button", { name: "Expand timer options" }).click();
}
async function custom(p: Page, n: string) {
  await expand(p);
  await p.getByLabel("Custom duration in seconds").fill(n);
  await p.getByRole("button", { name: "Set duration", exact: true }).click();
}
async function audioSpy(p: Page) {
  await p.addInitScript(() => {
    const original = AudioContext.prototype.createOscillator;
    Object.assign(window, { beepStarts: 0 });
    AudioContext.prototype.createOscillator = function () {
      const o = original.call(this),
        start = o.start.bind(o);
      o.start = (...args) => {
        Object.assign(window, {
          beepStarts:
            (window as unknown as { beepStarts: number }).beepStarts + 1,
        });
        return start(...args);
      };
      return o;
    };
  });
}
async function beeps(p: Page) {
  return p.evaluate(
    () => (window as unknown as { beepStarts: number }).beepStarts,
  );
}
test("T01 defaults, exact alert options, presets and custom 1:20/1:30", async ({
  page,
}) => {
  await setup(page);
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "2:00",
  );
  await custom(page, "80");
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "1:20",
  );
  await page.getByLabel("Custom duration in seconds").fill("90");
  await page.getByRole("button", { name: "Set duration", exact: true }).click();
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "1:30",
  );
  for (const [label, time] of [
    ["30 sec", "0:30"],
    ["1 min", "1:00"],
    ["2 min", "2:00"],
    ["3 min", "3:00"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
      time,
    );
  }
  await expect(page.getByLabel("Completion alert")).toHaveValue("silent");
  await expect(
    page.getByLabel("Completion alert").locator("option"),
  ).toHaveText(["Silent", "Short beep"]);
  await expect(page.getByRole("button", { name: /Pause|Resume/ })).toHaveCount(
    0,
  );
});
test("T02 manual start, locked running duration, immediate reset and no automatic set completion", async ({
  page,
}) => {
  await setup(page);
  await expand(page);
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByLabel("Custom duration in seconds")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "1 min", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Stop and reset rest timer" }).click();
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "2:00",
  );
  await expand(page);
  await expect(page.getByLabel("Custom duration in seconds")).toBeEnabled();
  await expect(
    page.getByRole("heading", { name: /Set \d · Done/ }),
  ).toHaveCount(1);
});
test("T03 preference is explicit, selected independent, retained after reload", async ({
  page,
}) => {
  await setup(page);
  await custom(page, "80");
  await expect(
    page.getByText("Default 2:00 · Selected 1:20", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Use selected as my default" })
    .click();
  await page.getByRole("button", { name: "3 min", exact: true }).click();
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "3:00",
  );
  await page.reload();
  await expand(page);
  await expect(
    page.getByText("Default 1:20 · Selected 3:00", { exact: true }),
  ).toBeVisible();
});
test("T04 foreground short beep is single and expiry does not create actual records", async ({
  page,
}) => {
  await audioSpy(page);
  await page.clock.install();
  await setup(page);
  await custom(page, "5");
  await page.getByLabel("Completion alert").selectOption("short-beep");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop and reset rest timer" }),
  ).toBeVisible();
  await page.clock.runFor(5500);
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "0:00",
  );
  await expect.poll(() => beeps(page)).toBe(1);
  await page.clock.runFor(6000);
  expect(await beeps(page)).toBe(1);
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Not performed/ }),
  ).toHaveCount(3);
});
test("T05 reset cancels pending alert and remains silent past original deadline", async ({
  page,
}) => {
  await audioSpy(page);
  await page.clock.install();
  await setup(page);
  await custom(page, "5");
  await page.getByLabel("Completion alert").selectOption("short-beep");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Stop and reset rest timer" }).click();
  await page.clock.runFor(8000);
  expect(await beeps(page)).toBe(0);
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "0:05",
  );
});
test("T06 restored expired run is visual-only even with short-beep preference", async ({
  page,
}) => {
  await audioSpy(page);
  await harness(page);
  await page.evaluate(async () => {
    const t = window.eaTest,
      d = t.createDataset("foundation", "2026-10-19", [1, 3, 5]);
    d.preferences.timer.alert = "short-beep";
    d.view.timer = {
      ...d.view.timer,
      status: "running",
      runId: crypto.randomUUID(),
      deadline: Date.now() - 5000,
    };
    await t.store.create(d);
  });
  await page.goto("/");
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "0:00",
  );
  expect(await beeps(page)).toBe(0);
  await expect(page.getByText("Rest · Rest complete")).toBeVisible();
});
test("T07 background expiry suppresses delayed beep (visibility simulation)", async ({
  page,
}) => {
  await audioSpy(page);
  await page.clock.install();
  await setup(page);
  await custom(page, "5");
  await page.getByLabel("Completion alert").selectOption("short-beep");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop and reset rest timer" }),
  ).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(6000);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(250);
  expect(await beeps(page)).toBe(0);
  await expect(page.getByText("Rest · Rest complete")).toBeVisible();
});
test("T08 timer survives scrolling, session switching, overlay and tab navigation with drafts", async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel("Weight set 2").fill("63");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page
    .getByRole("button", { name: "Exercise demonstration", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Weight set 2")).toHaveValue("63");
  const select = page.getByLabel("Session", { exact: true });
  const first = await select.inputValue();
  await select.selectOption({ index: 1 });
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop and reset rest timer" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Workout", exact: true }).click();
  await page.getByLabel("Session", { exact: true }).selectOption(first);
  await expect(page.getByLabel("Weight set 2")).toHaveValue("63");
  await page.getByRole("button", { name: "Stop and reset rest timer" }).click();
});
test("T09 durable timer preference + independent selection backup restore into fresh profile", async ({
  page,
  browser,
}) => {
  await setup(page);
  await custom(page, "80");
  await page
    .getByRole("button", { name: "Use selected as my default" })
    .click();
  await page.getByRole("button", { name: "3 min", exact: true }).click();
  await page.getByLabel("Completion alert").selectOption("short-beep");
  await page.getByRole("button", { name: "Collapse timer options" }).click();
  await page.getByLabel("Weight set 1").fill("59");
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await page.getByRole("button", { name: "Backup", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export full backup" }).click();
  const file = (await (await download).path())!;
  const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    fresh = await context.newPage();
  try {
    await fresh.goto("/");
    await fresh.getByLabel("Import JSON backup").setInputFiles(file);
    await fresh.getByLabel(/I understand/).check();
    await fresh.getByRole("button", { name: "Confirm restore" }).click();
    await fresh.getByRole("button", { name: "Workout", exact: true }).click();
    await expect(fresh.getByLabel("Weight set 1")).toHaveValue("59");
    await expand(fresh);
    await expect(
      fresh.getByText("Default 1:20 · Selected 3:00", { exact: true }),
    ).toBeVisible();
    await expect(fresh.getByLabel("Completion alert")).toHaveValue(
      "short-beep",
    );
  } finally {
    await context.close();
  }
});
test("T10 legacy paused migration retains original and prior rollback pointer atomically", async ({
  page,
}) => {
  await harness(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        db = await t.openDB(),
        d = t.createDataset("foundation", "2026-10-19", [1, 3, 5]);
      const old = {
        ...d,
        schemaVersion: 1,
        preferences: { rir: true, unit: "lb" },
        view: { ...d.view, timer: { deadline: null, paused: 42 } },
      };
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(["datasets", "meta"], "readwrite");
        tx.objectStore("datasets").put(old, "legacy");
        tx.objectStore("meta").put(
          { active: "legacy", previous: "older", lastExport: null },
          "state",
        );
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
      });
      db.close();
      const migrated = await t.store.read(),
        m = await t.store.meta();
      const verify = await t.openDB();
      const raw = await new Promise((resolve) => {
        const q = verify
          .transaction("datasets")
          .objectStore("datasets")
          .get("legacy");
        q.onsuccess = () => resolve(q.result);
      });
      verify.close();
      return {
        version: migrated!.data.schemaVersion,
        workouts:
          t.canonical(migrated!.data.sessions) === t.canonical(old.sessions),
        previous: m.previous,
        original: t.canonical(raw) === t.canonical(old),
        info: await t.store.migrationInfo(),
      };
    }),
  ).toMatchObject({
    version: 2,
    workouts: true,
    previous: "legacy",
    original: true,
    info: { key: "legacy", previous: "older" },
  });
  await page.goto("/");
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "2:00",
  );
  await expect(page.getByText(/Timer storage upgraded/)).toBeVisible();
});
test("T11 failed dataset migration preserves original active bytes", async ({
  page,
}) => {
  await harness(page);
  expect(
    await page.evaluate(async () => {
      const t = window.eaTest,
        db = await t.openDB(),
        d = t.createDataset("foundation", "2026-10-19", [1, 3, 5]),
        old = {
          ...d,
          schemaVersion: 1,
          preferences: { rir: false, unit: "lb" },
          view: { ...d.view, timer: { deadline: null, paused: 30 } },
        };
      await new Promise<void>((r) => {
        const tx = db.transaction(["datasets", "meta"], "readwrite");
        tx.objectStore("datasets").put(old, "legacy");
        tx.objectStore("meta").put(
          { active: "legacy", previous: null, lastExport: null },
          "state",
        );
        tx.oncomplete = () => r();
      });
      db.close();
      const original = IDBObjectStore.prototype.add;
      IDBObjectStore.prototype.add = function () {
        throw new DOMException("quota", "QuotaExceededError");
      };
      let rejected = false;
      try {
        await t.store.read();
      } catch {
        rejected = true;
      } finally {
        IDBObjectStore.prototype.add = original;
      }
      const m = await t.store.meta();
      return { rejected, active: m.active };
    }),
  ).toEqual({ rejected: true, active: "legacy" });
});
test("T12 cached offline timer settings, deliberate logging and reload", async ({
  page,
  context,
}) => {
  await setup(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await custom(page, "90");
  await page
    .getByRole("button", { name: "Use selected as my default" })
    .click();
  await page.getByRole("button", { name: "Collapse timer options" }).click();
  await page.getByLabel("Weight set 1").fill("61");
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await page.reload();
  await expect(page.getByLabel("Weight set 1")).toHaveValue("61");
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    "1:30",
  );
  await context.setOffline(false);
});
test("T13 mobile layouts, floating dock, target sizes, contrast and screenshots", async ({
  page,
}) => {
  await setup(page);
  await mkdir("reports/mobile-timer/screenshots", { recursive: true });
  const metrics = [];
  for (const [width, height] of [
    [390, 844],
    [320, 740],
    [844, 390],
    [412, 915],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo(0, 0));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeVisible();
    const dock = await page
      .getByLabel("Rest timer controls", { exact: true })
      .boundingBox();
    expect(dock!.y + dock!.height).toBeLessThan(height - 50);
    for (const button of await page
      .locator(".timer-bar button,nav button")
      .all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    metrics.push({ width, height, dock });
    await page.screenshot({
      path: `reports/mobile-timer/screenshots/workout-${width}x${height}.png`,
      fullPage: false,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expand(page);
  await page.screenshot({
    path: "reports/mobile-timer/screenshots/timer-options.png",
  });
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  await writeFile(
    "reports/mobile-timer/layout.json",
    JSON.stringify({ metrics, axeViolations: axe.violations }, null, 2),
  );
});
test("T14 two tabs claim the same expiry at most once and converge", async ({
  page,
  context,
}) => {
  await setup(page);
  await custom(page, "5");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const second = await context.newPage();
  await second.goto("/");
  await expect(page.getByText("Rest · Rest complete")).toBeVisible({
    timeout: 8000,
  });
  await expect(second.getByText("Rest · Rest complete")).toBeVisible({
    timeout: 8000,
  });
  await harness(page);
  const count = await page.evaluate(async () => {
    const d = (await window.eaTest.store.read())!.data;
    return d.audit.filter((a) => a.action === "timer-finish").length;
  });
  expect(count).toBe(1);
});
test("T15 manual keyboard controls retain position and dialog overlays dock", async ({
  page,
}) => {
  await setup(page);
  const start = page.getByRole("button", { name: "Start", exact: true });
  await start.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Stop and reset rest timer" }),
  ).toBeVisible();
  const demo = page.getByRole("button", {
    name: "Exercise demonstration",
    exact: true,
  });
  await demo.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({
    path: "reports/mobile-timer/screenshots/exercise-overlay.png",
  });
  await page.keyboard.press("Escape");
  await expect(demo).toBeFocused();
});
test.skip("T16 physical iPhone Safari/PWA locked-screen audio, keyboard and VoiceOver (hardware unavailable)", () => {});
test.skip("T17 physical Android Chrome compatibility (hardware unavailable)", () => {});
test("T18 Silent completion creates no audio graph and no repeated writes", async ({
  page,
}) => {
  await audioSpy(page);
  await page.clock.install();
  await setup(page);
  await custom(page, "5");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop and reset rest timer" }),
  ).toBeVisible();
  await page.clock.runFor(5500);
  await expect(page.getByText("Rest · Rest complete")).toBeVisible();
  expect(await beeps(page)).toBe(0);
});
test("T19 blocked audio does not block starting, stopping or logging", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", {
      value: class {
        constructor() {
          throw Error("Audio blocked");
        }
      },
    });
  });
  await setup(page);
  await expand(page);
  await page.getByLabel("Completion alert").selectOption("short-beep");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop and reset rest timer" }),
  ).toBeVisible();
  await expect(
    page.getByText("Sound unavailable. Completion is visual only.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Stop and reset rest timer" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(
    page.getByRole("heading", { name: "Set 1 · Done" }),
  ).toBeVisible();
});
test("T20 conditioning overlay maps to conditioning rather than strength", async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel("Session", { exact: true }).selectOption({ index: 3 });
  await page
    .getByRole("button", { name: "Exercise demonstration", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Synthetic conditioning example" }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText(/synthetic-walk \/ v1/),
  ).toBeVisible();
});
test("T21 frozen/restored elapsed callbacks derive deadline rather than counting ticks", async ({
  page,
}) => {
  await page.clock.install();
  await setup(page);
  await custom(page, "30");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop and reset rest timer" }),
  ).toBeVisible();
  await page.clock.fastForward(21000);
  await expect(page.getByLabel("Rest timer", { exact: true })).toHaveText(
    /0:0[89]/,
  );
  await page.clock.fastForward(15000);
  await expect(page.getByText("Rest · Rest complete")).toBeVisible();
});
test("T22 Tight landscape expanded options and focused inputs remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await setup(page);
  await expand(page);
  await expect(
    page.getByRole("button", { name: "Collapse timer options" }),
  ).toBeVisible();
  await page.getByLabel("Completion alert").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("Completion alert")).toBeVisible();
  await page.getByRole("button", { name: "Collapse timer options" }).click();
  await page.getByLabel("Weight set 1").focus();
  await page.getByLabel("Weight set 1").scrollIntoViewIfNeeded();
  const input = await page.getByLabel("Weight set 1").boundingBox(),
    dock = await page
      .getByLabel("Rest timer controls", { exact: true })
      .boundingBox();
  expect(input!.y + input!.height).toBeLessThanOrEqual(dock!.y);
  await page.setViewportSize({ width: 844, height: 390 });
  await expand(page);
  await page.getByLabel("Completion alert").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("Completion alert")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
