import { NextResponse } from 'next/server'
import { fetchPublishedContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function GET() {
  const overrides = await fetchPublishedContent()
  return NextResponse.json(overrides)
}
