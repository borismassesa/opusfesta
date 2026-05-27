'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { MessageCircle, Mail, Copy, Send, Smartphone, Check, Users } from 'lucide-react'
import { Card, SectionTitle, EmptyState, StatusPill } from '@/components/dashboard/primitives'
import { Button } from '@/components/dashboard/controls'
import { recordSend } from '@/lib/dashboard/actions'
import {
  rsvpUrl,
  inviteMessage,
  whatsappShareUrl,
  smsShareUrl,
  emailShareUrl,
} from '@/lib/dashboard/share'
import type { GuestWithInvitations, RsvpStatus, SendChannel } from '@/lib/dashboard/types'

function summaryStatus(g: GuestWithInvitations): RsvpStatus | null {
  if (g.invitations.length === 0) return null
  if (g.invitations.some((i) => i.rsvp_status === 'attending')) return 'attending'
  if (g.invitations.every((i) => i.rsvp_status === 'declined')) return 'declined'
  if (g.invitations.some((i) => i.rsvp_status === 'maybe')) return 'maybe'
  return 'pending'
}

export default function InvitationsCenter({
  guests,
  coupleName,
}: {
  guests: GuestWithInvitations[]
  coupleName: string
}) {
  const [origin, setOrigin] = useState('')
  const [, startTransition] = useTransition()

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const invitable = guests.filter((g) => g.invitations.length > 0)
  const notInvited = guests.length - invitable.length

  function track(guestId: string, channel: SendChannel) {
    startTransition(() => {
      recordSend(guestId, channel).catch(() => {})
    })
  }

  function share(g: GuestWithInvitations, channel: SendChannel) {
    const link = rsvpUrl(origin, g.public_token)
    const msg = inviteMessage(coupleName, g.full_name, link)
    let url = ''
    if (channel === 'whatsapp') url = whatsappShareUrl(g, msg)
    else if (channel === 'sms') url = smsShareUrl(g, msg)
    else if (channel === 'email')
      url = emailShareUrl(g, `You're invited — ${coupleName}`, msg)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      track(g.id, channel)
    }
  }

  async function copy(g: GuestWithInvitations) {
    try {
      await navigator.clipboard.writeText(rsvpUrl(origin, g.public_token))
      toast.success('RSVP link copied')
      track(g.id, 'link')
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Send invitations"
        subtitle="Share each guest's personal RSVP link — no app needed on their end"
      />

      {guests.length === 0 ? (
        <EmptyState
          icon={<Send className="h-7 w-7" />}
          title="No guests to invite yet"
          description="Add guests and invite them to events first."
          action={
            <Link href="/my/dashboard/guests">
              <Button>
                <Users className="h-4 w-4" /> Go to guest list
              </Button>
            </Link>
          }
        />
      ) : invitable.length === 0 ? (
        <EmptyState
          icon={<Send className="h-7 w-7" />}
          title="No one is invited to an event yet"
          description="Open the guest list and tick which events each guest is invited to."
          action={
            <Link href="/my/dashboard/guests">
              <Button>Manage invitations</Button>
            </Link>
          }
        />
      ) : (
        <>
          {notInvited > 0 ? (
            <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              {notInvited} guest{notInvited === 1 ? ' is' : 's are'} not invited to any event yet.{' '}
              <Link href="/my/dashboard/guests" className="font-semibold underline">
                Add them to events
              </Link>
              .
            </p>
          ) : null}

          <Card className="divide-y divide-black/[0.05]">
            {invitable.map((g) => {
              const status = summaryStatus(g)
              const sent = g.invite_count > 0
              return (
                <div key={g.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A0DC]/15 text-sm font-semibold text-[#8e57b3]">
                      {g.full_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#1A1A1A]">{g.full_name}</p>
                      <p className="text-xs text-[#1A1A1A]/50">
                        {sent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <Check className="h-3 w-3" /> Sent {g.invite_count}×
                          </span>
                        ) : (
                          'Not sent yet'
                        )}
                      </p>
                    </div>
                  </div>

                  {status ? (
                    <div className="hidden w-24 text-right sm:block">
                      <StatusPill status={status} />
                    </div>
                  ) : null}

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <button
                      onClick={() => share(g, 'whatsapp')}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </button>
                    <button
                      onClick={() => share(g, 'sms')}
                      className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-xs font-medium text-[#1A1A1A]/70 hover:bg-black/[0.08]"
                    >
                      <Smartphone className="h-3.5 w-3.5" /> SMS
                    </button>
                    <button
                      onClick={() => share(g, 'email')}
                      className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-xs font-medium text-[#1A1A1A]/70 hover:bg-black/[0.08]"
                    >
                      <Mail className="h-3.5 w-3.5" /> Email
                    </button>
                    <button
                      onClick={() => copy(g)}
                      aria-label="Copy link"
                      className="flex items-center gap-1.5 rounded-lg bg-[#C9A0DC]/15 px-2.5 py-1.5 text-xs font-medium text-[#8e57b3] hover:bg-[#C9A0DC]/25"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>
                </div>
              )
            })}
          </Card>
        </>
      )}
    </div>
  )
}
