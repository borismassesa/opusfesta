'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function AdviceIdeasCTA() {
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
                <form className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                  <Input
                    type='email'
                    placeholder='Your email'
                    autoComplete='email'
                    aria-label='Email address'
                    className='bg-background h-11 flex-1 text-base'
                  />
                  <Button size='lg' className='h-11 text-base max-sm:w-full' type='submit'>
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
