import { test, expect } from "@playwright/test";
test("prepared Pages subpath build starts M1 and reopens offline with scoped assets", async ({
  page,
  context,
}) => {
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "Begin Workout", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Begin Workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Pause Workout", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved");
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume Workout" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL),
  ).toContain("/fitness-pilot-preview/sw.js");
  await context.setOffline(false);
});
