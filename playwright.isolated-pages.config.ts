import { defineConfig } from "@playwright/test";
import local from "./playwright.local.config";
export default defineConfig({
  ...local,
  testMatch: "isolated-pages.spec.ts",
  timeout: 60000,
  webServer: undefined,
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/isolated-pages/browser-results.json" }],
  ],
  use: { ...local.use, baseURL: "http://127.0.0.1:5187" },
});
