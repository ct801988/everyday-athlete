import { defineConfig } from "@playwright/test";
import local from "./playwright.local.config";
export default defineConfig({
  ...local,
  testMatch: ["m1-ui.spec.ts", "m1-storage.spec.ts"],
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/m1/browser-results.json" }],
  ],
});
