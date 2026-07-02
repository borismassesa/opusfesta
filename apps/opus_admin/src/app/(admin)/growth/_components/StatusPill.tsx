import { cn } from '@/lib/utils'
import { STATUS_LABEL, type GrowthStatus } from '../_lib/status'

const TONE: Record<Exclude<GrowthStatus, null>, string> = {
  met: 'bg-[#E8FBDB] text-[#3F8B5C]',
  on_track: 'bg-[#FCE9C2] text-[#B07F2C]',
  behind: 'bg-red-100 text-red-700',
}

export default function StatusPill({ status }: { status: GrowthStatus }) {
  if (!status) {
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-400">—</span>
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', TONE[status])}>
      {STATUS_LABEL[status]}
    </span>
  )
}
