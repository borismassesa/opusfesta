// Shared by server AND client components, so keep this module free of the
// 'use client' directive and React-only imports.

// Resolve relative media paths ("/assets/images/...") against the public
// website origin, since those files live in apps/opus_website/public. Absolute
// URLs, data/blob URIs, and Supabase storage URLs pass through untouched.
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  if (url.startsWith('/')) {
    const base = process.env.NEXT_PUBLIC_WEBSITE_URL ?? ''
    return base ? `${base}${url}` : url
  }
  return url
}
