import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
const begin = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin Workout", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pause Workout", exact: true }),
  ).toBeEnabled();
};
const saved = async (page: import("@playwright/test").Page) =>
  expect(page.locator(".save-status")).toHaveText("Saved");

test("immediate Begin/Done/Undo/units/Finish reloads retain explicit intent and draft precision", async ({
  page,
}) => {
  page.on("dialog", (d) => d.accept());
  await page.goto("/");
  await saved(page);
  const instant = async (name: string) =>
    page.evaluate((name) => {
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent?.trim() === name)!
        .click();
      location.reload();
    }, name);
  await instant("Begin Workout");
  await expect(
    page.getByRole("button", { name: "Pause Workout", exact: true }),
  ).toBeVisible();
  await saved(page);
  const first = page.getByRole("region", {
    name: "Demo dumbbell press",
    exact: true,
  });
  await first.getByLabel(/set 1 weight/).fill("25.1234567");
  await first.getByLabel(/set 1 reps/).fill("8");
  await saved(page);
  await instant("Done");
  await expect(
    first.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(1);
  await expect(first.getByLabel(/set 1 weight/)).toHaveValue("25.1234567");
  await saved(page);
  await instant("Undo");
  await expect(
    first.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.evaluate(() => {
    const s = document.querySelector("dialog select") as HTMLSelectElement;
    s.value = "kg";
    s.dispatchEvent(new Event("change", { bubbles: true }));
    location.reload();
  });
  await expect(first.locator(".set-head")).toContainText("Weight (kg)");
  await saved(page);
  await page
    .getByRole("button", { name: "Finish Workout", exact: true })
    .first()
    .click();
  await instant("Finish as partial");
  await expect(
    page.getByRole("heading", { name: "Workout finished as partial" }),
  ).toBeVisible();
});

test("invalid Done never creates an unrecoverable pending action; user can correct entries", async ({
  page,
}) => {
  await begin(page);
  const first = page.getByRole("region", {
    name: "Demo dumbbell press",
    exact: true,
  });
  await first
    .getByRole("button", { name: "Done", exact: true })
    .first()
    .click();
  await expect(page.getByRole("alert")).toContainText("Enter actual");
  await first.getByLabel(/set 1 weight/).fill("20");
  await first.getByLabel(/set 1 reps/).fill("8");
  await first
    .getByRole("button", { name: "Done", exact: true })
    .first()
    .click();
  await saved(page);
  await page.reload();
  await expect(
    first.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(1);
});

test("synchronous Pause/reload intent replays exactly once; failed commit is honest and recovered", async ({
  page,
}) => {
  page.on("dialog", (d) => d.accept());
  await begin(page);
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "Pause Workout",
    )!;
    button.click();
    location.reload();
  });
  await expect(
    page.getByRole("button", { name: "Resume Workout", exact: true }),
  ).toBeVisible();
  await saved(page);
  const paused = await page.locator(".session-bar").textContent();
  await page.reload();
  await expect(page.locator(".session-bar")).toHaveText(paused!);
  await page
    .getByRole("button", { name: "Resume Workout", exact: true })
    .click();
  await saved(page);
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (
      ...args: Parameters<IDBObjectStore["put"]>
    ) {
      if (this.name === "workspaces")
        throw new DOMException(
          "Simulated interrupted persistence",
          "AbortError",
        );
      return original.apply(this, args);
    };
  });
  await page
    .getByRole("button", { name: "Pause Workout", exact: true })
    .click();
  await expect(page.locator(".save-status")).toContainText("Not saved");
  await expect(
    page.getByRole("button", { name: "Pause Workout", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume Workout", exact: true }),
  ).toBeVisible();
  await saved(page);
});

