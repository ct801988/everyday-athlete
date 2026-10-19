/* global document, indexedDB, Storage, window, DOMException */
// Optional repeatable checks against the locally built review artifact only.
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import { chromium, expect } from "@playwright/test";
const folder = resolve(".data/pages-build");
const server = createServer((req, res) => {
  const pathname = new URL(req.url, "http://127.0.0.1:5197").pathname;
  const file = resolve(
    folder,
    "." + (pathname === "/" ? "/index.html" : pathname),
  );
  if (!file.startsWith(folder + "/") || !existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.setHeader(
    "Content-Type",
    {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".webmanifest": "application/manifest+json",
    }[extname(file)] || "application/octet-stream",
  );
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(5197, "127.0.0.1", ok));
const browser = await chromium.launch({
  executablePath: process.env.EA_CHROMIUM_PATH,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("dialog", (d) => d.accept());
const checks = [];
try {
  await page.goto("http://127.0.0.1:5197/");
  const saved = () => expect(page.locator(".save-status")).toHaveText("Saved");
  const twice = async (name) =>
    page.evaluate((name) => {
      const b = [...document.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === name,
      );
      b.click();
      b.click();
    }, name);
  await expect(
    page.getByRole("button", { name: "Begin Workout", exact: true }),
  ).toBeVisible();
  await twice("Begin Workout");
  await saved();
  await twice("Pause Workout");
  await saved();
  await twice("Resume Workout");
  await saved();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Pause Workout", exact: true }),
  ).toBeVisible();
  const intervals = await page.evaluate(async () => {
    const name = (await indexedDB.databases()).find((d) =>
      d.name.endsWith("-m1"),
    ).name;
    return new Promise((ok, no) => {
      const q = indexedDB.open(name);
      q.onerror = () => no(q.error);
      q.onsuccess = () => {
        const db = q.result,
          s = db
            .transaction("workspaces", "readonly")
            .objectStore("workspaces"),
          a = s.get("active");
        a.onsuccess = () => {
          const d = s.get(a.result);
          d.onsuccess = () => {
            ok(d.result.sessions[0].intervals);
            db.close();
          };
        };
      };
    });
  });
  expect(intervals).toHaveLength(2);
  expect(intervals.filter((i) => i.end === null)).toHaveLength(1);
  checks.push({
    name: "rapid duplicate Begin/Pause/Resume preserve one active interval after reload",
    result: "PASS",
  });
  const hold = page.getByRole("region", {
    name: "Demo timed hold",
    exact: true,
  });
  await hold
    .getByRole("button", { name: "Start exercise stopwatch", exact: true })
    .first()
    .click();
  await page.waitForTimeout(2200);
  await page.reload();
  await expect(hold.getByLabel(/set 1 seconds/)).toHaveValue(/^[12]$/);
  await expect(
    hold.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(0);
  checks.push({
    name: "stopwatch interrupted by reload recovers observed draft without confirming a set",
    result: "PASS",
  });
  await saved();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("ea-m1-lifecycle:"))
        throw new DOMException("Simulated quota", "QuotaExceededError");
      return original.call(this, key, value);
    };
    window.restoreStorageForTest = () => (Storage.prototype.setItem = original);
  });
  await page
    .getByRole("button", { name: "Pause Workout", exact: true })
    .click();
  await expect(page.locator(".save-status")).toContainText("Not saved");
  await page.evaluate(() => window.restoreStorageForTest());
  await page
    .getByRole("button", { name: "Reload saved records", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pause Workout", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Pause Workout", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Resume Workout", exact: true }),
  ).toBeVisible();
  checks.push({
    name: "journal storage failure rejects action visibly and permits safe recovery/retry",
    result: "PASS",
  });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Rest alert", exact: true })
    .selectOption("short-beep");
  await saved();
  await page.screenshot({ path: "reports/v21/390-settings-release.png" });
  const beforeRoot = resolve("../ea-v21-baseline/.data/local-test-build");
  if (existsSync(beforeRoot + "/index.html")) {
    const before = createServer((req, res) => {
      const pathname = new URL(req.url, "http://127.0.0.1:5198").pathname,
        file = resolve(
          beforeRoot,
          "." + (pathname === "/" ? "/index.html" : pathname),
        );
      if (!file.startsWith(beforeRoot + "/") || !existsSync(file)) {
        res.writeHead(404).end();
        return;
      }
      res.setHeader(
        "Content-Type",
        {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".png": "image/png",
        }[extname(file)] || "application/octet-stream",
      );
      res.end(readFileSync(file));
    });
    await new Promise((ok) => before.listen(5198, "127.0.0.1", ok));
    try {
      for (const width of [320, 390, 412]) {
        for (const [port, path] of [
          [5198, "reports/v21-before"],
          [5197, "reports/v21"],
        ]) {
          const capture = await browser.newPage({
            viewport: { width, height: 844 },
          });
          await capture.goto(`http://127.0.0.1:${port}/`);
          await expect(
            capture.getByRole("button", { name: "Begin Workout", exact: true }),
          ).toBeVisible();
          await capture.screenshot({ path: `${path}/${width}-viewport.png` });
          await capture.close();
        }
      }
    } finally {
      await new Promise((ok) => before.close(ok));
    }
  }
  writeFileSync(
    "reports/v21/supplemental-results.json",
    JSON.stringify(
      { scope: "local review artifact; disposable browser profile", checks },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(checks));
} finally {
  await browser.close();
  await new Promise((ok) => server.close(ok));
}
