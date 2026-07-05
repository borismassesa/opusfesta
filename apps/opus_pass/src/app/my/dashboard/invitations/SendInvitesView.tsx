'use client'

import { Fragment, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  MessageCircle,
  Smartphone,
  Copy,
  ArrowRight,
  ExternalLink,
  BellRing,
  Eye,
  X,
  RotateCcw,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react'
import {
  enablePublicSharing,
  setPublicSharing,
  sendWhatsAppInvites,
  sendWhatsAppTestInvite,
  saveInviteSendSettings,
  assignOrderToEvent,
  updateGuestPhone,
  updateGuestBasics,
  createGuest,
  deleteGuest,
  deleteGuests,
  recordSend,
  type WhatsAppSendSummary,
  type WhatsAppSendResult,
} from '@/lib/dashboard/actions'
import {
  whatsappShareUrl,
  smsShareUrl,
  publicInviteMessage,
  inviteMessage,
  reminderMessage,
  firstNameOf,
} from '@/lib/dashboard/share'
import { INVITE_TEMPLATE } from '@/lib/whatsapp/types'
import { EVENT_TYPE_LABELS_SW } from '@/lib/dashboard/types'
import type { SendInvitesData, SendGuestRow } from '@/lib/dashboard/queries'
import type { DashboardSendStrings } from '@/lib/cms/ui-strings-fallback'

const STATUS_CLASS: Record<SendGuestRow['status'], string> = {
  none: 's-none',
  sent: 's-sent',
  viewed: 's-view',
  attending: 's-yes',
  declined: 's-no',
  maybe: 's-maybe',
}

/** Substitute `{var}` placeholders in a CMS template with runtime values. */
const fmt = (t: string, v: Record<string, string | number>) =>
  t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m))

/** Render WhatsApp-flavoured text: *bold* spans and newlines. */
function waText(text: string) {
  return text.split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? <br /> : null}
      {line.split(/(\*[^*]+\*)/g).map((part, j) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <b key={j}>{part.slice(1, -1)}</b>
        ) : (
          <Fragment key={j}>{part}</Fragment>
        ),
      )}
    </Fragment>
  ))
}

/** The known Swahili event categories, in template-friendly form. */
const CATEGORY_OPTIONS = [...new Set(Object.values(EVENT_TYPE_LABELS_SW))]

/** Display form of a category: menu shows "Harusi", the message keeps the
 *  grammatically-correct lowercase noun mid-sentence ("kuhudhuria harusi ya"). */
const capitalize = (v: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : v)

/** Event-category picker: preset Swahili nouns plus an "other, type it" mode.
 *  The select can never render blank: an empty value shows a placeholder row
 *  and a saved custom value opens directly in other-mode. */
function CategoryField({
  value,
  onChange,
  label,
  otherLabel,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  otherLabel: string
}) {
  const isPreset = CATEGORY_OPTIONS.includes(value)
  const [otherPicked, setOtherPicked] = useState(() => Boolean(value) && !isPreset)
  const otherMode = otherPicked || (Boolean(value) && !isPreset)
  return (
    <label className="vfield">
      <span>{label}</span>
      <select
        value={otherMode ? '__other' : value}
        onChange={(e) => {
          if (e.target.value === '__other') {
            setOtherPicked(true)
          } else {
            setOtherPicked(false)
            onChange(e.target.value)
          }
        }}
      >
        {!value && !otherMode ? <option value="" disabled>{label}</option> : null}
        {CATEGORY_OPTIONS.map((o) => (
          <option key={o} value={o}>{capitalize(o)}</option>
        ))}
        <option value="__other">{otherLabel}</option>
      </select>
      {otherMode ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} maxLength={40} placeholder={otherLabel} autoFocus />
      ) : null}
    </label>
  )
}

/** A queued bulk send awaiting the couple's confirmation. */
interface PendingSend {
  ids?: string[]
  reminder: boolean
  recipients: number
  credits: number
}

