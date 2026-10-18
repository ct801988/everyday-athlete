import { chromium, expect, type Page } from "@playwright/test";
import { createServer, type Server } from "node:http";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve, extname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import assert from "node:assert/strict";
import { pagesBase } from "./pages-path";
import { readBackup } from "../src/local/backup";
const base = pagesBase(),
  dir = resolve(".data/pages-build"),
  evidence = "reports/github-pages";
mkdirSync(evidence, { recursive: true });
const cases: { name: string; status: string; detail?: string }[] = [];
async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    cases.push({ name, status: "passed" });
    console.log("PASS", name);
  } catch (e) {
    cases.push({ name, status: "failed", detail: String(e) });
    throw e;
  }
}
function serve(root: string, prefix: string, port: number): Promise<Server> {
  const s = createServer((req, res) => {
    const u = new URL(req.url!, "http://local");
    if (u.pathname === prefix.slice(0, -1) && prefix !== "/") {
      res.writeHead(301, { location: prefix });
      res.end();
      return;
    }
    if (prefix !== "/" && u.pathname === "/unrelated-app/") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        "<!doctype html><title>Unrelated synthetic test site</title>Unrelated",
      );
      return;
    }
    if (!u.pathname.startsWith(prefix)) {
      res.writeHead(404);
      res.end();
      return;
    }
    let relative;
    try {
      relative = decodeURIComponent(u.pathname.slice(prefix.length));
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    const p = resolve(root, relative || "index.html");
    if (!p.startsWith(root + "/") || !existsSync(p)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader(
      "Content-Type",
      (
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".webmanifest": "application/manifest+json",
          ".png": "image/png",
        } as Record<string, string>
      )[extname(p)] || "application/octet-stream",
    );
    res.end(readFileSync(p));
  });
  return new Promise((r) => s.listen(port, "127.0.0.1", () => r(s)));
}
const origin = "http://127.0.0.1:5190",
  oldOrigin = "http://127.0.0.1:5191",
  launch = {
    executablePath:
      process.env.EA_CHROMIUM_PATH || resolve(".data/chromium/chromium"),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  };
let server: Server | undefined, oldServer: Server | undefined;
const browser = await chromium.launch(launch),
  profile = mkdtempSync(join(tmpdir(), "ea-pages-test-"));
let context = await chromium.launchPersistentContext(profile, {
  ...launch,
  viewport: { width: 390, height: 844 },
});
const original = new Map<string, Buffer>();
for (const f of ["index.html", "sw.js", "release.json"])
  original.set(f, readFileSync(dir + "/" + f));
