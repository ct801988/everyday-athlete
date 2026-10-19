import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createServer, type Server } from "node:http";
import { readFileSync, existsSync, cpSync, rmSync } from "node:fs";
import { resolve, extname } from "node:path";
import { execFileSync } from "node:child_process";

let current = "a";
let server: Server;
let other: Server;
const origin = "http://127.0.0.1:5187";
test.beforeAll(async () => {
  for (const [version, sha] of [
    ["a", "1".repeat(40)],
    ["b", "2".repeat(40)],
  ]) {
    execFileSync("npm", ["run", "build:pages"], {
      env: {
        ...process.env,
        EA_ISOLATED_PAGES: "1",
        EA_PAGES_BASE: "/",
        VITE_EA_APPROVED_HOST: "everyday-athlete-preview.github.io",
        EA_PAGES_RELEASE_SHA: sha,
      },
      stdio: "pipe",
    });
    const target = `.data/isolated-${version}`;
    rmSync(target, { recursive: true, force: true });
    cpSync(".data/pages-build", target, { recursive: true });
  }
  server = createServer((req, res) => {
    const path = new URL(req.url!, origin).pathname;
    const root = resolve(`.data/isolated-${current}`);
    const file = resolve(root, "." + (path === "/" ? "/index.html" : path));
    if (!file.startsWith(root + "/") || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Type",
      (
        {
          ".js": "application/javascript",
          ".html": "text/html",
          ".css": "text/css",
          ".json": "application/json",
          ".png": "image/png",
          ".webmanifest": "application/manifest+json",
        } as Record<string, string>
      )[extname(file)] || "application/octet-stream",
    );
    res.end(readFileSync(file));
  });
  other = createServer((req, res) => {
    if (req.url === "/sw.js") {
      res.setHeader("Content-Type", "application/javascript");
      res.end(
        "self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k))))));",
      );
    } else {
      res.setHeader("Content-Type", "text/html");
      res.end(
        "<!doctype html><title>Isolated synthetic origin fixture</title>",
      );
    }
  });
  await Promise.all([
    new Promise<void>((r) => server.listen(5187, "127.0.0.1", r)),
    new Promise<void>((r) => other.listen(5188, "127.0.0.1", r)),
  ]);
});
test.afterAll(async () => {
  await Promise.all(
    [server, other]
      .filter(Boolean)
      .map((s) => new Promise<void>((r) => s.close(() => r()))),
  );
});

for (const state of ["active", "paused"])
  test(`root offline release update and rollback retain ${state} workout and exact drafts`, async ({
    page,
    context,
  }) => {
    current = "a";
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page
      .getByRole("button", { name: "Begin Workout", exact: true })
      .click();
    const card = page.locator(".exercise-card").first();
    await card.getByLabel(/set 1 weight/).fill("25.123456789");
    await card.getByLabel(/set 1 reps/).fill("8");
    await card
      .getByRole("button", { name: "Done", exact: true })
      .first()
      .click();
    await card.getByLabel(/set 2 weight/).fill("31.123456789");
    await card.getByLabel(/set 2 reps/).fill("9");
    if (state === "paused")
      await page
        .getByRole("button", { name: "Pause Workout", exact: true })
        .click();
    await expect(page.getByRole("status")).toContainText("Saved");
    const snapshot = () =>
      page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((ok, no) => {
          const q = indexedDB.open("everyday-athlete-local-m1");
          q.onsuccess = () => ok(q.result);
          q.onerror = () => no(q.error);
        });
        try {
          return await new Promise<unknown>((ok, no) => {
            const s = db.transaction("workspaces").objectStore("workspaces");
            const q = s.get("active");
            q.onsuccess = () => {
              const d = s.get(q.result);
              d.onsuccess = () => ok(d.result);
              d.onerror = () => no(d.error);
            };
            q.onerror = () => no(q.error);
          });
        } finally {
          db.close();
        }
      });
    const before = await snapshot();
    await page.evaluate(async () => {
      localStorage.setItem("ea-isolation-sentinel", "unchanged");
      await caches.open("unrelated-sentinel");
    });
    const otherPage = await context.newPage();
    await otherPage.goto("http://127.0.0.1:5188/");
    await otherPage.evaluate(async () => {
      await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
    });
    await otherPage.close();
    expect(
      await page.evaluate(() => localStorage.getItem("ea-isolation-sentinel")),
    ).toBe("unchanged");
    expect(await page.evaluate(() => caches.has("unrelated-sentinel"))).toBe(
      true,
    );
    current = "b";
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())!.update();
    });
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            !!(await navigator.serviceWorker.getRegistration())!.waiting,
        ),
      )
      .toBe(true);
    // ACTIVATE cannot force the isolated worker to take over an active session.
    await page.evaluate(async () => {
      (await navigator.serviceWorker.getRegistration())!.waiting!.postMessage(
        "ACTIVATE",
      );
    });
    expect(
      (await page.evaluate(() => fetch("/release.json").then((r) => r.json())))
        .revision,
    ).toBe("1".repeat(40));
    expect(await snapshot()).toEqual(before);
    await page.close();
    // With every controlled app window closed, normal worker activation may proceed.
    const probe = await context.newPage();
    await probe.goto("http://127.0.0.1:5188/");
    await expect
      .poll(() =>
        probe.evaluate(async (url) => {
          const r = await fetch(url + "/release.json", {
            mode: "no-cors",
          }).catch(() => null);
          return !!r;
        }, origin),
      )
      .toBe(true);
    await probe.close();
    page = await context.newPage();
    await page.goto("/");
    await expect
      .poll(() =>
        page.evaluate(() =>
          fetch("/release.json")
            .then((r) => r.json())
            .then((x) => x.revision),
        ),
      )
      .toBe("2".repeat(40));
    expect(await snapshot()).toEqual(before);
    await context.setOffline(true);
    await page.reload();
    await expect(
      page.getByRole("button", {
        name: state === "paused" ? "Resume Workout" : "Pause Workout",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .locator(".exercise-card")
        .first()
        .getByLabel(/set 2 weight/),
    ).toHaveValue("31.123456789");
    expect(await snapshot()).toEqual(before);
    await context.setOffline(false);
    current = "a";
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())!.update();
    });
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            !!(await navigator.serviceWorker.getRegistration())!.waiting,
        ),
      )
      .toBe(true);
    await page.close();
    page = await context.newPage();
    await page.goto("/");
    await expect
      .poll(() =>
        page.evaluate(() =>
          fetch("/release.json")
            .then((r) => r.json())
            .then((x) => x.revision),
        ),
      )
      .toBe("1".repeat(40));
    expect(await snapshot()).toEqual(before);
    expect(await page.evaluate(() => caches.has("unrelated-sentinel"))).toBe(
      true,
    );
  });

test("root manifest, scope, synthetic media and responsive accessibility", async ({
  page,
}) => {
  current = "a";
  await page.goto("/");
  await expect(page.locator(".exercise-card")).toHaveCount(6);
  const manifest = await page.evaluate(() =>
    fetch("/manifest.webmanifest").then((r) => r.json()),
  );
  expect(manifest).toMatchObject({
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    name: "Everyday Athlete Preview",
  });
  expect(
    await page.evaluate(
      async () => (await navigator.serviceWorker.ready).scope,
    ),
  ).toBe(origin + "/");
  for (const width of [320, 390, 412]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `reports/isolated-pages/root-${width}.png` });
  }
  await page.goto("/unapproved-sibling/");
  expect(await page.locator("body").innerText()).not.toContain("Begin Workout");
});
