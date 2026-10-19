import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const browser = await chromium.launch({
  executablePath: process.env.EA_CHROMIUM_PATH,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
mkdirSync("reports/v21", { recursive: true });
await page.goto("file://" + resolve("docs/v21/progress-proposal.html"));
await page.screenshot({
  path: "reports/v21/progress-proposal-synthetic.png",
  fullPage: true,
});
await page.goto(
  "file://" + resolve("docs/v21/progress-proposal.html") + "#empty",
);
await page.reload();
await page.locator("#empty").waitFor({ state: "visible" });
await page.screenshot({
  path: "reports/v21/progress-proposal-empty.png",
  fullPage: true,
});
console.log(
  "Two proposal screenshots, fictional examples only",
  readFileSync("docs/v21/progress-proposal.html").length,
);
await browser.close();
