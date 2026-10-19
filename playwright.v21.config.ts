import { defineConfig } from "@playwright/test";
import local from "./playwright.local.config";
export default defineConfig({
  ...local,
  testMatch: ["v21.spec.ts"],
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/v21/browser-results.json" }],
  ],
});
