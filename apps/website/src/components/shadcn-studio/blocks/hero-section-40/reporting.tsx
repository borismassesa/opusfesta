'use client'

import { BellRingIcon, CalculatorIcon, CreditCardIcon, FileChartPieIcon, LoaderIcon, WalletIcon } from 'lucide-react'

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
        title='New Expense Logged'
        description='A vendor quote was added to your live wedding budget.'
        time='0.5 sec'
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
        icon={<FileChartPieIcon />}
        title='Budget Intelligence'
        time='18 sec'
        delay={1.2}
        hasMenu={false}
        className='relative'
      >
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <CalculatorIcon className='text-muted-foreground size-4.5' />
            <span className='text-muted-foreground text-sm'>Vendor quotes synced</span>
          </div>
          <div className='flex items-center gap-2'>
            <CreditCardIcon className='text-muted-foreground size-4.5' />
            <span className='text-muted-foreground text-sm'>Payment timeline updated</span>
          </div>
        </div>
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='text-muted-foreground flex items-center justify-between gap-2'>
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground rounded-full border-0 px-2.5 py-0.5 text-xs font-medium'
            >
              Reforecasting budget...
            </Badge>
            <LoaderIcon className='size-4' />
          </div>
          <p className='text-muted-foreground text-sm'>
            Recalculates category totals, deposits, and remaining balance in real time.
          </p>
        </div>

        {/* Arrow for large screens */}
        <ArrowRight delay={1.3} />

        {/* Arrow for small screens */}
        <ArrowBottom delay={1.3} />
      </WorkflowItem>

      <WorkflowItem
        type='output'
        icon={<WalletIcon />}
        title='Budget Health Summary'
        description='Live totals, runway, and what you still need to allocate.'
        time='1.1 sec'
        delay={2.4}
        hasMenu={false}
        className='md:w-72.5'
      >
        <div className='bg-muted space-y-2.5 rounded-lg px-2.5 py-3'>
          <div className='flex items-center gap-2'>
            <WalletIcon className='text-muted-foreground size-4.5' />
            <span className='text-muted-foreground text-sm'>Summary shared with partner</span>
          </div>
          <div className='flex items-center gap-2'>
            <BellRingIcon className='text-muted-foreground size-4.5' />
            <span className='text-muted-foreground text-sm'>WhatsApp budget alert sent</span>
          </div>
        </div>
      </WorkflowItem>
    </div>
  )
}

export default Reporting
