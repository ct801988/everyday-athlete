export const ISOLATED_PREVIEW_HOST = "everyday-athlete-preview.github.io";

export function allowedHost(hostname: string, approvedHost = "") {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    (!!approvedHost &&
      hostname === approvedHost &&
      (!hostname.endsWith(".github.io") || hostname === ISOLATED_PREVIEW_HOST))
  );
}

export function allowedLocation(
  hostname: string,
  pathname: string,
  base: string,
  approvedHost = "",
) {
  if (!allowedHost(hostname, approvedHost)) return false;
  // A root worker is approved only for this dedicated origin, never a sibling project site.
  if (hostname === ISOLATED_PREVIEW_HOST)
    return base === "/" && (pathname === "/" || pathname === "/index.html");
  return pathname.startsWith(base);
}
