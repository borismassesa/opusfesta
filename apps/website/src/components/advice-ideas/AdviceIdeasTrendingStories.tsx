'use client'

import Link from 'next/link'
import { ArrowUpRightIcon, CalendarDaysIcon, ClockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAdviceIdeas } from '@/context/AdviceIdeasContext'
import { useAdviceIdeasPageContent } from '@/context/AdviceIdeasPageContentContext'
import { ADVICE_IDEAS_PATH } from '@/data/advice-ideas-posts'

export function AdviceIdeasTrendingStories() {
  const { posts } = useAdviceIdeas()
  const { content } = useAdviceIdeasPageContent()
  const byDateDesc = (a: { publishedAt?: string; date: string }, b: { publishedAt?: string; date: string }) =>
    new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime()

  const latestIds = new Set([...posts].sort(byDateDesc).slice(0, 3).map(post => post.id))

  const trendingPosts = [...posts]
    .filter(post => !latestIds.has(post.id))
    .sort((a, b) => {
      const saveDiff = (b.saves ?? 0) - (a.saves ?? 0)
      if (saveDiff !== 0) return saveDiff
      const viewDiff = (b.views ?? 0) - (a.views ?? 0)
      if (viewDiff !== 0) return viewDiff
      return byDateDesc(a, b)
    })
    .slice(0, 3)
  return (
    <section className='bg-background py-10 sm:py-14 lg:py-16' aria-labelledby='trending-stories-title'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-3'>
            <p className='text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
              {content.trending.label}
            </p>
            <h2 id='trending-stories-title' className='text-2xl font-semibold text-primary md:text-3xl'>
              {content.trending.title}
            </h2>
            <p className='text-muted-foreground text-base md:text-lg'>
              {content.trending.description}
            </p>
          </div>
          <Link
            href={`${ADVICE_IDEAS_PATH}#categories`}
            className='text-sm font-semibold text-primary inline-flex items-center gap-2 self-start transition-colors hover:text-primary/80'
          >
            {content.trending.ctaText}
            <ArrowUpRightIcon className='size-4' />
          </Link>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {trendingPosts.map(post => (
            <Link
              key={post.id}
              href={`${ADVICE_IDEAS_PATH}/${post.slug}`}
              className='group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-muted/20 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-background hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
            >
              <div className='relative overflow-hidden bg-surface'>
                <img
                  src={post.imageUrl}
                  alt={post.imageAlt}
                  className='aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                />
              </div>
              <div className='flex flex-1 flex-col gap-4 p-5'>
                <div className='flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-secondary'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <CalendarDaysIcon className='size-4' />
                    <span>{post.date}</span>
                    <ClockIcon className='size-4' />
                    <span>{post.readTime} min read</span>
                  </div>
                  <Badge className='rounded-full border-0 bg-primary/10 px-3 py-1 text-xs text-primary'>
                    {post.category}
                  </Badge>
                </div>
                <h3 className='text-lg font-semibold text-primary md:text-xl'>{post.title}</h3>
                <p className='text-secondary line-clamp-2 text-sm leading-relaxed'>{post.description}</p>
                <span className='mt-auto text-sm font-semibold text-primary'>Save for later</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
