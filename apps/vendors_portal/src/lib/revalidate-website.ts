// Best-effort cross-deployment revalidation.
//
// The public site (opus_website) renders /vendors/[slug] as ISR. When a vendor
// publishes storefront changes here, we POST opus_website's /api/revalidate so
// their public profile updates immediately instead of waiting for the ISR
// window. Mirrors apps/opus_admin/src/lib/revalidate.ts.
//
// Failure never blocks the publish — the storefront row is already updated and
// the page will refresh on its next ISR cycle regardless. We log loudly so a
// missing env var is visible rather than silently no-op'ing.

export async function revalidatePublicVendor(slug: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL
  const secret = process.env.WEBSITE_REVALIDATE_SECRET

  if (!url || !secret) {
    console.warn(
      `[revalidate] Skipping public vendor revalidation — ` +
        `${!url ? 'NEXT_PUBLIC_WEBSITE_URL' : 'WEBSITE_REVALIDATE_SECRET'} is not set. ` +
        `/vendors/${slug} will refresh on its ISR cycle instead.`,
    )
    return
  }

  const endpoint = `${url}/api/revalidate?path=${encodeURIComponent(`/vendors/${slug}`)}`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (!res.ok) {
      console.error(
        `[revalidate] /vendors/${slug} returned ${res.status} — public cache not invalidated.`,
      )
    }
  } catch (err) {
    console.error(`[revalidate] /vendors/${slug} fetch failed:`, err)
  }
}
