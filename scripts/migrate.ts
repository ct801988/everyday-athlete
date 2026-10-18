import { Database } from "../server/database";
const db = new Database(".data/pglite-v3");
await db.init();
console.log("SQL lab migrations ready (not native Supabase Auth/Storage)");
await db.close();
