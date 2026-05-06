'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Filter, MapPin, Mail, Search, Wallet, Users, MessageSquare, Check, X, Send, Archive, Receipt, ChevronDown, ChevronUp } from 'lucide-react'
import type { InquiryRow } from '@/lib/mock-data'
import { TZ_REGIONS } from '@/lib/onboarding/regions'
import { cn } from '@/lib/utils'
import type { VendorPricingPackage } from '@/lib/vendors'

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

type PersistedProposalStatus = 'sent' | 'countered' | 'accepted'

type InquiryDetail = {
  id: string
  status: 'pending' | 'responded' | 'accepted' | 'declined' | 'closed' | null
  proposal_status: PersistedProposalStatus | null
  proposal_event_date: string | null
  proposal_venue: string | null
  proposal_guest_count: number | null
  proposal_package: string | null
  proposal_invoice_amount: number | null
  proposal_invoice_details: string | null
  proposal_sent_at: string | null
  proposal_counter_amount: number | null
  proposal_counter_message: string | null
  proposal_countered_at: string | null
  proposal_accepted_at: string | null
}

function sameThread(a: ThreadMessage[], b: ThreadMessage[]): boolean {
  if (a.length !== b.length) return false
  return a.every((message, index) => {
    const other = b[index]
    return Boolean(
      other?.id === message.id
      && other.content === message.content
      && other.created_at === message.created_at
      && other.read_at === message.read_at,
    )
  })
}

type LeadsClientProps = {
  inquiries: InquiryRow[]
  source: LeadsSource
  vendorName: string
  packages: VendorPricingPackage[]
}

const VENUE_SUGGESTIONS = [
  'Mlimani City Hall, Dar es Salaam',
  'Johari Rotana, Dar es Salaam',
  'Hyatt Regency, Dar es Salaam',
  'Sea Cliff Hotel, Dar es Salaam',
  'White Sands Resort, Dar es Salaam',
  'Gran Meliá, Arusha',
  'Mount Meru Hotel, Arusha',
  'Malaika Beach Resort, Mwanza',
  'Best Western Dodoma City Hotel, Dodoma',
]

function matchesTab(active: (typeof TABS)[number], status: InquiryRow['status']) {
  if (active === 'Prospects') return status === 'new'
  if (active === 'Conversations') return status !== 'new'
  return status === 'new' || status === 'replied'
}

function getEmptyListMessage(source: LeadsSource['kind'], active: (typeof TABS)[number], searchQuery: string) {
  if (source === 'no-application') return 'No vendor application yet.'
  if (source === 'pending-approval') return 'Awaiting verification.'
  if (source === 'suspended') return 'Account suspended.'

  const q = searchQuery.trim()
  if (q) return `No ${active.toLowerCase()} found for "${q}".`
  if (active === 'Prospects') return 'No new prospects right now.'
  if (active === 'Conversations') return 'No conversations yet.'
  return 'No active inquiries yet.'
}

function getReplyButtonClass(isSampleData: boolean, replyOpen: boolean) {
  if (isSampleData) return 'bg-gray-200 text-gray-400 cursor-not-allowed'
  if (replyOpen) return 'bg-[#C9A0DC] text-black hover:bg-[#b98dcc]'
  return 'bg-gray-900 text-white hover:bg-gray-800'
}

