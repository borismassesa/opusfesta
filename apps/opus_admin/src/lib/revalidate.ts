// Shared cross-deployment revalidation helpers used by all CMS publish actions.
//
// The admin app is deployed independently of opus_website and vendors_portal, so
// `next/cache` revalidatePath() on the admin only refreshes admin pages. To
// invalidate the public deployments' ISR cache we POST to their /api/revalidate
// route. If the env vars are missing or the request fails the publish itself
// still succeeds — but we log loudly so the misconfiguration is visible rather
// than producing the silent "publish does nothing" bug we hit before.

type RevalidateTarget = {
  label: string
  url: string | undefined
  secret: string | undefined
}

async function revalidateTarget(target: RevalidateTarget, paths: string[]): Promise<void> {
  if (!target.url || !target.secret) {
    console.warn(
      `[revalidate] Skipping ${target.label} revalidation — ` +
        `${!target.url ? 'URL' : 'secret'} env var is not set. ` +
        `Public site will not see changes until ISR cycle or redeploy.`
    )
    return
  }

  const requests = paths.map(async (path) => {
    const endpoint = `${target.url}/api/revalidate?path=${encodeURIComponent(path)}`
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${target.secret}` },
      })
      if (!res.ok) {
        console.error(
          `[revalidate] ${target.label} ${path} returned ${res.status} — public cache not invalidated.`
        )
      }
    } catch (err) {
      console.error(`[revalidate] ${target.label} ${path} fetch failed:`, err)
    }
  })

  await Promise.all(requests)
}

export async function revalidateWebsite(...paths: string[]): Promise<void> {
  await revalidateTarget(
    {
      label: 'opus_website',
      url: process.env.NEXT_PUBLIC_WEBSITE_URL,
      secret: process.env.WEBSITE_REVALIDATE_SECRET,
    },
    paths.length ? paths : ['/']
  )
}

export async function revalidateVendorsPortal(...paths: string[]): Promise<void> {
  await revalidateTarget(
    {
      label: 'vendors_portal',
      url: process.env.NEXT_PUBLIC_VENDORS_PORTAL_URL,
      secret: process.env.VENDORS_PORTAL_REVALIDATE_SECRET,
    },
    paths.length ? paths : ['/']
  )
}