test("restore older exact weights, duplicate/no-change, cancellation, invalid input and retained rollback", async ({
  page,
}) => {
  await begin(page);
  const first = page.getByRole("region", {
    name: "Demo dumbbell press",
    exact: true,
  });
  await first.getByLabel(/set 1 weight/).fill("25.1234567");
  await first.getByLabel(/set 1 reps/).fill("8");
  await first
    .getByRole("button", { name: "Done", exact: true })
    .first()
    .click();
  await saved(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const downloadWait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  const file = await downloadWait,
    buffer = await readFile((await file.path())!);
  const upload = () =>
    page.locator("input[type=file]").setInputFiles({
      name: "synthetic-backup.json",
      mimeType: "application/json",
      buffer,
    });
  await page
    .getByRole("button", { name: "Close overlay", exact: true })
    .click();
  await first.getByLabel(/set 1 weight/).fill("99");
  await first.getByRole("button", { name: "Save edit", exact: true }).click();
  await saved(page);
  await page
    .getByRole("button", { name: "Finish Workout", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Finish as partial", exact: true })
    .click();
  await saved(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await upload();
  await expect(page.getByRole("dialog")).toContainText("does not merge");
  await page
    .getByRole("button", { name: "Confirm restore", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Backup restored successfully",
  );
  await page
    .getByRole("button", { name: "Close overlay", exact: true })
    .click();
  await expect(first.getByLabel(/set 1 weight/)).toHaveValue("25.1234567");
  await expect(
    page.getByRole("button", { name: "Pause Workout", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await upload();
  await page
    .getByRole("button", { name: "Confirm restore", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("No changes");
  await upload();
  await page
    .getByRole("button", { name: "Cancel import", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Restore cancelled");
  await page.locator("input[type=file]").setInputFiles({
    name: "winter-strong.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"winterStrong":true}'),
  });
  await expect(page.getByRole("dialog")).toContainText("Invalid backup");
  await page
    .getByRole("combobox", { name: "Weight units", exact: true })
    .selectOption("kg");
  await saved(page);
  await page
    .getByRole("button", { name: "Close overlay", exact: true })
    .click();
  await expect(first.getByLabel(/set 1 weight/)).toHaveValue("11.4");
  await first.getByLabel(/set 1 reps/).fill("9");
  await first.getByRole("button", { name: "Save edit", exact: true }).click();
  await saved(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const precisionWait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  const precision = JSON.parse(
    await readFile((await (await precisionWait).path())!, "utf8"),
  );
  expect(
    precision.body.dataset.sessions[0].performances[0].rows[0].actual.load,
  ).toMatchObject({ value: 25.1234567, unit: "lb" });
  await page
    .getByRole("button", { name: "Restore retained M1 workspace", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Previous workspace restored",
  );
  await page
    .getByRole("button", { name: "Close overlay", exact: true })
    .click();
  await expect(first.getByLabel(/set 1 weight/)).toHaveValue("99");
  await expect(
    page.getByRole("heading", { name: "Workout finished as partial" }),
  ).toBeVisible();
});

test("group display is adjacent and reload/unlink preserves prescription and partially logged sets", async ({
  page,
}) => {
  await begin(page);
  const press = page.getByRole("region", {
    name: "Demo dumbbell press",
    exact: true,
  });
  await press.getByLabel(/set 1 weight/).fill("20");
  await press.getByLabel(/set 1 reps/).fill("9");
  await press
    .getByRole("button", { name: "Done", exact: true })
    .first()
    .click();
  await saved(page);
  await page
    .getByRole("button", { name: "Group exercises", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Dumbbell press", exact: true })
    .check();
  await page.getByRole("checkbox", { name: "Squat", exact: true }).check();
  await page
    .getByRole("button", { name: "Group selected", exact: true })
    .click();
  await saved(page);
  await expect(page.locator(".exercise-card").nth(1)).toHaveAttribute(
    "aria-label",
    "Demo squat",
  );
  await expect(
    press.getByRole("button", { name: "Undo", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".exercise-card").nth(1)).toHaveAttribute(
    "aria-label",
    "Demo squat",
  );
  await page.screenshot({
    path: "reports/v21/390-grouped.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Unlink superset A", exact: true })
    .click();
  await saved(page);
  await expect(page.locator(".exercise-card").nth(1)).toHaveAttribute(
    "aria-label",
    "Demo dumbbell row",
  );
  await expect(
    press.getByRole("button", { name: "Undo", exact: true }),
  ).toBeVisible();
});

test("rest ring neutral, running collapse/reopen/reset, five-second completion hold and dismissal", async ({
  page,
}) => {
  await page.goto("/");
  await saved(page);
  await page.getByRole("button", { name: /Expand rest timer/ }).click();
  await expect(page.locator(".radial")).toBeVisible();
  await page
    .getByRole("button", { name: "Collapse timer", exact: true })
    .click();
  await expect(page.locator(".radial")).toHaveCount(0);
  await page.getByRole("button", { name: /Expand rest timer/ }).click();
  await page.getByRole("button", { name: "30s", exact: true }).click();
  await saved(page);
  for (let n = 0; n < 5; n++) {
    await page
      .getByRole("button", { name: "Subtract five seconds", exact: true })
      .click();
    await saved(page);
  }
  await page.screenshot({ path: "reports/v21/390-timer-ready.png" });
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await saved(page);
  await page.getByRole("button", { name: /Collapse rest timer/ }).click();
  await expect(page.locator(".rest-bar")).toContainText("Rest");
  await page.getByRole("button", { name: /Expand rest timer/ }).click();
  await page.screenshot({ path: "reports/v21/390-timer-running.png" });
  await expect(
    page.getByRole("button", {
      name: "Dismiss completed rest timer",
      exact: true,
    }),
  ).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".rest-bar")).toContainText("0:00");
  await page.screenshot({ path: "reports/v21/390-timer-done.png" });
  await page.waitForTimeout(2000);
  await expect(page.locator(".rest-dock")).toHaveClass(/complete/);
  await page
    .getByRole("button", { name: "Dismiss completed rest timer", exact: true })
    .click();
  await saved(page);
  await expect(page.locator(".rest-bar")).toContainText("Ready");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await saved(page);
  await page
    .getByRole("button", { name: "Stop and reset rest timer", exact: true })
    .click();
  await saved(page);
  await expect(page.locator(".rest-bar")).toContainText("0:05");
});

test("timed set stopwatch records only observed seconds, remains editable, pause interruption and factual finish", async ({
  page,
}) => {
  await begin(page);
  const hold = page.getByRole("region", {
    name: "Demo timed hold",
    exact: true,
  });
  await hold
    .getByRole("button", { name: "Start exercise stopwatch", exact: true })
    .first()
    .click();
  await page.waitForTimeout(2200);
  await hold
    .getByRole("button", { name: "Stop exercise stopwatch", exact: true })
    .click();
  await expect(hold.getByLabel(/set 1 seconds/)).toHaveValue(/^[12]$/);
  await expect(
    hold.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(0);
  await hold.getByLabel(/set 1 seconds/).fill("25");
  await hold.getByRole("button", { name: "Done", exact: true }).first().click();
  await saved(page);
  await hold.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "reports/v21/390-stopwatch.png" });
  await hold
    .getByRole("button", { name: "Start exercise stopwatch", exact: true })
    .nth(1)
    .click();
  await page.waitForTimeout(1300);
  await page
    .getByRole("button", { name: "Pause Workout", exact: true })
    .click();
  await saved(page);
  await expect(
    hold.getByRole("button", { name: "Stop exercise stopwatch", exact: true }),
  ).toHaveCount(0);
  await expect(hold.getByLabel(/set 2 seconds/)).toHaveValue("1");
  await page
    .getByRole("button", { name: "Finish Workout", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Finish as partial", exact: true })
    .click();
  await saved(page);
  await expect(
    page.getByText("Timed hold · 1 recorded set", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("heading", { name: "Workout finished as partial", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: "reports/v21/390-finish.png" });
});

test("stopwatch background interruption excludes suspended seconds and recovers draft without Done", async ({
  page,
}) => {
  await begin(page);
  const hold = page.getByRole("region", {
    name: "Demo timed hold",
    exact: true,
  });
  await hold
    .getByRole("button", { name: "Start exercise stopwatch", exact: true })
    .first()
    .click();
  await page.waitForTimeout(1300);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hold.getByLabel(/set 1 seconds/)).toHaveValue("1");
  await expect(
    hold.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(0);
  await saved(page);
  await page.reload();
  await expect(hold.getByLabel(/set 1 seconds/)).toHaveValue("1");
});

test("simulated safe area and visual keyboard hide docks without a bottom scrolling gap", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await begin(page);
  await page.evaluate(() => {
    (document.querySelector(".m1") as HTMLElement).style.setProperty(
      "--safe-bottom",
      "34px",
    );
  });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  expect(await nav.evaluate((e) => getComputedStyle(e).paddingBottom)).toBe(
    "41px",
  );
  expect(await nav.evaluate((e) => e.getBoundingClientRect().bottom)).toBe(844);
  await page
    .getByLabel("Demo dumbbell press set 1 weight", { exact: true })
    .focus();
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport, "height", {
      value: 500,
      configurable: true,
    });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await expect(nav).toBeHidden();
  await expect(
    page.getByRole("complementary", { name: "Rest timer" }),
  ).toBeHidden();
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport, "height", {
      value: 844,
      configurable: true,
    });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await expect(nav).toBeVisible();
});

test("rest completion expires after five seconds; audio preference has exactly two persistent choices", async ({
  page,
}) => {
  await page.goto("/");
  await saved(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const alert = page.getByRole("combobox", { name: "Rest alert", exact: true });
  await expect(alert.locator("option")).toHaveCount(2);
  await alert.selectOption("short-beep");
  await saved(page);
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(alert).toHaveValue("short-beep");
  await expect(page.getByRole("dialog")).toContainText("locked");
  await page
    .getByRole("button", { name: "Close overlay", exact: true })
    .click();
  await page.getByRole("button", { name: /Expand rest timer/ }).click();
  await page.getByRole("button", { name: "30s", exact: true }).click();
  await saved(page);
  for (let i = 0; i < 5; i++) {
    await page
      .getByRole("button", { name: "Subtract five seconds", exact: true })
      .click();
    await saved(page);
  }
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Dismiss completed rest timer",
      exact: true,
    }),
  ).toBeVisible({ timeout: 10000 });
  const completed = Date.now();
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeVisible({ timeout: 6500 });
  expect(Date.now() - completed).toBeGreaterThan(4000);
  await expect(page.locator(".rest-bar")).toContainText("0:05");
});

for (const width of [320, 390, 412])
  test(`V2.1 viewport ${width}: nav has no bottom gap, touch targets, overlays, axe`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await saved(page);
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    expect(
      await nav.evaluate((e) =>
        Math.abs(e.getBoundingClientRect().bottom - innerHeight),
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: `reports/v21/${width}-workout.png`,
      fullPage: true,
    });
    await page.evaluate(() => scrollTo(0, 1000));
    expect(
      await nav.evaluate((e) =>
        Math.abs(e.getBoundingClientRect().bottom - innerHeight),
      ),
    ).toBeLessThanOrEqual(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const button of await nav.getByRole("button").all()) {
      const b = await button.boundingBox();
      expect(b!.height).toBeGreaterThanOrEqual(44);
    }
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(
      page.getByRole("combobox", { name: "Rest alert", exact: true }),
    ).toHaveValue("silent");
    await expect(page.getByRole("dialog")).not.toContainText("no deployment");
    await page.screenshot({ path: `reports/v21/${width}-settings.png` });
  });
