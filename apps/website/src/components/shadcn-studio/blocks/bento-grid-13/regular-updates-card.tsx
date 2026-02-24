'use client'

import { motion } from 'motion/react'
import { AlbumIcon, ApertureIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const IMAGES = [
  '/images/advice-ideas/post-1.webp',
  '/images/advice-ideas/post-2.webp',
  '/images/advice-ideas/post-3.webp',
  '/images/advice-ideas/post-4.webp',
  '/images/advice-ideas/post-5.webp',
  '/images/advice-ideas/post-6.webp',
  '/images/advice-ideas/post-7.webp',
  '/images/advice-ideas/post-8.webp',
]

// Duplicate arrays for seamless CSS/Framer looping
const COLUMN_1 = [...IMAGES.slice(0, 4), ...IMAGES.slice(0, 4)]
const COLUMN_2 = [...IMAGES.slice(4, 8), ...IMAGES.slice(4, 8)]

export const RegularUpdatesCard = ({ className }: { className?: string }) => {
  return (
    <Card className={`relative flex h-full flex-col gap-0 border-border/70 bg-background/65 pt-0 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.4)] overflow-hidden ${className || ''}`}>
      {/* Dynamic Background Glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className='absolute -bottom-32 -right-32 size-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none'
      />
      <motion.div
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className='absolute top-20 -left-16 size-56 rounded-full bg-primary/10 blur-3xl pointer-events-none'
      />

      <div className='z-10 flex flex-col gap-6 p-6 pb-0'>
        {/* Header Ribbon */}
        <MotionPreset fade slide={{ direction: 'down', offset: 20 }} className='flex w-full items-center justify-between rounded-xl border border-border/50 bg-card p-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-8 rounded-md'>
              <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-md'>
                <AlbumIcon className='size-4' />
              </AvatarFallback>
            </Avatar>
            <span className='font-semibold text-sm'>Engagement Collection</span>
          </div>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            Details
          </Button>
        </MotionPreset>
      </div>

      <MotionPreset fade slide={{ direction: 'up', offset: 20 }} delay={0.3} className='relative flex-1 mt-6 h-full min-h-[300px] overflow-hidden bg-muted/20 border-t border-border/50'>
        {/* Soft fading edges for the infinite scroll */}
        <div className='pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-linear-to-b from-background to-transparent' />
        <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-linear-to-t from-background to-transparent' />

        <div className='absolute inset-0 flex justify-center gap-4 px-6 pt-2'>
          {/* Column 1 (Scrolls Up) */}
          <motion.div
            className='flex w-1/2 flex-col gap-4'
            animate={{ y: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 40, repeat: Infinity }}
          >
            {COLUMN_1.map((src, idx) => (
              <img
                key={`col1-${idx}`}
                src={src}
                alt='Inspiration'
                className='h-[160px] w-full rounded-[16px] object-cover shadow-sm'
              />
            ))}
          </motion.div>

          {/* Column 2 (Scrolls Down) */}
          <motion.div
            className='flex w-1/2 flex-col gap-4'
            animate={{ y: ['-50%', '0%'] }}
            transition={{ ease: 'linear', duration: 35, repeat: Infinity }}
          >
            {COLUMN_2.map((src, idx) => (
              <img
                key={`col2-${idx}`}
                src={src}
                alt='Inspiration'
                className='h-[200px] w-full rounded-[16px] object-cover shadow-sm'
              />
            ))}
          </motion.div>
        </div>

        {/* Center Premium Badge Overlaying the feed */}
        <div className='absolute inset-0 z-20 flex items-center justify-center p-4'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', delay: 0.6, bounce: 0.4 }}
            className='flex items-center gap-3 rounded-2xl border border-border/50 bg-background/80 px-5 py-3 shadow-xl backdrop-blur-xl transition-transform hover:scale-105'
          >
            <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <span className='font-bold text-sm'>1.2K</span>
            </div>
            <div className='flex flex-col pr-2'>
              <span className='text-sm font-semibold leading-none text-rose-500'>Ideas</span>
              <span className='pt-1 text-[10px] text-muted-foreground leading-none'>Saved to boards</span>
            </div>
          </motion.div>
        </div>
      </MotionPreset>

      <CardContent className='relative z-10 mt-auto flex flex-col gap-3 pb-6 pt-4 px-6 border-t border-border/40 bg-card/30'>
        <MotionPreset
          component='h5'
          fade
          slide={{ direction: 'down', offset: 20 }}
          delay={0.7}
          className='text-2xl font-semibold flex items-center gap-2'
        >
          Organize inspiration into decisions.
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          slide={{ direction: 'down', offset: 20 }}
          delay={0.8}
          className='text-muted-foreground text-base'
        >
          Moodboards syncing with your vendor palette.
        </MotionPreset>
      </CardContent>
    </Card>
  )
}

export default RegularUpdatesCard
