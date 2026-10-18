export function allowedHost(hostname: string, approvedHost = "") {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    (!!approvedHost &&
      hostname === approvedHost &&
      !hostname.endsWith(".github.io"))
  );
}
