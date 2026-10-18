import http from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { Database } from "./database";
import {
  ALICE,
  BOB,
  ALICE_SESSION,
  BOB_SESSION,
  ALICE_CONDITIONING,
  BOB_CONDITIONING,
} from "../src/domain/fixtures";
import { compareEffort, recommend } from "../src/domain/coaching";
import {
  reschedule,
  schedule,
  ScheduleRequest,
  type Slot,
} from "../src/domain/scheduling";
import { csvCell, UUID } from "../src/domain/contracts";
const db = new Database(process.env.EA_SQL_DIR || ".data/pglite-v3");
await db.init();
const accounts = Object.fromEntries(
  [
    ["alice", ALICE],
    ["bob", BOB],
  ].map(([name, id]) => [
    name,
    { id, hash: scryptSync(name + "-local-only", "synthetic-lab-salt", 64) },
  ]),
);
const sessions = new Map<string, { user: string; expires: number }>(),
  attempts = new Map<string, { count: number; until: number }>();
const allowedOrigins = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
]);
async function body(req: http.IncomingMessage) {
  let value = "";
  for await (const chunk of req) {
    value += String(chunk);
    if (value.length > 65536) throw Error("Payload too large");
  }
  return JSON.parse(value || "{}") as unknown;
}
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  const send = (code: number, data: unknown) => {
    res.writeHead(code);
    res.end(JSON.stringify(data));
  };
  if (
    ![
      "127.0.0.1:4174",
      "localhost:4174",
      "127.0.0.1:5173",
      "localhost:5173",
    ].includes(req.headers.host || "")
  )
    return send(403, { error: "Host denied" });
  if (req.headers.origin && !allowedOrigins.has(req.headers.origin))
    return send(403, { error: "Origin denied" });
  const url = new URL(req.url || "/", "http://127.0.0.1");
  try {
    if (url.pathname === "/api/health")
      return send(200, {
        ok: true,
        engine: "PostgreSQL WASM SQL lab",
        nativeSupabaseVerified: false,
        synthetic: true,
      });
    if (url.pathname === "/api/login" && req.method === "POST") {
      const key = req.socket.remoteAddress || "local",
        now = Date.now();
      let limit = attempts.get(key);
      if (!limit || limit.until < now) {
        limit = { count: 0, until: now + 60000 };
        attempts.set(key, limit);
      }
      if (++limit.count > 30) return send(429, { error: "Try again later" });
      const input = z
        .object({ username: z.string().max(40), password: z.string().max(100) })
        .strict()
        .parse(await body(req));
      const account = accounts[input.username];
      const hash = scryptSync(input.password, "synthetic-lab-salt", 64);
      if (!account || !timingSafeEqual(hash, account.hash))
        return send(401, { error: "Invalid credentials" });
      const token = randomBytes(32).toString("hex");
      sessions.set(token, {
        user: account.id,
        expires: Date.now() + 8 * 3600000,
      });
      res.setHeader(
        "Set-Cookie",
        "ea_session=" +
          token +
          "; HttpOnly; SameSite=Strict; Path=/api; Max-Age=28800",
      );
      return send(200, {
        id: account.id,
        sessionId: input.username === "alice" ? ALICE_SESSION : BOB_SESSION,
      });
    }
    const token =
      req.headers.cookie
        ?.split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith("ea_session="))
        ?.split("=")[1] || "";
    const auth = sessions.get(token);
    if (!auth || auth.expires < Date.now())
      return send(401, { error: "Sign in required" });
    const user = auth.user;
    if (url.pathname === "/api/me")
      return send(200, {
        id: user,
        sessionId: user === ALICE ? ALICE_SESSION : BOB_SESSION,
      });
    if (url.pathname === "/api/logout" && req.method === "POST") {
      sessions.delete(token);
      res.setHeader(
        "Set-Cookie",
        "ea_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0",
      );
      return send(200, { ok: true });
    }
    if (url.pathname === "/api/conditioning")
      return send(
        200,
        await db.readSession(
          user,
          user === ALICE ? ALICE_CONDITIONING : BOB_CONDITIONING,
        ),
      );
    if (url.pathname === "/api/session") {
      const id = UUID.parse(url.searchParams.get("id"));
      return send(200, await db.readSession(user, id));
    }
    if (url.pathname === "/api/mutate" && req.method === "POST")
      return send(200, await db.mutate(user, await body(req)));
    if (url.pathname === "/api/coaching") {
      const s = await db.readSession(
        user,
        UUID.parse(url.searchParams.get("id")),
      );
      const output = {
        recommendation: recommend({
          prescription: s.prescription,
          history: [],
          pain: false,
          tired: false,
          increment: 2.5,
        }),
        effort: compareEffort(s.prescription.effortTarget, s.effort),
      };
      await db.exclusive(() =>
        db.engine.query(
          "insert into public.recommendation_runs(user_id,session_id,context_revision,input_snapshot,output) values($1,$2,$3,$4,$5)",
          [user, s.id, s.revision, JSON.stringify(output)],
        ),
      );
      return send(200, output);
    }
    if (url.pathname === "/api/schedule" && req.method === "GET")
      return send(
        200,
        await db.as(
          user,
          async (q) =>
            (await q("select revision,data from public.schedules")).rows[0] || {
              revision: 0,
              data: [],
            },
        ),
      );
    if (url.pathname === "/api/schedule" && req.method === "POST") {
      const input = z
        .object({
          expectedRevision: z.number().int().nonnegative(),
          request: ScheduleRequest,
        })
        .strict()
        .parse(await body(req));
      const data = schedule(input.request);
      return send(
        200,
        await db.as(
          user,
          async (q) =>
            (
              await q("select public.save_schedule($1,$2,$3) as saved", [
                input.expectedRevision,
                JSON.stringify(data),
                JSON.stringify(input.request),
              ])
            ).rows[0],
        ),
      );
    }
    if (url.pathname === "/api/reschedule" && req.method === "POST") {
      const input = z
        .object({
          id: z.string(),
          date: z.string(),
          expectedRevision: z.number().int(),
          slotRevision: z.number().int(),
          minimumGapDays: z.number().int().min(1).max(7),
        })
        .strict()
        .parse(await body(req));
      const current = await db.as(
        user,
        async (q) =>
          (
            await q<{
              revision: number;
              data: Slot[];
              preferences: { weekdays: number[] };
            }>("select revision,data,preferences from public.schedules")
          ).rows[0],
      );
      if (!current || current.revision !== input.expectedRevision)
        throw Error("Schedule revision conflict");
      const data = reschedule(
        current.data,
        input.id,
        input.date,
        input.minimumGapDays,
        input.slotRevision,
        current.preferences.weekdays,
      );
      return send(
        200,
        await db.as(
          user,
          async (q) =>
            (
              await q("select public.save_schedule($1,$2,$3) as saved", [
                current.revision,
                JSON.stringify(data),
                JSON.stringify(current.preferences),
              ])
            ).rows[0],
        ),
      );
    }
    if (url.pathname === "/api/export") {
      const data = await db.export(user);
      if (url.searchParams.get("format") === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.end(
          "Record type,Data\r\n" +
            Object.entries(data)
              .map(([k, v]) => csvCell(k) + "," + csvCell(v))
              .join("\r\n"),
        );
        return;
      }
      return send(200, data);
    }
    send(404, { error: "Not found" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed";
    const code = /not accessible|Unauthorized/.test(message)
      ? 403
      : /conflict|mismatch/i.test(message)
        ? 409
        : 400;
    send(code, { error: message });
  }
});
server.listen(4174, "127.0.0.1", () =>
  console.log(
    "Synthetic foundation API on http://127.0.0.1:4174 — WASM SQL lab, NOT full Supabase Auth/Storage",
  ),
);
async function close() {
  server.close();
  await db.close();
  process.exit(0);
}
process.on("SIGTERM", close);
process.on("SIGINT", close);
