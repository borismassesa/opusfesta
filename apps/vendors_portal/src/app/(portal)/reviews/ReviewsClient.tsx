'use client'

import { useMemo, useState } from 'react'
import {
  Camera,
  Check,
  Filter,
  Flag,
  MessageSquareReply,
  Pin,
  PinOff,
  Send,
  Star,
} from 'lucide-react'
import type { Review, ReviewInviteCandidate } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type ReviewSort = 'recent' | 'highest' | 'lowest' | 'awaiting-reply'
type ReviewFilter = 'all' | 'with-photos' | 'awaiting-reply'

export type ReviewsSource =
  | { kind: 'live' }
  | { kind: 'no-application' }
  | { kind: 'pending-approval' }
  | { kind: 'suspended' }
  | { kind: 'no-env' }

const BANNER_BY_SOURCE: Record<ReviewsSource['kind'], string | null> = {
  live: null,
  'no-application':
    "You haven't started a vendor application yet. Apply to do business on OpusFesta to start collecting reviews.",
  'pending-approval':
    'Your vendor application is awaiting OpusFesta verification. Reviews unlock once your account is approved.',
  suspended:
    'Your vendor account is suspended. Contact OpusFesta support if you believe this is a mistake.',
  'no-env':
    'DEV: Vendor backend not connected — showing seed data. Check Supabase env vars and that migrations are applied to your Supabase project.',
}

type ReviewsClientProps = {
  initialReviews: Review[]
  inviteCandidates: ReviewInviteCandidate[]
  invitesAvailable: boolean
  source: ReviewsSource
}