export default function SendInvitesView({
  data,
  strings,
}: {
  data: SendInvitesData
  strings: DashboardSendStrings
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { event, funnel, quota, publicLink, whatsappLive, guests, events, selectedEventId, unassignedOrders } = data
  const eventId = selectedEventId ?? undefined

  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<'all' | 'notsent' | 'awaiting'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sendingRow, setSendingRow] = useState<string | null>(null)
  const [confirmSend, setConfirmSend] = useState<PendingSend | null>(null)
  const [report, setReport] = useState<WhatsAppSendSummary | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [testPhone, setTestPhone] = useState(data.testPhone ?? '')
  const [testSending, setTestSending] = useState(false)
  const [phoneEdit, setPhoneEdit] = useState<{ id: string; value: string } | null>(null)
  // Inline guest-list editing: one row at a time, plus an add-guest row.
  const [rowEdit, setRowEdit] = useState<{ id: string; name: string; phone: string; askDelete: boolean } | null>(null)
  const [newGuest, setNewGuest] = useState<{ name: string; phone: string } | null>(null)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  // The template's {{2}}/{{3}}, editable everywhere they're shown and REQUIRED
  // before any send. {{1}} (guest name) is per-guest from the roster; the
  // sample here only drives the preview bubble and the test message.
  const [hostName, setHostName] = useState(data.sendSettings.hostName)
  const [eventCat, setEventCat] = useState(data.sendSettings.eventCategory)
  const [sampleGuest, setSampleGuest] = useState(firstNameOf(guests[0]?.name ?? 'Amina'))
  const settingsValid = hostName.trim().length > 0 && eventCat.trim().length > 0
  // The details card is a form only while unconfirmed or explicitly editing;
  // once saved it collapses into a confirmed summary.
  const [editingSettings, setEditingSettings] = useState(!data.sendSettings.confirmed)

  // "Awaiting" = invited but not yet replied (delivered or seen, no RSVP).
  const isAwaiting = (s: SendGuestRow['status']) => s === 'sent' || s === 'viewed'
  const hasPhone = (g: SendGuestRow) => Boolean(g.whatsappPhone || g.phone)

  const notSentCount = useMemo(() => guests.filter((g) => g.status === 'none').length, [guests])
  const awaitingCount = useMemo(() => guests.filter((g) => isAwaiting(g.status)).length, [guests])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return guests.filter((g) => {
      if (filter === 'notsent' && g.status !== 'none') return false
      if (filter === 'awaiting' && !isAwaiting(g.status)) return false
      if (q && !`${g.name} ${g.phone ?? ''} ${g.whatsappPhone ?? ''}`.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [guests, filter, search])
  const pct = quota.purchased > 0 ? Math.min(100, Math.round((quota.used / quota.purchased) * 100)) : 0

  // The webhook flips statuses (delivered, viewed, RSVP taps) server-side;
  // refetch periodically so the table reflects them without a manual reload.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible' && !pending && !sendingRow) router.refresh()
    }, 25_000)
    return () => clearInterval(t)
  }, [router, pending, sendingRow])

  // Heading name comes from the event itself (falls back to the couple profile
  // only when no events exist), suffixed with the event type when it adds info.
  const headingName = event.eventName ?? event.coupleName
  const heading =
    event.eventTypeLabel && event.eventTypeLabel.toLowerCase() !== headingName.toLowerCase()
      ? `${headingName}, ${event.eventTypeLabel}`
      : headingName

  const previewBody = INVITE_TEMPLATE.body
    .replace('{{1}}', sampleGuest.trim() || 'Amina')
    .replace('{{2}}', hostName.trim() || event.coupleName)
    .replace('{{3}}', eventCat.trim() || event.eventCategorySw)

  /** Switch which event this page is scoped to — a fresh server fetch of the
   *  design/quota/guest-statuses for that event (not client-side filtering,
   *  since entitlement itself is scoped server-side). */
  function switchEvent(id: string) {
    router.push(`${pathname}?event=${id}`)
  }

  function assignUnassignedOrder(orderId: string) {
    if (!selectedEventId) return
    startTransition(async () => {
      try {
        await assignOrderToEvent(orderId, selectedEventId)
        toast.success(strings.toast_order_assigned)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_send_failed)
      }
    })
  }

  function toggleSharing() {
    startTransition(async () => {
      try {
        if (publicLink.enabled) {
          await setPublicSharing(false)
        } else {
          await enablePublicSharing()
        }
        router.refresh()
      } catch {
        toast.error(strings.toast_sharing_error)
      }
    })
  }

  async function copyLink() {
    if (!publicLink.url) return
    await navigator.clipboard.writeText(publicLink.url)
    setCopied(true)
    toast.success(strings.toast_link_copied)
    setTimeout(() => setCopied(false), 1800)
  }

  function shareLink(channel: 'whatsapp' | 'sms' | 'qr') {
    if (!publicLink.url) return
    const msg = publicInviteMessage(event.coupleName, publicLink.url)
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
    } else if (channel === 'sms') {
      window.open(`sms:?&body=${encodeURIComponent(msg)}`, '_blank')
    } else {
      window.open(publicLink.url, '_blank', 'noopener,noreferrer')
    }
  }

  /** Stage a bulk send: show recipients + credit cost, send on confirm. */
  function stageBulkSend(ids?: string[], { reminder = false }: { reminder?: boolean } = {}) {
    const pool = ids ? guests.filter((g) => ids.includes(g.id)) : guests
    const eligible = pool.filter(hasPhone)
    if (eligible.length === 0) {
      toast.error(strings.toast_nothing_sent)
      return
    }
    const credits = eligible.filter((g) => g.status === 'none').length
    setConfirmSend({ ids, reminder, recipients: eligible.length, credits })
  }

  function runBulkSend(ids?: string[], reminder = false) {
    setConfirmSend(null)
    startTransition(async () => {
      // The confirmed {{2}}/{{3}} values are part of every send — persist them
      // first so the server action reads what the couple just approved.
      try {
        await saveInviteSendSettings(hostName, eventCat)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_nothing_sent)
        return
      }
      const res = await sendWhatsAppInvites(ids, eventId)
      if (!res.hasPaidOrder) {
        toast.error(strings.toast_no_package)
        return
      }
      // Every guest fell through (unconfirmed, or the account has no card
      // image) — a "0 sent" success toast would hide the real problem.
      if (res.sent === 0 && res.failed === 0 && res.blocked === 0 && res.skipped === 0) {
        toast.error(strings.toast_nothing_sent)
        setSelected(new Set())
        return
      }
      const verb = res.dryRun
        ? strings.send_verb_dryrun
        : reminder
          ? strings.send_verb_reminded
          : strings.send_verb_sent
      const parts = [`${res.sent} ${verb}`]
      if (res.failed > 0) parts.push(fmt(strings.send_failed_n, { n: res.failed }))
      if (res.blocked > 0) parts.push(fmt(strings.send_over_quota, { n: res.blocked }))
      if (res.skipped > 0) parts.push(fmt(strings.send_no_phone, { n: res.skipped }))
      const summaryLine = parts.join(' · ')
      if (res.sent > 0) toast.success(summaryLine)
      else toast.error(summaryLine)
      setReport(res)
      setSelected(new Set())
      router.refresh()
    })
  }

  /** Nudge everyone who was invited but hasn't replied (re-sends are free). */
  function remindAwaiting() {
    const ids = guests.filter((g) => isAwaiting(g.status)).map((g) => g.id)
    if (ids.length === 0) {
      toast(strings.toast_no_awaiting)
      return
    }
    stageBulkSend(ids, { reminder: true })
  }

  function retryFailed() {
    const ids = (report?.results ?? []).filter((r) => r.outcome === 'failed').map((r) => r.id)
    if (ids.length === 0) return
    runBulkSend(ids)
  }

  function rowShare(g: SendGuestRow, channel: 'whatsapp' | 'sms' | 'copy') {
    if (channel === 'copy') {
      navigator.clipboard.writeText(g.rsvpUrl)
      toast.success(strings.toast_personal_copied)
      return
    }
    // With WhatsApp Business live, the row button sends the real approved
    // template (same pipeline as bulk send) — not a wa.me prefill.
    if (channel === 'whatsapp' && whatsappLive) {
      // First send ever? The couple must confirm the invitation details
      // ({{2}}/{{3}}) — route through the confirm dialog which saves them.
      if (!data.sendSettings.confirmed) {
        stageBulkSend([g.id], { reminder: isAwaiting(g.status) })
        return
      }
      const first = firstNameOf(g.name)
      const remindingLive = isAwaiting(g.status)
      setSendingRow(g.id)
      startTransition(async () => {
        try {
          const res = await sendWhatsAppInvites([g.id], eventId)
          if (!res.hasPaidOrder) toast.error(strings.toast_no_package)
          else if (res.sent > 0 && res.dryRun) toast.success(`1 ${strings.send_verb_dryrun}`)
          else if (res.sent > 0)
            toast.success(fmt(remindingLive ? strings.toast_reminded_one : strings.toast_sent_one, { name: first }))
          else if (res.blocked > 0) toast.error(fmt(strings.send_over_quota, { n: res.blocked }))
          else if (res.skipped > 0) toast.error(fmt(strings.send_no_phone, { n: res.skipped }))
          else toast.error(fmt(strings.toast_send_failed, { name: first }))
          router.refresh()
        } finally {
          setSendingRow(null)
        }
      })
      return
    }
    // Already invited but no reply yet → send a gentle reminder, not a fresh invite.
    const reminding = isAwaiting(g.status)
    const msg = reminding
      ? reminderMessage(event.coupleName, g.name, g.rsvpUrl)
      : inviteMessage(event.coupleName, g.name, g.rsvpUrl)
    const guestLike = { full_name: g.name, phone: g.phone, whatsapp_phone: g.whatsappPhone }
    const url = channel === 'whatsapp' ? whatsappShareUrl(guestLike, msg) : smsShareUrl(guestLike, msg)
    window.open(url, '_blank', 'noopener,noreferrer')
    recordSend(g.id, channel).catch(() => {})
    if (reminding)
      toast.success(fmt(strings.toast_reminder_ready, { name: firstNameOf(g.name) }))
  }

  function sendTest() {
    if (!testPhone.trim() || testSending) return
    setTestSending(true)
    startTransition(async () => {
      try {
        const res = await sendWhatsAppTestInvite(
          testPhone,
          { guestName: sampleGuest, coupleName: hostName, eventCategory: eventCat },
          eventId,
        )
        if (res.ok && res.dryRun) toast.success(`1 ${strings.send_verb_dryrun}`)
        else if (res.ok) toast.success(strings.test_sent)
        else toast.error(res.error ? `${strings.test_failed}: ${res.error}` : strings.test_failed)
      } finally {
        setTestSending(false)
      }
    })
  }

  function saveSettings() {
    if (!settingsValid) return
    startTransition(async () => {
      try {
        await saveInviteSendSettings(hostName, eventCat)
        toast.success(strings.toast_settings_saved)
        setEditingSettings(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_settings_saved)
      }
    })
  }

  function saveRowEdit() {
    if (!rowEdit) return
    const { id, name, phone } = rowEdit
    startTransition(async () => {
      try {
        await updateGuestBasics(id, name, phone)
        toast.success(strings.toast_guest_saved)
        setRowEdit(null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_send_failed)
      }
    })
  }

  function removeGuest() {
    if (!rowEdit) return
    const { id } = rowEdit
    startTransition(async () => {
      try {
        await deleteGuest(id)
        toast.success(strings.toast_guest_removed)
        setRowEdit(null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_send_failed)
      }
    })
  }

  function runBulkDelete() {
    const ids = [...selected]
    if (ids.length === 0) return
    startTransition(async () => {
      try {
        const n = await deleteGuests(ids)
        toast.success(fmt(strings.toast_guests_removed, { n }))
        setSelected(new Set())
        setConfirmBulkDelete(false)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_send_failed)
      }
    })
  }

  function addGuest() {
    if (!newGuest || !newGuest.name.trim()) return
    const { name, phone } = newGuest
    startTransition(async () => {
      try {
        await createGuest({
          full_name: name.replace(/\s+/g, ' ').trim(),
          phone: phone.trim() || null,
          whatsapp_phone: phone.trim() || null,
        })
        toast.success(strings.toast_guest_saved)
        setNewGuest(null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_send_failed)
      }
    })
  }

  function savePhone() {
    if (!phoneEdit) return
    const { id, value } = phoneEdit
    startTransition(async () => {
      try {
        await updateGuestPhone(id, value)
        setPhoneEdit(null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : strings.toast_send_failed)
      }
    })
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleSelectAll(on: boolean) {
    setSelected(on ? new Set(visible.map((g) => g.id)) : new Set())
  }

  const reportGroups: { label: string; outcome: WhatsAppSendResult['outcome'] }[] = [
    { label: strings.results_failed, outcome: 'failed' },
    { label: strings.results_blocked, outcome: 'blocked' },
    { label: strings.results_skipped, outcome: 'skipped' },
    { label: strings.results_sent, outcome: 'sent' },
  ]

  return (
    <div className="si">
      <style>{css}</style>

      <div className="head">
        <div>
          <h1>{strings.heading}</h1>
          <p className="sub">{strings.subheading}</p>
        </div>
        <div className="headacts">
          {events.length > 1 ? (
            <label className="evswitch">
              <span>{strings.event_switcher_label}</span>
              <select value={selectedEventId ?? ''} onChange={(e) => switchEvent(e.target.value)} disabled={pending}>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} · {e.eventTypeLabel}</option>
                ))}
              </select>
            </label>
          ) : null}
          <button className="btn ghost" onClick={() => setPreviewOpen(true)}>
            <Eye size={15} /> {strings.preview_button}
          </button>
        </div>
      </div>

      {/* Paid designs bought before this event existed, or before the couple
          had picked which event they're for — nudge them to assign one. */}
      {unassignedOrders.length > 0 ? (
        <div className="unassigned">
          <div className="uhead">
            <span className="dp">{strings.unassigned_pill}</span>
            <span>{fmt(strings.unassigned_note, { n: unassignedOrders.length })}</span>
          </div>
          <div className="ulist">
            {unassignedOrders.map((o) => (
              <div key={o.id} className="urow">
                {o.cardImageUrl ? (
                  <span className="uimg"><Image src={o.cardImageUrl} alt="" fill sizes="36px" className="object-cover" unoptimized /></span>
                ) : null}
                <span className="uname">{o.cardName ?? strings.card_fallback_label}</span>
                <span className="uguests">{fmt(strings.unassigned_guests, { n: o.purchasedGuests })}</span>
                <button className="btn ghost" disabled={pending} onClick={() => assignUnassignedOrder(o.id)}>
                  {fmt(strings.unassigned_assign, { event: event.eventName ?? event.coupleName })}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Event context */}
      <div className="ctx">
        <div className="ccard">
          {event.cardImageUrl ? (
            <Image
              src={event.cardImageUrl}
              alt={`${event.coupleName} invitation card`}
              fill
              sizes="92px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="ci">
              <span>{event.eventTypeLabel ? event.eventTypeLabel.toUpperCase() : strings.card_fallback_label}</span>
              <b>{headingName}</b>
              {event.dateLabel ? <span>{event.dateLabel.toUpperCase()}</span> : null}
            </div>
          )}
        </div>
        <div className="cinfo">
          <h3>{heading}</h3>
          <div className="row">
            {event.dateLabel ? <span>📅 {event.dateLabel}</span> : null}
            {event.venue ? <span>📍 {event.venue}</span> : null}
            {event.hasPaidOrder ? (
              <span className="badge">✓ {event.cardTier ? fmt(strings.card_purchased_tier, { tier: event.cardTier }) : strings.card_purchased}</span>
            ) : null}
          </div>

          {event.hasPaidOrder ? (
            <>
              <div className="pmeta">
                {event.cardTier ? (
                  <span className="fact"><i>{strings.fact_package}</i>{event.cardTier}</span>
                ) : null}
                {event.cardName ? (
                  <span className="fact"><i>{strings.fact_design}</i>{event.cardName}</span>
                ) : null}
                <span className="fact">
                  <i>{strings.fact_invites_paid}</i>
                  {fmt(strings.fact_to_share, { n: quota.purchased })}
                </span>
              </div>

              {event.addOns.length > 0 ? (
                <div className="addons">
                  <span className="al">{strings.addons_label}</span>
                  {event.addOns.map((a) => (
                    <span key={a} className="ao">{a}</span>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
        <Link href="/my/dashboard/events" className="chg">{strings.manage_events}</Link>
      </div>

      {/* Funnel + quota */}
      <div className="funnel">
        <div className="fc"><div className="n">{funnel.invited}</div><div className="l">{strings.funnel_invited}</div></div>
        <div className="fc"><div className="n">{funnel.delivered}</div><div className="l"><span className="ar">→</span> {strings.funnel_delivered}</div></div>
        <div className="fc"><div className="n">{funnel.viewed}</div><div className="l"><span className="ar">→</span> {strings.funnel_viewed}</div></div>
        <div className="fc"><div className="n">{funnel.rsvpd}</div><div className="l"><span className="ar">→</span> {strings.funnel_rsvpd}</div></div>
        <div className="fc quota">
          <div className="top"><span>{strings.quota_label}</span><span><b>{quota.used}</b> {fmt(strings.quota_used_suffix, { m: quota.purchased })}</span></div>
          <div className="bar"><i style={{ width: `${pct}%` }} /></div>
          <div className="ft">{fmt(strings.quota_remaining, { n: quota.remaining })} · <Link href="/invitations/catalog">{strings.quota_topup}</Link></div>
        </div>
      </div>
      <div className="livehint"><span className="pulse" />{strings.live_hint}</div>

      {/* Two modes: Targeted is the product's core, Broadcast is secondary */}
      <div className="modes">
        <section className="mode primary">
          <div className="hrow"><div><div className="tag">{strings.targeted_tag}</div><h2>{strings.targeted_title}</h2></div></div>
          <p>{strings.targeted_desc}</p>
          {editingSettings ? (
            <div className="vars">
              <div className="vlegend">{strings.settings_legend}</div>
              <div className="vgrid two">
                <label className="vfield">
                  <span>{strings.field_host_label}</span>
                  <input value={hostName} onChange={(e) => setHostName(e.target.value)} maxLength={60} />
                </label>
                <CategoryField
                  value={eventCat}
                  onChange={setEventCat}
                  label={strings.field_category_label}
                  otherLabel={strings.field_category_other}
                />
              </div>
              <div className="vsave">
                <p className="mutedp">{strings.settings_required_note}</p>
                <div className="vbtns">
                  {data.sendSettings.confirmed ? (
                    <button
                      className="btn ghost"
                      disabled={pending}
                      title={strings.preview_close}
                      onClick={() => {
                        setHostName(data.sendSettings.hostName)
                        setEventCat(data.sendSettings.eventCategory)
                        setEditingSettings(false)
                      }}
                    ><X size={14} /></button>
                  ) : null}
                  <button className="btn solid" disabled={pending || !settingsValid} onClick={saveSettings}>
                    <Check size={14} /> {strings.save_number}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="vars saved">
              <div className="vlegend ok"><Check size={13} /> {strings.settings_legend}</div>
              <div className="vsummary">
                <span className="vchip"><i>{strings.field_host_label}</i>{hostName}</span>
                <span className="vchip"><i>{strings.field_category_label}</i>{capitalize(eventCat)}</span>
                <button className="btn ghost vedit" disabled={pending} onClick={() => setEditingSettings(true)}>
                  <Pencil size={13} /> {strings.settings_edit}
                </button>
              </div>
            </div>
          )}
          <div className="chips">
            <button
              className="btn pri lg"
              disabled={pending || notSentCount === 0}
              onClick={() => stageBulkSend(guests.filter((g) => g.status === 'none').map((g) => g.id))}
            >
              <MessageCircle size={16} /> {fmt(strings.send_all_notsent, { n: notSentCount })}
            </button>
            {awaitingCount > 0 ? (
              <button className="chip remind" disabled={pending} onClick={remindAwaiting}>
                <BellRing size={15} />{fmt(strings.remind_awaiting, { n: awaitingCount })}
              </button>
            ) : null}
            <button className="chip" onClick={() => setPreviewOpen(true)}>
              <Eye size={15} />{strings.preview_button}
            </button>
          </div>
          {!whatsappLive ? (
            <div className="connect">
              <span className="dp">{strings.dryrun_pill}</span>
              <span>{strings.dryrun_note}</span>
            </div>
          ) : null}
          <div className="note"><span className="k">{strings.best_for}</span><span>{strings.targeted_best_for}</span></div>
        </section>

        <section className="mode">
          <div className="hrow">
            <div><div className="tag">{strings.broadcast_tag}</div><h2>{strings.broadcast_title}</h2></div>
            <button
              className={`tg ${publicLink.enabled ? 'on' : 'off'}`}
              onClick={toggleSharing}
              disabled={pending}
              title={publicLink.enabled ? strings.sharing_on : strings.sharing_off}
              aria-label={strings.sharing_toggle_aria}
            ><i /></button>
          </div>
          <p>{strings.broadcast_desc}</p>

          {publicLink.enabled && publicLink.url ? (
            <>
              <div className="linkbox">
                <code>{publicLink.url.replace(/^https?:\/\//, '')}</code>
                <button className="copybtn" onClick={copyLink}>{copied ? strings.copy_done : strings.copy}</button>
              </div>
              <div className="chips">
                <button className="chip wa" onClick={() => shareLink('whatsapp')}><MessageCircle size={15} />{strings.chip_whatsapp}</button>
                <button className="chip sms" onClick={() => shareLink('sms')}><Smartphone size={15} />{strings.chip_sms}</button>
                <button className="chip copy" onClick={copyLink}><Copy size={15} />{strings.chip_copy_link}</button>
                <button className="chip qr" onClick={() => shareLink('qr')}><ExternalLink size={15} />{strings.chip_open}</button>
              </div>
            </>
          ) : (
            <div className="linkbox off"><code>{strings.link_off_placeholder}</code></div>
          )}

          <div className="note"><span className="k">{strings.best_for}</span><span>{strings.broadcast_best_for}</span></div>
        </section>
      </div>

      {/* Guest table */}
      <div className="gt">
        <div className="gth">
          <input
            type="checkbox"
            className="ck"
            checked={visible.length > 0 && selected.size === visible.length}
            onChange={(e) => toggleSelectAll(e.target.checked)}
          />
          <h2>{strings.guest_list}</h2><span className="cnt">{fmt(strings.guest_count, { n: guests.length })}</span>
          <input
            className="gsearch"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={strings.search_placeholder}
            aria-label={strings.search_aria}
          />
          <div className="acts">
            <div className="seg" role="tablist" aria-label={strings.filter_aria}>
              <button className={`sg ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
                {strings.filter_all}
              </button>
              <button className={`sg ${filter === 'notsent' ? 'on' : ''}`} onClick={() => setFilter('notsent')}>
                {strings.filter_notsent}{notSentCount ? ` ${notSentCount}` : ''}
              </button>
              <button className={`sg ${filter === 'awaiting' ? 'on' : ''}`} onClick={() => setFilter('awaiting')}>
                {strings.filter_awaiting}{awaitingCount ? ` ${awaitingCount}` : ''}
              </button>
            </div>
            {selected.size > 0 ? <span className="selcnt">{fmt(strings.selected_count, { n: selected.size })}</span> : null}
            {selected.size > 0 ? (
              <button className="btn ghost danger" disabled={pending} onClick={() => setConfirmBulkDelete(true)}>
                <Trash2 size={14} /> {strings.bulk_delete}
              </button>
            ) : null}
            <button className="btn ghost" disabled={pending} onClick={() => setNewGuest({ name: '', phone: '' })}>
              <Plus size={14} /> {strings.add_guest}
            </button>
            <button className="btn pri" disabled={pending || selected.size === 0} onClick={() => stageBulkSend([...selected])}>
              {strings.send_to_selected} <ArrowRight size={15} />
            </button>
          </div>
        </div>
        {visible.length === 0 && !newGuest ? (
          <div className="empty">
            {search.trim()
              ? strings.empty_search
              : filter === 'notsent'
                ? strings.empty_notsent
                : filter === 'awaiting'
                  ? strings.empty_awaiting
                  : strings.empty_none}
          </div>
        ) : (
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 30 }}></th><th>{strings.th_guest}</th><th>{strings.th_contact}</th>
                  <th>{strings.th_channel}</th><th>{strings.th_status}</th><th style={{ textAlign: 'right' }}>{strings.th_send}</th>
                </tr>
              </thead>
              <tbody>
                {newGuest ? (
                  <tr>
                    <td></td>
                    <td className="who">
                      <input
                        className="einp"
                        autoFocus
                        placeholder={strings.th_guest}
                        value={newGuest.name}
                        onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') addGuest(); if (e.key === 'Escape') setNewGuest(null) }}
                      />
                    </td>
                    <td className="contact">
                      <input
                        className="einp"
                        placeholder={strings.test_placeholder}
                        value={newGuest.phone}
                        onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') addGuest(); if (e.key === 'Escape') setNewGuest(null) }}
                        inputMode="tel"
                      />
                    </td>
                    <td colSpan={2}></td>
                    <td>
                      <div className="ra">
                        <button className="ia send" disabled={pending || !newGuest.name.trim()} onClick={addGuest}>
                          <Check size={14} /> {strings.save_number}
                        </button>
                        <button className="ia" disabled={pending} onClick={() => setNewGuest(null)} title={strings.preview_close}><X size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ) : null}
                {visible.map((g) =>
                  rowEdit?.id === g.id ? (
                    <tr key={g.id}>
                      <td></td>
                      <td className="who">
                        <input
                          className="einp"
                          autoFocus
                          value={rowEdit.name}
                          onChange={(e) => setRowEdit({ ...rowEdit, name: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveRowEdit(); if (e.key === 'Escape') setRowEdit(null) }}
                        />
                      </td>
                      <td className="contact">
                        <input
                          className="einp"
                          placeholder={strings.test_placeholder}
                          value={rowEdit.phone}
                          onChange={(e) => setRowEdit({ ...rowEdit, phone: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveRowEdit(); if (e.key === 'Escape') setRowEdit(null) }}
                          inputMode="tel"
                        />
                      </td>
                      <td colSpan={2}></td>
                      <td>
                        <div className="ra">
                          <button className="ia send" disabled={pending} onClick={saveRowEdit}>
                            <Check size={14} /> {strings.save_number}
                          </button>
                          <button
                            className="ia danger"
                            disabled={pending}
                            title={strings.row_delete}
                            onClick={() => (rowEdit.askDelete ? removeGuest() : setRowEdit({ ...rowEdit, askDelete: true }))}
                          >
                            <Trash2 size={14} />
                            {rowEdit.askDelete ? strings.row_delete_confirm : null}
                          </button>
                          <button className="ia" disabled={pending} onClick={() => setRowEdit(null)} title={strings.preview_close}><X size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                  <tr key={g.id}>
                    <td><input type="checkbox" className="ck" checked={selected.has(g.id)} onChange={() => toggleSelect(g.id)} /></td>
                    <td className="who">{g.name}</td>
                    <td className="contact">
                      {g.phone ?? g.whatsappPhone ?? (
                        phoneEdit?.id === g.id ? (
                          <span className="pedit">
                            <input
                              autoFocus
                              value={phoneEdit.value}
                              onChange={(e) => setPhoneEdit({ id: g.id, value: e.target.value })}
                              onKeyDown={(e) => { if (e.key === 'Enter') savePhone(); if (e.key === 'Escape') setPhoneEdit(null) }}
                              placeholder={strings.test_placeholder}
                            />
                            <button className="mini-btn" disabled={pending} onClick={savePhone}>{strings.save_number}</button>
                            <button className="mini-btn ghost" onClick={() => setPhoneEdit(null)} aria-label={strings.preview_close}><X size={12} /></button>
                          </span>
                        ) : (
                          <button className="addnum" onClick={() => setPhoneEdit({ id: g.id, value: '' })}>
                            <Plus size={12} /> {strings.add_number}
                          </button>
                        )
                      )}
                    </td>
                    <td>
                      <span className={`mini ${g.channel}`}>{g.channel === 'whatsapp' ? <MessageCircle size={13} /> : <Smartphone size={13} />}{g.channel === 'whatsapp' ? strings.channel_whatsapp : strings.channel_sms}</span>
                    </td>
                    <td><span className={`status ${STATUS_CLASS[g.status]}`}>{g.statusLabel}</span></td>
                    <td>
                      <div className="ra">
                        <button
                          className="ia send"
                          disabled={pending || !hasPhone(g)}
                          title={strings.row_whatsapp}
                          onClick={() => rowShare(g, 'whatsapp')}
                        >
                          {sendingRow === g.id ? <Loader2 size={14} className="spin" /> : <MessageCircle size={14} />}
                          {g.status === 'none' ? strings.row_send : strings.row_resend}
                        </button>
                        <button className="ia" disabled={pending || !hasPhone(g)} title={strings.row_sms} onClick={() => rowShare(g, 'sms')}><Smartphone size={15} /></button>
                        <button className="ia" disabled={pending} title={strings.row_copy} onClick={() => rowShare(g, 'copy')}><Copy size={15} /></button>
                        <button
                          className="ia"
                          disabled={pending}
                          title={strings.row_edit}
                          onClick={() => setRowEdit({ id: g.id, name: g.name, phone: g.phone ?? g.whatsappPhone ?? '', askDelete: false })}
                        ><Pencil size={14} /></button>
                      </div>
                    </td>
                  </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk-send confirm — the couple must approve {{2}}/{{3}} to send */}
      {confirmSend ? (
        <div className="ovl" onClick={() => setConfirmSend(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{strings.confirm_title}</h3>
            <p className="big">{fmt(strings.confirm_recipients, { n: confirmSend.recipients })}</p>
            {confirmSend.credits > 0 ? (
              <p className="mutedp">{fmt(strings.confirm_credits, { n: confirmSend.credits, m: quota.remaining })}</p>
            ) : null}
            <div className="vars">
              <div className="vlegend">{strings.settings_legend}</div>
              <label className="vfield">
                <span>{strings.field_host_label}</span>
                <input value={hostName} onChange={(e) => setHostName(e.target.value)} maxLength={60} />
              </label>
              <CategoryField
                value={eventCat}
                onChange={setEventCat}
                label={strings.field_category_label}
                otherLabel={strings.field_category_other}
              />
              <p className="mutedp">{strings.settings_required_note}</p>
            </div>
            <div className="mrow">
              <button className="btn ghost" onClick={() => setConfirmSend(null)}>{strings.confirm_cancel}</button>
              <button
                className="btn pri"
                disabled={pending || !settingsValid}
                onClick={() => runBulkSend(confirmSend.ids, confirmSend.reminder)}
              >
                <MessageCircle size={15} /> {strings.confirm_confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bulk-delete confirm */}
      {confirmBulkDelete ? (
        <div className="ovl" onClick={() => setConfirmBulkDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{strings.bulk_delete_title}</h3>
            <p className="big">{fmt(strings.bulk_delete_body, { n: selected.size })}</p>
            <div className="mrow">
              <button className="btn ghost" onClick={() => setConfirmBulkDelete(false)}>{strings.confirm_cancel}</button>
              <button className="btn dangerfill" disabled={pending} onClick={runBulkDelete}>
                <Trash2 size={14} /> {strings.bulk_delete_confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Invite preview + test send */}
      {previewOpen ? (
        <div className="ovl" onClick={() => setPreviewOpen(false)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="mhead">
              <h3>{strings.preview_title}</h3>
              <button className="xbtn" onClick={() => setPreviewOpen(false)} aria-label={strings.preview_close}><X size={16} /></button>
            </div>
            <p className="mutedp">{strings.preview_note}</p>
            <div className="pgrid">
              <div>
                <div className="vars">
                  <div className="vlegend">{strings.settings_legend}</div>
                  <div className="vgrid">
                    <label className="vfield">
                      <span>{strings.field_guest_label}</span>
                      <input value={sampleGuest} onChange={(e) => setSampleGuest(e.target.value)} maxLength={40} />
                    </label>
                    <label className="vfield">
                      <span>{strings.field_host_label}</span>
                      <input value={hostName} onChange={(e) => setHostName(e.target.value)} maxLength={60} />
                    </label>
                    <CategoryField
                      value={eventCat}
                      onChange={setEventCat}
                      label={strings.field_category_label}
                      otherLabel={strings.field_category_other}
                    />
                  </div>
                  <p className="mutedp">{strings.settings_required_note}</p>
                </div>
                <div className="testrow">
                  <label htmlFor="si-test-phone">{strings.test_label}</label>
                  <div className="trow">
                    <input
                      id="si-test-phone"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder={strings.test_placeholder}
                      inputMode="tel"
                    />
                    <button className="btn solid" disabled={testSending || !testPhone.trim() || !event.hasPaidOrder} onClick={sendTest}>
                      {testSending ? <Loader2 size={14} className="spin" /> : <MessageCircle size={14} />} {strings.test_send}
                    </button>
                  </div>
                </div>
              </div>
              <div className="wawrap">
                <div className="wabubble">
                  {event.cardImageUrl ? (
                    <Image
                      src={event.cardImageUrl}
                      alt=""
                      width={760}
                      height={1064}
                      className="waimgfull"
                      unoptimized
                    />
                  ) : (
                    <div className="waimg">
                      <div className="waimg-ph"><b>{event.coupleName}</b></div>
                    </div>
                  )}
                  <div className="wabody">{waText(previewBody)}</div>
                  <div className="wafoot">{INVITE_TEMPLATE.footer}</div>
                  {INVITE_TEMPLATE.buttons.map((b) => (
                    <div key={b.index} className="wabtn">↩ {b.label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Send report drawer */}
      {report ? (
        <div className="ovl right" onClick={() => setReport(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mhead">
              <h3>{strings.results_title}</h3>
              <button className="xbtn" onClick={() => setReport(null)} aria-label={strings.results_close}><X size={16} /></button>
            </div>
            <div className="dsum">
              <span className="ds ok">{report.sent} {strings.results_sent}</span>
              {report.failed > 0 ? <span className="ds bad">{report.failed} {strings.results_failed}</span> : null}
              {report.skipped > 0 ? <span className="ds warn">{report.skipped} {strings.results_skipped}</span> : null}
              {report.blocked > 0 ? <span className="ds warn">{report.blocked} {strings.results_blocked}</span> : null}
            </div>
            <div className="dlist">
              {reportGroups.map(({ label, outcome }) => {
                const rows = report.results.filter((r) => r.outcome === outcome)
                if (rows.length === 0) return null
                return (
                  <div key={outcome} className="dgroup">
                    <div className={`dglabel ${outcome}`}>{label}</div>
                    {rows.map((r) => (
                      <div key={r.id} className="drow">
                        <span className="dname">{r.name}</span>
                        {r.outcome === 'sent' && r.resend ? <span className="dtag">{strings.results_resend_tag}</span> : null}
                        {r.error ? <span className="derr">{r.error}</span> : null}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
            <div className="mrow">
              {report.failed > 0 ? (
                <button className="btn ghost" disabled={pending} onClick={retryFailed}>
                  <RotateCcw size={14} /> {strings.results_retry}
                </button>
              ) : null}
              <button className="btn pri" onClick={() => setReport(null)}>{strings.results_close}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const css = `
.si{ --purple:#6B3FA0; --purple-d:#4A2870; --lav:#D7BDE8; --lav-btn:#DCC3EC; --lav-soft:#F6EEFB;
  --ink:#1c1b1f; --muted:#8b8790; --faint:#b6b2ba; --line:#ededf0; --hover:#faf8fc;
  --wa:#25D366; --sms:#3478F6; --amber-bg:#FFFBEB; --amber-bd:#FBE8B0; --amber-tx:#8a6d1a;
  --ok-bg:#EAF6EF; --ok-tx:#2E7D55; --bad-bg:#fcecec; --bad-tx:#c0392b;
  --radius:16px; --soft:0 1px 2px rgba(20,18,30,.05);
  color:var(--ink); }
.si .serif, .si h1, .si h2, .si h3, .si .n, .si .ci b{ font-family:var(--font-cormorant),Georgia,serif; }
.si h1{ font-weight:600; font-size:30px; letter-spacing:-.3px; }
.si .head{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.si .headacts{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.si .evswitch{ display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; color:var(--muted); }
.si .evswitch select{ border:1px solid var(--line); border-radius:10px; padding:8px 12px; font-size:13px;
  font-weight:600; color:var(--ink); background:#fff; max-width:240px; }
.si .evswitch select:focus{ outline:none; border-color:var(--lav); }
.si .unassigned{ margin-top:18px; padding:14px 16px; border:1px solid var(--amber-bd); background:var(--amber-bg);
  border-radius:var(--radius); }
.si .uhead{ display:flex; align-items:center; gap:10px; font-size:12.5px; color:var(--amber-tx); flex-wrap:wrap; }
.si .uhead .dp{ background:var(--amber-bd); color:var(--amber-tx); font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:999px; flex:none; }
.si .ulist{ display:flex; flex-direction:column; gap:8px; margin-top:12px; }
.si .urow{ display:flex; align-items:center; gap:10px; background:#fff; border:1px solid var(--amber-bd);
  border-radius:12px; padding:8px 10px; flex-wrap:wrap; }
.si .uimg{ position:relative; width:36px; height:48px; flex:none; border-radius:6px; overflow:hidden; }
.si .uname{ font-weight:600; font-size:13px; color:var(--ink); }
.si .uguests{ font-size:12px; color:var(--muted); }
.si .urow .btn{ margin-left:auto; }
.si .sub{ color:var(--muted); font-size:14px; margin-top:6px; max-width:640px; line-height:1.5; }
.si .btn{ border:none; border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 16px; cursor:pointer;
  display:inline-flex; align-items:center; gap:7px; transition:filter .12s, transform .08s; }
.si .btn:hover{ filter:brightness(.97); transform:translateY(-1px); }
.si .btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; }
.si .btn.pri{ background:var(--lav-btn); color:var(--purple-d); box-shadow:var(--soft); }
.si .btn.lg{ padding:11px 20px; font-size:14px; background:var(--purple); color:#fff; }
.si .btn.ghost{ background:#fff; color:var(--ink); border:1px solid var(--line); }
.si .btn.solid{ background:var(--purple); color:#fff; box-shadow:var(--soft); }
.si .btn.ghost.danger{ color:var(--bad-tx); border-color:#f2c9c9; }
.si .btn.ghost.danger:hover{ background:var(--bad-bg); }
.si .btn.dangerfill{ background:var(--bad-tx); color:#fff; }
.si .spin{ animation:si-spin .8s linear infinite; }
@keyframes si-spin{ to{ transform:rotate(360deg); } }
.si .ctx{ display:flex; gap:20px; align-items:center; background:#fff; border:1px solid var(--line);
  border-radius:var(--radius); padding:18px; margin:22px 0 18px; box-shadow:var(--soft); }
.si .ccard{ width:92px; height:124px; flex:none; border-radius:12px; position:relative; overflow:hidden;
  background:linear-gradient(155deg,var(--purple),var(--lav)); }
.si .ccard .ci{ position:absolute; inset:9px; border:1px solid rgba(255,255,255,.55); border-radius:7px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; text-align:center; color:#fff; }
.si .ccard .ci b{ font-size:14px; }
.si .ccard .ci span{ font-size:7px; letter-spacing:1.2px; opacity:.85; }
.si .ctx h3{ font-size:20px; font-weight:600; }
.si .ctx .row{ display:flex; gap:16px; color:var(--muted); font-size:13px; margin-top:8px; flex-wrap:wrap; align-items:center; }
.si .badge{ display:inline-flex; align-items:center; gap:6px; background:var(--ok-bg); color:var(--ok-tx);
  font-size:11.5px; font-weight:600; padding:4px 11px; border-radius:999px; }
.si .ctx .chg{ margin-left:auto; align-self:flex-start; font-size:13px; color:var(--purple); font-weight:600; text-decoration:none; }
.si .cinfo{ min-width:0; }
.si .pmeta{ display:flex; flex-wrap:wrap; gap:10px 26px; margin-top:14px; }
.si .pmeta .fact{ display:inline-flex; flex-direction:column; gap:2px; font-size:14px; font-weight:600; color:var(--ink); }
.si .pmeta .fact i{ font-style:normal; font-size:10px; font-weight:600; letter-spacing:.6px; text-transform:uppercase; color:var(--faint); }
.si .addons{ display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:14px; }
.si .addons .al{ font-size:10px; font-weight:600; letter-spacing:.6px; text-transform:uppercase; color:var(--faint); }
.si .addons .ao{ display:inline-flex; align-items:center; background:var(--lav-soft); color:var(--purple-d);
  font-size:12px; font-weight:600; padding:5px 12px; border-radius:999px; }
.si .funnel{ display:grid; grid-template-columns:repeat(4,1fr) 1.5fr; gap:12px; }
.si .fc{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:16px 18px; box-shadow:var(--soft); }
.si .fc .n{ font-size:27px; line-height:1; font-weight:600; }
.si .fc .l{ font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin-top:8px; }
.si .fc .l .ar{ color:var(--lav); font-weight:700; }
.si .quota .top{ display:flex; justify-content:space-between; font-size:12px; color:var(--muted); margin-bottom:9px; }
.si .quota .top b{ color:var(--ink); }
.si .bar{ height:7px; background:var(--lav-soft); border-radius:999px; overflow:hidden; }
.si .bar i{ display:block; height:100%; background:linear-gradient(90deg,var(--purple),var(--lav)); }
.si .quota .ft{ font-size:11px; color:var(--muted); margin-top:9px; }
.si .quota .ft a{ color:var(--purple); font-weight:600; text-decoration:none; }
.si .livehint{ display:flex; align-items:center; gap:7px; color:var(--faint); font-size:11px; margin:8px 2px 22px; }
.si .pulse{ width:7px; height:7px; border-radius:50%; background:var(--ok-tx); animation:si-pulse 2.4s ease-in-out infinite; }
@keyframes si-pulse{ 0%,100%{ opacity:.35 } 50%{ opacity:1 } }
.si .modes{ display:grid; grid-template-columns:1.4fr 1fr; gap:16px; }
.si .mode{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:22px; box-shadow:var(--soft);
  display:flex; flex-direction:column; }
.si .mode.primary{ border-color:var(--lav); box-shadow:0 2px 10px rgba(107,63,160,.08); }
.si .tag{ font-size:10.5px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--lav); }
.si .mode.primary .tag{ color:var(--purple); }
.si .mode h2{ font-size:20px; margin-top:6px; font-weight:600; }
.si .mode p{ color:var(--muted); font-size:13px; margin-top:8px; line-height:1.55; }
.si .mode p b{ color:var(--ink); font-weight:600; }
.si .hrow{ display:flex; justify-content:space-between; align-items:flex-start; }
.si .linkbox{ display:flex; align-items:center; gap:10px; background:var(--lav-soft); border-radius:12px;
  padding:10px 12px 10px 14px; margin-top:16px; }
.si .linkbox.off{ background:#f6f5f8; }
.si .linkbox code{ font-family:ui-monospace,monospace; font-size:12.5px; color:var(--purple-d); flex:1;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.si .linkbox.off code{ color:var(--muted); }
.si .linkbox .copybtn{ border:none; background:var(--purple); color:#fff; font-weight:600; font-size:12px;
  padding:7px 14px; border-radius:999px; cursor:pointer; }
.si .chips{ display:flex; gap:9px; margin-top:16px; flex-wrap:wrap; align-items:center; }
.si .chip{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--line); background:#fff;
  border-radius:11px; padding:9px 13px; font-size:13px; font-weight:600; cursor:pointer; color:var(--ink);
  transition:border-color .12s, background .12s; }
.si .chip:hover{ background:var(--hover); border-color:var(--lav); }
.si .chip:disabled{ opacity:.5; cursor:not-allowed; }
.si .chip.wa svg{ color:var(--wa); } .si .chip.sms svg{ color:var(--sms); }
.si .chip.copy svg{ color:var(--purple); } .si .chip.qr svg{ color:var(--ink); }
.si .chip.remind svg{ color:#E0A458; }
.si .note{ display:flex; gap:8px; align-items:flex-start; margin-top:auto; padding-top:16px; font-size:12px; color:var(--muted); }
.si .note .k{ color:var(--purple); font-weight:600; }
.si .tg{ position:relative; width:42px; height:24px; border-radius:999px; cursor:pointer; flex:none; border:none; padding:0; }
.si .tg.on{ background:var(--purple); } .si .tg.off{ background:#d7d4da; }
.si .tg i{ position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:left .15s; }
.si .tg.on i{ left:21px; } .si .tg.off i{ left:3px; }
.si .connect{ display:flex; align-items:center; gap:10px; margin-top:16px; padding:11px 14px; border-radius:12px;
  background:var(--amber-bg); border:1px solid var(--amber-bd); font-size:12.5px; color:var(--amber-tx); line-height:1.4; }
.si .connect .dp{ background:var(--amber-bd); color:var(--amber-tx); font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:999px; flex:none; }
.si .gt{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); margin-top:24px; box-shadow:var(--soft); overflow:hidden; }
.si .gth{ display:flex; align-items:center; gap:14px; padding:18px 20px; border-bottom:1px solid var(--line); flex-wrap:wrap; }
.si .gth h2{ font-size:18px; font-weight:600; }
.si .gth .cnt{ color:var(--muted); font-size:12px; }
.si .gth .gsearch{ flex:0 1 240px; min-width:150px; border:1px solid var(--line); border-radius:10px;
  padding:8px 12px; font-size:13px; color:var(--ink); background:#fff; }
.si .gth .gsearch:focus{ outline:none; border-color:var(--lav); }
.si .gth .acts{ margin-left:auto; display:flex; gap:9px; align-items:center; flex-wrap:wrap; }
.si .selcnt{ font-size:12px; font-weight:600; color:var(--purple-d); background:var(--lav-soft); padding:5px 11px; border-radius:999px; }
.si .seg{ display:inline-flex; border:1px solid var(--line); border-radius:10px; overflow:hidden; }
.si .seg .sg{ background:#fff; border:none; padding:8px 12px; font-size:12.5px; font-weight:600; color:var(--muted); cursor:pointer; }
.si .seg .sg + .sg{ border-left:1px solid var(--line); }
.si .seg .sg.on{ background:var(--lav-soft); color:var(--purple-d); }
.si .seg .sg:hover:not(.on){ background:var(--hover); }
.si .empty{ padding:40px 20px; text-align:center; color:var(--muted); font-size:14px; }
.si .scroll{ overflow-x:auto; }
.si table{ width:100%; border-collapse:collapse; font-size:13.5px; min-width:720px; }
.si th{ text-align:left; font-size:10.5px; letter-spacing:.6px; text-transform:uppercase; color:var(--faint);
  padding:12px 20px; border-bottom:1px solid var(--line); font-weight:600; position:sticky; top:0; background:#fff; z-index:1; }
.si td{ padding:14px 20px; border-bottom:1px solid var(--line); }
.si tr:last-child td{ border-bottom:none; }
.si tbody tr:hover td{ background:var(--hover); }
.si .who{ font-weight:600; } .si .contact{ color:var(--muted); font-size:12px; }
.si .addnum{ display:inline-flex; align-items:center; gap:5px; border:1px dashed var(--lav); background:var(--lav-soft);
  color:var(--purple-d); font-size:11.5px; font-weight:600; padding:5px 10px; border-radius:999px; cursor:pointer; }
.si .pedit{ display:inline-flex; align-items:center; gap:6px; }
.si .pedit input{ width:130px; border:1px solid var(--lav); border-radius:8px; padding:5px 8px; font-size:12px; }
.si .pedit input:focus{ outline:none; border-color:var(--purple); }
.si .mini-btn{ border:none; background:var(--purple); color:#fff; font-size:11px; font-weight:600; padding:5px 10px;
  border-radius:999px; cursor:pointer; display:inline-flex; align-items:center; }
.si .mini-btn.ghost{ background:#fff; color:var(--muted); border:1px solid var(--line); }
.si .mini-btn:disabled{ opacity:.5; }
.si .mini{ display:inline-flex; align-items:center; gap:7px; border:1px solid var(--line); border-radius:9px;
  padding:5px 10px; font-size:12px; font-weight:600; }
.si .mini.whatsapp svg{ color:var(--wa); } .si .mini.sms svg{ color:var(--sms); }
.si .status{ display:inline-flex; align-items:center; font-size:11.5px; font-weight:600; padding:4px 11px; border-radius:999px; }
.si .s-none{ background:#f3f2f5; color:var(--muted); }
.si .s-sent{ background:var(--lav-soft); color:var(--purple); }
.si .s-view{ background:#eef3ff; color:var(--sms); }
.si .s-yes{ background:var(--ok-bg); color:var(--ok-tx); }
.si .s-no{ background:var(--bad-bg); color:var(--bad-tx); }
.si .s-maybe{ background:#fff5e6; color:#b9791a; }
.si .ra{ display:flex; gap:7px; justify-content:flex-end; align-items:center; }
.si .ia{ height:32px; min-width:32px; padding:0 8px; border-radius:9px; border:1px solid var(--line); background:#fff; cursor:pointer;
  display:inline-flex; align-items:center; justify-content:center; gap:6px; font-size:12px; font-weight:600; color:var(--ink); }
.si .ia:hover{ background:var(--hover); border-color:var(--lav); }
.si .ia:disabled{ opacity:.45; cursor:not-allowed; }
.si .ia.send{ background:var(--purple); border-color:var(--purple); color:#fff; padding:0 12px; }
.si .ia.send:hover{ filter:brightness(1.06); background:var(--purple); }
.si .ia.danger{ color:var(--bad-tx); }
.si .ia.danger:hover{ border-color:var(--bad-tx); background:var(--bad-bg); }
.si .einp{ width:100%; max-width:220px; border:1px solid var(--lav); border-radius:8px; padding:6px 9px; font-size:13px; background:#fff; }
.si .einp:focus{ outline:none; border-color:var(--purple); }
.si .ck{ width:15px; height:15px; accent-color:var(--purple); }

/* Overlays: confirm modal, preview modal, report drawer */
.si .ovl{ position:fixed; inset:0; background:rgba(28,27,31,.42); z-index:60; display:flex; align-items:center; justify-content:center; padding:18px; }
.si .ovl.right{ justify-content:flex-end; padding:0; }
.si .modal{ background:#fff; border-radius:18px; padding:24px; width:min(440px,100%); box-shadow:0 18px 50px rgba(20,18,30,.25); }
.si .modal.wide{ width:min(960px,96vw); max-height:92vh; overflow-y:auto; }
.si .pgrid{ display:grid; grid-template-columns:1fr 1.1fr; gap:20px; margin-top:16px; align-items:start; }
.si .pgrid .vars{ margin-top:0; }
.si .pgrid .vgrid{ grid-template-columns:1fr; }
.si .pgrid .wawrap{ margin-top:0; display:flex; align-items:center; justify-content:center; min-height:100%; }
@media(max-width:760px){ .si .pgrid{ grid-template-columns:1fr; } }
.si .modal h3{ font-size:21px; font-weight:600; }
.si .modal .big{ font-size:14.5px; margin-top:12px; line-height:1.5; }
.si .mutedp{ color:var(--muted); font-size:12.5px; margin-top:8px; line-height:1.5; }
.si .mrow{ display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
.si .mhead{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.si .xbtn{ border:none; background:#f3f2f5; color:var(--muted); width:30px; height:30px; border-radius:50%; cursor:pointer;
  display:grid; place-items:center; }
.si .wawrap{ margin-top:16px; background:#EFE7DD; border-radius:14px; padding:18px; }
.si .wabubble{ background:#fff; border-radius:10px; padding:6px; width:min(380px,100%); margin:0 auto;
  box-shadow:0 1px 1px rgba(0,0,0,.08); font-size:13.5px; line-height:1.45; }
.si .waimg{ position:relative; width:100%; aspect-ratio:4/3; border-radius:7px; overflow:hidden; background:linear-gradient(155deg,var(--purple),var(--lav)); }
.si .waimgfull{ display:block; width:100%; height:auto; border-radius:7px; }
.si .waimg-ph{ position:absolute; inset:0; display:grid; place-items:center; color:#fff; font-family:var(--font-cormorant),Georgia,serif; font-size:18px; }
.si .wabody{ padding:9px 6px 4px; color:#111; white-space:normal; }
.si .wafoot{ padding:0 6px 8px; color:#8a8a8a; font-size:11px; }
.si .wabtn{ border-top:1px solid #f0f0f0; text-align:center; color:#34B7F1; font-weight:600; font-size:13px; padding:9px 4px; }
.si .vars{ margin-top:16px; padding:14px; border:1px solid var(--line); border-radius:12px; background:var(--hover); }
.si .vlegend{ font-size:10.5px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--purple); margin-bottom:10px; }
.si .vgrid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
.si .vgrid.two{ grid-template-columns:1fr 1fr; }
.si .vsave{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:4px; }
.si .vsave .mutedp{ margin-top:0; }
.si .vbtns{ display:flex; gap:8px; flex:none; }
.si .vars.saved{ background:var(--ok-bg); border-color:#cfe8da; }
.si .vlegend.ok{ color:var(--ok-tx); display:inline-flex; align-items:center; gap:5px; }
.si .vsummary{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.si .vchip{ display:inline-flex; flex-direction:column; gap:2px; background:#fff; border:1px solid #dcebe2;
  border-radius:10px; padding:8px 14px; font-size:13.5px; font-weight:600; color:var(--ink); }
.si .vchip i{ font-style:normal; font-size:9.5px; font-weight:600; letter-spacing:.6px; text-transform:uppercase; color:var(--faint); }
.si .vedit{ margin-left:auto; }
.si .vfield{ display:flex; flex-direction:column; gap:5px; }
.si .vfield + .vfield{ margin-top:10px; }
.si .vgrid .vfield + .vfield{ margin-top:0; }
.si .vfield span{ font-size:11px; font-weight:600; color:var(--muted); }
.si .vfield input, .si .vfield select{ width:100%; border:1px solid var(--line); border-radius:9px; padding:8px 10px; font-size:13px; background:#fff; color:var(--ink); }
.si .vfield input:focus, .si .vfield select:focus{ outline:none; border-color:var(--lav); }
@media(max-width:640px){ .si .vgrid{ grid-template-columns:1fr; } }
.si .testrow{ margin-top:18px; }
.si .testrow label{ font-size:12px; font-weight:600; color:var(--muted); }
.si .trow{ display:flex; gap:9px; margin-top:8px; }
.si .trow input{ flex:1; border:1px solid var(--line); border-radius:10px; padding:9px 12px; font-size:13px; }
.si .trow input:focus{ outline:none; border-color:var(--lav); }
.si .drawer{ background:#fff; width:min(420px,94vw); height:100%; padding:22px; overflow-y:auto; display:flex; flex-direction:column;
  box-shadow:-16px 0 40px rgba(20,18,30,.18); animation:si-slide .18s ease-out; }
@keyframes si-slide{ from{ transform:translateX(24px); opacity:.4 } to{ transform:none; opacity:1 } }
.si .drawer h3{ font-size:20px; font-weight:600; }
.si .dsum{ display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; }
.si .ds{ font-size:12px; font-weight:600; padding:5px 11px; border-radius:999px; }
.si .ds.ok{ background:var(--ok-bg); color:var(--ok-tx); }
.si .ds.bad{ background:var(--bad-bg); color:var(--bad-tx); }
.si .ds.warn{ background:var(--amber-bg); color:var(--amber-tx); border:1px solid var(--amber-bd); }
.si .dlist{ margin-top:16px; flex:1; }
.si .dgroup{ margin-bottom:16px; }
.si .dglabel{ font-size:10.5px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--faint); padding-bottom:6px; }
.si .dglabel.failed{ color:var(--bad-tx); } .si .dglabel.blocked, .si .dglabel.skipped{ color:var(--amber-tx); }
.si .drow{ display:flex; align-items:baseline; gap:8px; padding:7px 0; border-bottom:1px solid var(--line); font-size:13px; flex-wrap:wrap; }
.si .dname{ font-weight:600; }
.si .dtag{ font-size:10.5px; font-weight:600; color:var(--purple-d); background:var(--lav-soft); padding:2px 8px; border-radius:999px; }
.si .derr{ font-size:11.5px; color:var(--bad-tx); }

@media(max-width:900px){ .si .modes{ grid-template-columns:1fr; } .si .funnel{ grid-template-columns:repeat(2,1fr); }
  .si .funnel .quota{ grid-column:span 2; } }
@media(max-width:640px){ .si .ctx{ flex-direction:column; align-items:flex-start; } .si .ctx .chg{ margin-left:0; }
  .si .gth .acts{ margin-left:0; width:100%; justify-content:flex-start; } }
`
