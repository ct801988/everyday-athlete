import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
export default defineConfig({
  testDir: "tests/local",
  testMatch: "**/*.spec.ts",
  outputDir: ".data/local-test-results",
  workers: 1,
  timeout: 45000,
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/mobile-timer/local-browser.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5175",
    viewport: { width: 390, height: 844 },
    launchOptions: {
      executablePath:
        process.env.EA_CHROMIUM_PATH || resolve(".data/chromium/chromium"),
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    },
  },
  webServer: {
    command:
      "npm run build:test && npx vite preview --outDir .data/local-test-build --host 127.0.0.1 --port 5175 --strictPort",
    url: "http://127.0.0.1:5175",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
