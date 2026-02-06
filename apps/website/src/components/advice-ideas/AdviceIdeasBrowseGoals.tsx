'use client'

import Link from 'next/link'
import { CalendarDaysIcon, WalletIcon, SparklesIcon, UsersIcon } from 'lucide-react'
import { useAdviceIdeasPageContent } from '@/context/AdviceIdeasPageContentContext'
import { ADVICE_IDEAS_PATH, categoryToId } from '@/data/advice-ideas-posts'

const iconMap = [CalendarDaysIcon, WalletIcon, SparklesIcon, UsersIcon]

export function AdviceIdeasBrowseGoals() {
  const { content } = useAdviceIdeasPageContent()
  const goals = content.browseGoals.items
  return (
    <section className='bg-muted/10 py-10 sm:py-14 lg:py-16' aria-labelledby='browse-goals-title'>
      <div className='mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8'>
        <div className='space-y-3'>
          <p className='text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
            {content.browseGoals.label}
          </p>
          <h2 id='browse-goals-title' className='text-2xl font-semibold text-primary md:text-3xl'>
            {content.browseGoals.title}
          </h2>
          <p className='text-muted-foreground text-base md:text-lg'>
            {content.browseGoals.description}
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {goals.map((goal, index) => {
            const Icon = iconMap[index % iconMap.length]
            return (
              <Link
                key={`${goal.category}-${index}`}
                href={`${ADVICE_IDEAS_PATH}#category-${categoryToId(goal.category)}`}
                className='group flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
              >
                <div className='flex items-center gap-3'>
                  <span className='inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Icon className='size-5' />
                  </span>
                  <span className='text-base font-semibold text-primary'>{goal.title}</span>
                </div>
                <p className='text-sm text-secondary'>{goal.description}</p>
                <span className='text-sm font-semibold text-primary'>Explore {goal.category}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
