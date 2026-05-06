// OF-ADM-AUTHORS-001 — pending invite row. Visually marked with a soft amber
// tint so admins can scan the list and tell at a glance who is "real" vs.
// outstanding. Resend rotates the token via regenerateContributorInvitation;
// failures fall back to a mailto: handoff (matches AuthorAccessForm).

'use client'

import { useState, useTransition } from 'react'
import { Mail, MoreHorizontal, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { regenerateContributorInvitation } from '@/lib/advice-submission-actions'
import StatusPill from './StatusPill'
import type { AuthorListEntry } from './types'

type Props = {
  entry: Extract<AuthorListEntry, { kind: 'invite' }>
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000) return 'just now'
  const min = Math.round(ms / 60_000)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day}d ago`
  const month = Math.round(day / 30)
  return `${month}mo ago`
}

function buildMailto(invite: Props['entry'], link: string): string {
  const recipient = invite.displayName?.trim() || invite.email
  const titleClause = invite.articleTitle?.trim()
    ? ` on "${invite.articleTitle.trim()}"`
    : ''
  const subject = invite.articleTitle?.trim()
    ? `Invitation to write for OpusFesta — ${invite.articleTitle.trim()}`
    : 'Invitation to write for OpusFesta Ideas & Advice'
  const body = [
    `Hi ${recipient},`,
    '',
    `We'd love for you to write for OpusFesta's Ideas & Advice section${titleClause}.`,
    '',
    `Use this link to start drafting (it's scoped to your email — sign in with ${invite.email}):`,
    link,
    '',
    'Looking forward to your story!',
    '— The OpusFesta team',
  ].join('\n')
  return `mailto:${encodeURIComponent(invite.email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`
}

export default function PendingInviteRow({ entry }: Props) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function resend() {
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await regenerateContributorInvitation(entry.id)
        if (result.delivery.sent) {
          setMessage('Email sent.')
        } else if (typeof window !== 'undefined') {
          window.location.href = buildMailto(entry, result.link)
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Could not re-send invite.')
      }
    })
  }

  const titleSuffix = entry.articleTitle ? ` · Article: ${entry.articleTitle}` : ''

  return (
    <div
      role="row"
      className="grid grid-cols-[24px_36px_minmax(0,1fr)_140px_90px_80px] items-center gap-3 border-b border-gray-100 bg-[#FFFBF2] px-4 py-3.5"
    >
      {/* Drag handle is disabled for invites — they always sort last by status */}
      <span aria-hidden className="block h-6 w-6" />

      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Mail className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900" title={entry.email}>
            {entry.email}
          </span>
          <StatusPill variant="pending" />
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          Invited {relativeTime(entry.invitedAt)}
          {titleSuffix}
        </p>
      </div>

      <div role="cell" className="truncate text-[13px] text-gray-700" title={entry.role || '—'}>
        {entry.role || '—'}
      </div>
      <div role="cell" className="text-[13px] text-gray-400">
        —
      </div>

      <div role="cell" className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={resend}
          disabled={pending}
          className={cn(
            'inline-flex items-center gap-1 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-50',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          title="Generate a fresh link and email it"
        >
          <RefreshCw className={cn('h-3 w-3', pending && 'animate-spin')} />
          {pending ? 'Sending…' : 'Resend'}
        </button>
        {/* TODO(OF-ADM-AUTHORS-001 v2): wire kebab — Cancel invite / Copy link */}
        <button
          type="button"
          aria-label="More actions"
          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {message && (
        <p className="col-span-full text-right text-xs text-gray-500">{message}</p>
      )}
    </div>
  )
}
