import { NextRequest, NextResponse } from 'next/server'
import { fetchAdviceIdeasPostBySlug } from '@/lib/advice-ideas/server'

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await fetchAdviceIdeasPostBySlug(params.slug)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching Advice & Ideas post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
