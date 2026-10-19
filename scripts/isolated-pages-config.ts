import { ISOLATED_PREVIEW_HOST } from "../src/m1/host";
import { pagesBase } from "./pages-path";

export function deploymentBase(
  mode = process.env.EA_ISOLATED_PAGES,
  host = process.env.VITE_EA_APPROVED_HOST,
  base = process.env.EA_PAGES_BASE,
) {
  if (mode === "1") {
    if (host !== ISOLATED_PREVIEW_HOST || base !== "/")
      throw Error(
        "Isolated Pages requires the exact approved hostname and root base",
      );
    return "/";
  }
  if (mode) throw Error("Unknown isolated Pages mode");
  return pagesBase(base);
}
