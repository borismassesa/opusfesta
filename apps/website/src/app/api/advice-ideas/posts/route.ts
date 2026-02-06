import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchAdviceIdeasPosts } from '@/lib/advice-ideas/server'

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  category: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
  featured: z
    .string()
    .transform(value => value === 'true')
    .optional(),
  sort: z.enum(['latest', 'trending']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }

    const posts = await fetchAdviceIdeasPosts(parsed.data)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching Advice & Ideas posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
