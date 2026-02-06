'use client'

import Link from 'next/link'
import { ArrowUpRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdviceIdeasPageContent } from '@/context/AdviceIdeasPageContentContext'
import { ADVICE_IDEAS_PATH } from '@/data/advice-ideas-posts'

export function AdviceIdeasNewsletterStrip() {
  const { content } = useAdviceIdeasPageContent()
  return (
    <section className='bg-primary/5 py-8 sm:py-10' aria-labelledby='newsletter-strip-title'>
      <div className='mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-primary/10 bg-background/80 px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:px-8'>
        <div className='space-y-2'>
          <p className='text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground'>
            {content.newsletter.label}
          </p>
          <h2 id='newsletter-strip-title' className='text-xl font-semibold text-primary md:text-2xl'>
            {content.newsletter.title}
          </h2>
          <p className='text-muted-foreground text-sm md:text-base'>
            {content.newsletter.description}
          </p>
        </div>
        <Button asChild size='lg' className='text-base w-full justify-center sm:w-auto'>
          <Link href={`${ADVICE_IDEAS_PATH}#home`}>
            {content.newsletter.buttonText}
            <ArrowUpRightIcon className='size-4' />
          </Link>
        </Button>
      </div>
    </section>
  )
}
