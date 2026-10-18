// Repository project sites only; reject origin-wide or ambiguous scopes.
export function pagesBase(
  value = process.env.EA_PAGES_BASE || "/fitness-pilot-preview/",
) {
  if (!/^\/[a-z0-9][a-z0-9_-]{0,99}\/$/.test(value))
    throw Error(
      "Pages base must be one lowercase repository path, e.g. /fitness-pilot-preview/",
    );
  return value;
}
