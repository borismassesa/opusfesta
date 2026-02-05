'use client'

import type { KeyboardEvent } from 'react'
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ADVICE_IDEAS_PATH, categoryToId, type AdviceIdeasPost } from '@/data/advice-ideas-posts'

interface AdviceIdeasRelatedPostsProps {
  blogPosts: AdviceIdeasPost[];
}

export function AdviceIdeasRelatedPosts({ blogPosts }: AdviceIdeasRelatedPostsProps) {
  const router = useRouter()

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, post: AdviceIdeasPost) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      router.push(`${ADVICE_IDEAS_PATH}/${post.slug}`)
    }
  }

  return (
    <section className='bg-muted/40 dark:bg-muted/20 py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:px-8'>
        <div className='space-y-4'>
          <Badge variant='outline'>More ideas</Badge>

          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Related Advice</h2>

          <p className='text-muted-foreground text-lg md:text-xl'>
            Keep planning with a few hand-picked reads for your next step.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {blogPosts.map(post => (
            <Card
              key={post.id}
              className='group h-full cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
              onClick={() => router.push(`${ADVICE_IDEAS_PATH}/${post.slug}`)}
              onKeyDown={event => handleCardKeyDown(event, post)}
              role='link'
              tabIndex={0}
            >
              <CardContent className='flex h-full flex-col gap-4 p-5'>
                <div className='relative overflow-hidden rounded-xl bg-surface'>
                  <img
                    src={post.imageUrl}
                    alt={post.imageAlt}
                    className='aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                  />
                </div>
                <div className='flex items-center justify-between gap-2 text-xs font-medium text-secondary'>
                  <div className='flex items-center gap-2'>
                    <CalendarDaysIcon className='size-4' />
                    <span>{post.date}</span>
                    <ClockIcon className='ml-3 size-4' />
                    <span>{post.readTime} min read</span>
                  </div>
                  <Badge
                    className='bg-primary/10 text-primary border-0 px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
                    onClick={e => {
                      e.stopPropagation()
                      router.push(`${ADVICE_IDEAS_PATH}#category-${categoryToId(post.category)}`)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`${ADVICE_IDEAS_PATH}#category-${categoryToId(post.category)}`)
                      }
                    }}
                    role='button'
                    tabIndex={0}
                  >
                    {post.category}
                  </Badge>
                </div>
                <h3 className='line-clamp-2 text-base font-semibold text-primary md:text-lg'>{post.title}</h3>
                <p className='text-secondary line-clamp-2 text-sm leading-relaxed'>{post.description}</p>
                <div className='mt-auto flex items-center justify-between pt-2'>
                  <div className='flex items-center gap-2 text-sm font-medium text-secondary'>
                    <img src={post.avatarUrl} alt={post.author} className='size-7 rounded-full object-cover' />
                    <span>{post.author}</span>
                  </div>
                  <div className='bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-full shadow-sm'>
                    <ArrowRightIcon className='size-4 -rotate-45' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
