/* global navigator */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const results = [];
const browser = await chromium.launch({
  executablePath: resolve(".data/chromium/chromium"),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
let server;
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("file://" + resolve("review-candidate/COPY_WORKER.html"));
  const code = readFileSync("review-candidate/worker.js", "utf8");
  assert.equal(await page.locator("#code").inputValue(), code);
  results.push({
    name: "copy helper preserves exact tested Worker bytes",
    status: "passed",
  });
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text) => {
          globalThis.copied = text;
        },
      },
    });
  });
  await page.locator("#copy").click();
  assert.equal(await page.evaluate(() => globalThis.copied), code);
  results.push({
    name: "copy action passes exact bytes to clipboard API (API instrumented)",
    status: "passed",
  });
  assert(requests.every((x) => x.startsWith("file://")));
  results.push({
    name: "copy helper makes no network requests",
    status: "passed",
  });
  const meta = JSON.parse(
    readFileSync("review-candidate/package.json", "utf8"),
  );
  assert.equal(createHash("sha256").update(code).digest("hex"), meta.sha256);
  results.push({
    name: "review Worker matches tested generated package hash",
    status: "passed",
  });
  server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "5176",
      "--strictPort",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  await new Promise((ok, no) => {
    server.stdout.once("data", ok);
    server.once("error", no);
    server.once("exit", () => no(Error("Local screenshot server exited")));
  });
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto("http://127.0.0.1:5176");
  await p
    .getByRole("button", { name: "Start synthetic demonstration" })
    .click();
  await p.getByLabel("Weight set 1").fill("57");
  await p.getByRole("button", { name: "Done", exact: true }).first().click();
  await p
    .getByLabel("Weight set 1")
    .evaluate((el) => el.scrollIntoView({ block: "center" }));
  await p.screenshot({
    path: "reports/mobile-timer/screenshots/logging-390x844.png",
  });
} catch (error) {
  results.push({
    name: "review artifact verification",
    status: "failed",
    error: String(error),
  });
  throw error;
} finally {
  server?.kill();
  await browser.close();
  mkdirSync("reports/mobile-timer", { recursive: true });
  writeFileSync(
    "reports/mobile-timer/review-artifact-checks.json",
    JSON.stringify(
      {
        cases: results,
        passed: results.filter((x) => x.status === "passed").length,
        failed: results.filter((x) => x.status === "failed").length,
        clipboardLimitation:
          "API instrumented; native clipboard permissions/browser behavior remain platform-specific",
      },
      null,
      2,
    ),
  );
}
console.log(
  `${results.length} review artifact checks passed; synthetic logging screenshot captured`,
);
