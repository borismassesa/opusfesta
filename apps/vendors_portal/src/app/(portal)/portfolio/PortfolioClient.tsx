'use client'

import Image from 'next/image'
import { Star, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PortfolioItem = {
  id: string
  title: string
  description: string | null
  eventType: string | null
  eventDate: string | null
  coverImage: string | null
  imageCount: number
  featured: boolean
}

export type PortfolioSource =
  | { kind: 'live' }
  | { kind: 'no-application' }
  | { kind: 'pending-approval' }
  | { kind: 'suspended' }
  | { kind: 'no-env' }

const BANNER_BY_SOURCE: Record<PortfolioSource['kind'], string | null> = {
  live: null,
  'no-application':
    "You haven't started a vendor application yet. Apply to do business on OpusFesta to manage a portfolio.",
  'pending-approval':
    'Your vendor application is awaiting OpusFesta verification. Your portfolio unlocks once your account is approved.',
  suspended:
    'Your vendor account is suspended. Contact OpusFesta support if you believe this is a mistake.',
  'no-env':
    'DEV: Vendor backend not connected — showing seed data. Check Supabase env vars and that migrations are applied to your Supabase project.',
}

type PortfolioClientProps = {
  items: PortfolioItem[]
  source: PortfolioSource
}

export default function PortfolioClient({ items, source }: PortfolioClientProps) {
  const banner = BANNER_BY_SOURCE[source.kind]

  return (
    <div className="p-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        {banner && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {banner}
          </div>
        )}

        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Portfolio</h1>
            <p className="text-sm text-gray-500 mt-1">
              {items.length} {items.length === 1 ? 'gallery' : 'galleries'}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mt-4">
              No portfolio galleries yet
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Upload your best work so couples can see what you do. Galleries
              show on your storefront.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <article
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  {item.featured && (
                    <span
                      className={cn(
                        'absolute top-3 left-3 inline-flex items-center gap-1',
                        'bg-[#9FE870] text-gray-900 text-[11px] font-bold',
                        'px-2 py-1 rounded-md',
                      )}
                    >
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-semibold px-2 py-1 rounded-md">
                    {item.imageCount} {item.imageCount === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.eventType ?? 'Untagged'}
                    {item.eventDate ? ` · ${item.eventDate}` : ''}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
