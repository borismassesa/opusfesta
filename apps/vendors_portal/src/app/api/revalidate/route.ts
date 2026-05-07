import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Paths the admin's CMS publish flows actually invalidate. Anything outside
// this set is rejected with 400 so a typo surfaces in admin runtime logs
// instead of silently no-op'ing while the operator sees "Publish succeeded".
const ALLOWED_EXACT = new Set(['/'])

function isAllowed(path: string): boolean {
  return ALLOWED_EXACT.has(path)
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.VENDORS_PORTAL_REVALIDATE_SECRET
  // Distinguish unset-secret (config bug — admin can't reach this app at all)
  // from header-mismatch (drift between projects, or a probe). Without this,
  // operators chasing "publish doesn't update vendors_portal" see only a 401
  // and can't tell which case they're in.
  if (!secret) {
    console.warn(
      '[revalidate] VENDORS_PORTAL_REVALIDATE_SECRET is not set — admin publish requests will be rejected.',
    )
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (auth !== `Bearer ${secret}`) {
    console.warn('[revalidate] auth header mismatch — secret drifted between admin and vendors_portal?')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'

  if (!isAllowed(path)) {
    console.warn(`[revalidate] rejected unknown path: ${path}`)
    return NextResponse.json({ error: 'unknown_path', path }, { status: 400 })
  }

  try {
    revalidatePath(path)
  } catch (err) {
    console.error(`[revalidate] revalidatePath(${path}) threw:`, err)
    return NextResponse.json({ error: 'revalidation_failed', path }, { status: 500 })
  }
  console.log(`[revalidate] invalidated ${path}`)
  return NextResponse.json({ revalidated: true, path })
}
