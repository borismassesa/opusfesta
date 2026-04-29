import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MapPin, Wallet } from 'lucide-react'
import type { InquiryRow } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<InquiryRow['status'], string> = {
  new: 'bg-[#F0DFF6] text-[#7E5896]',
  replied: 'bg-amber-50 text-amber-700',
  booked: 'bg-emerald-50 text-emerald-600',
  declined: 'bg-gray-100 text-gray-500',
  closed: 'bg-gray-100 text-gray-500',
}

const STATUS_LABEL: Record<InquiryRow['status'], string> = {
  new: 'New',
  replied: 'Replied',
  booked: 'Booked',
  declined: 'Declined',
  closed: 'Closed',
}

export function RecentInquiries({ rows }: { rows: InquiryRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div>
          <h3 className="text-[15px] font-medium text-gray-900">Recent inquiries</h3>
          <p className="text-sm text-gray-500 mt-0.5">Couples who reached out recently.</p>
        </div>
        <Link
          href="/leads"
          className="flex items-center gap-1 text-sm font-semibold text-[#7E5896] hover:text-[#5d3f77] transition-colors"
        >
          View all
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <ul className="divide-y divide-gray-100">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              href={`/leads/${row.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <Image
                src={row.avatarUrl}
                alt={row.couple}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {row.couple}
                  </p>
                  <span
                    className={cn(
                      'text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0',
                      STATUS_STYLES[row.status],
                    )}
                  >
                    {STATUS_LABEL[row.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{row.date}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 shrink-0">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-gray-400" />
                  {row.budget}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {row.location}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
