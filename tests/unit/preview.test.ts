import { it, expect } from "vitest";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { fetchPreview, type PreviewEnv } from "../../preview/worker";
import { assetPaths } from "../../preview/asset-paths";
const secret = randomBytes(32).toString("base64url");
const auth = "Basic " + btoa("preview:" + secret);
function env() {
  let calls = 0;
  const e: PreviewEnv = {
    PREVIEW_PASSWORD: secret,
    PREVIEW_HOST: "owner.test",
    ASSETS: {
      fetch: async () => {
        calls++;
        return new Response("synthetic file", {
          headers: {
            "Content-Type": "text/plain",
            "Set-Cookie": "should-not-leak",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  };
  return { e, count: () => calls };
}
const req = (path = "/", header: string | null = auth, method = "GET") =>
  new Request("https://owner.test" + path, {
    method,
    headers: header ? { Authorization: header } : undefined,
  });
it("PW01 missing/short secret or missing host fails closed before ASSETS", async () => {
  for (const patch of [
    { PREVIEW_PASSWORD: undefined },
    { PREVIEW_PASSWORD: "short" },
    { PREVIEW_HOST: undefined },
  ]) {
    const x = env();
    expect((await fetchPreview(req(), { ...x.e, ...patch })).status).toBe(503);
    expect(x.count()).toBe(0);
  }
});
it("PW02 every exact asset requires authorization", async () => {
  for (const path of assetPaths) {
    const x = env();
    expect((await fetchPreview(req(path, null), x.e)).status).toBe(401);
    expect(x.count()).toBe(0);
  }
});
it("PW03 malformed, wrong, oversized and duplicate credentials denied", async () => {
  for (const h of [
    "Bearer x",
    "Basic !!!!",
    "Basic " + btoa("wrong:" + secret),
    "Basic " + btoa("preview:incorrect"),
    "Basic " + "A".repeat(600),
    auth + ", " + auth,
  ]) {
    const x = env();
    expect((await fetchPreview(req("/", h), x.e)).status).toBe(401);
    expect(x.count()).toBe(0);
  }
});
it("PW04 credentials/cookies/referrer stripped before asset binding", async () => {
  let forwarded: Request | undefined;
  const x = env();
  x.e.ASSETS.fetch = async (r) => {
    forwarded = r;
    return new Response("ok");
  };
  const r = req();
  r.headers.set("Cookie", "private");
  r.headers.set("Referer", "https://elsewhere.test");
  expect((await fetchPreview(r, x.e)).status).toBe(200);
  expect(forwarded!.headers.has("Authorization")).toBe(false);
  expect(forwarded!.headers.has("Cookie")).toBe(false);
  expect(forwarded!.headers.has("Referer")).toBe(false);
});
it("PW05 refuses HTTP and wrong host without consulting forwarded headers", async () => {
  const x = env();
  expect(
    (
      await fetchPreview(
        new Request("http://owner.test", { headers: { Authorization: auth } }),
        x.e,
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await fetchPreview(
        new Request("https://other.test", {
          headers: { Authorization: auth, "X-Forwarded-Host": "owner.test" },
        }),
        x.e,
      )
    ).status,
  ).toBe(421);
  expect(x.count()).toBe(0);
});
it("PW06 alternate/encoded/source/API/query paths never reach assets", async () => {
  for (const p of [
    "/index.html/",
    "/%69ndex.html",
    "/foo",
    "/api/export",
    "/.env",
    "/.git/config",
    "/tests/local/harness.html",
    "/?password=x",
  ]) {
    const x = env();
    expect((await fetchPreview(req(p), x.e)).status).toBe(404);
    expect(x.count()).toBe(0);
  }
});
it("PW07 every mutation/upload method is denied", async () => {
  for (const m of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const x = env();
    expect((await fetchPreview(req("/", auth, m), x.e)).status).toBe(405);
    expect(x.count()).toBe(0);
  }
});
it("PW08 success and errors carry private cache/noindex/security headers", async () => {
  for (const h of [auth, null]) {
    const x = env(),
      r = await fetchPreview(req("/", h), x.e);
    expect(r.headers.get("Cache-Control")).toContain("no-store");
    expect(r.headers.get("Vary")).toBe("Authorization");
    expect(r.headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(r.headers.has("Access-Control-Allow-Origin")).toBe(false);
    expect(r.headers.has("Set-Cookie")).toBe(false);
    expect(r.headers.get("X-Robots-Tag")).toContain("noindex");
  }
});
it("PW09 asset exceptions and redirects fail closed", async () => {
  const x = env();
  x.e.ASSETS.fetch = async () => {
    throw Error("sensitive internal error");
  };
  const r = await fetchPreview(req(), x.e);
  expect(r.status).toBe(503);
  expect(await r.text()).not.toContain("sensitive");
  x.e.ASSETS.fetch = async () =>
    new Response(null, {
      status: 302,
      headers: { Location: "https://other.test" },
    });
  expect((await fetchPreview(req(), x.e)).status).toBe(404);
});
it("PW10 HEAD does not expose body; successful GET is the bound asset", async () => {
  const x = env();
  expect(await (await fetchPreview(req("/", auth, "HEAD"), x.e)).text()).toBe(
    "",
  );
  expect(await (await fetchPreview(req(), x.e)).text()).toBe("synthetic file");
});
it("PW11 secret rotation rejects the previous credential", async () => {
  const x = env();
  x.e.PREVIEW_PASSWORD = randomBytes(32).toString("base64url");
  expect((await fetchPreview(req(), x.e)).status).toBe(401);
});
it("PW12 config is worker-first, no version URLs/logging/source maps or data bindings", () => {
  const c = JSON.parse(readFileSync("wrangler.preview.jsonc", "utf8"));
  expect(c.assets.run_worker_first).toBe(true);
  expect(c.preview_urls).toBe(false);
  expect(c.observability.enabled).toBe(false);
  expect(c.upload_source_maps).toBe(false);
  for (const k of [
    "kv_namespaces",
    "r2_buckets",
    "d1_databases",
    "services",
    "vars",
  ])
    expect(c[k]).toBeUndefined();
});
