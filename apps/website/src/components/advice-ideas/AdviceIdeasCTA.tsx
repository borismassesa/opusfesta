'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function AdviceIdeasCTA() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      // TODO: Replace with real newsletter subscription API call.
      await Promise.resolve()
      setFeedback({ type: 'success', message: "You're subscribed. Watch your inbox for the next issue." })
      setEmail('')
    } catch (error) {
      setFeedback({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='bg-surface py-8 sm:py-16 lg:py-24' id='get-in-touch'>
      <div className='container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
        <Card className='overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm'>
          <CardContent className='p-0'>
            <div className='grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]'>
              <div className='relative min-h-[240px] sm:min-h-[300px] lg:min-h-full'>
                <img
                  src='/images/advice-ideas/cta.webp'
                  alt='Wedding planning flat lay'
                  className='h-full w-full object-cover'
                />
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent' />
              </div>

              <div className='flex h-full flex-col justify-between gap-6 bg-surface p-6 sm:p-8'>
                <div className='space-y-3'>
                  <p className='text-xs font-semibold tracking-[0.2em] text-secondary uppercase'>Newsletter</p>
                  <h2 className='text-xl leading-tight font-semibold text-primary sm:text-2xl lg:text-3xl'>
                    Fresh wedding ideas, planning tips, and vendor insights delivered to your inbox.
                  </h2>
                  <p className='text-secondary text-sm leading-relaxed sm:text-base'>
                    Join couples and planners who get practical guidance, budget tips, and creative inspiration for a
                    celebration that feels like you.
                  </p>
                </div>
                <form
                  className='flex flex-col gap-3 sm:flex-row sm:items-center'
                  onSubmit={handleSubmit}
                  aria-busy={isSubmitting}
                >
                  <Input
                    type='email'
                    placeholder='Your email'
                    autoComplete='email'
                    aria-label='Email address'
                    className='bg-background h-11 flex-1 text-base'
                    value={email}
                    onChange={event => {
                      setEmail(event.target.value)
                      if (feedback) {
                        setFeedback(null)
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <Button size='lg' className='h-11 text-base max-sm:w-full' type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
