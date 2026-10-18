// Registry-packaged Chromium fallback for hosts where Playwright CDN is blocked.
// Extract archives without ownership changes; no system users/files are changed.
import { brotliDecompressSync } from "node:zlib";
import { readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
const base = resolve("node_modules/@sparticuz/chromium/bin"),
  out = resolve(".data/chromium");
mkdirSync(out, { recursive: true });
writeFileSync(
  out + "/chromium",
  brotliDecompressSync(readFileSync(base + "/chromium.br")),
);
chmodSync(out + "/chromium", 0o755);
for (const file of ["fonts", "swiftshader"]) {
  writeFileSync(
    out + "/" + file + ".tar",
    brotliDecompressSync(readFileSync(base + "/" + file + ".tar.br")),
  );
  execFileSync("tar", [
    "--no-same-owner",
    "-xf",
    out + "/" + file + ".tar",
    "-C",
    out,
  ]);
}
console.log("Browser extracted locally at " + out + "/chromium");