export default function ReviewsClient({
  initialReviews,
  inviteCandidates,
  invitesAvailable,
  source,
}: ReviewsClientProps) {
  // Reply / pin / invite state are local-only in Phase 1; writes land in Phase 4.
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [pendingInvites, setPendingInvites] =
    useState<ReviewInviteCandidate[]>(inviteCandidates)
  const [sentInvites, setSentInvites] = useState<string[]>([])
  const [sort, setSort] = useState<ReviewSort>('recent')
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [replying, setReplying] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState('')

  const banner = BANNER_BY_SOURCE[source.kind]

  const stats = useMemo(() => {
    const total = reviews.length
    const sum = reviews.reduce((s, r) => s + r.rating, 0)
    const avg = total === 0 ? 0 : sum / total
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }))
    const awaitingReply = reviews.filter((r) => !r.reply).length
    return { total, avg, distribution, awaitingReply }
  }, [reviews])

  const visible = useMemo(() => {
    let list = reviews.slice()
    if (filter === 'with-photos') list = list.filter((r) => (r.photos?.length ?? 0) > 0)
    if (filter === 'awaiting-reply') list = list.filter((r) => !r.reply)
    if (sort === 'recent') list.sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))
    if (sort === 'highest') list.sort((a, b) => b.rating - a.rating || b.reviewedAt.localeCompare(a.reviewedAt))
    if (sort === 'lowest') list.sort((a, b) => a.rating - b.rating || b.reviewedAt.localeCompare(a.reviewedAt))
    if (sort === 'awaiting-reply') {
      list.sort((a, b) => {
        const aw = a.reply ? 1 : 0
        const bw = b.reply ? 1 : 0
        return aw - bw || b.reviewedAt.localeCompare(a.reviewedAt)
      })
    }
    return list.sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)))
  }, [reviews, sort, filter])

  const togglePin = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isPinned: !r.isPinned } : r)))
  }

  const startReply = (id: string) => {
    const existing = reviews.find((r) => r.id === id)?.reply?.body ?? ''
    setReplying(id)
    setReplyDraft(existing)
  }

  const cancelReply = () => {
    setReplying(null)
    setReplyDraft('')
  }

  const submitReply = (id: string) => {
    const body = replyDraft.trim()
    if (!body) return
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, reply: { body, repliedAt: new Date().toISOString() } }
          : r,
      ),
    )
    setReplying(null)
    setReplyDraft('')
  }

  const removeReply = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: undefined } : r)))
  }

  const sendInvite = (bookingId: string) => {
    setSentInvites((prev) => (prev.includes(bookingId) ? prev : [...prev, bookingId]))
  }

  const dismissInvite = (bookingId: string) => {
    setPendingInvites((prev) => prev.filter((c) => c.bookingId !== bookingId))
    setSentInvites((prev) => prev.filter((id) => id !== bookingId))
  }

  return (
    <div className="px-6 lg:px-10 pt-4 lg:pt-5 pb-12">
      <div className="max-w-6xl space-y-6">
        {banner && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {banner}
          </div>
        )}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
          <StatsCard stats={stats} />
          <InviteCard
            candidates={pendingInvites}
            sentInvites={sentInvites}
            invitesAvailable={invitesAvailable}
            onSend={sendInvite}
            onDismiss={dismissInvite}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1">
              Sort
            </span>
            <SegmentedControl
              value={sort}
              onChange={setSort}
              options={[
                { id: 'recent', label: 'Most recent' },
                { id: 'highest', label: 'Highest' },
                { id: 'lowest', label: 'Lowest' },
                { id: 'awaiting-reply', label: 'Awaiting reply' },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: `All ${reviews.length}` },
                { id: 'with-photos', label: 'With photos' },
                { id: 'awaiting-reply', label: `Awaiting (${stats.awaitingReply})` },
              ]}
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              {reviews.length === 0
                ? 'No reviews yet — couples leave reviews after their event.'
                : 'No reviews match these filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                replying={replying === review.id}
                replyDraft={replyDraft}
                onReplyDraftChange={setReplyDraft}
                onStartReply={() => startReply(review.id)}
                onCancelReply={cancelReply}
                onSubmitReply={() => submitReply(review.id)}
                onRemoveReply={() => removeReply(review.id)}
                onTogglePin={() => togglePin(review.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatsCard({
  stats,
}: {
  stats: {
    total: number
    avg: number
    distribution: { star: number; count: number }[]
    awaitingReply: number
  }
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
      <div className="flex flex-wrap items-start gap-6">
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Average rating
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-gray-900 tabular-nums tracking-tight">
              {stats.avg.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 tabular-nums">/ 5</span>
          </div>
          <Stars value={stats.avg} size="md" className="mt-2" />
          <p className="text-xs text-gray-500 mt-2">
            from{' '}
            <span className="font-semibold text-gray-900 tabular-nums">{stats.total}</span> review
            {stats.total === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex-1 min-w-[260px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
            Rating distribution
          </p>
          <ul className="space-y-1.5">
            {stats.distribution.map(({ star, count }) => {
              const pct = stats.total === 0 ? 0 : Math.round((count / stats.total) * 100)
              return (
                <li key={star} className="flex items-center gap-3">
                  <span className="w-7 text-xs font-semibold text-gray-700 tabular-nums shrink-0">
                    {star}★
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-gray-500 tabular-nums shrink-0">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <p className="mt-5 text-xs text-gray-500 leading-relaxed">
        OpusFesta auto-collects reviews from couples after each event — you can&rsquo;t write or
        delete them, but you can reply, pin, or report. Verified reviews boost search ranking.
      </p>
    </div>
  )
}

function InviteCard({
  candidates,
  sentInvites,
  invitesAvailable,
  onSend,
  onDismiss,
}: {
  candidates: ReviewInviteCandidate[]
  sentInvites: string[]
  invitesAvailable: boolean
  onSend: (bookingId: string) => void
  onDismiss: (bookingId: string) => void
}) {
  if (!invitesAvailable) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 text-center">
        <p className="text-sm font-semibold text-gray-900">Review invites coming soon</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Invites unlock once the bookings module ships — couples need a
          completed booking before we can email them on your behalf.
        </p>
      </div>
    )
  }
  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 text-center">
        <p className="text-sm font-semibold text-gray-900">All caught up</p>
        <p className="text-xs text-gray-500 mt-1">
          No past bookings are waiting on a review invite.
        </p>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Request reviews</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Past bookings that haven&rsquo;t left a review yet. We send the couple a polite,
            OpusFesta-branded email — your storefront&rsquo;s rating only updates if they post.
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {candidates.map((c) => {
          const sent = sentInvites.includes(c.bookingId)
          return (
            <li
              key={c.bookingId}
              className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatarUrl}
                alt=""
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{c.couple}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {c.packageName} · {formatDate(c.eventDate)}
                </p>
              </div>
              {sent ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3 h-3" />
                  Invited
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSend(c.bookingId)}
                  className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Invite
                </button>
              )}
              <button
                type="button"
                onClick={() => onDismiss(c.bookingId)}
                className="text-gray-400 hover:text-gray-700 text-[10px] font-medium"
                aria-label={`Dismiss ${c.couple}`}
                title="Dismiss"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
}) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn(
            'text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors',
            value === o.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  replying,
  replyDraft,
  onReplyDraftChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onRemoveReply,
  onTogglePin,
}: {
  review: Review
  replying: boolean
  replyDraft: string
  onReplyDraftChange: (v: string) => void
  onStartReply: () => void
  onCancelReply: () => void
  onSubmitReply: () => void
  onRemoveReply: () => void
  onTogglePin: () => void
}) {
  return (
    <article
      className={cn(
        'bg-white rounded-2xl border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6',
        review.isPinned ? 'border-[#7E5896]/40 ring-1 ring-[#7E5896]/15' : 'border-gray-100',
      )}
    >
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.avatarUrl}
          alt=""
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{review.couple}</p>
            {review.isPinned ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0DFF6] text-[#7E5896]">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            ) : null}
          </div>
          <Stars value={review.rating} size="sm" className="mt-1" />
          <p className="text-xs text-gray-500 mt-1.5">
            {review.packageName} · Wedding {formatDate(review.eventDate)} · Reviewed{' '}
            {formatRelative(review.reviewedAt)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <IconAction
            label={review.isPinned ? 'Unpin' : 'Pin to top'}
            onClick={onTogglePin}
            icon={
              review.isPinned ? (
                <PinOff className="w-3.5 h-3.5" />
              ) : (
                <Pin className="w-3.5 h-3.5" />
              )
            }
          />
          <IconAction
            label="Report"
            icon={<Flag className="w-3.5 h-3.5" />}
            tone="muted"
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
        {review.body}
      </p>

      {review.photos && review.photos.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.photos.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="relative block w-32 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      ) : null}

      {review.reply && !replying ? (
        <div className="mt-5 rounded-lg bg-gray-50 border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-700">
              <MessageSquareReply className="w-3 h-3" />
              Your reply · {formatRelative(review.reply.repliedAt)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onStartReply}
                className="text-[11px] font-semibold text-gray-600 hover:text-gray-900"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onRemoveReply}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
              >
                Remove
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {review.reply.body}
          </p>
        </div>
      ) : null}

      {replying ? (
        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-3">
          <textarea
            autoFocus
            value={replyDraft}
            onChange={(e) => onReplyDraftChange(e.target.value)}
            placeholder="Thank the couple, address any concern with grace, keep it short. Other couples will read this."
            rows={4}
            className="w-full text-sm bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-gray-500">
              Replies are public. Stick to facts; never share private contact info.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancelReply}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmitReply}
                disabled={!replyDraft.trim()}
                className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
              >
                Post reply
              </button>
            </div>
          </div>
        </div>
      ) : !review.reply ? (
        <button
          type="button"
          onClick={onStartReply}
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <MessageSquareReply className="w-3.5 h-3.5" />
          Reply publicly
        </button>
      ) : null}
    </article>
  )
}

function Stars({
  value,
  size = 'md',
  className,
}: {
  value: number
  size?: 'sm' | 'md'
  className?: string
}) {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = value >= i + 1
        const partial = !filled && value > i
        return (
          <span key={i} className="relative">
            <Star className={cn(dim, 'text-gray-200')} />
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : `${(value - i) * 100}%` }}
                aria-hidden
              >
                <Star className={cn(dim, 'text-amber-400 fill-amber-400')} />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

function IconAction({
  label,
  icon,
  onClick,
  tone = 'default',
}: {
  label: string
  icon: React.ReactNode
  onClick?: () => void
  tone?: 'default' | 'muted'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        tone === 'muted'
          ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      )}
    >
      {icon}
    </button>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diffDays = Math.floor((now - d.getTime()) / 86_400_000)
  if (diffDays < 1) return 'today'
  if (diffDays < 2) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}
