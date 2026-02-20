'use client'

import { BookmarkIcon, ImageIcon, LoaderIcon, PaletteIcon, SparklesIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import ArrowBottom from '@/components/shadcn-studio/blocks/hero-section-40/arrow-bottom'
import ArrowRight from '@/components/shadcn-studio/blocks/hero-section-40/arrow-right'
import WorkflowItem from '@/components/shadcn-studio/blocks/hero-section-40/workflow-item'

const FollowUps = () => {
  return (
    <div className='flex max-md:flex-col max-md:space-y-8 md:items-center md:space-x-16'>
      <WorkflowItem
        type='input'
        icon={<PaletteIcon />}
        title='Style Quiz Started'
        description='Answer quick prompts about your venue, vibe, and must-have details.'
        time='0.4 sec'
        hasMenu={false}
        className='relative'
      >
        {/* Arrow for large screens */}
        <ArrowRight delay={0.1} />

        {/* Arrow for small screens */}
        <ArrowBottom delay={0.1} />
      </WorkflowItem>

      <WorkflowItem
        type='action'
        icon={<SparklesIcon />}
        title='Style Signal Analysis'
        time='1.6 sec'
        delay={1.2}
        hasMenu={false}
        className='relative'
      >
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <ImageIcon className='text-muted-foreground size-4.5' />
            <span className='text-muted-foreground text-sm'>Moodboard inspirations</span>
          </div>
          <div className='flex items-center gap-2'>
            <BookmarkIcon className='text-muted-foreground size-4.5' />
            <span className='text-muted-foreground text-sm'>Saved outfits and decor pins</span>
          </div>
        </div>
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='text-muted-foreground flex items-center justify-between gap-2'>
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground rounded-full border-0 px-2.5 py-0.5 text-xs font-medium'
            >
              Generating style profile...
            </Badge>
            <LoaderIcon className='size-4' />
          </div>
          <p className='text-muted-foreground text-sm'>
            Converts your answers into a clear palette, mood direction, and vendor-fit guidance.
          </p>
        </div>

        {/* Arrow for large screens */}
        <ArrowRight delay={1.3} />

        {/* Arrow for small screens */}
        <ArrowBottom delay={1.3} />
      </WorkflowItem>

      <WorkflowItem
        type='output'
        icon={<PaletteIcon />}
        title='Style Direction Ready'
        description='Your personalized aesthetic brief is ready to share and apply.'
        time='0.3 sec'
        delay={2.4}
        hasMenu={false}
      >
        <div className='bg-muted rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <PaletteIcon className='text-muted-foreground size-4.5' />
            <span className='text-muted-foreground text-sm'>Mood direction saved</span>
          </div>
        </div>
      </WorkflowItem>
    </div>
  )
}

export default FollowUps
