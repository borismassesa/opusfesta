'use client'

import { useState } from 'react'

import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { WalletIcon, CalculatorIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

export const GoalAndTargetCard = ({ className }: { className?: string }) => {
  const max = 25
  const step = 2.5
  const ticks = [...Array(Math.floor(max / step) + 1)].map((_, i) => i * step)
  const [value, setValue] = useState([12.5])

  return (
    <Card className={`relative flex h-full flex-col gap-0 border-border/70 bg-background/65 pt-0 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.4)] overflow-hidden ${className || ''}`}>
      {/* Dynamic Background Glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className='absolute -bottom-32 -right-32 size-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none'
      />
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className='absolute top-10 -left-16 size-56 rounded-full bg-primary/10 blur-3xl pointer-events-none'
      />

      <div className='z-10 flex flex-col gap-6 p-6'>
        {/* Header Ribbon */}
        <MotionPreset fade slide={{ direction: 'down', offset: 20 }} className='flex w-full items-center justify-between rounded-xl border border-border/50 bg-card p-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-8 rounded-md'>
              <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-md'>
                <WalletIcon className='size-4' />
              </AvatarFallback>
            </Avatar>
            <span className='font-semibold text-sm'>Budget Advisor</span>
          </div>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            Details
          </Button>
        </MotionPreset>

        <MotionPreset
          fade
          slide={{ direction: 'left', offset: 20 }}
          delay={0.3}
          className='group flex flex-col gap-2 rounded-xl border border-border/50 bg-card/50 px-6 py-6 backdrop-blur-sm transition-all hover:bg-card hover:shadow-md'
        >
          <div className='flex items-center justify-between mb-4'>
            <Label className='text-muted-foreground'>Total Budget Goal</Label>
            <Badge variant="outline" className='text-emerald-500 border-emerald-500/30 bg-emerald-500/10'>On Track</Badge>
          </div>
          <div className='flex items-center gap-3 w-full px-2'>
            <span className='text-sm font-medium text-muted-foreground w-12'>TSh 0</span>
            <Slider
              aria-label='Budget slider'
              defaultValue={[80]}
              max={100}
              step={1}
              onValueChange={setValue}
              value={value}
              className='flex-1 cursor-grab active:cursor-grabbing **:[[role=slider]]:bg-primary **:[[role=slider]]:border-primary'
            />
            <span className='text-sm font-medium text-primary md:w-[70px] text-right'>
              TSh 50M
            </span>
          </div>
        </MotionPreset>
      </div >

      <CardContent className='relative z-10 mt-auto flex flex-col gap-3 pb-6 pt-2 px-6 border-t border-border/40 bg-card/30'>
        <MotionPreset
          component='h3'
          fade
          slide={{ direction: 'down', offset: 20 }}
          delay={0.7}
          className='text-2xl font-semibold flex items-center gap-2'
        >
          <CalculatorIcon className='size-5 text-emerald-500' />
          Budget clarity at a glance.
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          slide={{ direction: 'down', offset: 20 }}
          delay={0.8}
          className='text-muted-foreground text-base'
        >
          Totals, deposits, and runway in one view.
        </MotionPreset>
      </CardContent>
    </Card >
  )
}

export default GoalAndTargetCard