async function patchInquiryRequest(id: string, payload: Record<string, unknown>) {
  const res = await fetch(`/api/inquiries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Request failed')
}

/* ── Sub-components for action panels ── */

type ProposalDraft = {
  eventDate: string
  venue: string
  guestCount: string
  packageName: string
  invoiceAmount: string
  invoiceDetails: string
}

type ProposalPanelProps = {
  open: boolean
  sending: boolean
  draft: ProposalDraft
  preview: string
  packages: VendorPricingPackage[]
  venueSuggestions: string[]
  onToggle: () => void
  onDraftChange: (next: ProposalDraft) => void
  onCancel: () => void
  onSend: () => void
}

function ProposalPanel({ open, sending, draft, preview, packages, venueSuggestions, onToggle, onDraftChange, onCancel, onSend }: Readonly<ProposalPanelProps>) {
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-gray-500" />
          Send proposal (recap + quote)
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-3 bg-white border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="proposal-event-date" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Event date</label>
              <input
                id="proposal-event-date"
                type="date"
                value={draft.eventDate}
                onChange={(e) => onDraftChange({ ...draft, eventDate: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A0DC] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="proposal-venue" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Venue</label>
              <input
                id="proposal-venue"
                type="text"
                list="proposal-venue-suggestions"
                value={draft.venue}
                onChange={(e) => onDraftChange({ ...draft, venue: e.target.value })}
                placeholder="e.g. Mlimani City Hall"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A0DC] transition-colors"
              />
              <datalist id="proposal-venue-suggestions">
                {venueSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="proposal-guests" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Guests</label>
              <input
                id="proposal-guests"
                type="text"
                inputMode="numeric"
                value={draft.guestCount}
                onChange={(e) => onDraftChange({ ...draft, guestCount: e.target.value.replaceAll(/\D/g, '') })}
                placeholder="e.g. 150"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A0DC] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="proposal-package" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Package</label>
              <select
                id="proposal-package"
                value={draft.packageName}
                onChange={(e) => {
                  const nextPackage = e.target.value
                  const matched = packages.find((pkg) => pkg.label === nextPackage)
                  onDraftChange({
                    ...draft,
                    packageName: nextPackage,
                    invoiceAmount: matched ? extractDigitsFromPrice(matched.value) : draft.invoiceAmount,
                  })
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A0DC] transition-colors"
              >
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg.label} value={pkg.label}>
                    {pkg.label}{pkg.value ? ` · ${pkg.value}` : ''}
                  </option>
                ))}
                {draft.packageName && !packages.some((pkg) => pkg.label === draft.packageName) ? (
                  <option value={draft.packageName}>{draft.packageName}</option>
                ) : null}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="proposal-amount" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Invoice amount (TZS)</label>
            <input
              id="proposal-amount"
              type="text"
              inputMode="numeric"
              value={draft.invoiceAmount}
              onChange={(e) => onDraftChange({ ...draft, invoiceAmount: e.target.value.replaceAll(/\D/g, '') })}
              placeholder="e.g. 2500000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A0DC] transition-colors"
            />
            {draft.invoiceAmount && Number(draft.invoiceAmount) > 0 && (
              <p className="text-xs text-gray-400 mt-1">TZS {Number(draft.invoiceAmount).toLocaleString('en-GB')}</p>
            )}
          </div>
          <div>
            <label htmlFor="proposal-details" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Invoice details <span className="font-normal text-gray-400">(optional)</span></label>
            <textarea
              id="proposal-details"
              value={draft.invoiceDetails}
              onChange={(e) => onDraftChange({ ...draft, invoiceDetails: e.target.value })}
              placeholder="What's included, timeline, any conditions…"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A0DC] transition-colors"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Preview</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {preview}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              disabled={sending || !draft.invoiceAmount || Number(draft.invoiceAmount) <= 0}
              onClick={onSend}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Sending…' : 'Send proposal'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type DeclinePanelProps = {
  reason: string
  loading: boolean
  onReasonChange: (v: string) => void
  onCancel: () => void
  onConfirm: () => void
}

function DeclinePanel({ reason, loading, onReasonChange, onCancel, onConfirm }: Readonly<DeclinePanelProps>) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 space-y-3">
      <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
        Decline — add a reason <span className="font-normal text-red-500">(optional)</span>
      </p>
      <textarea
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="e.g. Date not available, outside service area…"
        rows={2}
        className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-red-400 transition-colors"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {loading ? 'Declining…' : 'Confirm decline'}
        </button>
      </div>
    </div>
  )
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

function mapUiStatusToDbStatus(status: InquiryRow['status']) {
  if (status === 'booked') return 'accepted'
  if (status === 'replied') return 'responded'
  return status
}

function extractDigitsFromPrice(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const millionMatch = /([\d.]+)\s*M/i.exec(trimmed)
  if (millionMatch?.[1]) {
    return String(Math.round(Number.parseFloat(millionMatch[1]) * 1_000_000))
  }
  const numeric = trimmed.replaceAll(/[^\d]/g, '')
  return numeric
}

function formatProposalDate(value: string): string {
  if (!value) return 'Date TBC'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatProposalMoney(value: number | null): string {
  if (!value || value <= 0) return 'TBC'
  return `TZS ${value.toLocaleString('en-GB')}`
}

function mapDbStatusToUiStatus(status: InquiryDetail['status']): InquiryRow['status'] {
  if (status === 'accepted') return 'booked'
  if (status === 'responded') return 'replied'
  if (status === 'declined') return 'declined'
  if (status === 'closed') return 'closed'
  return 'new'
}

function extractInterestedPackage(message: string | undefined): string {
  if (!message) return ''
  const match = /Interested package:\s*(.+)/i.exec(message)
  return match?.[1]?.trim() ?? ''
}

function buildDefaultProposalDraft(row: InquiryRow, inquiryDetail?: InquiryDetail | null): ProposalDraft {
  const invoiceAmount = inquiryDetail?.proposal_status && inquiryDetail.proposal_invoice_amount
    ? String(inquiryDetail.proposal_invoice_amount)
    : ''
  let guestCount = ''
  if (typeof inquiryDetail?.proposal_guest_count === 'number') {
    guestCount = String(inquiryDetail.proposal_guest_count)
  } else if (typeof row.guestCount === 'number') {
    guestCount = String(row.guestCount)
  }
  return {
    eventDate: inquiryDetail?.proposal_event_date ?? row.eventDateIso ?? '',
    venue: inquiryDetail?.proposal_venue ?? (row.location && row.location !== '—' ? row.location : ''),
    guestCount,
    packageName: inquiryDetail?.proposal_package ?? extractInterestedPackage(row.message),
    invoiceAmount,
    invoiceDetails: inquiryDetail?.proposal_invoice_details ?? '',
  }
}

function buildProposalMessage(row: InquiryRow, draft: ProposalDraft): string {
  const parsed = Number(draft.invoiceAmount.replaceAll(/\D/g, ''))
  const formattedAmount = parsed > 0 ? `TZS ${parsed.toLocaleString('en-GB')}` : 'TBC'
  const guestText = draft.guestCount.trim() ? `${draft.guestCount.trim()}+` : 'TBC'
  const lines = [
    'Proposal summary',
    `- Client: ${row.couple}`,
    `- Event date: ${draft.eventDate.trim() ? formatProposalDate(draft.eventDate.trim()) : 'Date TBC'}`,
    `- Venue: ${draft.venue.trim() || 'TBC'}`,
    `- Guests: ${guestText}`,
    `- Package: ${draft.packageName.trim() || 'TBC'}`,
    `- Invoice: ${formattedAmount}`,
  ]

  if (row.budget && row.budget !== '—') {
    lines.push(`- Client budget: ${row.budget}`)
  }
  if (row.email) {
    lines.push(`- Email: ${row.email}`)
  }
  if (row.phone) {
    lines.push(`- Phone: ${row.phone}`)
  }
  if (draft.invoiceDetails.trim()) {
    lines.push('', 'Invoice details:', draft.invoiceDetails.trim())
  }
  if (row.message?.trim()) {
    lines.push('', 'Original client note:', row.message.trim())
  }

  return lines.join('\n')
}

function ProposalStateCard({
  inquiryDetail,
  onAcceptCounter,
  acceptingCounter,
}: Readonly<{
  inquiryDetail: InquiryDetail
  onAcceptCounter: () => void
  acceptingCounter: boolean
}>) {
  if (!inquiryDetail.proposal_status) return null
  let statusClass = 'bg-blue-100 text-blue-700'
  if (inquiryDetail.proposal_status === 'accepted') {
    statusClass = 'bg-green-100 text-green-700'
  } else if (inquiryDetail.proposal_status === 'countered') {
    statusClass = 'bg-amber-100 text-amber-700'
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Proposal</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {inquiryDetail.proposal_status === 'sent' && 'Waiting for client response'}
            {inquiryDetail.proposal_status === 'countered' && 'Client sent a counter'}
            {inquiryDetail.proposal_status === 'accepted' && 'Proposal accepted'}
          </p>
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', statusClass)}>
          {inquiryDetail.proposal_status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
        <div><strong>Date:</strong> {formatProposalDate(inquiryDetail.proposal_event_date ?? '')}</div>
        <div><strong>Venue:</strong> {inquiryDetail.proposal_venue ?? 'TBC'}</div>
        <div><strong>Guests:</strong> {inquiryDetail.proposal_guest_count ? `${inquiryDetail.proposal_guest_count}+` : 'TBC'}</div>
        <div><strong>Package:</strong> {inquiryDetail.proposal_package ?? 'TBC'}</div>
        <div><strong>Invoice:</strong> {formatProposalMoney(inquiryDetail.proposal_invoice_amount)}</div>
      </div>

      {inquiryDetail.proposal_invoice_details && (
        <div className="rounded-xl bg-white border border-gray-200 p-3 text-sm text-gray-700 whitespace-pre-wrap">
          {inquiryDetail.proposal_invoice_details}
        </div>
      )}

      {inquiryDetail.proposal_status === 'countered' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
          <p className="text-sm font-semibold text-amber-800">Counter from client</p>
          <p className="text-sm text-amber-900">
            <strong>Counter amount:</strong> {formatProposalMoney(inquiryDetail.proposal_counter_amount)}
          </p>
          {inquiryDetail.proposal_counter_message && (
            <p className="text-sm text-amber-900 whitespace-pre-wrap">{inquiryDetail.proposal_counter_message}</p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={acceptingCounter}
              onClick={onAcceptCounter}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {acceptingCounter ? 'Accepting…' : 'Accept counter'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type MessageBubbleProps = {
  msg: ThreadMessage
}

function MessageBubble({ msg }: Readonly<MessageBubbleProps>) {
  const isVendor = msg.sender_type === 'vendor'
  return (
    <div className={`flex gap-2.5 ${isVendor ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${isVendor ? 'bg-[#C9A0DC] text-[#1A1A1A]' : 'bg-gray-200 text-gray-600'}`}>
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
}

function filterInquiry(row: InquiryRow, active: (typeof TABS)[number], q: string): boolean {
  if (!matchesTab(active, row.status)) return false
  if (!q) return true
  const haystack = [row.couple, row.location, row.email ?? '', row.phone ?? ''].join(' ').toLowerCase()
  return haystack.includes(q)
}

function ContactSidebar({ selectedRow }: Readonly<{ selectedRow: InquiryRow | null }>) {
  return (
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
  )
}

function useLeadsState(initialInquiries: InquiryRow[], isSampleData: boolean) {
  const [active, setActive] = useState<(typeof TABS)[number]>('Inquiries')
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selected, setSelected] = useState<string | null>(initialInquiries[0]?.id ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyOpen, setReplyOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [thread, setThread] = useState<ThreadMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [selectedInquiryDetail, setSelectedInquiryDetail] = useState<InquiryDetail | null>(null)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [proposalSending, setProposalSending] = useState(false)
  const [proposalActionLoading, setProposalActionLoading] = useState(false)
  const [proposalDraft, setProposalDraft] = useState<ProposalDraft>({
    eventDate: '',
    venue: '',
    guestCount: '',
    packageName: '',
    invoiceAmount: '',
    invoiceDetails: '',
  })
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const visibleInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return inquiries.filter((row) => filterInquiry(row, active, q))
  }, [inquiries, active, searchQuery])

  useEffect(() => {
    if (visibleInquiries.length === 0) { setSelected(null); return }
    const stillVisible = visibleInquiries.some((r) => r.id === selected)
    if (!stillVisible) setSelected(visibleInquiries[0].id)
  }, [visibleInquiries, selected])

  const selectedRow = visibleInquiries.find((r) => r.id === selected)
    ?? inquiries.find((r) => r.id === selected)
    ?? null

  function syncInquiryDetail(nextInquiry: InquiryDetail) {
    setSelectedInquiryDetail(nextInquiry)
    updateLocalStatus(nextInquiry.id, mapDbStatusToUiStatus(nextInquiry.status))
  }

  useEffect(() => {
    if (!selected || isSampleData) { setThread([]); setSelectedInquiryDetail(null); return }
    setThreadLoading(true)
    setProposalOpen(false)
    setDeclineOpen(false)
    setDeclineReason('')
    Promise.all([
      fetch(`/api/inquiries/${selected}/messages`).then((r) => r.ok ? r.json() : Promise.reject(new Error('messages failed'))),
      fetch(`/api/inquiries/${selected}`).then((r) => r.ok ? r.json() : Promise.reject(new Error('inquiry failed'))),
    ])
      .then(([messagesJson, inquiryJson]) => {
        setThread(messagesJson.messages ?? [])
        if (inquiryJson.inquiry) syncInquiryDetail(inquiryJson.inquiry as InquiryDetail)
      })
      .catch(() => setThread([]))
      .finally(() => setThreadLoading(false))
  }, [selected, isSampleData])

  useEffect(() => {
    if (!selectedRow) return
    setProposalDraft(buildDefaultProposalDraft(selectedRow, selectedInquiryDetail))
  }, [selectedRow?.id, selectedInquiryDetail?.proposal_sent_at])

  useEffect(() => {
    if (!selected || isSampleData) return

    let cancelled = false

    const refreshThread = async () => {
      try {
        const [messagesResponse, inquiryResponse] = await Promise.all([
          fetch(`/api/inquiries/${selected}/messages`, { cache: 'no-store' }),
          fetch(`/api/inquiries/${selected}`, { cache: 'no-store' }),
        ])
        if (!messagesResponse.ok || !inquiryResponse.ok) return
        const [json, inquiryJson] = await Promise.all([messagesResponse.json(), inquiryResponse.json()])
        if (cancelled) return
        const nextThread = (json.messages ?? []) as ThreadMessage[]
        setThread((prev) => (sameThread(prev, nextThread) ? prev : nextThread))
        if (inquiryJson.inquiry) syncInquiryDetail(inquiryJson.inquiry as InquiryDetail)
      } catch {
        // Keep current thread and retry on the next watcher tick.
      }
    }

    const intervalId = globalThis.setInterval(() => {
      void refreshThread()
    }, 1500)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshThread()
      }
    }

    window.addEventListener('focus', handleVisibility)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      globalThis.clearInterval(intervalId)
      window.removeEventListener('focus', handleVisibility)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [selected, isSampleData])

  function updateLocalStatus(id: string, status: InquiryRow['status']) {
    setInquiries((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)))
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
      if (!res.ok) throw new Error('send failed')
      const json = await res.json()
      setThread((prev) => [...prev, json.message])
      updateLocalStatus(selectedRow.id, 'replied')
      setReplyText('')
      setReplyOpen(false)
    } catch { /* keep open */ } finally { setSending(false) }
  }

  async function handleClose() {
    if (!selectedRow || isSampleData) return
    setActionLoading(true)
    try {
      await patchInquiryRequest(selectedRow.id, { status: 'closed' })
      updateLocalStatus(selectedRow.id, 'closed')
    } catch { /* silent */ } finally { setActionLoading(false) }
  }

  async function handleDecline() {
    if (!selectedRow || isSampleData) return
    setActionLoading(true)
    try {
      await patchInquiryRequest(selectedRow.id, {
        status: 'declined',
        vendor_response: declineReason.trim() || undefined,
      })
      updateLocalStatus(selectedRow.id, 'declined')
      setDeclineOpen(false)
      setDeclineReason('')
    } catch { /* keep open */ } finally { setActionLoading(false) }
  }

  async function handleSendProposal() {
    if (!selectedRow || !proposalDraft.invoiceAmount.trim() || isSampleData) return
    const parsed = Number(proposalDraft.invoiceAmount.replaceAll(/\D/g, ''))
    if (!parsed || parsed <= 0) return
    setProposalSending(true)
    try {
      const res = await fetch(`/api/inquiries/${selectedRow.id}/proposal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          eventDate: proposalDraft.eventDate,
          venue: proposalDraft.venue,
          guestCount: proposalDraft.guestCount,
          packageName: proposalDraft.packageName,
          invoiceAmount: proposalDraft.invoiceAmount,
          invoiceDetails: proposalDraft.invoiceDetails,
        }),
      })
      if (!res.ok) throw new Error('send failed')
      if (selectedRow.status === 'new') {
        await patchInquiryRequest(selectedRow.id, { status: 'responded' })
        updateLocalStatus(selectedRow.id, 'replied')
      }
      syncInquiryDetail({
        id: selectedRow.id,
        status: 'responded',
        proposal_status: 'sent',
        proposal_event_date: proposalDraft.eventDate || null,
        proposal_venue: proposalDraft.venue || null,
        proposal_guest_count: proposalDraft.guestCount ? Number(proposalDraft.guestCount) : null,
        proposal_package: proposalDraft.packageName || null,
        proposal_invoice_amount: parsed,
        proposal_invoice_details: proposalDraft.invoiceDetails || null,
        proposal_sent_at: new Date().toISOString(),
        proposal_counter_amount: null,
        proposal_counter_message: null,
        proposal_countered_at: null,
        proposal_accepted_at: null,
      })
      setProposalOpen(false)
    } catch {
      // Keep panel open so the vendor can retry.
    } finally {
      setProposalSending(false)
    }
  }

  async function handleAcceptCounter() {
    if (!selectedRow || selectedInquiryDetail?.proposal_status !== 'countered' || isSampleData) {
      return
    }
    setProposalActionLoading(true)
    try {
      const res = await fetch(`/api/inquiries/${selectedRow.id}/proposal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept-counter' }),
      })
      if (!res.ok) throw new Error('accept failed')
      syncInquiryDetail({
        ...selectedInquiryDetail,
        status: 'accepted',
        proposal_status: 'accepted',
        proposal_invoice_amount: selectedInquiryDetail.proposal_counter_amount ?? selectedInquiryDetail.proposal_invoice_amount,
        proposal_accepted_at: new Date().toISOString(),
      })
      updateLocalStatus(selectedRow.id, 'booked')
    } catch {
      // Silent for now.
    } finally {
      setProposalActionLoading(false)
    }
  }

  async function handleStatusChange(status: InquiryRow['status']) {
    if (!selectedRow || isSampleData) return
    setActionLoading(true)
    try {
      await patchInquiryRequest(selectedRow.id, { status: mapUiStatusToDbStatus(status) })
      updateLocalStatus(selectedRow.id, status)
    } catch { /* silent */ } finally { setActionLoading(false) }
  }

  return {
    active, setActive,
    inquiries,
    selected, setSelected,
    searchQuery, setSearchQuery,
    replyText, setReplyText,
    replyOpen, setReplyOpen,
    sending,
    actionLoading,
    thread,
    threadLoading,
    selectedInquiryDetail,
    proposalOpen, setProposalOpen,
    proposalSending,
    proposalActionLoading,
    proposalDraft, setProposalDraft,
    declineOpen, setDeclineOpen,
    declineReason, setDeclineReason,
    visibleInquiries,
    selectedRow,
    handleReply,
    handleClose,
    handleDecline,
    handleSendProposal,
    handleAcceptCounter,
    handleStatusChange,
  }
}

export default function LeadsClient({ inquiries: initialInquiries, source, vendorName, packages }: Readonly<LeadsClientProps>) {
  const isSampleData = source.kind === 'no-env'
  const banner = BANNER_BY_SOURCE[source.kind]
  const venueSuggestions = useMemo(() => {
    const suggestions = new Set<string>([...VENUE_SUGGESTIONS, ...TZ_REGIONS.map((region) => region.name)])
    initialInquiries.forEach((inquiry) => {
      if (inquiry.location && inquiry.location !== '—') {
        suggestions.add(inquiry.location)
      }
    })
    return Array.from(suggestions)
  }, [initialInquiries])
  const {
    active, setActive, selected, setSelected, searchQuery, setSearchQuery,
    replyText, setReplyText, replyOpen, setReplyOpen, sending, actionLoading,
    thread, threadLoading, selectedInquiryDetail, proposalOpen, setProposalOpen, proposalSending,
    proposalActionLoading,
    proposalDraft, setProposalDraft, declineOpen, setDeclineOpen,
    declineReason, setDeclineReason, visibleInquiries, selectedRow,
    handleReply, handleClose,
    handleDecline, handleSendProposal, handleAcceptCounter, handleStatusChange,
  } = useLeadsState(initialInquiries, isSampleData)

  return (
    <div className="p-8 pb-12">
      <div className="max-w-350 mx-auto">
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
                        'pb-3 px-3 text-sm font-semibold transition-colors border-b-2 -mb-px',
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                {visibleInquiries.length === 0 ? (
                  <li className="px-5 py-10 text-center text-sm text-gray-400">
                    {getEmptyListMessage(source.kind, active, searchQuery)}
                  </li>
                ) : (
                  visibleInquiries.map((row) => (
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
                        getReplyButtonClass(isSampleData, replyOpen),
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

                  {selectedInquiryDetail && (
                    <ProposalStateCard
                      inquiryDetail={selectedInquiryDetail}
                      onAcceptCounter={handleAcceptCounter}
                      acceptingCounter={proposalActionLoading}
                    />
                  )}

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
                        thread.map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            msg={msg}
                          />
                        ))
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
                    <div className="mt-auto pt-6 space-y-3">

                      {selectedRow.status !== 'declined' && (
                        <ProposalPanel
                          open={proposalOpen}
                          sending={proposalSending}
                          draft={proposalDraft}
                          preview={buildProposalMessage(selectedRow, proposalDraft)}
                          packages={packages}
                          venueSuggestions={venueSuggestions}
                          onToggle={() => { setProposalOpen((o) => !o); setDeclineOpen(false) }}
                          onDraftChange={setProposalDraft}
                          onCancel={() => {
                            setProposalOpen(false)
                            setProposalDraft(buildDefaultProposalDraft(selectedRow))
                          }}
                          onSend={handleSendProposal}
                        />
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
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
                            onClick={() => { setDeclineOpen((o) => !o); setProposalOpen(false) }}
                            className={cn(
                              'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors',
                              declineOpen
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : 'border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50',
                            )}
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={handleClose}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archive
                        </button>
                      </div>

                      {/* Decline reason panel */}
                      {declineOpen && selectedRow.status !== 'declined' && (
                        <DeclinePanel
                          reason={declineReason}
                          loading={actionLoading}
                          onReasonChange={setDeclineReason}
                          onCancel={() => { setDeclineOpen(false); setDeclineReason('') }}
                          onConfirm={handleDecline}
                        />
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
            <ContactSidebar selectedRow={selectedRow} />

          </div>
        </div>
      </div>
    </div>
  )
}
