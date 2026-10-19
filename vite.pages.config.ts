import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { deploymentBase } from "./scripts/isolated-pages-config.ts";
export default defineConfig({
  plugins: [react()],
  base: deploymentBase(),
  build: { outDir: ".data/pages-build", emptyOutDir: true },
});
