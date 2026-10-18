process.env.WRANGLER_SEND_METRICS = "false";
process.env.CI = "1";
const { unstable_dev } = await import("wrangler");
const { request } = await import("@playwright/test");
let worker;
try {
  worker = await unstable_dev("preview/worker.ts", {
    config: "wrangler.preview.jsonc",
    local: true,
    ip: "127.0.0.1",
    port: 5180,
    localProtocol: "https",
    vars: { PREVIEW_HOST: "127.0.0.1" },
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
  const client = await request.newContext({ ignoreHTTPSErrors: true });
  const r = await client.get("https://127.0.0.1:5180/");
  await client.dispose();
  console.log("Native local Worker response:", r.status());
  if (r.status() !== 503)
    throw Error("Expected fail-closed missing-secret response");
} finally {
  await worker?.stop();
}
