'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', opts ?? { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg }: Readonly<{ msg: InquiryMessage }>) {
  const isClient = msg.sender_type === 'client'
  return (
    <div className={`flex gap-3 ${isClient ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold ${
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

export default function InquiryThread({ inquiry, messages: initialMessages, email }: Readonly<Props>) {
  const router = useRouter()
  const [messages, setMessages] = useState<InquiryMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [inquiryStatus, setInquiryStatus] = useState<InquiryStatus>((inquiry.status ?? 'pending') as InquiryStatus)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [messageActionLoading, setMessageActionLoading] = useState(false)
  const [inquiryActionLoading, setInquiryActionLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const status = inquiryStatus
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

  async function sendMessage() {
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
      if (res.ok) {
        setMessages((prev) => [...prev, json.message])
        setDraft('')
      } else {
        setSendError(json.error ?? 'Failed to send. Please try again.')
      }
    } catch {
      setSendError('Network error. Please check your connection.')
    } finally {
      setSending(false)
    }
  }

  async function handleUpdateMessage(messageId: string) {
    if (!editDraft.trim() || messageActionLoading) return
    setMessageActionLoading(true)
    try {
      const res = await fetch(`/api/my/inquiries/${inquiry.id}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content: editDraft.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSendError(json.error ?? 'Failed to update message.')
        return
      }
      setMessages((prev) => prev.map((m) => (m.id === messageId ? json.message : m)))
      setEditingMessageId(null)
      setEditDraft('')
      setSendError('')
    } catch {
      setSendError('Network error while updating message.')
    } finally {
      setMessageActionLoading(false)
    }
  }

  async function handleDeleteMessage(messageId: string) {
    if (messageActionLoading) return
    setMessageActionLoading(true)
    try {
      const res = await fetch(`/api/my/inquiries/${inquiry.id}/messages/${messageId}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        setSendError('Failed to delete message.')
        return
      }
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      if (editingMessageId === messageId) {
        setEditingMessageId(null)
        setEditDraft('')
      }
      setSendError('')
    } catch {
      setSendError('Network error while deleting message.')
    } finally {
      setMessageActionLoading(false)
    }
  }

  async function handleCloseInquiry() {
    if (inquiryActionLoading || status === 'closed') return
    setInquiryActionLoading(true)
    try {
      const res = await fetch(`/api/my/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status: 'closed' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSendError(json.error ?? 'Failed to close request.')
        return
      }
      setInquiryStatus('closed')
      setSendError('')
    } catch {
      setSendError('Network error while closing request.')
    } finally {
      setInquiryActionLoading(false)
    }
  }

  async function handleDeleteInquiry() {
    if (inquiryActionLoading) return
    setInquiryActionLoading(true)
    try {
      const res = await fetch(`/api/my/inquiries/${inquiry.id}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        setSendError('Failed to delete request.')
        return
      }
      router.push(`/my/inquiries?email=${encodeURIComponent(email)}`)
      router.refresh()
    } catch {
      setSendError('Network error while deleting request.')
    } finally {
      setInquiryActionLoading(false)
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
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            {status !== 'closed' && (
              <button
                type="button"
                disabled={inquiryActionLoading}
                onClick={handleCloseInquiry}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Close request
              </button>
            )}
            <button
              type="button"
              disabled={inquiryActionLoading}
              onClick={handleDeleteInquiry}
              className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
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
        <div className="p-5 space-y-5 min-h-60">
          {thread.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
          ) : (
            thread.map((msg) => {
              const isOwn = msg.sender_type === 'client' && msg.id !== 'initial'
              const isEditing = editingMessageId === msg.id
              return (
                <div key={msg.id} className="space-y-1.5">
                  <MessageBubble msg={msg} />
                  {isOwn && (
                    <div className="flex justify-end gap-2 text-[11px] text-gray-400 pr-11">
                      {isEditing ? (
                        <div className="w-full max-w-md rounded-xl border border-(--accent)/40 bg-[#FCF7FF] p-2.5 space-y-2">
                          <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-800 focus:outline-none focus:border-(--accent)"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => { setEditingMessageId(null); setEditDraft('') }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={messageActionLoading || !editDraft.trim()}
                              onClick={() => handleUpdateMessage(msg.id)}
                              className="rounded-md bg-[#1A1A1A] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => { setEditingMessageId(msg.id); setEditDraft(msg.content) }}
                            className="hover:text-gray-600 transition-colors"
                          >
                            Edit
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            disabled={messageActionLoading}
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose area */}
        {canSendMore ? (
          <div className="border-t border-gray-100 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void sendMessage()
              }}
              className="flex gap-2 items-end"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Send a follow-up message to ${vendorLabel}…`}
                rows={2}
                disabled={sending}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-(--accent) transition-colors disabled:opacity-60"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    void sendMessage()
                  }
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
