'use client'

import { BellRingIcon, FileChartPieIcon, LoaderIcon, MessageSquareTextIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import ArrowBottom from '@/components/shadcn-studio/blocks/hero-section-40/arrow-bottom'
import ArrowRight from '@/components/shadcn-studio/blocks/hero-section-40/arrow-right'
import WorkflowItem from '@/components/shadcn-studio/blocks/hero-section-40/workflow-item'

const Reporting = () => {
  return (
    <div className='flex max-md:flex-col max-md:space-y-8 md:items-center md:space-x-16'>
      <WorkflowItem
        type='input'
        icon={<BellRingIcon />}
        title='New Quote Added'
        description='Vendor pricing is added to your budget.'
        time='0.5 sec'
        className='relative'
      >
        {/* Arrow for large screens */}
        <ArrowRight delay={0.1} />

        {/* Arrow for small screens */}
        <ArrowBottom delay={0.1} />
      </WorkflowItem>

      <WorkflowItem
        type='action'
        icon={<FileChartPieIcon />}
        title='Budget Breakdown'
        time='18 sec'
        delay={1.2}
        className='relative'
      >
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-44.png'
              alt='Budget sheet'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>Vendor quotes</span>
          </div>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-40.png'
              alt='Payment schedule'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>Payment schedule</span>
          </div>
        </div>
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='text-muted-foreground flex items-center justify-between gap-2'>
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground rounded-full border-0 px-2.5 py-0.5 text-xs font-medium'
            >
              Updating totals...
            </Badge>
            <LoaderIcon className='size-4' />
          </div>
          <p className='text-muted-foreground text-sm'>
            Recalculates totals, deposits, and remaining balance in real time.
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
        title='Budget Summary'
        description="Updated totals with what’s left to allocate."
        time='1.1 sec'
        delay={2.4}
        className='md:w-72.5'
      >
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.shadcnstudio.com/ss-assets/template/landing-page/orion/image-48.png'
              alt='Budget summary'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>Summary shared</span>
          </div>
          <div className='flex items-center gap-2'>
            <img
              src='https://cdn.simpleicons.org/whatsapp/25D366'
              alt='WhatsApp logo'
              className='size-4.5'
            />
            <span className='text-muted-foreground text-sm'>WhatsApp alerts queued</span>
          </div>
        </div>
      </WorkflowItem>
    </div>
  )
}

export default Reporting
