import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Paths the admin's CMS publish flows actually invalidate. Anything outside
// this set is rejected with 400 so a typo (e.g. /vendor for /vendors) surfaces
// in admin runtime logs instead of silently no-op'ing while the operator sees
// "Publish succeeded".
const ALLOWED_EXACT = new Set(['/', '/vendors', '/advice-and-ideas'])
// Article slug paths — slugify() in opus_admin produces [a-z0-9-] up to 80 chars.
const ARTICLE_SLUG = /^\/advice-and-ideas\/[a-z0-9](?:[a-z0-9-]{0,79})$/

function isAllowed(path: string): boolean {
  return ALLOWED_EXACT.has(path) || ARTICLE_SLUG.test(path)
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.WEBSITE_REVALIDATE_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'

  if (!isAllowed(path)) {
    console.warn(`[revalidate] rejected unknown path: ${path}`)
    return NextResponse.json({ error: 'unknown_path', path }, { status: 400 })
  }

  console.log(`[revalidate] ${path}`)
  revalidatePath(path)
  return NextResponse.json({ revalidated: true, path })
}
