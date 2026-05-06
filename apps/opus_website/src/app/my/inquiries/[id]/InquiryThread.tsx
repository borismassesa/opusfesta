'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Send, CheckCircle2 } from 'lucide-react'
import type { InquiryDetail, InquiryMessage } from './page'

type InquiryStatus = 'pending' | 'responded' | 'accepted' | 'declined' | 'closed'

const STATUS_LABEL: Record<InquiryStatus, string> = {
  pending: 'Pending reply',
  responded: 'Replied',
  accepted: 'Accepted',
  declined: 'Declined',
  closed: 'Closed',
}

const STATUS_STYLE: Record<InquiryStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  responded: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-600',
  closed: 'bg-gray-100 text-gray-500',
}

function formatDate(iso: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return 'Date TBC'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', opts ?? { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg }: { msg: InquiryMessage }) {
  const isClient = msg.sender_type === 'client'
  return (
    <div className={`flex gap-3 ${isClient ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${
          isClient ? 'bg-(--accent) text-[#1A1A1A]' : 'bg-gray-900 text-white'
        }`}
      >
        {msg.sender_name.charAt(0).toUpperCase()}
      </div>
      <div className={`flex flex-col gap-1 max-w-[75%] ${isClient ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="font-semibold text-gray-600">{msg.sender_name}</span>
          <span>{formatDate(msg.created_at, { day: '2-digit', month: 'short' })} · {formatTime(msg.created_at)}</span>
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isClient
              ? 'bg-(--accent) text-[#1A1A1A] rounded-tr-sm'
              : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'
          }`}
        >
          {msg.content}
        </div>
      </div>
    </div>
  )
}

type Props = {
  inquiry: InquiryDetail
  messages: InquiryMessage[]
  email: string
}

export default function InquiryThread({ inquiry, messages: initialMessages, email }: Props) {
  const [messages, setMessages] = useState<InquiryMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const status = (inquiry.status ?? 'pending') as InquiryStatus
  const vendorLabel = inquiry.vendor_name ?? inquiry.vendor_slug ?? 'Vendor'

  // Build the full thread: initial inquiry message + subsequent messages
  const initialMsg: InquiryMessage | null = inquiry.message
    ? {
        id: 'initial',
        sender_type: 'client',
        sender_name: inquiry.name ?? email,
        content: inquiry.message,
        created_at: inquiry.created_at,
        read_at: null,
      }
    : null

  // Legacy vendor_response (before inquiry_messages existed)
  const legacyReply: InquiryMessage | null =
    inquiry.vendor_response && messages.every((m) => m.sender_type !== 'vendor')
      ? {
          id: 'legacy-reply',
          sender_type: 'vendor',
          sender_name: vendorLabel,
          content: inquiry.vendor_response,
          created_at: inquiry.responded_at ?? inquiry.created_at,
          read_at: null,
        }
      : null

  const thread: InquiryMessage[] = [
    ...(initialMsg ? [initialMsg] : []),
    ...messages,
    ...(legacyReply ? [legacyReply] : []),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || sending) return

    setSending(true)
    setSendError('')
    try {
      const res = await fetch(`/api/my/inquiries/${inquiry.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content: draft.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSendError(json.error ?? 'Failed to send. Please try again.')
      } else {
        setMessages((prev) => [...prev, json.message])
        setDraft('')
      }
    } catch {
      setSendError('Network error. Please check your connection.')
    } finally {
      setSending(false)
    }
  }

  const canSendMore = status !== 'declined' && status !== 'closed'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href={`/my/inquiries`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A1A1A] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All requests
      </Link>

      {/* Inquiry header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">{vendorLabel}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quote request</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        {/* Event details */}
        <div className="mt-4 flex flex-wrap gap-3">
          {inquiry.event_date && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formatDate(inquiry.event_date)}
            </span>
          )}
          {inquiry.location && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {inquiry.location}
            </span>
          )}
          {inquiry.guest_count && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {inquiry.guest_count} guests
            </span>
          )}
        </div>

        {status === 'accepted' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>
              <strong>{vendorLabel}</strong> has accepted your request. They&apos;ll be in touch to confirm the details.
            </p>
          </div>
        )}
      </div>

      {/* Message thread */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Thread body */}
        <div className="p-5 space-y-5 min-h-[240px]">
          {thread.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
          ) : (
            thread.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose area */}
        {canSendMore ? (
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={handleSend} className="flex gap-2 items-end">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Send a follow-up message to ${vendorLabel}…`}
                rows={2}
                disabled={sending}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-(--accent) transition-colors disabled:opacity-60"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(e as unknown as React.FormEvent)
                }}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending…' : 'Send'}
              </button>
            </form>
            {sendError && (
              <p className="text-xs text-red-600 mt-2">{sendError}</p>
            )}
            <p className="text-[11px] text-gray-400 mt-2">Press ⌘ + Enter to send</p>
          </div>
        ) : (
          <div className="border-t border-gray-100 px-5 py-4 text-xs text-gray-400 text-center">
            {status === 'declined'
              ? 'This vendor has declined the request. You can browse other vendors.'
              : 'This conversation is closed.'}
          </div>
        )}
      </div>
    </div>
  )
}
