'use client'

import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { MotionPreset } from '@/components/ui/motion-preset'

import StatCard from '@/components/shadcn-studio/blocks/bento-grid-13/stat-card'
import { ArmchairIcon, CrownIcon, HeartIcon, UsersRoundIcon, BriefcaseBusinessIcon, ArrowRightIcon } from 'lucide-react'

// Seats filled per table — discrete seating records, not a time series.
const chartData = [
  { event: 'Head', guests: 12 },
  { event: 'Family', guests: 64 },
  { event: 'Friends', guests: 58 },
  { event: 'Work', guests: 40 }
]

const totalEarningChartConfig = {
  guests: {
    label: 'Seated',
    color: '#C9A0DC'
  }
} satisfies ChartConfig

const SalesGrowthCard = () => {
  return (
    <Card className='h-full justify-between gap-11 shadow-none ring-0'>
      <div className='flex flex-col gap-8'>
        <MotionPreset
          fade
          slide={{ direction: 'down', offset: 35 }}
          delay={0.75}
          transition={{ duration: 0.5 }}
          className='px-6'
        >
          <StatCard
            avatarIcon={
              <ArmchairIcon className='size-4' />
            }
            title='Seated guests'
            statNumber='248'
            percentage={5}
            className='w-full p-6 shadow-lg'
          />
        </MotionPreset>

        <MotionPreset
          fade
          slide={{ direction: 'down', offset: 35 }}
          delay={0.9}
          transition={{ duration: 0.5 }}
          className='text-muted-foreground flex flex-col gap-4 py-6 text-sm'
        >
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center justify-between gap-2 py-2'>
                <div className='flex items-center gap-2'>
                  <CrownIcon className='size-4' />
                  <span>Head table</span>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <span className='font-medium'>12</span>
                  <span className='text-card-foreground'>100%</span>
                </div>
              </div>
              <div className='flex items-center justify-between gap-2 py-2'>
                <div className='flex items-center gap-2'>
                  <HeartIcon className='size-4' />
                  <span>Family</span>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <span className='font-medium'>64</span>
                  <span className='text-card-foreground'>92%</span>
                </div>
              </div>
              <div className='flex items-center justify-between gap-2 py-2'>
                <div className='flex items-center gap-2'>
                  <UsersRoundIcon className='size-4' />
                  <span>Friends</span>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <span className='font-medium'>58</span>
                  <span className='text-card-foreground'>85%</span>
                </div>
              </div>
              <div className='flex items-center justify-between gap-2 py-2'>
                <div className='flex items-center gap-2'>
                  <BriefcaseBusinessIcon className='size-4' />
                  <span>Work</span>
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <span className='font-medium'>40</span>
                  <span className='text-card-foreground'>70%</span>
                </div>
              </div>
            </div>
            <div>
              <Separator />
            </div>
          </CardContent>
          <MotionPreset fade slide={{ direction: 'down', offset: 35 }} delay={1.05} transition={{ duration: 0.5 }}>
            <ChartContainer config={totalEarningChartConfig} className='h-39.25 w-full'>
              <BarChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke='var(--border)' />
                <XAxis
                  dataKey='event'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey='guests' fill='var(--color-guests)' radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ChartContainer>
          </MotionPreset>
        </MotionPreset>
      </div>

      <CardContent className='flex flex-col gap-4'>
        <MotionPreset
          component='h5'
          fade
          slide={{ direction: 'down', offset: 35 }}
          delay={1.2}
          inView={false}
          transition={{ duration: 0.5 }}
          className='text-2xl font-semibold'
        >
          Seating chart
        </MotionPreset>
        <MotionPreset
          component='p'
          fade
          slide={{ direction: 'down', offset: 35 }}
          delay={1.35}
          inView={false}
          transition={{ duration: 0.5 }}
          className='text-muted-foreground text-lg'
        >
          Arrange guests across tables and watch each one fill up, from the head table to family, friends and work.
        </MotionPreset>
        <Link
          href='/my/dashboard/guests'
          className='group mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[#b97fd0] transition-colors hover:text-[#9a5fb5]'
        >
          Plan seating
          <ArrowRightIcon className='size-4 transition-transform group-hover:translate-x-1' />
        </Link>
      </CardContent>
    </Card>
  )
}

export default SalesGrowthCard
