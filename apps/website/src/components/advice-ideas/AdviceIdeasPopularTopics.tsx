'use client'

import Link from 'next/link'
import { useAdviceIdeas } from '@/context/AdviceIdeasContext'
import { useAdviceIdeasPageContent } from '@/context/AdviceIdeasPageContentContext'
import { ADVICE_IDEAS_PATH, categoryToId } from '@/data/advice-ideas-posts'

const topicOrder = [
  'Planning Timeline',
  'Budgeting',
  'Style & Decor',
  'Ceremony',
  'Reception',
  'Photography',
  'Guest Experience',
  'Etiquette',
]

export function AdviceIdeasPopularTopics() {
  const { posts } = useAdviceIdeas()
  const { content } = useAdviceIdeasPageContent()
  const topicData = topicOrder.map(category => {
    const match = posts.find(post => post.category === category)

    return {
      category,
      title: category,
      imageUrl: match?.imageUrl ?? '/images/advice-ideas/post-1.webp',
      imageAlt: match?.imageAlt ?? `${category} inspiration`,
    }
  })
  return (
    <section className='bg-background py-10 sm:py-14 lg:py-16' aria-labelledby='popular-topics-title'>
      <div className='mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8'>
        <div className='space-y-3'>
          <p className='text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
            {content.topics.label}
          </p>
          <h2 id='popular-topics-title' className='text-2xl font-semibold text-primary md:text-3xl'>
            {content.topics.title}
          </h2>
          <p className='text-muted-foreground text-base md:text-lg'>
            {content.topics.description}
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {topicData.map(topic => (
            <Link
              key={topic.category}
              href={`${ADVICE_IDEAS_PATH}#category-${categoryToId(topic.category)}`}
              className='group flex items-center gap-4 rounded-2xl border border-border/70 bg-muted/20 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-background hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
            >
              <div className='relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-surface'>
                <img
                  src={topic.imageUrl}
                  alt={topic.imageAlt}
                  className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                  loading='lazy'
                />
              </div>
              <span className='text-base font-semibold text-primary leading-snug text-balance'>{topic.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
