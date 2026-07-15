// Pure URL parsing, split out from deepLinks.ts so it can be unit-tested
// without pulling in @clerk/clerk-expo (via ./supabase), which only loads
// under the React Native/Metro toolchain and can't run under plain Node.

const APP_DOMAINS = new Set(['opusfesta.com', 'www.opusfesta.com']);

/**
 * Links use either the custom scheme (opusfesta://vendor/123) or the
 * production https domain (https://opusfesta.com/vendors/some-slug). For the
 * custom scheme, WHATWG URL parsing puts the first path segment in
 * `hostname` rather than `pathname` — fold it back in so both forms resolve
 * through the same segment list.
 */
export function toSegments(url: string): string[] {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return [];
  }
  const pathSegments = parsed.pathname.split('/').filter(Boolean);
  if (parsed.hostname && !APP_DOMAINS.has(parsed.hostname)) {
    return [parsed.hostname, ...pathSegments];
  }
  return pathSegments;
}
