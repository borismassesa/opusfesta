'use client'

import { motion } from 'motion/react'
import { DropletIcon, HeartIcon, GemIcon } from 'lucide-react'

import { Bar, ComposedChart, Line, XAxis } from 'recharts'

import { Card, CardContent } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { MotionPreset } from '@/components/ui/motion-preset'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const chartData = [
  { time: '09:00', uv: 88, pv: 88 },
  { time: '10:00', uv: 88, pv: 88 },
  { time: '11:00', uv: 144, pv: 144 },
  { time: '12:00', uv: 144, pv: 144 },
  { time: '13:00', uv: 109, pv: 109 },
  { time: '14:00', uv: 102, pv: 109 },
  { time: '15:00', uv: 62, pv: 62 },
  { time: '16:00', uv: 62, pv: 62 },
  { time: '17:00', uv: 128, pv: 144 },
  { time: '18:00', uv: 144, pv: 144 },
  { time: '19:00', uv: 183, pv: 200 },
  { time: '20:00', uv: 200, pv: 200 }
]

const totalEarningChartConfig = {
  uv: {
    label: 'Palette clarity',
    color: 'color-mix(in oklab, var(--primary) 10%, background)'
  },
  pv: {
    label: 'Style fit score',
    color: 'var(--primary)'
  }
} satisfies ChartConfig

export const SalesGrowthCard = ({ className }: { className?: string }) => {
  return (
    <Card className={`relative flex h-full flex-col gap-0 border-border/70 bg-background/65 pt-0 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.4)] overflow-hidden ${className || ''}`}>
      {/* Dynamic Background Glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className='absolute -bottom-32 -right-32 size-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none'
      />
      <motion.div
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className='absolute top-20 -left-16 size-56 rounded-full bg-primary/10 blur-3xl pointer-events-none'
      />

      <div className='z-10 flex flex-col gap-6 p-6'>
        {/* Header Ribbon */}
        <MotionPreset fade slide={{ direction: 'down', offset: 20 }} className='flex w-full items-center justify-between rounded-xl border border-border/50 bg-card p-3 shadow-sm'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-8 rounded-md'>
              <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-md'>
                <GemIcon className='size-4' />
              </AvatarFallback>
            </Avatar>
            <span className='font-semibold text-sm'>Style Quiz</span>
          </div>
          <Button variant='outline' size='sm' className='h-7 text-xs'>
            Details
          </Button>
        </MotionPreset>

        {/* Glassmorphic Metrics */}
        <div className='grid grid-cols-2 gap-3'>
          <MotionPreset
            fade
            slide={{ direction: 'left', offset: 20 }}
            delay={0.3}
            className='group flex flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:bg-card hover:shadow-md'
          >
            <div className='flex items-center gap-2 text-muted-foreground'>
              <DropletIcon className='size-4 text-violet-500' />
              <span className='text-xs font-medium'>Palette clarity</span>
            </div>
            <div className='flex items-baseline justify-between'>
              <span className='text-2xl font-bold'>82</span>
              <span className='text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded'>+6.2%</span>
            </div>
          </MotionPreset>

          <MotionPreset
            fade
            slide={{ direction: 'left', offset: 20 }}
            delay={0.4}
            className='group flex flex-col gap-2 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:bg-card hover:shadow-md'
          >
            <div className='flex items-center gap-2 text-muted-foreground'>
              <HeartIcon className='size-4 text-primary' />
              <span className='text-xs font-medium'>Style fit score</span>
            </div>
            <div className='flex items-baseline justify-between'>
              <span className='text-2xl font-bold'>91</span>
              <span className='text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded'>+4.8%</span>
            </div>
          </MotionPreset>
        </div>

        <MotionPreset fade slide={{ direction: 'up', offset: 20 }} delay={0.5} className='pt-2'>
          <ChartContainer config={totalEarningChartConfig} className='h-[140px] w-full'>
            <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <XAxis
                dataKey='time'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={15}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <Bar dataKey='uv' barSize={12} fill='var(--color-uv)' radius={[2, 2, 0, 0]} />
              <Line type='linear' dataKey='pv' stroke='var(--color-pv)' dot={false} strokeWidth={2.5} />
            </ComposedChart>
          </ChartContainer>
        </MotionPreset>
      </div>

      <CardContent className='relative z-10 mt-auto flex flex-col gap-3 pb-6 pt-2 px-6 border-t border-border/40 bg-card/30'>
        <MotionPreset
          component='h3'
          fade
          slide={{ direction: 'down', offset: 20 }}
          delay={0.7}
          className='text-2xl font-semibold flex items-center gap-2'
        >
          Turn taste into practical direction.
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          slide={{ direction: 'down', offset: 20 }}
          delay={0.8}
          className='text-muted-foreground text-base'
        >
          Palette clarity, style fit score, and vendor-fit signal.
        </MotionPreset>
      </CardContent>
    </Card>
  )
}

export default SalesGrowthCard
