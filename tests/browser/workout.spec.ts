import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page: Page, name = "alice") {
  await page.goto("/");
  await page.getByLabel("Username", { exact: true }).fill(name);
  await page.getByLabel("Password", { exact: true }).fill(name + "-local-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Signed in:")).toBeVisible();
}
async function sync(page: Page) {
  await page
    .getByRole("button", { name: "Sync to account", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved to account.");
}
test("draft suggestions, one-tap confirmation, correction and undo survive real reload", async ({
  page,
}) => {
  await login(page);
  await page.getByLabel("Set 1 weight", { exact: true }).fill("45");
  await page.getByLabel("Set 1 reps", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(page.getByTestId("completion-count")).toContainText("1 of 3");
  await sync(page);
  await page.reload();
  await expect(page.getByLabel("Set 1 weight", { exact: true })).toHaveValue(
    "45",
  );
  await expect(page.getByTestId("completion-count")).toContainText("1 of 3");
  await page.getByLabel("Set 1 reps", { exact: true }).fill("9");
  await page
    .getByRole("button", { name: "Save correction", exact: true })
    .first()
    .click();
  await sync(page);
  await page.getByRole("button", { name: "Undo set 1", exact: true }).click();
  await sync(page);
  await expect(page.getByTestId("completion-count")).toContainText("0 of 3");
});
test("bulk cancel creates no actuals; explicit confirmation records only remaining rows", async ({
  page,
}) => {
  await login(page);
  await page
    .getByRole("button", { name: "Mark remaining sets complete" })
    .click();
  await page.getByRole("button", { name: "Cancel bulk" }).click();
  await expect(page.getByTestId("completion-count")).toContainText("0 of 3");
  await page
    .getByRole("button", { name: "Mark remaining sets complete" })
    .click();
  await page
    .getByRole("button", { name: "I performed these remaining sets" })
    .click();
  await sync(page);
  await expect(page.getByTestId("completion-count")).toContainText("3 of 3");
  for (const n of [1, 2, 3]) {
    await page
      .getByRole("button", { name: "Undo set " + n, exact: true })
      .click();
    await sync(page);
  }
});
test("overlay preserves unsaved input, tab, focus, exact scroll, carousel and running timer", async ({
  page,
}) => {
  await login(page);
  await page.getByLabel("Set 2 weight", { exact: true }).fill("42");
  await page.getByRole("button", { name: "Start / resume rest" }).click();
  const first = Number(
    (await page.getByTestId("timer").innerText()).replace("s", ""),
  );
  await page
    .getByRole("button", { name: "View demonstration" })
    .scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.getByRole("button", { name: "View demonstration" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Next frame" }).click();
  await expect(page.getByText("Frame 2 of 3")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Set 2 weight", { exact: true })).toHaveValue(
    "42",
  );
  await expect(
    page.getByRole("button", { name: "Workout", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await expect(
    page.getByRole("button", { name: "View demonstration" }),
  ).toBeFocused();
  const after = Number(
    (await page.getByTestId("timer").innerText()).replace("s", ""),
  );
  expect(after).toBeLessThanOrEqual(first);
  expect(after).toBeGreaterThan(first - 10);
  await page.getByRole("button", { name: "View demonstration" }).click();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Set 2 weight", { exact: true })).toHaveValue(
    "42",
  );
});
test("offline interruption retains queued actual and resumes with one server mutation", async ({
  page,
  context,
}) => {
  await login(page);
  await context.setOffline(true);
  await page.getByRole("button", { name: "Done", exact: true }).first().click();
  await expect(page.getByRole("status")).toContainText("1 queued");
  await page.getByRole("button", { name: "Sync to account" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await context.setOffline(false);
  await sync(page);
  const exportData = await (await page.request.get("/api/export")).json();
  expect(
    exportData.actual_sets.filter((x: { confirmed: boolean }) => x.confirmed),
  ).toHaveLength(1);
  await page.getByRole("button", { name: "Undo set 1", exact: true }).click();
  await sync(page);
});
test("conditioning report is optional, separate from target and never praised above range", async ({
  page,
}) => {
  await login(page);
  await page
    .getByRole("combobox", {
      name: "Your Effort Level (optional)",
      exact: true,
    })
    .selectOption("8");
  await page.getByRole("button", { name: "Save effort report" }).click();
  await sync(page);
  await expect(page.getByText("Your Effort Level recorded: 8")).toBeVisible();
  await expect(
    page.getByText("Higher reported effort is context"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip / clear effort" }).click();
  await sync(page);
  await expect(
    page.getByText("Your Effort Level recorded: Not reported"),
  ).toBeVisible();
  await expect(page.getByTestId("effort-target")).toContainText("5–6");
});
test("flexible three/four-day scheduling and explicit reschedule retain ordered identity", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Program", exact: true })
    .selectOption("strength");
  await page
    .getByRole("button", { name: "Generate synthetic schedule" })
    .click();
  await expect(page.locator("ol li").first()).toContainText("slot-1");
  const original = await page.locator("ol li").first().innerText();
  await page
    .getByRole("button", { name: "Preview synthetic reschedule" })
    .click();
  await page
    .getByRole("button", { name: "Confirm synthetic reschedule" })
    .click();
  await expect(page.locator("ol li").first()).toContainText("2026-10-23");
  expect(original).toContain("original");
  await page.reload();
  await page.getByRole("button", { name: "Schedule", exact: true }).click();
  await expect(page.locator("ol li")).toHaveCount(8);
});
test("second synthetic account and exports are isolated through HTTP session and SQL RLS", async ({
  page,
}) => {
  await login(page, "bob");
  await expect(page.getByTestId("completion-count")).toContainText("0 of 3");
  const response = await page.request.get(
    "/api/session?id=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  );
  expect(response.status()).toBe(403);
  const exportData = await (await page.request.get("/api/export")).json();
  expect(
    exportData.sessions.every((s: { user_id: string }) =>
      s.user_id.startsWith("222"),
    ),
  ).toBe(true);
});
test("320px keyboard interaction and automated accessibility audit have no serious/critical violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await login(page);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: "View demonstration" }).click();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    ),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  const body = await new AxeBuilder({ page }).analyze();
  expect(
    body.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    ),
  ).toEqual([]);
});

test("HTTP authentication rejects wrong password and cross-origin mutations", async ({
  page,
}) => {
  const bad = await page.request.post("/api/login", {
    data: { username: "alice", password: "wrong" },
  });
  expect(bad.status()).toBe(401);
  await login(page);
  const denied = await page.request.post("/api/mutate", {
    headers: { Origin: "http://untrusted.invalid" },
    data: {},
  });
  expect(denied.status()).toBe(403);
});

test("two independent devices surface stale edits and preserve an explicit account choice", async ({
  page,
  browser,
}) => {
  await login(page);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const other = await context.newPage();
  try {
    await login(other);
    await page.getByLabel("Set 1 reps", { exact: true }).fill("8");
    await page
      .getByRole("button", { name: "Done", exact: true })
      .first()
      .click();
    await sync(page);
    await other.getByLabel("Set 1 reps", { exact: true }).fill("9");
    await other
      .getByRole("button", { name: "Done", exact: true })
      .first()
      .click();
    await other
      .getByRole("button", { name: "Sync to account", exact: true })
      .click();
    await expect(
      other.getByRole("heading", { name: "Conflicting saved versions" }),
    ).toBeVisible();
    await other.getByRole("button", { name: "Use account version" }).click();
    await expect(other.getByRole("status")).toContainText(
      "Account version kept",
    );
    await expect(other.getByLabel("Set 1 reps", { exact: true })).toHaveValue(
      "8",
    );
    const exported = await (await other.request.get("/api/export")).json();
    expect(
      exported.actual_sets.find((s: { ordinal: number }) => s.ordinal === 1)
        .actual_values.reps,
    ).toBe(8);
    await page.getByRole("button", { name: "Undo set 1", exact: true }).click();
    await sync(page);
  } finally {
    await context.close();
  }
});

test("partial finalization is distinct from full work and can reopen without inventing sets", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "Finish partial session" }).click();
  await sync(page);
  await expect(
    page.getByText("Session status: partial.", { exact: false }),
  ).toBeVisible();
  const exported = await (await page.request.get("/api/export")).json();
  expect(
    exported.actual_sets.filter((s: { confirmed: boolean }) => s.confirmed),
  ).toHaveLength(0);
  await page.getByRole("button", { name: "Reopen for correction" }).click();
  await sync(page);
  await expect(
    page.getByText("Session status: active.", { exact: false }),
  ).toBeVisible();
});
