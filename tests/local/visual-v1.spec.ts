import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
test("capture full-size 390px V1 states with synthetic interaction data", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".exercise-card")).toHaveCount(6);
  const shot = async (name: string, fullPage = false) =>
    page.screenshot({ path: `reports/visual-v1/${name}.png`, fullPage });
  await shot("01-workout-header");
  await shot("02-continuous-workout", true);
  await page
    .getByRole("button", { name: "Begin Workout", exact: true })
    .click();
  const first = page.locator(".exercise-card").first();
  for (let i = 1; i <= 3; i++) {
    await first
      .getByLabel(`Demo dumbbell press set ${i} weight`, { exact: true })
      .fill("25");
    await first
      .getByLabel(`Demo dumbbell press set ${i} reps`, { exact: true })
      .fill("8");
    await first
      .getByRole("button", { name: "Done", exact: true })
      .first()
      .click();
  }
  await first.locator(".exercise-title").click();
  await page.evaluate(() => scrollTo(0, 0));
  await shot("03-completed-collapsed");
  await page.getByRole("button", { name: "Expand rest timer" }).click();
  await shot("04-timer-expanded");
  await page.getByRole("button", { name: "30s", exact: true }).click();
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Subtract five seconds" }).click();
  await page
    .locator(".rest-bar")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await shot("05-timer-running");
  await expect(page.locator(".rest-dock")).toHaveClass(/complete/, {
    timeout: 10000,
  });
  await shot("06-timer-complete");
  await page
    .locator(".exercise-card")
    .first()
    .getByRole("button", { name: /Information for/ })
    .click();
  await shot("07-exercise-overlay");
  await page.getByRole("button", { name: "Close overlay" }).click();
  await page.getByRole("button", { name: "Visuals", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Visuals", exact: true }),
  ).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
  await shot("08-visuals-library");
  await page.getByLabel("Search exercises", { exact: true }).fill("row");
  await shot("09-visuals-search");
  await page.getByRole("button", { name: "Workout", exact: true }).click();
  await expect(page.locator(".exercise-card")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Finish Workout", exact: true })
    .first()
    .click();
  await shot("10-partial-summary");
  await page.getByRole("button", { name: "Finish as partial" }).click();
});
