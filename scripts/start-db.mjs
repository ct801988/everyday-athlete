import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
// Real local PostgreSQL. No Docker, account creation, hosted service or auth mock.
const databaseDir = resolve(process.env.EA_DATABASE_DIR || ".data/postgres");
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "synthetic-owner-local-only",
  port: 55432,
  persistent: true,
  createPostgresUser: false,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (m) => process.stderr.write(String(m) + "\n"),
});
if (!existsSync(databaseDir + "/PG_VERSION")) await pg.initialise();
await pg.start();
console.log(
  "Real local PostgreSQL ready at 127.0.0.1:55432 (synthetic data only)",
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1000);
