'use client'

import Link from 'next/link'
import { ArrowUpRightIcon, CalendarDaysIcon, ClockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAdviceIdeas } from '@/context/AdviceIdeasContext'
import { useAdviceIdeasPageContent } from '@/context/AdviceIdeasPageContentContext'
import { ADVICE_IDEAS_PATH } from '@/data/advice-ideas-posts'

export function AdviceIdeasLatestStories() {
  const { posts } = useAdviceIdeas()
  const { content } = useAdviceIdeasPageContent()
  const latestPosts = [...posts]
    .sort((a, b) => new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime())
    .slice(0, 3)
  return (
    <section className='bg-muted/30 py-10 sm:py-14 lg:py-16' aria-labelledby='latest-stories-title'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-3'>
            <p className='text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
              {content.latest.label}
            </p>
            <h2 id='latest-stories-title' className='text-2xl font-semibold text-primary md:text-3xl'>
              {content.latest.title}
            </h2>
            <p className='text-muted-foreground text-base md:text-lg'>
              {content.latest.description}
            </p>
          </div>
          <Link
            href={`${ADVICE_IDEAS_PATH}#categories`}
            className='text-sm font-semibold text-primary inline-flex items-center gap-2 self-start transition-colors hover:text-primary/80'
          >
            {content.latest.ctaText}
            <ArrowUpRightIcon className='size-4' />
          </Link>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {latestPosts.map(post => (
            <Link
              key={post.id}
              href={`${ADVICE_IDEAS_PATH}/${post.slug}`}
              className='group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
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
                  <Badge
                    className='rounded-full border-0 bg-primary/10 px-3 py-1 text-xs text-primary'
                  >
                    <span className='sr-only'>Category:</span>
                    {post.category}
                  </Badge>
                </div>
                <h3 className='text-lg font-semibold text-primary md:text-xl'>{post.title}</h3>
                <p className='text-secondary line-clamp-2 text-sm leading-relaxed'>{post.description}</p>
                <span className='mt-auto text-sm font-semibold text-primary'>Read story</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
