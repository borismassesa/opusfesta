import Link from 'next/link'
import { ExternalLink, MapPin } from 'lucide-react'
import type { Vendor } from '@/lib/mock-data'

export function VendorHero({ vendor }: { vendor: Vendor }) {
  const initials = vendor.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F0DFF6] text-[#7E5896] font-bold text-xl flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{vendor.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{vendor.category}</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {vendor.location}
          </p>
        </div>
      </div>

      <Link
        href="/storefront"
        className="mt-5 inline-flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        View public storefront
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  )
}
