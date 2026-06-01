import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const ALLOWED_EXACT = new Set(['/', '/invitations', '/guests-and-rsvp', '/websites'])

function isAllowed(path: string): boolean {
  return ALLOWED_EXACT.has(path)
}

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.OPUS_PASS_REVALIDATE_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'

  if (!isAllowed(path)) {
    console.warn(`[opus-pass revalidate] rejected unknown path: ${path}`)
    return NextResponse.json({ error: 'unknown_path', path }, { status: 400 })
  }

  revalidatePath(path)
  return NextResponse.json({ revalidated: true, path })
}
