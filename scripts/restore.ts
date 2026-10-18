import { PGlite } from "@electric-sql/pglite";
import { existsSync, readFileSync } from "node:fs";
const [source, target] = process.argv.slice(2);
if (!source || !target)
  throw Error("Usage: npm run db:restore -- BACKUP.tgz NEW_DIRECTORY");
if (existsSync(target))
  throw Error(
    "Restore target must not exist. Existing data is never overwritten.",
  );
const db = new PGlite({
  dataDir: target,
  loadDataDir: new Blob([readFileSync(source)]),
});
await db.waitReady;
try {
  const count = await db.query<{ count: string }>(
    "select count(*)::text from public.sessions",
  );
  console.log(
    "Restored SQL-lab sessions: " +
      count.rows[0].count +
      " into " +
      target +
      "; not a native Supabase/Auth/Storage restoration.",
  );
} finally {
  await db.close();
}
