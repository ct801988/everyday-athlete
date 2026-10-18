import { assetPaths } from "./asset-paths";
export interface PreviewEnv {
  PREVIEW_PASSWORD?: string;
  PREVIEW_HOST?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}
const allowed = new Set<string>(assetPaths);
const security = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Cloudflare-CDN-Cache-Control": "no-store",
  Vary: "Authorization",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy":
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};
function response(
  body: BodyInit | null,
  status: number,
  headers: HeadersInit = {},
) {
  const h = new Headers(headers);
  for (const [k, v] of Object.entries(security)) h.set(k, v);
  h.delete("Access-Control-Allow-Origin");
  h.delete("Set-Cookie");
  return new Response(body, { status, headers: h });
}
async function authorized(header: string | null, secret: string) {
  if (
    !header ||
    header.length > 512 ||
    !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(header)
  )
    return false;
  let provided: string;
  try {
    provided = atob(header.slice(6));
    if (btoa(provided) !== header.slice(6)) return false;
  } catch {
    return false;
  }
  // Native Web Crypto HMAC verification avoids a JavaScript early-exit secret comparison.
  const e = new TextEncoder(),
    key = await crypto.subtle.importKey(
      "raw",
      e.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"],
    );
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    e.encode("preview:" + secret),
  );
  return crypto.subtle.verify("HMAC", key, expected, e.encode(provided));
}
export async function fetchPreview(
  request: Request,
  env: PreviewEnv,
): Promise<Response> {
  // There is intentionally no public readiness route or fallback credential.
  if (
    typeof env.PREVIEW_PASSWORD !== "string" ||
    !/^[\x21-\x7e]{32,128}$/.test(env.PREVIEW_PASSWORD) ||
    typeof env.PREVIEW_HOST !== "string" ||
    !env.PREVIEW_HOST ||
    /[:/\s]/.test(env.PREVIEW_HOST)
  )
    return response("Preview unavailable", 503);
  const url = new URL(request.url);
  if (url.protocol !== "https:") return response("HTTPS required", 403);
  if (url.hostname !== env.PREVIEW_HOST.toLowerCase())
    return response("Unrecognized preview host", 421);
  try {
    if (
      !(await authorized(
        request.headers.get("Authorization"),
        env.PREVIEW_PASSWORD,
      ))
    )
      return response("Preview access required", 401, {
        "WWW-Authenticate":
          'Basic realm="Fitness App Preview", charset="UTF-8"',
        "Content-Type": "text/plain; charset=utf-8",
      });
    if (request.method !== "GET" && request.method !== "HEAD")
      return response("Method not allowed", 405, { Allow: "GET, HEAD" });
    if (url.search || !allowed.has(url.pathname))
      return response("Not found", 404);
    const headers = new Headers(request.headers);
    headers.delete("Authorization");
    headers.delete("Cookie");
    headers.delete("Referer");
    const target = new URL(url);
    if (target.pathname === "/") target.pathname = "/index.html";
    const asset = await env.ASSETS.fetch(
      new Request(target, { method: request.method, headers }),
    );
    if (asset.status !== 200 && asset.status !== 304)
      return response("Not found", 404);
    return response(
      request.method === "HEAD" || asset.status === 304 ? null : asset.body,
      asset.status,
      asset.headers,
    );
  } catch {
    return response("Preview unavailable", 503);
  }
}
export default { fetch: fetchPreview };
