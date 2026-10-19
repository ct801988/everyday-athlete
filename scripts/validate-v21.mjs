import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
function fingerprint() {
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = directory + "/" + entry.name;
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  for (const dir of ["src", "scripts", "tests"]) walk(dir);
  files.push(
    ...readdirSync(".").filter((name) => /\.(ts|js|json)$/.test(name)),
  );
  const hash = createHash("sha256");
  for (const path of files.sort()) {
    hash.update(path);
    hash.update(readFileSync(path));
  }
  return hash.digest("hex");
}
const folder = "reports/v21";
mkdirSync(folder, { recursive: true });
const commands = [
  ["typecheck", ["run", "typecheck"]],
  ["lint", ["run", "lint"]],
  [
    "unit",
    [
      "run",
      "test:unit",
      "--",
      "--reporter=json",
      "--outputFile=reports/v21/unit-results.json",
    ],
  ],
  [
    "integration",
    [
      "run",
      "test:integration",
      "--",
      "--reporter=json",
      "--outputFile=reports/v21/integration-results.json",
    ],
  ],
  ["production-build", ["run", "build"]],
  [
    "m1-v2-v21-browser",
    [
      "exec",
      "--",
      "playwright",
      "test",
      "--config",
      "playwright.v21-regression.config.ts",
    ],
  ],
  ["project-path-offline", ["run", "test:m1:pages"]],
  [
    "isolated-root-update-rollback",
    [
      "exec",
      "--",
      "playwright",
      "test",
      "--config",
      "playwright.isolated-pages.config.ts",
    ],
  ],
];
const summary = {
  node: process.version,
  sourceFingerprint: fingerprint(),
  started: new Date().toISOString(),
  checks: [],
};
for (const [name, args] of commands) {
  const result = spawnSync("npm", args, {
    encoding: "utf8",
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  writeFileSync(
    `${folder}/${name}.log`,
    `${result.stdout || ""}\n${result.stderr || ""}`,
  );
  summary.checks.push({
    name,
    command: ["npm", ...args].join(" "),
    exitCode: result.status,
    error: result.error?.message ?? null,
  });
  writeFileSync(
    `${folder}/validation-summary.json`,
    JSON.stringify(summary, null, 2),
  );
  console.log(name, result.status === 0 ? "PASS" : "FAIL");
  if (result.status !== 0) {
    console.error((result.stderr || result.stdout || "").slice(-5000));
    process.exit(1);
  }
}
copyFileSync(
  "reports/m1/pages-browser-results.json",
  `${folder}/project-pages-results.json`,
);
copyFileSync(
  "reports/isolated-pages/browser-results.json",
  `${folder}/isolated-pages-results.json`,
);
summary.finished = new Date().toISOString();
summary.sourceStable = summary.sourceFingerprint === fingerprint();
if (!summary.sourceStable)
  throw Error("Source changed during validation; rerun on frozen candidate");
writeFileSync(
  `${folder}/validation-summary.json`,
  JSON.stringify(summary, null, 2),
);
console.log("Validation complete. Physical iPhone checks are not included.");
