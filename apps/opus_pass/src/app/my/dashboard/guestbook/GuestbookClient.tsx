'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookHeart, Check, Copy, ExternalLink, EyeOff, Link2, Mic, Trash2, UserCheck } from 'lucide-react'
import {
  approveGuestbookEntry,
  hideGuestbookEntry,
  deleteGuestbookEntry,
  enablePublicSharing,
} from '@/lib/dashboard/actions'
import { guestbookPath } from '@/lib/dashboard/share'
import { GUESTBOOK_STATUS_LABELS, type GuestbookEntry, type GuestbookReviewStatus } from '@/lib/dashboard/types'
import { Card, SectionTitle, EmptyState } from '@/components/dashboard/primitives'
import { cn } from '@/lib/utils'

const STATUS_PILL: Record<GuestbookReviewStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  hidden: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function GuestbookClient({
  initial,
  shareSlug,
  shareEnabled,
}: {
  initial: GuestbookEntry[]
  shareSlug: string | null
  shareEnabled: boolean
}) {
  const [entries, setEntries] = useState(initial)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const { pending, rest } = useMemo(() => {
    const pending = entries.filter((e) => e.review_status === 'pending')
    const rest = entries.filter((e) => e.review_status !== 'pending')
    return { pending, rest }
  }, [entries])

  function setStatus(id: string, review_status: GuestbookReviewStatus) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, review_status } : e)))
  }

  function act(id: string, fn: (id: string) => Promise<void>, onDone?: () => void) {
    setBusyId(id)
    startTransition(async () => {
      try {
        await fn(id)
        onDone?.()
      } finally {
        setBusyId(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Guestbook" subtitle="A standalone link where guests leave messages and photo memories — no wedding website required." />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="px-5 py-4">
          <div className="grid grid-cols-3 divide-x divide-black/[0.12] text-center">
            <Stat value={pending.length} label="Needs review" />
            <Stat value={entries.filter((e) => e.review_status === 'approved').length} label="Approved" />
            <Stat value={entries.filter((e) => e.review_status === 'hidden').length} label="Hidden" />
          </div>
        </Card>
        <ShareLinkCard shareSlug={shareSlug} shareEnabled={shareEnabled} />
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={<BookHeart size={22} />}
          title="No messages yet"
          description="Share your guestbook link above — guests can leave a message or photo memory without needing a wedding website. They'll show up here for you to approve."
        />
      ) : (
        <>
          {pending.length > 0 && (
            <section className="rounded-2xl border border-[#9FE870]/60 bg-[#9FE870]/12 p-5 sm:p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#14342B]">Needs review · {pending.length}</h2>
                <p className="text-sm text-[#1A1A1A]/60">
                  Approve to show these on your guestbook link, or hide if it&apos;s not something you want public.
                </p>
              </div>
              <ul className="space-y-2.5">
                {pending.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    busy={busyId === entry.id}
                    onApprove={() =>
                      act(entry.id, approveGuestbookEntry, () => setStatus(entry.id, 'approved'))
                    }
                    onHide={() => act(entry.id, hideGuestbookEntry, () => setStatus(entry.id, 'hidden'))}
                    onDelete={() =>
                      act(entry.id, deleteGuestbookEntry, () =>
                        setEntries((prev) => prev.filter((e) => e.id !== entry.id)),
                      )
                    }
                  />
                ))}
              </ul>
            </section>
          )}

          {rest.length > 0 && (
            <Card className="p-5 sm:p-6">
              <SectionTitle title="All messages" subtitle={`${rest.length} reviewed`} />
              <ul className="space-y-2.5">
                {rest.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    busy={busyId === entry.id}
                    onApprove={
                      entry.review_status === 'hidden'
                        ? () => act(entry.id, approveGuestbookEntry, () => setStatus(entry.id, 'approved'))
                        : undefined
                    }
                    onHide={
                      entry.review_status === 'approved'
                        ? () => act(entry.id, hideGuestbookEntry, () => setStatus(entry.id, 'hidden'))
                        : undefined
                    }
                    onDelete={() =>
                      act(entry.id, deleteGuestbookEntry, () =>
                        setEntries((prev) => prev.filter((e) => e.id !== entry.id)),
                      )
                    }
                  />
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl leading-none font-semibold tracking-tight text-[#1A1A1A]">{value}</div>
      <div className="mt-1 text-xs font-medium text-[#1A1A1A]/55">{label}</div>
    </div>
  )
}

function ShareLinkCard({ shareSlug, shareEnabled }: { shareSlug: string | null; shareEnabled: boolean }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()
  // Built from window.location.origin (not a server-computed publicOrigin())
  // so the link — and the "Preview as guest" tab — resolve to localhost while
  // developing instead of always pointing at the production domain.
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const shareLink = shareSlug && origin ? `${origin}${guestbookPath(shareSlug)}` : null

  function onEnable() {
    startTransition(async () => {
      await enablePublicSharing()
      router.refresh()
    })
  }

  async function onCopy() {
    if (!shareLink) return
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/65">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              <span>Your guestbook link</span>
            </div>
            {shareEnabled && shareLink ? (
              <div className="mt-1 truncate rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-xs text-[#1A1A1A]/80">
                {shareLink.replace(/^https?:\/\//, '')}
              </div>
            ) : (
              <div className="mt-1 text-xs text-[#1A1A1A]/55">No link yet — generate one to start collecting wishes.</div>
            )}
          </div>
          {shareEnabled && shareLink ? (
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-[#1A1A1A] hover:bg-[#b97fd0]"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Preview
              </a>
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.18] bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A] hover:bg-black/[0.03]"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onEnable}
              disabled={pending}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-[#1A1A1A] hover:bg-[#b97fd0] disabled:opacity-50"
            >
              <Link2 className="h-3.5 w-3.5" /> {pending ? 'Generating…' : 'Get my guestbook link'}
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

function EntryRow({
  entry,
  busy,
  onApprove,
  onHide,
  onDelete,
}: {
  entry: GuestbookEntry
  busy: boolean
  onApprove?: () => void
  onHide?: () => void
  onDelete: () => void
}) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-black/[0.08] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 gap-3">
        {entry.photo_url && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <Image src={entry.photo_url} alt="" fill sizes="56px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-medium text-[#1A1A1A]">
            {entry.guest_name}
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                STATUS_PILL[entry.review_status],
              )}
            >
              {GUESTBOOK_STATUS_LABELS[entry.review_status]}
            </span>
          </p>
          {entry.message && <p className="mt-0.5 line-clamp-2 text-sm text-[#1A1A1A]/70">{entry.message}</p>}
          {entry.audio_url && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]/40" />
              <audio controls preload="none" src={entry.audio_url} className="h-8 max-w-[240px]" />
            </div>
          )}
          <p className="mt-0.5 text-xs text-[#1A1A1A]/45">{formatDate(entry.created_at)}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:ml-4">
        {onApprove && (
          <button
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#14342B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f2a22] disabled:opacity-50"
          >
            <UserCheck className="h-3.5 w-3.5" /> Approve
          </button>
        )}
        {onHide && (
          <button
            onClick={onHide}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-xs font-semibold text-[#1A1A1A]/70 hover:bg-black/[0.03] disabled:opacity-50"
          >
            <EyeOff className="h-3.5 w-3.5" /> Hide
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </li>
  )
}
