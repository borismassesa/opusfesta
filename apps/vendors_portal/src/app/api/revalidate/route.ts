import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

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
  revalidatePath(path)
  return NextResponse.json({ revalidated: true, path })
}
