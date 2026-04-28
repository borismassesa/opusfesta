import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.WEBSITE_REVALIDATE_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'
  revalidatePath(path)
  return NextResponse.json({ revalidated: true, path })
}
