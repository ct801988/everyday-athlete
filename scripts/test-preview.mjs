/* global navigator, caches, fetch */
import { Buffer } from "node:buffer";
import { performance } from "node:perf_hooks";
import { randomBytes, createHash, X509Certificate } from "node:crypto";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  readdirSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
process.env.WRANGLER_SEND_METRICS = "false";
process.env.CI = "1";
// No remote authentication or remote dev bindings are used by this runner.
delete process.env.CLOUDFLARE_API_TOKEN;
delete process.env.CLOUDFLARE_API_KEY;
const dashboard = process.env.EA_PREVIEW_PACKAGE === "dashboard";
const evidenceDir =
  process.env.EA_PREVIEW_EVIDENCE_DIR ||
  (dashboard ? "reports/dashboard-preview" : "reports/preview-preparation");
const { unstable_dev } = await import("wrangler");
const { chromium, request, expect } = await import("@playwright/test");
const secretA = randomBytes(32).toString("base64url"),
  secretB = randomBytes(32).toString("base64url");
const auth = (s) => "Basic " + Buffer.from("preview:" + s).toString("base64");
const tlsDir = mkdtempSync(join(tmpdir(), "ea-preview-tls-")),
  keyPath = join(tlsDir, "key.pem"),
  certPath = join(tlsDir, "cert.pem");
execFileSync(
  "openssl",
  [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-keyout",
    keyPath,
    "-out",
    certPath,
    "-days",
    "1",
    "-subj",
    "/CN=127.0.0.1",
    "-addext",
    "subjectAltName=IP:127.0.0.1",
  ],
  { stdio: "ignore" },
);
const pinnedKey = createHash("sha256")
  .update(
    new X509Certificate(readFileSync(certPath)).publicKey.export({
      type: "spki",
      format: "der",
    }),
  )
  .digest("base64");
const base = "https://127.0.0.1:5180";
const records = [];
const redact = (s) =>
  [secretA, secretB, auth(secretA), auth(secretB)].reduce(
    (a, b) => a.split(b).join("[REDACTED]"),
    String(s),
  );
const options = (port, secret, host = "127.0.0.1") => ({
  config: dashboard ? "wrangler.dashboard.jsonc" : "wrangler.preview.jsonc",
  local: true,
  ip: "127.0.0.1",
  port,
  localProtocol: "https",
  httpsKeyPath: keyPath,
  httpsCertPath: certPath,
  vars: {
    ...(secret ? { PREVIEW_PASSWORD: secret } : {}),
    ...(host ? { PREVIEW_HOST: host } : {}),
  },
  logLevel: "error",
  experimental: {
    disableExperimentalWarning: true,
    forceLocal: true,
    disableDevRegistry: true,
    fileBasedRegistry: false,
    enableIpc: false,
    watch: false,
    liveReload: false,
  },
});
async function start(port, secret, host) {
  if (dashboard)
    execFileSync(process.execPath, ["scripts/build-dashboard-preview.mjs"], {
      stdio: "ignore",
    });
  return unstable_dev(
    dashboard ? ".data/dashboard-preview/worker.js" : "preview/worker.ts",
    options(port, secret, host),
  );
}
function report() {
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(
    evidenceDir + "/native-browser.json",
    JSON.stringify(
      {
        runtime:
          "Wrangler4.151.1 / native workerd, local HTTPS; Chromium pins ephemeral certificate public key for this test only",
        testPasswords: "random in-memory fixtures only; not saved or delivered",
        cases: records,
        passed: records.filter((x) => x.status === "passed").length,
        failed: records.filter((x) => x.status === "failed").length,
        skipped: records.filter((x) => x.status === "skipped").length,
      },
      null,
      2,
    ) + "\n",
  );
}
async function check(name, fn) {
  const t = performance.now();
  try {
    await fn();
    records.push({
      name,
      status: "passed",
      milliseconds: Math.round(performance.now() - t),
    });
    console.log("PASS", name);
  } catch (e) {
    records.push({
      name,
      status: "failed",
      milliseconds: Math.round(performance.now() - t),
      error: redact(e.stack ?? e),
    });
    console.log("FAIL", name, redact(e.message));
  }
  report();
}
let primary, missing, nohost, browser, api, context, page;
const swPath = ".data/preview-assets/sw.js",
  originalSW = readFileSync(swPath, "utf8");
