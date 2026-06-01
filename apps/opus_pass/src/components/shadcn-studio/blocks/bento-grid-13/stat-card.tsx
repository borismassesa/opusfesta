import type { ReactNode } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  avatarIcon: ReactNode
  title: string
  statNumber: string
  percentage: number
}

const StatCard = ({ className, avatarIcon, title, statNumber, percentage }: Props) => {
  return (
    <div className={cn('flex w-71.5 flex-col gap-4 rounded-xl border p-4 shadow-sm', className)}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar className='rounded-sm after:border-0'>
            <AvatarFallback className='bg-[#C9A0DC]/25 text-[#7c3f9c] shrink-0 rounded-sm'>{avatarIcon}</AvatarFallback>
          </Avatar>
          <span className='text-base'>{title}</span>
        </div>
        <Button variant='outline' size='xs'>
          Details
        </Button>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-2xl font-semibold'>{statNumber}</span>
        <Badge className='bg-[#9FE870] text-[#1A1A1A] rounded-sm border-transparent font-semibold focus-visible:outline-none'>
          {percentage > 0 && '+'}
          {percentage}%
        </Badge>
      </div>
    </div>
  )
}

export default StatCard
