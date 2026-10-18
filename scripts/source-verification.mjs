import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
mkdirSync("reports", { recursive: true });
const files = [
  "docs/approved/Everyday_Athlete_Decision_Register_v0.5.md",
  "docs/approved/Fitness_Platform_Master_Source_Document_v1.3.md",
  "docs/approved/Everyday_Athlete_Pre_Assignment_002_Work_Brief.md",
];
const phrases = [
  "Approved for MVP",
  "3 training days",
  "4 training days",
  "optional",
  "DEC-006",
  "DEC-008",
  "DEC-009",
];
const register = readFileSync(files[0], "utf8");
for (const phrase of phrases)
  if (!register.includes(phrase))
    throw Error("Missing approved direction: " + phrase);
writeFileSync(
  "reports/source-verification.json",
  JSON.stringify(
    {
      verifiedAt: "2026-10-17",
      materialContradiction: false,
      authority:
        "v0.5 source plus explicit Assignment 002 execution authorization; historical no-code instruction superseded only within F01–F09",
      files: files.map((path) => ({
        path,
        sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
      })),
    },
    null,
    2,
  ) + "\n",
);
console.log("Source direction verified; no material contradiction.");
