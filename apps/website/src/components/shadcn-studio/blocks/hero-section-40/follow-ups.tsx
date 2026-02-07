'use client'

import { BellRingIcon, LoaderIcon, MessageSquareTextIcon, ScanEyeIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import ArrowBottom from '@/components/shadcn-studio/blocks/hero-section-40/arrow-bottom'
import ArrowRight from '@/components/shadcn-studio/blocks/hero-section-40/arrow-right'
import WorkflowItem from '@/components/shadcn-studio/blocks/hero-section-40/workflow-item'

const FollowUps = () => {
  return (
    <div className='flex max-md:flex-col max-md:space-y-8 md:items-center md:space-x-16'>
      <WorkflowItem
        type='input'
        icon={<BellRingIcon />}
        title='Style Quiz Started'
        description='Answer a few quick questions about your vibe and venue.'
        time='0.4 sec'
        className='relative'
      >
        {/* Arrow for large screens */}
        <ArrowRight delay={0.1} />

        {/* Arrow for small screens */}
        <ArrowBottom delay={0.1} />
      </WorkflowItem>

      <WorkflowItem
        type='action'
        icon={<ScanEyeIcon />}
        title='Preference Analysis'
        time='1.6 sec'
        delay={1.2}
        className='relative'
      >
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-45.png'
              alt='Moodboard'
              className='size-4.5 dark:invert'
            />
            <span className='text-muted-foreground text-sm'>Moodboard cues</span>
          </div>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-48.png'
              alt='Saved looks'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>Saved looks and pins</span>
          </div>
        </div>
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='text-muted-foreground flex items-center justify-between gap-2'>
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground rounded-full border-0 px-2.5 py-0.5 text-xs font-medium'
            >
              Generating profile...
            </Badge>
            <LoaderIcon className='size-4' />
          </div>
          <p className='text-muted-foreground text-sm'>
            We translate your answers into a clear style direction and palette.
          </p>
        </div>

        {/* Arrow for large screens */}
        <ArrowRight delay={1.3} />

        {/* Arrow for small screens */}
        <ArrowBottom delay={1.3} />
      </WorkflowItem>

      <WorkflowItem
        type='output'
        icon={<MessageSquareTextIcon />}
        title='Style Profile Ready'
        description='Your personalized style summary is ready to use.'
        time='0.3 sec'
        delay={2.4}
      >
        <div className='bg-muted rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-48.png'
              alt='Style profile'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>Profile saved</span>
          </div>
        </div>
      </WorkflowItem>
    </div>
  )
}

export default FollowUps
