'use client'

import { ChartPieIcon, Clock8Icon, FileChartPieIcon, LoaderIcon, ThumbsUpIcon } from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/badge'

import ArrowBottom from '@/components/shadcn-studio/blocks/hero-section-40/arrow-bottom'
import WorkflowItem from '@/components/shadcn-studio/blocks/hero-section-40/workflow-item'

const DataSync = () => {
  return (
    <div className='flex max-md:flex-col max-md:space-y-8 md:items-start'>
      <WorkflowItem
        type='input'
        icon={<ChartPieIcon />}
        title='Saved Looks'
        description='Collect outfits, decor, and palettes you love.'
        time='0.4 sec'
        className='relative md:mt-10.5 md:mr-11.25 md:w-70'
      >
        <div className='bg-muted rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-44.png'
              alt='Style pins'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>Style pins</span>
          </div>
        </div>

        {/* Arrow for large screens */}
        <motion.svg
          width='103'
          height='121'
          viewBox='0 0 103 121'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute top-full right-0 translate-x-11.25 -translate-y-1.5 max-md:hidden'
        >
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              delay: 0.1
            }}
            d='M6 0L12 6L6 12L0 6L6 0Z'
            fill='color-mix(in oklab,var(--foreground)15%,var(--background))'
            className='dark:fill-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              delay: 0.4
            }}
            d='M6 6V93.2683C6 104.314 14.9543 113.268 26 113.268H101.997'
            stroke='color-mix(in oklab,var(--foreground)15%,var(--background))'
            strokeWidth='2'
            className='dark:stroke-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration: 0.35,
                ease: 'easeInOut',
                delay: 0.9
              },
              opacity: { duration: 0.1, delay: 0.9 }
            }}
            d='M95.6143 106.91L101.997 113.269L95.6146 119.626'
            stroke='color-mix(in oklab,var(--foreground)15%,var(--background))'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='dark:stroke-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
          />
        </motion.svg>

        {/* Arrow for small screens */}
        <ArrowBottom delay={0.1} />
      </WorkflowItem>

      <WorkflowItem
        type='action'
        icon={<FileChartPieIcon />}
        title='Collection Match'
        time='16 sec'
        delay={1.2}
        className='relative md:mt-56 md:mr-3.5'
      >
        <div className='bg-muted rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-44.png'
              alt='Collection board'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>The Engagement Era Collection</span>
          </div>
        </div>
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='text-muted-foreground flex items-center justify-between gap-2'>
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground rounded-full border-0 px-2.5 py-0.5 text-xs font-medium'
            >
              Curating selections...
            </Badge>
            <LoaderIcon className='size-4' />
          </div>
          <p className='text-muted-foreground text-sm'>Matching styles to your palette, venue, and budget.</p>
        </div>

        {/* Arrow for large screens */}
        <motion.svg
          width='134'
          height='121'
          viewBox='0 0 134 121'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute top-9 -right-3.5 -translate-y-full max-md:hidden'
        >
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              delay: 1.3
            }}
            d='M6 108.626L12 114.626L6 120.626L0 114.626L6 108.626Z'
            fill='color-mix(in oklab,var(--foreground)15%,var(--background))'
            className='dark:fill-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
              delay: 1.6
            }}
            d='M6 114.626V27.3579C6 16.3122 14.9543 7.35791 26 7.35791H132.311'
            stroke='color-mix(in oklab,var(--foreground)15%,var(--background))'
            strokeWidth='2'
            className='dark:stroke-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration: 0.35,
                ease: 'easeInOut',
                delay: 2.1
              },
              opacity: { duration: 0.1, delay: 2.1 }
            }}
            d='M125.928 1L132.31 7.35817L125.928 13.7158'
            stroke='color-mix(in oklab,var(--foreground)15%,var(--background))'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='dark:stroke-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
          />
        </motion.svg>

        {/* Arrow for small screens */}
        <ArrowBottom delay={1.3} />
      </WorkflowItem>

      <div className='flex flex-col gap-8 md:gap-6'>
        <WorkflowItem
          type='pending'
          icon={<Clock8Icon />}
          title='Curator Review'
          description='Confirm favorites before finalizing the set.'
          time='24 min'
          delay={2.4}
          className='relative md:w-70'
        >
          <div className='bg-muted rounded-lg px-2.5 py-3'>
            <div className='flex items-center gap-2'>
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-44.png'
                alt='Shortlist'
                className='size-4.5'
              />
              <span className='text-muted-foreground text-sm'>Shortlist ready</span>
            </div>
          </div>

          {/* Arrow for large screens */}
          <motion.svg
            width='93'
            height='112'
            viewBox='0 0 93 112'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='absolute -bottom-13.5 left-full -translate-x-1.5 max-md:hidden'
          >
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
                delay: 2.5
              }}
              d='M6 0L12 6L6 12L0 6L6 0Z'
              fill='color-mix(in oklab,var(--foreground)15%,var(--background))'
              className='dark:fill-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
                delay: 2.8
              }}
              d='M6 6H64.792C75.8377 6 84.792 14.9543 84.792 26V110.695'
              stroke='color-mix(in oklab,var(--foreground)15%,var(--background))'
              strokeWidth='2'
              className='dark:stroke-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: {
                  duration: 0.35,
                  ease: 'easeInOut',
                  delay: 3.3
                },
                opacity: { duration: 0.1, delay: 3.3 }
              }}
              d='M91.1494 104.146L84.7912 110.528L78.4336 104.146'
              stroke='color-mix(in oklab,var(--foreground)15%,var(--background))'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='dark:stroke-[color-mix(in_oklab,var(--foreground)25%,var(--background))]'
            />
          </motion.svg>

          {/* Arrow for small screens */}
          <ArrowBottom delay={2.5} />
        </WorkflowItem>

        <WorkflowItem
          type='output'
          icon={<ThumbsUpIcon />}
          title='Collection Ready'
          description='Your Engagement Era Collection is organized and shareable.'
          time='4.1 sec'
          delay={3.6}
          className='md:ml-41 md:w-72.5'
        >
          <div className='bg-muted rounded-lg px-2.5 py-3'>
            <div className='flex items-center gap-2'>
              <img
                src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-44.png'
                alt='Collection saved'
                className='size-4.5'
              />
              <span className='text-muted-foreground text-sm'>Collection saved</span>
            </div>
          </div>
        </WorkflowItem>
      </div>
    </div>
  )
}

export default DataSync
