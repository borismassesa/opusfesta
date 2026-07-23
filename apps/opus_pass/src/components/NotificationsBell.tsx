'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BadgeCheck, CreditCard, Gift, HandCoins, MailOpen, PenLine, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type NotifType =
  | 'rsvp_received'
  | 'pledge_received'
  | 'payment_confirmed'
  | 'payment_submitted'
  | 'guestbook_received'
  | 'gift_claimed'
  | 'system'

type Notif = {
  id: string
  type: NotifType
  title: string
  body: string | null
  href: string | null
  read: boolean
  created_at: string
  actor_name: string | null
}

// Per-type icon token: a Lucide glyph in a tinted circle. Keyed on the types the
// server actually emits (see lib/dashboard/notifications.ts + its call sites), so
// gift claims and guestbook messages stop collapsing into a generic bell.
const TYPE_ICON: Record<NotifType, { Icon: LucideIcon; wrap: string; fg: string }> = {
  rsvp_received: { Icon: MailOpen, wrap: 'bg-sky-50', fg: 'text-sky-600' },
  pledge_received: { Icon: HandCoins, wrap: 'bg-[#9FE870]/25', fg: 'text-[#3d7a1f]' },
  gift_claimed: { Icon: Gift, wrap: 'bg-[#9FE870]/25', fg: 'text-[#3d7a1f]' },
  guestbook_received: { Icon: PenLine, wrap: 'bg-[var(--accent)]/15', fg: 'text-[#8e57b3]' },
  payment_submitted: { Icon: CreditCard, wrap: 'bg-amber-50', fg: 'text-amber-600' },
  payment_confirmed: { Icon: BadgeCheck, wrap: 'bg-emerald-50', fg: 'text-emerald-600' },
  system: { Icon: Bell, wrap: 'bg-gray-100', fg: 'text-gray-500' },
}
const FALLBACK_ICON = TYPE_ICON.system

// Deterministic initials + tone for the actor avatar (no Math.random — must be
// stable across SSR/renders).
const AVATAR_TONES = [
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
]
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}
function toneFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_TONES[h % AVATAR_TONES.length]
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  // Stay relative past a week so the list never mixes "5d ago" with a raw date.
  const w = Math.floor(d / 7)
  if (w < 5) return `${w}w ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

/**
 * Navbar notification bell for the signed-in couple. Polls the unread count
 * every 45s and loads the full list when opened. Rendered only when signed in.
 */
export default function NotificationsBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { items: Notif[]; unread: number }
      setItems(data.items ?? [])
      setUnread(data.unread ?? 0)
    } catch {
      /* offline / transient — keep last known state */
    }
  }, [])

  // Initial load + 45s poll for the unread badge.
  useEffect(() => {
    load()
    const t = setInterval(load, 45000)
    return () => clearInterval(t)
  }, [load])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      await load()
      setLoading(false)
    }
  }

  const markAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })))
    setUnread(0)
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ all: true }),
    }).catch(() => {})
  }

  const onItem = async (n: Notif) => {
    if (!n.read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)))
      setUnread((u) => Math.max(0, u - 1))
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: n.id }),
      }).catch(() => {})
    }
    setOpen(false)
    if (n.href) router.push(n.href)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 sm:h-10 sm:w-10 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed right-3 top-16 z-50 flex max-h-[70vh] w-[calc(100vw-1.5rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] sm:max-w-[380px]">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-bold text-[#1A1A1A]">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="rounded-full border border-[var(--accent)]/45 px-3 py-1 text-xs font-semibold text-[#8e57b3] transition-colors hover:bg-[var(--accent)]/10"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">Loading…</p>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-gray-700">You're all caught up</p>
                <p className="mt-1 text-xs text-gray-400">
                  RSVPs and pledges from your guests will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((n) => {
                  const cfg = TYPE_ICON[n.type] ?? FALLBACK_ICON
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => onItem(n)}
                        className={cn(
                          'flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                          n.read
                            ? 'border-transparent'
                            : 'border-(--accent) bg-[var(--accent)]/[0.04]',
                        )}
                      >
                        {/* Leading media: actor avatar (with a small type badge) when
                            the notification is about a person, else the type token. */}
                        <span className="relative mt-0.5 shrink-0" aria-hidden>
                          {n.actor_name ? (
                            <>
                              <span
                                className={cn(
                                  'grid h-9 w-9 place-items-center rounded-full text-xs font-bold',
                                  toneFor(n.actor_name),
                                )}
                              >
                                {initials(n.actor_name)}
                              </span>
                              <span
                                className={cn(
                                  'absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full ring-2 ring-white',
                                  cfg.wrap,
                                )}
                              >
                                <cfg.Icon className={cn('h-2.5 w-2.5', cfg.fg)} strokeWidth={2.5} />
                              </span>
                            </>
                          ) : (
                            <span
                              className={cn('grid h-9 w-9 place-items-center rounded-full', cfg.wrap)}
                            >
                              <cfg.Icon className={cn('h-[18px] w-[18px]', cfg.fg)} strokeWidth={2} />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block text-sm leading-snug',
                              n.read ? 'font-medium text-gray-700' : 'font-semibold text-[#1A1A1A]',
                            )}
                          >
                            {n.title}
                          </span>
                          {n.body && (
                            <span className="mt-0.5 block truncate text-xs text-gray-500">{n.body}</span>
                          )}
                          <span className="mt-1 block text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
