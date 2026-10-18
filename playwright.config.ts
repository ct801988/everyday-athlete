import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  expect: { timeout: 7000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/browser.json" }],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
    launchOptions: {
      executablePath:
        process.env.EA_CHROMIUM_PATH || resolve(".data/chromium/chromium"),
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    },
  },
  webServer: [
    {
      command: "npm run api",
      url: "http://127.0.0.1:4174/api/health",
      reuseExistingServer: true,
    },
    {
      command: "VITE_EA_MODE=lab npm run dev",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
    },
  ],
});