const snapshot = resolve(".data/pages-rollback-check");
rmSync(snapshot, { recursive: true, force: true });
cpSync(dir, snapshot, { recursive: true });
async function exportFile(p: Page) {
  const event = p.waitForEvent("download");
  await p
    .getByRole("button", { name: "Export full backup", exact: true })
    .click();
  return (await (await event).path())!;
}
async function activate(p: Page) {
  await expect(
    p.getByRole("button", { name: /Apply cached app update/ }),
  ).toBeVisible();
  await p.getByRole("button", { name: /Apply cached app update/ }).click();
  await expect(p.getByRole("navigation")).toBeVisible();
}
try {
  server = await serve(dir, base, 5190);
  oldServer = await serve(resolve("deployment-candidate/public"), "/", 5191);
  const old = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    p = await context.newPage(),
    network: string[] = [];
  context.on("request", (r) => network.push(r.url()));
  let backupPath = "",
    legacyId = "";
  await check(
    "PG01 project-path assets, manifest and exact SW scope",
    async () => {
      await p.goto(origin + base);
      await expect(
        p.getByRole("button", { name: "Start synthetic demonstration" }),
      ).toBeVisible();
      await p.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      const scope = await p.evaluate(async () => {
        const r = await navigator.serviceWorker.getRegistration();
        return r?.scope;
      });
      assert.equal(scope, origin + base);
      const manifest = await (
        await p.request.get(origin + base + "manifest.webmanifest")
      ).json();
      assert.equal(manifest.start_url, base);
      assert.equal(manifest.scope, base);
      for (const icon of manifest.icons) assert(icon.src.startsWith(base));
      assert.equal(
        (await p.request.get(origin + "/assets/not-here.js")).status(),
        404,
      );
    },
  );
  await check(
    "PG02 legacy-host export and cross-origin restore preview preserve actuals/unknowns",
    async () => {
      await old.goto(oldOrigin);
      await old
        .getByRole("button", { name: "Start synthetic demonstration" })
        .click();
      await old.getByLabel("Weight set 1").fill("54");
      await old
        .getByRole("button", { name: "Done", exact: true })
        .first()
        .click();
      await old.getByRole("button", { name: "Backup", exact: true }).click();
      backupPath = await exportFile(old);
      const raw = JSON.parse(readFileSync(backupPath, "utf8"));
      assert.equal(raw.body.dataset.schemaVersion, 1);
      legacyId = raw.body.dataset.id;
      await p.getByLabel("Import JSON backup").setInputFiles(backupPath);
      await expect(p.getByText(/Legacy v1 backup/)).toBeVisible();
      await p.getByLabel(/I understand/).check();
      await p.getByRole("button", { name: "Confirm restore" }).click();
      await p.getByRole("button", { name: "Workout", exact: true }).click();
      await expect(p.getByLabel("Weight set 1")).toHaveValue("54");
      await expect(
        p.getByRole("heading", { name: "Set 1 · Done" }),
      ).toBeVisible();
    },
  );
  await check(
    "PG03 Pages namespace is distinct; it is not an authorization boundary",
    async () => {
      const names = await p.evaluate(async () =>
        (await indexedDB.databases()).map((x) => x.name),
      );
      assert(names.includes("everyday-athlete-local@" + base));
      assert(!names.includes("everyday-athlete-local"));
    },
  );
  await check(
    "PG04 no registration and no workout uploads or external requests",
    async () => {
      assert(network.every((x) => x.startsWith(origin)));
      assert(!network.some((x) => x.includes("/api/")));
    },
  );
  await check(
    "PG05 offline reload, deliberate logging, history and scheduling",
    async () => {
      await p.reload();
      await p.waitForFunction(() => !!navigator.serviceWorker.controller);
      await context.setOffline(true);
      await p.reload();
      await p.getByLabel("Weight set 2").fill("56");
      await p.getByRole("button", { name: "Done", exact: true }).nth(0).click();
      await expect(
        p.getByRole("heading", { name: "Set 2 · Done" }),
      ).toBeVisible();
      await p.getByRole("button", { name: "History", exact: true }).click();
      await expect(
        p.getByRole("heading", { name: "History and progress" }),
      ).toBeVisible();
      await p.getByRole("button", { name: "Schedule", exact: true }).click();
      await expect(p.getByRole("heading", { name: /Schedule/ })).toBeVisible();
      await context.setOffline(false);
    },
  );
  await check("PG06 old host remains unchanged after migration", async () => {
    await old.reload();
    await old.getByRole("button", { name: "Workout", exact: true }).click();
    await expect(old.getByLabel("Weight set 1")).toHaveValue("54");
    await expect(
      old.getByRole("heading", { name: "Set 2 · Not performed" }),
    ).toBeVisible();
  });
  await check(
    "PG07 actual browser close/relaunch persists imported history on project path",
    async () => {
      await context.close();
      context = await chromium.launchPersistentContext(profile, {
        ...launch,
        viewport: { width: 390, height: 844 },
      });
    },
  );
  const live = await context.newPage();
  await check("PG08 restarted browser reopens cached app offline", async () => {
    await context.setOffline(true);
    await live.goto(origin + base);
    await live.getByRole("button", { name: "Workout", exact: true }).click();
    await expect(live.getByLabel("Weight set 2")).toHaveValue("56");
    await expect(
      live.getByRole("heading", { name: "Set 2 · Done" }),
    ).toBeVisible();
    await context.setOffline(false);
  });
  await check(
    "PG09 current-format backup validates checksum, actuals, unknown effort/RIR and same-file import",
    async () => {
      await live.getByRole("button", { name: "Backup", exact: true }).click();
      const path = await exportFile(live),
        b = await readBackup(readFileSync(path, "utf8"));
      assert.equal(b.body.dataset.id, legacyId);
      assert.equal(b.body.dataset.sessions[0].actuals.length, 2);
      assert.equal(b.body.dataset.sessions[0].actuals[0].values.rir, null);
      assert.equal(b.body.dataset.sessions.at(-1)!.effort, null);
      await live.getByLabel("Import JSON backup").setInputFiles(path);
      await live.getByLabel(/I understand/).check();
      await live.getByRole("button", { name: "Confirm restore" }).click();
      await expect(live.getByText(/Restore completed/)).toBeVisible();
    },
  );
  await check(
    "PG10 invalid import leaves current performed history unchanged",
    async () => {
      await live.getByLabel("Import JSON backup").setInputFiles({
        name: "invalid.json",
        mimeType: "application/json",
        buffer: Buffer.from('{"body":{"formatVersion":99}}'),
      });
      await expect(live.getByRole("alert")).toContainText("Import rejected");
      await live.getByRole("button", { name: "Workout", exact: true }).click();
      await expect(live.getByLabel("Weight set 1")).toHaveValue("54");
    },
  );
  await check(
    "PG11 same-schema release update waits for explicit activation and retains workouts",
    async () => {
      execFileSync("npm", ["run", "build:pages"], {
        env: { ...process.env, EA_PAGES_RELEASE_SHA: "b".repeat(40) },
        stdio: "pipe",
      });
      await live.evaluate(async () => {
        await (await navigator.serviceWorker.getRegistration())!.update();
      });
      await activate(live);
      await expect(live.getByLabel("Weight set 2")).toHaveValue("56");
      const release = await live.evaluate(
        async () =>
          await (await fetch(new URL("release.json", location.href))).json(),
      );
      assert.equal(release.revision, "b".repeat(40));
    },
  );
  await check(
    "PG12 republishing previous compatible artifact rolls code back without reverting workouts",
    async () => {
      cpSync(snapshot, dir, { recursive: true });
      await live.evaluate(async () => {
        await (await navigator.serviceWorker.getRegistration())!.update();
      });
      await activate(live);
      await expect(live.getByLabel("Weight set 2")).toHaveValue("56");
      const release = await live.evaluate(
        async () =>
          await (await fetch(new URL("release.json", location.href))).json(),
      );
      assert.equal(
        release.revision,
        JSON.parse(original.get("release.json")!.toString()).revision,
      );
    },
  );
  await check(
    "PG13 failed/incomplete cache install cannot replace working offline release",
    async () => {
      let sw = original
        .get("sw.js")!
        .toString()
        .replace(/CACHE=PREFIX\+"[a-f0-9]+"/, 'CACHE=PREFIX+"failed-install"');
      sw = sw.replace(
        "FILES=[",
        'FILES=["' + base + 'intentionally-missing.js",',
      );
      writeFileSync(dir + "/sw.js", sw);
      const result = await live.evaluate(async () => {
        const reg = (await navigator.serviceWorker.getRegistration())!;
        const failure = new Promise<string>((resolve) => {
          reg.addEventListener(
            "updatefound",
            () => {
              const w = reg.installing!;
              w.addEventListener("statechange", () => {
                if (w.state === "redundant") resolve("rejected");
              });
            },
            { once: true },
          );
          setTimeout(() => resolve("timeout"), 10000);
        });
        await reg.update();
        return failure;
      });
      assert.equal(result, "rejected");
      await context.setOffline(true);
      await live.reload();
      await expect(live.getByLabel("Weight set 2")).toHaveValue("56");
      await context.setOffline(false);
      writeFileSync(dir + "/sw.js", original.get("sw.js")!);
    },
  );
  await check(
    "PG14 unrelated project is outside service-worker control",
    async () => {
      const unrelated = await context.newPage();
      await unrelated.goto(origin + "/unrelated-app/");
      assert.equal(
        await unrelated.evaluate(
          () => navigator.serviceWorker.controller?.scriptURL ?? null,
        ),
        null,
      );
      await unrelated.close();
    },
  );
  await check(
    "PG15 only public static application assets are in the deployment artifact",
    async () => {
      const a = JSON.parse(
        readFileSync(evidence + "/pages-artifact.json", "utf8"),
      );
      assert(
        a.files.every(
          (x: { path: string }) =>
            !/(tests|server|\.env|\.map|worker\.js|\.git)/.test(x.path),
        ),
      );
    },
  );
  await check(
    "PG16 browser backup after compatible rollback remains valid",
    async () => {
      await live.getByRole("button", { name: "Backup", exact: true }).click();
      const b = await readBackup(readFileSync(await exportFile(live), "utf8"));
      assert.equal(b.body.dataset.sessions[0].actuals.length, 2);
      assert.equal(b.body.dataset.id, legacyId);
    },
  );
  await check(
    "PG17 synthetic sibling can read same-origin IndexedDB: separate repository is NOT authorization",
    async () => {
      const sibling = await context.newPage();
      await sibling.goto(origin + "/unrelated-app/");
      const observed = await sibling.evaluate(async (name) => {
        const names = (await indexedDB.databases()).map((x) => x.name);
        if (!names.includes(name)) return -1;
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const q = indexedDB.open(name);
          q.onsuccess = () => resolve(q.result);
          q.onerror = () => reject(q.error);
        });
        try {
          return await new Promise<number>((resolve, reject) => {
            const tx = db.transaction(["meta", "datasets"], "readonly"),
              q = tx.objectStore("meta").get("state");
            q.onsuccess = () => {
              const r = tx.objectStore("datasets").get(q.result.active);
              r.onsuccess = () => resolve(r.result.sessions[0].actuals.length);
              r.onerror = () => reject(r.error);
            };
            q.onerror = () => reject(q.error);
          });
        } finally {
          db.close();
        }
      }, "everyday-athlete-local@" + base);
      assert.equal(observed, 2);
      await sibling.close();
    },
  );
  for (const name of [
    "Live GitHub authenticated repository read/write and workflow-scope verification (connection unavailable)",
    "Hosted Actions/OIDC/Pages deployment and environment approval (not authorized)",
    "Physical iPhone Safari/PWA/new-origin Files transfer (hardware unavailable)",
  ])
    cases.push({ name, status: "skipped" });
} finally {
  for (const [f, bytes] of original) writeFileSync(dir + "/" + f, bytes);
  // Restore matching artifact metadata after the temporary release-B exercise.
  execFileSync("npm", ["run", "build:pages"], {
    env: { ...process.env },
    stdio: "pipe",
  });
  await context.close();
  await browser.close();
  await new Promise<void>((r) => (server ? server.close(() => r()) : r()));
  await new Promise<void>((r) =>
    oldServer ? oldServer.close(() => r()) : r(),
  );
  rmSync(profile, { recursive: true, force: true });
  rmSync(snapshot, { recursive: true, force: true });
  const report = {
    environment:
      "Local HTTP static-host simulation + real Chromium/IndexedDB/Service Worker; NOT GitHub-hosted execution",
    cases,
    passed: cases.filter((x) => x.status === "passed").length,
    failed: cases.filter((x) => x.status === "failed").length,
    skipped: cases.filter((x) => x.status === "skipped").length,
  };
  writeFileSync(
    evidence + "/local-pages-verification.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    report.passed +
      " passed, " +
      report.failed +
      " failed, " +
      report.skipped +
      " skipped",
  );
}
