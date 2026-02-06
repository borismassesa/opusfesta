'use client'

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUpRightIcon, CalendarDaysIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAdviceIdeas } from '@/context/AdviceIdeasContext'
import { useAdviceIdeasPageContent } from '@/context/AdviceIdeasPageContentContext'
import { ADVICE_IDEAS_PATH, categoryToId, type AdviceIdeasPost } from '@/data/advice-ideas-posts'

export function AdviceIdeasHeroSection() {
  const { posts } = useAdviceIdeas()
  const { content } = useAdviceIdeasPageContent()
  const featuredPosts = posts.filter(post => post.featured)
  const heroPosts =
    featuredPosts.length > 0
      ? featuredPosts
      : [...posts].sort((a, b) => new Date(b.publishedAt || b.date).getTime() - new Date(a.publishedAt || a.date).getTime()).slice(0, 2)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleCardClick = (post: AdviceIdeasPost) => {
    router.push(`${ADVICE_IDEAS_PATH}/${post.slug}`)
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, post: AdviceIdeasPost) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick(post)
    }
  }

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedEmail) {
      setFeedback({ type: 'error', message: 'Please enter an email address.' })
      return
    }

    if (!emailPattern.test(trimmedEmail)) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/advice-ideas/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, source: 'hero' }),
      })

      if (!response.ok) {
        throw new Error('Subscription failed')
      }
      setFeedback({ type: 'success', message: "You're subscribed. Watch your inbox for the next issue." })
      setEmail('')
    } catch (error) {
      setFeedback({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const cardStyle =
    'group overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'

  return (
    <section id='home' className='bg-muted pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-20'>
      <div className='mx-auto flex h-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:gap-12 lg:px-8'>
        {/* Hero Header */}
        <div className='flex max-w-4xl flex-col items-center gap-4 self-center text-center sm:gap-5'>
          <h1 className='text-3xl leading-[1.29167] font-semibold text-balance sm:text-4xl lg:text-5xl'>
            {content.hero.title}
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl'>
            {content.hero.subtitle}
          </p>
          <form
            className='gap-3 py-2 max-sm:w-full max-sm:space-y-2 sm:flex sm:flex-row md:w-sm'
            onSubmit={handleSubscribe}
            aria-busy={isSubmitting}
          >
            <Input
              type='email'
              placeholder={content.hero.formPlaceholder}
              autoComplete='email'
              aria-label='Email address'
              className='bg-background h-10 min-w-0 flex-1 text-base'
              value={email}
              onChange={event => {
                setEmail(event.target.value)
                if (feedback) {
                  setFeedback(null)
                }
              }}
              disabled={isSubmitting}
            />
            <Button size='lg' className='text-base max-sm:w-full' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : content.hero.buttonText}
            </Button>
          </form>
          {feedback ? (
            <p
              className={`text-sm ${feedback.type === 'error' ? 'text-destructive' : 'text-emerald-600'}`}
              role='status'
              aria-live='polite'
            >
              {feedback.message}
            </p>
          ) : null}
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          {heroPosts.map(item => (
            <Card
              key={item.id}
              className={`cursor-pointer py-0 ${cardStyle}`}
              onClick={() => handleCardClick(item)}
              onKeyDown={event => handleCardKeyDown(event, item)}
              role='link'
              tabIndex={0}
            >
              <CardContent className='grid h-full grid-cols-1 px-0 xl:grid-cols-2'>
                <div className='flex h-full flex-col p-5 sm:p-6'>
                  <div className='relative flex-1 overflow-hidden rounded-xl bg-surface'>
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                    />
                  </div>
                </div>
                <div className='flex h-full flex-col justify-between gap-5 p-5 sm:p-6'>
                  <div className='space-y-4'>
                    <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-secondary'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <CalendarDaysIcon className='size-4' />
                        <span>{item.date}</span>
                      </div>
                      <Badge
                        className='bg-primary/10 text-primary cursor-pointer shrink-0 border-0 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
                        onClick={e => {
                          e.stopPropagation()
                          router.push(`${ADVICE_IDEAS_PATH}#category-${categoryToId(item.category)}`)
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            router.push(`${ADVICE_IDEAS_PATH}#category-${categoryToId(item.category)}`)
                          }
                        }}
                        role='button'
                        tabIndex={0}
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <h3 className='text-xl font-semibold text-primary'>{item.title}</h3>
                    <p className='text-secondary'>{item.description}</p>
                  </div>
                  <div className='flex w-full items-center justify-between gap-2'>
                    <span className='text-sm font-semibold text-secondary'>{item.author}</span>
                    <div className='bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-lg shadow-sm'>
                      <ArrowUpRightIcon className='size-4' />
                    </div>
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
