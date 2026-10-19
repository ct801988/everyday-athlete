import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("continuous logging, deliberate actuals, extras, grouping, pause, reopen, partial history and overlays", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin Workout", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".exercise-card")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Begin Workout", exact: true })
    .click();
  const first = page.locator(".exercise-card").nth(0),
    second = page.locator(".exercise-card").nth(1);
  await first.getByLabel(/set 1 weight/).fill("25");
  await first.getByLabel(/set 1 reps/).fill("8");
  await first
    .getByRole("button", { name: "Done", exact: true })
    .first()
    .click();
  await expect(first.getByText("Recorded: 25 × 8 reps")).toBeVisible();
  await second.getByLabel(/set 1 weight/).fill("30");
  await second.getByLabel(/set 1 reps/).fill("9");
  await first.getByRole("button", { name: "Information for" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close overlay" }).click();
  await expect(second.getByLabel(/set 1 reps/)).toHaveValue("9");
  await first.getByRole("button", { name: "Add Set" }).click();
  await expect(first.locator(".set-row")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Add Exercise", exact: false })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Demo conditioning interval/ })
    .click();
  await expect(page.locator(".exercise-card")).toHaveCount(7);
  await page.getByRole("button", { name: "Group / unlink supersets" }).click();
  await page
    .getByRole("checkbox", { name: "Demo dumbbell press", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Demo dumbbell row", exact: true })
    .check();
  await page.getByRole("button", { name: "Group selected" }).click();
  await expect(first.locator(".group")).toHaveText("A1");
  await expect(second.locator(".group")).toHaveText("A2");
  await page.getByRole("button", { name: "Expand rest timer" }).click();
  await page.getByRole("button", { name: "2m", exact: true }).click();
  for (let i = 0; i < 6; i++)
    await page.getByRole("button", { name: "Add five seconds" }).click();
  await expect(page.locator(".adjust")).toContainText("2:30");
  await page
    .locator(".rest-bar")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add five seconds" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Pause Workout", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Resume Workout" }),
  ).toBeVisible();
  await expect(page.locator(".rest-bar")).toContainText("Ready");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume Workout" }),
  ).toBeVisible();
  await expect(second.getByLabel(/set 1 reps/)).toHaveValue("9");
  await expect(first.getByText("Recorded: 25 × 8 reps")).toBeVisible();
  await page.getByRole("button", { name: "Resume Workout" }).click();
  await page
    .getByRole("button", { name: "Finish Workout", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Finish as partial" }).click();
  await expect(
    page.getByRole("heading", { name: "Workout finished as partial" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(
    page.getByText("Partial workout", { exact: true }),
  ).toBeVisible();
});
for (const width of [320, 390, 412])
  test(`mobile ${width}: labels, navigation, contrast and screenshot`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator(".exercise-card")).toHaveCount(6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const tab of ["Program", "Visuals", "Progress", "Workout"]) {
      await page.getByRole("button", { name: tab, exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Settings", exact: true }),
      ).toBeVisible();
    }
    const a = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(a.violations).toEqual([]);
    await page.screenshot({
      path: `reports/m1/workout-${width}.png`,
      fullPage: false,
    });
  });
test("rest deadline expires green and reset restores configured time", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Expand rest timer" }).click();
  await page.getByRole("button", { name: "30s", exact: true }).click();
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Subtract five seconds" }).click();
  await page
    .locator(".rest-bar")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect(page.locator(".rest-bar")).toContainText("Rest complete", {
    timeout: 10000,
  });
  await expect(page.locator(".rest-dock")).toHaveClass(/complete/);
  await expect(page.locator(".rest-bar")).toContainText("0:05");
});

test("offline reopen retains paused drafts and completed records; backup download and preview import", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Begin Workout", exact: true })
    .click();
  const card = page.locator(".exercise-card").first();
  await card.getByLabel(/set 1 weight/).fill("20");
  await card.getByLabel(/set 1 reps/).fill("10");
  await card.getByRole("button", { name: "Done", exact: true }).first().click();
  await page
    .getByRole("button", { name: "Pause Workout", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved");
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume Workout" }),
  ).toBeVisible();
  await expect(card.getByText("Recorded: 20 × 10 reps")).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const dl = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  const download = await dl;
  const path = await download.path();
  expect(path).not.toBeNull();
  await page.locator("input[type=file]").setInputFiles(path!);
  await expect(page.getByText(/Preview: 1 sessions/)).toBeVisible();
  await page.getByRole("button", { name: "Import reviewed backup" }).click();
  await expect(page.getByText(/Preview: 1 sessions/)).not.toBeVisible();
  await context.setOffline(false);
});
test("collapse and keyboard focus restore exact overlay position", async ({
  page,
}) => {
  await page.goto("/");
  const card = page.locator(".exercise-card").nth(2);
  await card.scrollIntoViewIfNeeded();
  const info = card.getByRole("button", { name: /Information for/ });
  await info.focus();
  const y = await page.evaluate(() => scrollY);
  await info.click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close overlay" })
    .click();
  await expect(info).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await card.locator(".exercise-title").click();
  await expect(card.locator(".set-row")).toHaveCount(0);
  await card.locator(".exercise-title").click();
  await expect(card.locator(".set-row")).toHaveCount(3);
});
test("independent origins cannot read M1 records or clear its caches", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin Workout", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  async function datasetId(target: typeof page) {
    return target.evaluate(async () => {
      const name = (await indexedDB.databases()).find((x) =>
        x.name?.endsWith("-m1"),
      )!.name!;
      return new Promise<string>((resolve, reject) => {
        const q = indexedDB.open(name);
        q.onerror = () => reject(q.error);
        q.onsuccess = () => {
          const db = q.result;
          const tx = db.transaction("workspaces", "readonly");
          const st = tx.objectStore("workspaces");
          const a = st.get("active");
          a.onsuccess = () => {
            const d = st.get(a.result);
            d.onsuccess = () => {
              resolve(d.result.id);
              db.close();
            };
          };
        };
      });
    });
  }
  const originalId = await datasetId(page);
  const before = await page.evaluate(() => caches.keys());
  const other = await context.newPage();
  await other.goto("http://localhost:5175/");
  await expect(
    other.getByRole("button", { name: "Begin Workout", exact: true }),
  ).toBeVisible();
  expect(await datasetId(other)).not.toBe(originalId);
  await other.evaluate(async () => {
    for (const key of await caches.keys()) await caches.delete(key);
  });
  expect(await datasetId(page)).toBe(originalId);
  expect(await page.evaluate(() => caches.keys())).toEqual(before);
  await other.close();
});