const assets = JSON.parse(
  readFileSync("reports/preview-preparation/deployment-assets.json", "utf8"),
).files;
try {
  primary = await start(5180, secretA);
  missing = await start(5181);
  nohost = await start(5182, secretA, "");
  api = await request.newContext({ ignoreHTTPSErrors: true });
  await check(
    "NG01 native missing secret and missing host fail closed",
    async () => {
      for (const port of [5181, 5182]) {
        const r = await api.get("https://127.0.0.1:" + port + "/");
        assert.equal(r.status(), 503);
        assert.equal(await r.text(), "Preview unavailable");
      }
    },
  );
  await check(
    "NG02 every published asset denies unauthenticated direct requests",
    async () => {
      for (const path of ["/", ...assets.map((x) => x.path)]) {
        const r = await api.get(base + path);
        assert.equal(r.status(), 401, path);
        assert.ok(r.headers()["www-authenticate"]);
        assert.equal(
          r.headers()["cache-control"],
          "private, no-store, max-age=0",
        );
      }
    },
  );
  await check(
    "NG03 authenticated native binding returns every exact payload hash",
    async () => {
      for (const item of assets) {
        const r = await api.get(base + item.path, {
          headers: { Authorization: auth(secretA) },
        });
        assert.equal(r.status(), 200, item.path);
        assert.equal(
          createHash("sha256")
            .update(await r.body())
            .digest("hex"),
          item.sha256,
          item.path,
        );
      }
    },
  );
  await check(
    "NG04 warm asset state never bypasses authorization for fresh clients",
    async () => {
      const cold = await request.newContext({ ignoreHTTPSErrors: true });
      try {
        for (const item of assets)
          assert.equal(
            (await cold.get(base + item.path)).status(),
            401,
            item.path,
          );
      } finally {
        await cold.dispose();
      }
    },
  );
  await check("NG05 malformed/wrong credentials deny access", async () => {
    for (const h of [
      "Bearer anything",
      "Basic !!!!",
      auth(secretB),
      "Basic " + "A".repeat(600),
    ])
      assert.equal(
        (await api.get(base + "/", { headers: { Authorization: h } })).status(),
        401,
      );
  });
  await check(
    "NG06 unknown/encoded/source/API/query paths protected and not served",
    async () => {
      for (const path of [
        "/.env",
        "/.git/config",
        "/api/export",
        "/tests/local/harness.html",
        "/%69ndex.html",
        "/index.html/",
        "/?token=not-a-secret",
      ]) {
        assert.equal((await api.get(base + path)).status(), 401, path);
        assert.equal(
          (
            await api.get(base + path, {
              headers: { Authorization: auth(secretA) },
            })
          ).status(),
          404,
          path,
        );
      }
    },
  );
  await check("NG07 upload methods rejected, no data endpoint", async () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      const r = await api.fetch(base + "/", {
        method,
        headers: { Authorization: auth(secretA) },
        data: "synthetic invalid upload",
      });
      assert.equal(r.status(), 405);
      assert.equal(r.headers().allow, "GET, HEAD");
    }
  });
  await check("NG08 HEAD, private cache, CSP and no CORS headers", async () => {
    const r = await api.head(base + "/index.html", {
      headers: { Authorization: auth(secretA) },
    });
    assert.equal(r.status(), 200);
    assert.equal((await r.body()).length, 0);
    assert.equal(r.headers().vary, "Authorization");
    assert.equal(r.headers()["cdn-cache-control"], "no-store");
    assert.ok(
      r.headers()["content-security-policy"].includes("script-src 'self'"),
    );
    assert.equal(r.headers()["access-control-allow-origin"], undefined);
  });
  browser = await chromium.launch({
    executablePath:
      process.env.EA_CHROMIUM_PATH || resolve(".data/chromium/chromium"),
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--ignore-certificate-errors-spki-list=" + pinnedKey,
    ],
  });
  context = await browser.newContext({
    ignoreHTTPSErrors: true,
    httpCredentials: { username: "preview", password: secretA },
    viewport: { width: 390, height: 844 },
  });
  page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on("request", (r) =>
    requests.push({ url: r.url(), method: r.method() }),
  );
  page.on("pageerror", (e) => errors.push(e.message));
  await check(
    "NB01 native HTTPS Basic Auth opens no-login synthetic app",
    async () => {
      await page.goto(base);
      await page
        .getByRole("button", { name: "Start synthetic demonstration" })
        .click();
      await expect(page.getByRole("navigation")).toBeVisible();
      assert.deepEqual(errors, []);
    },
  );
  await check("NB02 manifest and icon are gated and readable", async () => {
    const manifest = await page.evaluate(async () => {
      const r = await fetch("/manifest.webmanifest");
      return r.json();
    });
    assert.equal(manifest.name, "Fitness App Preview");
    assert.equal(manifest.short_name, "Fitness App Preview");
    assert.equal(await page.title(), "Fitness App Preview");
    await expect(
      page.getByRole("heading", { name: "Fitness App Preview", exact: true }),
    ).toBeVisible();
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.scope, "/");
    assert.equal(manifest.start_url, "/");
    const icon = await page
      .locator('link[rel="apple-touch-icon"]')
      .getAttribute("href");
    assert.equal(icon, "/icons/icon-180.png");
  });
  await check(
    "NB03 confirmed set and draft persist on protected reload",
    async () => {
      await page.getByLabel("Weight set 1").fill("57");
      await page
        .getByRole("button", { name: "Done", exact: true })
        .first()
        .click();
      await expect(
        page.getByRole("heading", { name: "Set 1 · Done" }),
      ).toBeVisible();
      await page.reload();
      await expect(page.getByLabel("Weight set 1")).toHaveValue("57");
      await expect(
        page.getByRole("heading", { name: "Set 1 · Done" }),
      ).toBeVisible();
    },
  );
  await check(
    "NB04 service worker installs behind password and caches complete shell",
    async () => {
      await page.evaluate(async () => {
        await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, rej) =>
            setTimeout(() => rej(Error("Service worker not ready")), 7000),
          ),
        ]);
      });
      await page.reload();
      const keys = await page.evaluate(() => caches.keys());
      assert.ok(keys.some((k) => k.startsWith("ea-preview-shell-")));
    },
  );
  await check(
    "NB05 protected app reload/startup/logging/history work offline",
    async () => {
      await context.setOffline(true);
      await page.reload();
      await page
        .getByRole("button", { name: "Done", exact: true })
        .first()
        .click();
      await page.getByRole("button", { name: "History", exact: true }).click();
      await expect(page.getByText(/actual sets: 2/)).toBeVisible();
      await page.getByRole("button", { name: "Schedule", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: /Schedule · 3/ }),
      ).toBeVisible();
      await context.setOffline(false);
    },
  );
  await check(
    "NB06 backup download and duplicate restore work under gate/CSP",
    async () => {
      await page.getByRole("button", { name: "Backup", exact: true }).click();
      const event = page.waitForEvent("download");
      await page.getByRole("button", { name: "Export full backup" }).click();
      const file = await (await event).path();
      assert.ok(file);
      await page.getByLabel("Import JSON backup").setInputFiles(file);
      await page.getByRole("checkbox", { name: /I understand/ }).check();
      await page.getByRole("button", { name: "Confirm restore" }).click();
      await expect(page.getByRole("status").first()).toContainText(
        "Restore completed",
      );
    },
  );
  await check(
    "NB07 controlled cached-shell update preserves records",
    async () => {
      await page.getByRole("button", { name: "Workout", exact: true }).click();
      await primary.stop();
      primary = undefined;
      writeFileSync(
        swPath,
        originalSW.replace(
          /ea-preview-shell-([a-f0-9]+)/g,
          "ea-preview-shell-$1-update",
        ),
      );
      primary = await start(5180, secretA);
      await page.evaluate(async () => {
        await (await navigator.serviceWorker.getRegistration()).update();
      });
      await expect(
        page.getByRole("button", { name: /Apply cached app update/ }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: /Apply cached app update/ })
        .click();
      await expect(
        page.getByRole("heading", { name: "Set 1 · Done" }),
      ).toBeVisible();
      await expect(page.getByLabel("Weight set 1")).toHaveValue("57");
    },
  );
  await check(
    "NG09 native secret rotation rejects old credentials, new credentials succeed",
    async () => {
      await primary.stop();
      primary = undefined;
      primary = await start(5180, secretB);
      assert.equal(
        (
          await api.get(base + "/", {
            headers: { Authorization: auth(secretA) },
          })
        ).status(),
        401,
      );
      assert.equal(
        (
          await api.get(base + "/", {
            headers: { Authorization: auth(secretB) },
          })
        ).status(),
        200,
      );
    },
  );
  await check(
    "NB08 cached offline copy remains usable after rotation (explicit limitation)",
    async () => {
      await context.setOffline(true);
      await page.reload();
      await expect(
        page.getByRole("heading", { name: "Set 1 · Done" }),
      ).toBeVisible();
      await context.setOffline(false);
    },
  );
  await check(
    "NB09 application sends no telemetry, API or workout upload requests",
    async () => {
      assert.ok(requests.length > 0);
      assert.ok(
        requests.every(
          (r) =>
            r.url.startsWith(base) &&
            r.method === "GET" &&
            !r.url.includes("/api/"),
        ),
      );
      assert.deepEqual(errors, []);
    },
  );
  await check(
    "NG10 generated test credentials absent from repository and payload files",
    async () => {
      const skip = new Set([".git", "node_modules"]);
      const leaked = [];
      const walk = (dir) => {
        for (const e of readdirSync(dir, { withFileTypes: true })) {
          if (skip.has(e.name)) continue;
          const path = join(dir, e.name);
          if (e.isDirectory()) walk(path);
          else if (e.isFile()) {
            const data = readFileSync(path);
            if (
              [secretA, secretB, auth(secretA), auth(secretB)].some((s) =>
                data.includes(Buffer.from(s)),
              )
            )
              leaked.push(path);
          }
        }
      };
      walk(".");
      assert.deepEqual(leaked, []);
    },
  );
  for (const [name, reason] of [
    [
      "EDGE01 live Cloudflare hostname/aliases/CDN/WAF/cost account verification",
      "No hosting/account provisioning authorized; local runtime is not global edge proof",
    ],
    [
      "DEVICE01 physical iPhone Safari/Home Screen/VoiceOver compatibility",
      "No physical device access; Chromium is not Safari certification",
    ],
    [
      "DEVICE02 physical Android Chrome/TalkBack compatibility",
      "No physical device access; family testers not authorized",
    ],
  ])
    records.push({ name, status: "skipped", reason });
  report();
} catch (e) {
  records.push({
    name: "Runner setup/runtime",
    status: "failed",
    error: redact(e.stack ?? e),
  });
  report();
  console.log("FAIL runner", redact(e.message));
} finally {
  writeFileSync(swPath, originalSW);
  if (dashboard)
    execFileSync(process.execPath, ["scripts/build-dashboard-preview.mjs"], {
      stdio: "ignore",
    });
  await browser?.close();
  await api?.dispose();
  await primary?.stop();
  await missing?.stop();
  await nohost?.stop();
  rmSync(tlsDir, { recursive: true, force: true });
}
console.log(
  "Preview results:",
  records.filter((x) => x.status === "passed").length,
  "passed,",
  records.filter((x) => x.status === "failed").length,
  "failed,",
  records.filter((x) => x.status === "skipped").length,
  "skipped",
);
if (records.some((x) => x.status === "failed")) process.exitCode = 1;
