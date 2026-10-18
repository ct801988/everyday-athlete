import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { Database } from "../server/database";
const path = process.env.EA_SQL_DIR || ".data/pglite-v3";
if (!existsSync(path))
  throw Error("No existing SQL lab to back up. Stop the API before backup.");
const db = new Database(path);
await db.init();
try {
  const snapshot = await db.snapshot();
  mkdirSync(".data/backups", { recursive: true });
  const target = ".data/backups/sql-lab-" + Date.now() + ".tgz";
  writeFileSync(target, new Uint8Array(await snapshot.arrayBuffer()));
  console.log("Synthetic WASM SQL backup: " + target);
} finally {
  await db.close();
}
