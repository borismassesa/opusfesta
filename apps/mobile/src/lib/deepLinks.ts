import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { getMyWeddingWebsite } from './api/wedding-website';

// Links use either the custom scheme (opusfesta://vendor/123) or the
// production https domain (https://opusfesta.com/vendors/some-slug). For the
// custom scheme, WHATWG URL parsing puts the first path segment in
// `hostname` rather than `pathname` — fold it back in so both forms resolve
// through the same segment list.
const APP_DOMAINS = new Set(['opusfesta.com', 'www.opusfesta.com']);

function toSegments(url: string): string[] {
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

export type DeepLinkTarget = { pathname: string; params?: Record<string, string> };

/**
 * Resolves an inbound URL to an expo-router destination. Returns null when
 * the URL doesn't match a known route, or (for the 'w/:slug' case) when it
 * points at a wedding website the signed-in user doesn't own — the app has
 * no public multi-tenant viewer, so that content only exists on the web.
 */
export async function resolveDeepLink(
  url: string,
  authedClient: SupabaseClient | null,
): Promise<DeepLinkTarget | null> {
  const [first, second] = toSegments(url);
  if (!first) return null;

  if (first === 'vendor' && second) {
    return { pathname: '/vendor/[id]', params: { id: second } };
  }

  if (first === 'vendors' && second) {
    if (!supabase) return null;
    const { data } = await supabase.from('vendors').select('id').eq('slug', second).maybeSingle();
    return data ? { pathname: '/vendor/[id]', params: { id: data.id } } : null;
  }

  if (first === 'messages' && second) {
    return { pathname: '/(tabs)/messages/[id]', params: { id: second } };
  }

  if (first === 'w' && second) {
    if (!authedClient) return null;
    const site = await getMyWeddingWebsite(authedClient);
    return site?.slug === second ? { pathname: '/website/preview' } : null;
  }

  return null;
}

// Stashed while a URL arrives before the user is signed in / onboarded, so
// it can be resumed once auth resolves. Module-level is enough — deep links
// arrive one at a time and the app has a single active session.
let pendingDeepLink: string | null = null;

export function setPendingDeepLink(url: string): void {
  pendingDeepLink = url;
}

export function consumePendingDeepLink(): string | null {
  const url = pendingDeepLink;
  pendingDeepLink = null;
  return url;
}
