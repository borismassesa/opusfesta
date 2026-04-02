import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AdviceIdeasDetailPage from '@/components/advice-ideas/AdviceIdeasDetailPage'
import { adviceIdeasPosts, getAdviceIdeasPost } from '@/lib/advice-ideas'

export function generateStaticParams() {
  return adviceIdeasPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getAdviceIdeasPost(slug)

  if (!post) {
    return {
      title: 'Article Not Found | OpusFesta',
    }
  }

  return {
    title: `${post.title} | OpusFesta`,
    description: post.description,
  }
}

export default async function AdviceIdeasSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getAdviceIdeasPost(slug)

  if (!post) {
    notFound()
  }

  return <AdviceIdeasDetailPage post={post} />
}
