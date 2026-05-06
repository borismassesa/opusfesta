'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Filter, MapPin, Mail, Search, Wallet, Users, MessageSquare, Check, X, Send } from 'lucide-react'
import type { InquiryRow } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const TABS = ['Prospects', 'Inquiries', 'Conversations'] as const

export type LeadsSource =
  | { kind: 'live' }
  | { kind: 'no-application' }
  | { kind: 'pending-approval' }
  | { kind: 'suspended' }
  | { kind: 'no-env' }

type ThreadMessage = {
  id: string
  sender_type: 'client' | 'vendor'
  sender_name: string
  content: string
  created_at: string
  read_at: string | null
}

type LeadsClientProps = {
  inquiries: InquiryRow[]
  source: LeadsSource
  vendorName: string
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

const STATUS_LABEL: Record<InquiryRow['status'], string> = {
  new: 'New',
  replied: 'Replied',
  booked: 'Booked',
  declined: 'Declined',
  closed: 'Closed',
}

const STATUS_STYLE: Record<InquiryRow['status'], string> = {
  new: 'bg-[#F0DFF6] text-[#7E5896]',
  replied: 'bg-blue-50 text-blue-700',
  booked: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-600',
  closed: 'bg-gray-100 text-gray-500',
}

export default function LeadsClient({ inquiries: initialInquiries, source, vendorName }: LeadsClientProps) {
  const [active, setActive] = useState<(typeof TABS)[number]>('Inquiries')
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selected, setSelected] = useState(initialInquiries[0]?.id ?? null)
  const [replyText, setReplyText] = useState('')
  const [replyOpen, setReplyOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [thread, setThread] = useState<ThreadMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)

  const selectedRow = inquiries.find((r) => r.id === selected) ?? null
  const banner = BANNER_BY_SOURCE[source.kind]
  const isSampleData = source.kind === 'no-env'

  // Load message thread whenever the selected inquiry changes
  useEffect(() => {
    if (!selected || isSampleData) { setThread([]); return }
    setThreadLoading(true)
    fetch(`/api/inquiries/${selected}/messages`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((json) => setThread(json.messages ?? []))
      .catch(() => setThread([]))
      .finally(() => setThreadLoading(false))
  }, [selected, isSampleData])

  function updateLocalStatus(id: string, status: InquiryRow['status']) {
    setInquiries((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  async function patchInquiry(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Request failed')
  }

  async function handleReply() {
    if (!selectedRow || !replyText.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/inquiries/${selectedRow.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim() }),
      })
      if (!res.ok) throw new Error('Failed to send')
      const json = await res.json()
      setThread((prev) => [...prev, json.message])
      updateLocalStatus(selectedRow.id, 'replied')
      setReplyText('')
      setReplyOpen(false)
    } catch {
      // keep reply open so vendor can retry
    } finally {
      setSending(false)
    }
  }

  async function handleStatusChange(status: InquiryRow['status']) {
    if (!selectedRow || isSampleData) return
    const dbStatus = status === 'booked' ? 'accepted' : status === 'replied' ? 'responded' : status
    setActionLoading(true)
    try {
      await patchInquiry(selectedRow.id, { status: dbStatus })
      updateLocalStatus(selectedRow.id, status)
    } catch {
      // silent — row stays unchanged
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        {banner && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {banner}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_300px] min-h-[70vh]">

            {/* ── List sidebar ── */}
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
                        onClick={() => { setSelected(row.id); setReplyOpen(false) }}
                        className={cn(
                          'w-full flex items-start gap-3 px-5 py-4 border-b border-gray-50 transition-colors text-left',
                          selected === row.id ? 'bg-[#FCF7FF]' : 'hover:bg-gray-50',
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
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {isSampleData ? `[SAMPLE] ${row.couple}` : row.couple}
                            </p>
                            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', STATUS_STYLE[row.status])}>
                              {STATUS_LABEL[row.status]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{row.date}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{row.location}</p>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </aside>

            {/* ── Detail panel ── */}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {isSampleData ? `[SAMPLE] ${selectedRow.couple}` : selectedRow.couple}
                        </h2>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', STATUS_STYLE[selectedRow.status])}>
                          {STATUS_LABEL[selectedRow.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Wedding date · {selectedRow.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSampleData}
                      onClick={() => setReplyOpen((o) => !o)}
                      className={cn(
                        'flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors',
                        isSampleData
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : replyOpen
                            ? 'bg-[#C9A0DC] text-black hover:bg-[#b98dcc]'
                            : 'bg-gray-900 text-white hover:bg-gray-800',
                      )}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Reply
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" />
                        Budget
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1.5">{selectedRow.budget}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Location
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1.5">{selectedRow.location}</p>
                    </div>
                    {selectedRow.guestCount !== undefined && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Guests
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1.5">{selectedRow.guestCount}+</p>
                      </div>
                    )}
                  </div>

                  {/* Message thread */}
                  <div className="mt-6 rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Conversation</p>
                      {threadLoading && (
                        <span className="text-[10px] text-gray-400 animate-pulse">Loading…</span>
                      )}
                    </div>
                    <div className="p-4 space-y-4 max-h-64 overflow-y-auto bg-white">
                      {thread.length === 0 && !threadLoading ? (
                        <p className="text-xs text-gray-400 text-center py-4">
                          No messages yet. Use &ldquo;Reply&rdquo; to start the conversation.
                        </p>
                      ) : (
                        thread.map((msg) => {
                          const isVendor = msg.sender_type === 'vendor'
                          return (
                            <div key={msg.id} className={`flex gap-2.5 ${isVendor ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${isVendor ? 'bg-[#C9A0DC] text-[#1A1A1A]' : 'bg-gray-200 text-gray-600'}`}>
                                {msg.sender_name.charAt(0).toUpperCase()}
                              </div>
                              <div className={`flex flex-col gap-1 max-w-[80%] ${isVendor ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] text-gray-400 font-semibold">{msg.sender_name}</span>
                                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isVendor ? 'bg-[#F0DFF6] text-[#1A1A1A] rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Reply composer */}
                    {replyOpen && !isSampleData ? (
                      <div className="border-t border-gray-100 p-4 bg-[#FCF7FF]">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a personalised reply…"
                          rows={4}
                          className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 focus:outline-none focus:border-[#C9A0DC] transition-colors"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { setReplyOpen(false); setReplyText('') }}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={sending || !replyText.trim()}
                            onClick={handleReply}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {sending ? 'Sending…' : 'Send reply'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Status actions */}
                  {!isSampleData && selectedRow.status !== 'booked' && selectedRow.status !== 'closed' && (
                    <div className="mt-auto pt-6 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleStatusChange('booked')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark as booked
                      </button>
                      {selectedRow.status !== 'declined' && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleStatusChange('declined')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  Select an inquiry to view details.
                </div>
              )}
            </section>

            {/* ── Contact sidebar ── */}
            <aside className="p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Contact information
              </h3>
              {selectedRow ? (
                <ul className="mt-4 space-y-3 text-sm">
                  {selectedRow.email && (
                    <li className="flex items-center gap-2.5 text-gray-700 break-all">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <a href={`mailto:${selectedRow.email}`} className="hover:underline">
                        {selectedRow.email}
                      </a>
                    </li>
                  )}
                  {selectedRow.phone && (
                    <li className="flex items-center gap-2.5 text-gray-700">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"/></svg>
                      <a href={`tel:${selectedRow.phone}`} className="hover:underline">
                        {selectedRow.phone}
                      </a>
                    </li>
                  )}
                  {!selectedRow.email && !selectedRow.phone && (
                    <li className="text-gray-400 text-sm">No contact info provided.</li>
                  )}
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
