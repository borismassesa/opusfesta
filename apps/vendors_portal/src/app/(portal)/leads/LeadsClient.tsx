'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Filter, MapPin, Phone, Mail, Search, Wallet } from 'lucide-react'
import type { InquiryRow } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const TABS = ['Prospects', 'Inquiries', 'Conversations'] as const

export type LeadsSource =
  | { kind: 'live' }
  | { kind: 'no-application' }
  | { kind: 'pending-approval' }
  | { kind: 'suspended' }
  | { kind: 'no-env' }

type LeadsClientProps = {
  inquiries: InquiryRow[]
  source: LeadsSource
}

const BANNER_BY_SOURCE: Record<LeadsSource['kind'], string | null> = {
  live: null,
  'no-application':
    "You haven't started a vendor application yet. Apply to do business on OpusFesta to receive leads.",
  'pending-approval':
    'Your vendor application is awaiting OpusFesta verification. Leads unlock once your account is approved.',
  suspended:
    'Your vendor account is suspended. Contact OpusFesta support if you believe this is a mistake.',
  'no-env':
    'DEV: Vendor backend not connected — showing seed data. Check Supabase env vars and that migrations are applied to your Supabase project.',
}

export default function LeadsClient({ inquiries, source }: LeadsClientProps) {
  const [active, setActive] = useState<(typeof TABS)[number]>('Inquiries')
  const [selected, setSelected] = useState(inquiries[0]?.id ?? null)

  const selectedRow = inquiries.find((r) => r.id === selected) ?? null
  const banner = BANNER_BY_SOURCE[source.kind]
  const isSampleData = source.kind === 'no-env'

  return (
    <div className="p-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        {banner && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {banner}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_320px] min-h-[70vh]">
            <aside className="border-r border-gray-100 flex flex-col">
              <div className="p-5 border-b border-gray-100">
                <div className="flex gap-1 border-b border-gray-100 -mx-5 px-5">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActive(t)}
                      className={cn(
                        'pb-3 px-3 text-sm font-semibold transition-colors border-b-2 -mb-[1px]',
                        active === t
                          ? 'border-[#C9A0DC] text-[#7E5896]'
                          : 'border-transparent text-gray-400 hover:text-gray-700',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search couples…"
                      className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Filter"
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <ul className="flex-1 overflow-y-auto">
                {inquiries.length === 0 ? (
                  <li className="px-5 py-10 text-center text-sm text-gray-400">
                    {source.kind === 'no-application'
                      ? 'No vendor application yet.'
                      : source.kind === 'pending-approval'
                        ? 'Awaiting verification.'
                        : source.kind === 'suspended'
                          ? 'Account suspended.'
                          : 'No inquiries yet.'}
                  </li>
                ) : (
                  inquiries.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(row.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-5 py-4 border-b border-gray-50 transition-colors text-left',
                          selected === row.id
                            ? 'bg-[#FCF7FF]'
                            : 'hover:bg-gray-50',
                        )}
                      >
                        <Image
                          src={row.avatarUrl}
                          alt={row.couple}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {isSampleData ? `[SAMPLE] ${row.couple}` : row.couple}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{row.date}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{row.location}</p>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </aside>

            <section className="border-r border-gray-100 p-8 flex flex-col">
              {selectedRow ? (
                <>
                  <div className="flex items-start gap-4">
                    <Image
                      src={selectedRow.avatarUrl}
                      alt={selectedRow.couple}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {isSampleData ? `[SAMPLE] ${selectedRow.couple}` : selectedRow.couple}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Wedding date · {selectedRow.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSampleData}
                      className={cn(
                        'text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors',
                        isSampleData
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-gray-800',
                      )}
                    >
                      Reply
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" />
                        Budget
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1.5">
                        {selectedRow.budget}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Location
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1.5">
                        {selectedRow.location}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-gray-100 p-5 bg-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Message
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Hi! We&apos;re planning a weekend wedding and love your portfolio.
                      We&apos;d love to hear about your packages and availability on our date.
                      Looking forward to your reply!
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  Select an inquiry to view details.
                </div>
              )}
            </section>

            <aside className="p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Contact information
              </h3>
              {selectedRow ? (
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-center gap-2.5 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    +255 712 000 000
                  </li>
                  <li className="flex items-center gap-2.5 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    couple@example.com
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-gray-400 mt-4">No contact selected.</p>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Lead source
                </h4>
                <div className="flex items-center gap-2">
                  <span className="bg-[#F0DFF6] text-[#7E5896] text-[11px] font-bold px-2.5 py-1 rounded-md">
                    OpusFesta search
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
