/**
 * Resolve a media path against the opus_pass origin so the admin's live
 * previews can render assets stored under `/assets/...` (which live on the
 * opus_pass app, not the admin app). Absolute URLs, blob:, and data: URIs
 * pass through unchanged.
 */
export function resolveOpusPassAssetUrl(url: string | undefined | null): string {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  if (url.startsWith('/')) {
    const base = process.env.NEXT_PUBLIC_OPUS_PASS_URL ?? ''
    return base ? `${base}${url}` : url
  }
  return url
}
