import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [320, 390, 412])
  test(`units, preserved history, targets and keyboard clearance ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/tests/local/m1-harness.html");
    await page.waitForFunction(() => !!window.m1Test);
    await page.evaluate(async () => {
      const a = window.m1Test,
        d = a.createModel(),
        s = d.sessions[0],
        h = a.demoSession(d.program);
      h.status = "finished_partial";
      h.performedDate = "2026-10-18";
      const r = h.performances[0].rows[0];
      r.confirmed = true;
      r.actual = {
        load: {
          kind: "external",
          value: 20,
          unit: "kg",
          basis: "per_dumbbell",
        },
        reps: 8,
        seconds: null,
        rir: null,
        rirCapped: false,
      };
      r.draft = a.valuesDraft(r.actual);
      d.sessions.push(h);
      const planned = s.prescription.exercises[0].sets[0];
      planned.suggested = {
        load: {
          kind: "external",
          value: 100,
          unit: "lb",
          basis: "per_dumbbell",
        },
        reps: 8,
        seconds: null,
        rir: null,
        rirCapped: false,
      };
      await a.initialize(d);
    });
    await page.goto("/");
    const first = page.locator(".exercise-card").first();
    await expect(first.locator(".set-head")).toContainText("Weight (lb)");
    await expect(first.locator(".last-target")).toContainText("44.1 lb");
    await first.locator(".target-explanation summary").click();
    await expect(first.locator(".last-target")).toContainText("100 lb");
    await first.locator(".target-explanation summary").click();
    await expect(
      page
        .locator(".rest-bar")
        .getByRole("button", { name: "Start", exact: true }),
    ).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page.screenshot({
      path: `reports/visual-v2-final/${width}-pounds.png`,
    });
    await page
      .getByRole("button", { name: "Begin Workout", exact: true })
      .click();
    await first.getByLabel(/set 1 weight/).fill("25.123456789");
    await expect(
      page.getByRole("complementary", { name: "Rest timer" }),
    ).not.toBeVisible();
    await first.getByLabel(/set 1 reps/).fill("8");
    await first
      .getByRole("button", { name: "Done", exact: true })
      .first()
      .click();
    await expect(
      first.getByRole("button", { name: "Undo", exact: true }),
    ).toHaveCount(1);
    // Snapshot the complete persisted sessions, not just displayed labels.
    const readSessions = async () => {
      await page.goto("/tests/local/m1-harness.html");
      await page.waitForFunction(() => !!window.m1Test);
      return page.evaluate(async () => (await window.m1Test.read())!.sessions);
    };
    const before = await readSessions();
    await page.goto("/");
    const select = async (unit: string) => {
      await page.getByRole("button", { name: "Settings", exact: true }).click();
      await page
        .getByRole("combobox", { name: "Weight units", exact: true })
        .selectOption(unit);
      await expect(
        page.getByRole("combobox", { name: "Weight units", exact: true }),
      ).toHaveValue(unit);
      await expect(page.getByRole("status")).toContainText("Saved");
      await page.getByRole("button", { name: "Close overlay" }).click();
    };
    await select("kg");
    const after = await readSessions();
    expect(after).toEqual(before);
    await page.goto("/");
    await expect(first.locator(".set-head")).toContainText("Weight (kg)");
    await expect(first.getByLabel(/set 1 weight/)).toHaveValue(
      String(Number((25.123456789 * 0.45359237).toFixed(1))),
    );
    await expect(first.locator(".last-target")).toContainText("20 kg");
    await first.locator(".target-explanation summary").click();
    await expect(first.locator(".last-target")).toContainText("45.4 kg");
    await first.locator(".target-explanation summary").click();
    await expect(
      page
        .locator(".rest-bar")
        .getByRole("button", { name: "Start", exact: true }),
    ).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page.screenshot({
      path: `reports/visual-v2-final/${width}-kilograms.png`,
    });
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // Focus reveals full converted precision but never writes it back by itself.
    await first.getByLabel(/set 1 weight/).focus();
    await expect(first.getByLabel(/set 1 weight/)).toHaveValue(
      String(25.123456789 * 0.45359237),
    );
    await page.getByRole("heading", { name: "Today’s workout" }).click();
    await expect(first.getByLabel(/set 1 weight/)).toHaveValue("11.4");
    // A reps-only correction must retain the original exact lb load, not 11.4 kg.
    await first.getByLabel(/set 1 reps/).fill("10");
    await first.getByRole("button", { name: "Save edit", exact: true }).click();
    await expect(
      first.getByRole("button", { name: "Undo", exact: true }),
    ).toHaveCount(1);
    const corrected = await readSessions();
    expect(corrected[0].performances[0].rows[0].actual?.load).toEqual(
      before[0].performances[0].rows[0].actual?.load,
    );
    expect(corrected[0].performances[0].rows[0].actual?.reps).toBe(10);
    await page.goto("/");
    await first.getByLabel(/set 2 weight/).fill("10.50");
    await first.getByLabel(/set 2 reps/).fill("9");
    await first
      .getByRole("button", { name: "Done", exact: true })
      .first()
      .click();
    await expect(
      first.getByRole("button", { name: "Undo", exact: true }),
    ).toHaveCount(2);
    await page.getByRole("button", { name: "Progress", exact: true }).click();
    await expect(page.locator(".progress-loads")).toContainText("20 kg");
    await page.getByRole("button", { name: "Workout", exact: true }).click();
    await expect(
      page.getByRole("complementary", { name: "Rest timer" }),
    ).toHaveCount(1);
    await expect(page.locator(".bottom-nav")).toHaveCount(1);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      expect(await page.locator(".rest-dock").count()).toBe(1);
      expect(await page.locator(".bottom-nav").count()).toBe(1);
      await page.evaluate(() => scrollTo(0, 0));
    }
    await select("lb");
    await expect(first.getByLabel(/set 1 weight/)).toHaveValue("25.123456789");
    await expect(first.getByLabel(/set 2 weight/)).toHaveValue("23.1");
    await page.goto("/tests/local/m1-harness.html");
    await page.waitForFunction(() => !!window.m1Test);
    const saved = await page.evaluate(async () => {
      const a = window.m1Test,
        d = (await a.read())!;
      const b = await a.exportBackup(d),
        restored = await a.parseBackup(JSON.stringify(b));
      return {
        rows: d.sessions[0].performances[0].rows,
        exact: JSON.stringify(restored.sessions) === JSON.stringify(d.sessions),
      };
    });
    expect(saved.exact).toBe(true);
    expect(saved.rows[0].actual?.load).toMatchObject({
      value: 25.123456789,
      unit: "lb",
    });
    expect(saved.rows[1].actual?.load).toMatchObject({
      value: 10.5,
      unit: "kg",
    });
  });
