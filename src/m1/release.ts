export type ReleaseInfo = {
  revision: string;
  datasetSchema: number;
  base: string;
};
export function verifiedRelease(value: unknown): ReleaseInfo | null {
  if (!value || typeof value !== "object") return null;
  const x = value as Partial<ReleaseInfo>;
  return typeof x.revision === "string" &&
    /^[a-f0-9]{40}$/.test(x.revision) &&
    x.datasetSchema === 3 &&
    x.base === import.meta.env.BASE_URL
    ? (x as ReleaseInfo)
    : null;
}
