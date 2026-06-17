'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { MessageCircle, Mail, Copy, ArrowRight } from 'lucide-react'
import {
  enablePublicSharing,
  setPublicSharing,
  sendWhatsAppInvites,
  recordSend,
} from '@/lib/dashboard/actions'
import {
  whatsappShareUrl,
  smsShareUrl,
  publicInviteMessage,
  inviteMessage,
  reminderMessage,
} from '@/lib/dashboard/share'
import type { SendInvitesData, SendGuestRow } from '@/lib/dashboard/queries'

const STATUS_CLASS: Record<SendGuestRow['status'], string> = {
  none: 's-none',
  sent: 's-sent',
  viewed: 's-view',
  attending: 's-yes',
  declined: 's-no',
  maybe: 's-maybe',
}

export default function SendInvitesView({ data }: { data: SendInvitesData }) {
  const router = useRouter()
  const { event, funnel, quota, publicLink, whatsappLive, guests } = data

  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<'all' | 'notsent' | 'awaiting'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // "Awaiting" = invited but not yet replied (delivered or seen, no RSVP).
  const isAwaiting = (s: SendGuestRow['status']) => s === 'sent' || s === 'viewed'

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

  // Heading name comes from the event itself (falls back to the couple profile
  // only when no events exist), suffixed with the event type when it adds info.
  const headingName = event.eventName ?? event.coupleName
  const heading =
    event.eventTypeLabel && event.eventTypeLabel.toLowerCase() !== headingName.toLowerCase()
      ? `${headingName} — ${event.eventTypeLabel}`
      : headingName

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
        toast.error('Could not update sharing.')
      }
    })
  }

  async function copyLink() {
    if (!publicLink.url) return
    await navigator.clipboard.writeText(publicLink.url)
    setCopied(true)
    toast.success('Link copied')
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

  function bulkSend(ids?: string[], { reminder = false }: { reminder?: boolean } = {}) {
    startTransition(async () => {
      const res = await sendWhatsAppInvites(ids)
      if (!res.hasPaidOrder) {
        toast.error('Buy an invitation package to send.')
        return
      }
      const verb = res.dryRun ? 'queued (dry run)' : reminder ? 'reminded' : 'sent'
      const parts = [`${res.sent} ${verb}`]
      if (res.blocked > 0) parts.push(`${res.blocked} over quota`)
      if (res.skipped > 0) parts.push(`${res.skipped} no phone`)
      toast.success(parts.join(' · '))
      setSelected(new Set())
      router.refresh()
    })
  }

  /** Nudge everyone who was invited but hasn't replied (re-sends are free). */
  function remindAwaiting() {
    const ids = guests.filter((g) => isAwaiting(g.status)).map((g) => g.id)
    if (ids.length === 0) {
      toast('No one is awaiting a reply right now.')
      return
    }
    bulkSend(ids, { reminder: true })
  }

  function rowShare(g: SendGuestRow, channel: 'whatsapp' | 'sms' | 'copy') {
    // Already invited but no reply yet → send a gentle reminder, not a fresh invite.
    const reminding = isAwaiting(g.status)
    const msg = reminding
      ? reminderMessage(event.coupleName, g.name, g.rsvpUrl)
      : inviteMessage(event.coupleName, g.name, g.rsvpUrl)
    if (channel === 'copy') {
      navigator.clipboard.writeText(g.rsvpUrl)
      toast.success('Personal link copied')
      return
    }
    const guestLike = { full_name: g.name, phone: g.phone, whatsapp_phone: g.whatsappPhone }
    const url = channel === 'whatsapp' ? whatsappShareUrl(guestLike, msg) : smsShareUrl(guestLike, msg)
    window.open(url, '_blank', 'noopener,noreferrer')
    recordSend(g.id, channel).catch(() => {})
    if (reminding) toast.success(`Reminder ready for ${g.name.split(/\s+/)[0] || g.name}`)
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

  return (
    <div className="si">
      <style>{css}</style>

      <h1>Send invites</h1>
      <p className="sub">
        Your card is paid for. Now get it into your guests&apos; hands — share a public link, or send each
        guest a personal invite.
      </p>

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
              <span>{event.eventTypeLabel ? event.eventTypeLabel.toUpperCase() : 'INVITATION'}</span>
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
              <span className="badge">✓ {event.cardTier ? `${event.cardTier} card` : 'Card'} purchased</span>
            ) : null}
          </div>

          {event.hasPaidOrder ? (
            <>
              <div className="pmeta">
                {event.cardTier ? (
                  <span className="fact"><i>Package</i>{event.cardTier}</span>
                ) : null}
                {event.cardName ? (
                  <span className="fact"><i>Design</i>{event.cardName}</span>
                ) : null}
                <span className="fact">
                  <i>Invites paid</i>
                  {quota.purchased} to share
                </span>
              </div>

              {event.addOns.length > 0 ? (
                <div className="addons">
                  <span className="al">Add-ons</span>
                  {event.addOns.map((a) => (
                    <span key={a} className="ao">{a}</span>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
        <Link href="/my/dashboard/events" className="chg">Manage events</Link>
      </div>

      {/* Funnel + quota */}
      <div className="funnel">
        <div className="fc"><div className="n">{funnel.invited}</div><div className="l">Invited</div></div>
        <div className="fc"><div className="n">{funnel.delivered}</div><div className="l"><span className="ar">→</span> Delivered</div></div>
        <div className="fc"><div className="n">{funnel.viewed}</div><div className="l"><span className="ar">→</span> Viewed</div></div>
        <div className="fc"><div className="n">{funnel.rsvpd}</div><div className="l"><span className="ar">→</span> RSVP&apos;d</div></div>
        <div className="fc quota">
          <div className="top"><span>Paid invitations</span><span><b>{quota.used}</b> of {quota.purchased} used</span></div>
          <div className="bar"><i style={{ width: `${pct}%` }} /></div>
          <div className="ft">{quota.remaining} remaining · <Link href="/invitations/catalog">Top up</Link></div>
        </div>
      </div>

      {/* Two modes */}
      <div className="modes">
        <section className="mode">
          <div className="hrow">
            <div><div className="tag">Broadcast</div><h2>Public invite link</h2></div>
            <button
              className={`tg ${publicLink.enabled ? 'on' : 'off'}`}
              onClick={toggleSharing}
              disabled={pending}
              title={publicLink.enabled ? 'Sharing on' : 'Sharing off'}
              aria-label="Toggle public sharing"
            ><i /></button>
          </div>
          <p>
            One link you can drop into any WhatsApp group or status. It unfurls into a branded preview, and
            self-RSVPs land in a <b>review queue</b> — so no one can reply as someone else.
          </p>

          {publicLink.enabled && publicLink.url ? (
            <>
              <div className="linkbox">
                <code>{publicLink.url.replace(/^https?:\/\//, '')}</code>
                <button className="copybtn" onClick={copyLink}>{copied ? 'Copied ✓' : 'Copy'}</button>
              </div>
              <div className="chips">
                <button className="chip wa" onClick={() => shareLink('whatsapp')}><span className="dot" />WhatsApp</button>
                <button className="chip sms" onClick={() => shareLink('sms')}><span className="dot" />SMS</button>
                <button className="chip copy" onClick={copyLink}><span className="dot" />Copy link</button>
                <button className="chip qr" onClick={() => shareLink('qr')}><span className="dot" />Open</button>
              </div>
            </>
          ) : (
            <div className="linkbox off"><code>Turn on sharing to get your public link</code></div>
          )}

          <div className="note"><span className="k">Best for</span><span>big group chats and status — fast reach, lighter control.</span></div>
        </section>

        <section className="mode">
          <div className="hrow"><div><div className="tag">Targeted</div><h2>Personal invites</h2></div></div>
          <p>
            Send each named guest their own card with <b>Attend / Decline / View location</b> buttons they tap
            right in WhatsApp — or as an SMS link, no app needed. Every send is tracked below.
          </p>
          <div className="chips">
            <button className="chip wa" disabled={pending} onClick={() => bulkSend()}><span className="dot" />Send via WhatsApp</button>
            {awaitingCount > 0 ? (
              <button className="chip remind" disabled={pending} onClick={remindAwaiting}>
                <span className="dot" />Remind {awaitingCount} awaiting
              </button>
            ) : null}
          </div>
          {!whatsappLive ? (
            <div className="connect">
              <span className="dp">Dry run</span>
              <span>WhatsApp Business isn&apos;t connected — sends are logged only until the Meta account &amp; template are approved.</span>
            </div>
          ) : null}
          <div className="note"><span className="k">Best for</span><span>your real guest list — accurate counts and per-guest status.</span></div>
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
          <h2>Guest list</h2><span className="cnt">{guests.length} guests</span>
          <input
            className="gsearch"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or number…"
            aria-label="Search guests"
          />
          <div className="acts">
            <div className="seg" role="tablist" aria-label="Filter guests">
              <button className={`sg ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
                All
              </button>
              <button className={`sg ${filter === 'notsent' ? 'on' : ''}`} onClick={() => setFilter('notsent')}>
                Not sent{notSentCount ? ` ${notSentCount}` : ''}
              </button>
              <button className={`sg ${filter === 'awaiting' ? 'on' : ''}`} onClick={() => setFilter('awaiting')}>
                Awaiting{awaitingCount ? ` ${awaitingCount}` : ''}
              </button>
            </div>
            <button className="btn pri" disabled={pending || selected.size === 0} onClick={() => bulkSend([...selected])}>
              Send to selected <ArrowRight size={15} />
            </button>
          </div>
        </div>
        {visible.length === 0 ? (
          <div className="empty">
            {search.trim()
              ? 'No guests match your search.'
              : filter === 'notsent'
                ? 'Everyone has been sent an invite.'
                : filter === 'awaiting'
                  ? 'No one is awaiting a reply.'
                  : 'No guests yet.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 30 }}></th><th>Guest</th><th>Contact</th>
                <th>Preferred channel</th><th>Status</th><th style={{ textAlign: 'right' }}>Send</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((g) => (
                <tr key={g.id}>
                  <td><input type="checkbox" className="ck" checked={selected.has(g.id)} onChange={() => toggleSelect(g.id)} /></td>
                  <td className="who">{g.name}</td>
                  <td className="contact">{g.phone ?? g.whatsappPhone ?? '—'}</td>
                  <td>
                    <span className={`mini ${g.channel}`}><span className="dot" />{g.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</span>
                  </td>
                  <td><span className={`status ${STATUS_CLASS[g.status]}`}>{g.statusLabel}</span></td>
                  <td>
                    <div className="ra">
                      <button className="ia wa" title="WhatsApp" onClick={() => rowShare(g, 'whatsapp')}><MessageCircle size={15} /></button>
                      <button className="ia sms" title="SMS" onClick={() => rowShare(g, 'sms')}><Mail size={15} /></button>
                      <button className="ia copy" title="Copy personal link" onClick={() => rowShare(g, 'copy')}><Copy size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const css = `
.si{ --purple:#6B3FA0; --purple-d:#4A2870; --lav:#D7BDE8; --lav-btn:#DCC3EC; --lav-soft:#F6EEFB;
  --ink:#1c1b1f; --muted:#8b8790; --faint:#b6b2ba; --line:#ededf0; --hover:#faf8fc;
  --wa:#25D366; --sms:#3478F6; --amber-bg:#FFFBEB; --amber-bd:#FBE8B0; --amber-tx:#8a6d1a;
  --ok-bg:#EAF6EF; --ok-tx:#2E7D55; --radius:16px; --soft:0 1px 2px rgba(20,18,30,.05);
  color:var(--ink); }
.si .serif, .si h1, .si h2, .si h3, .si .n, .si .ci b{ font-family:var(--font-cormorant),Georgia,serif; }
.si h1{ font-weight:600; font-size:30px; letter-spacing:-.3px; }
.si .sub{ color:var(--muted); font-size:14px; margin-top:6px; max-width:640px; line-height:1.5; }
.si .btn{ border:none; border-radius:999px; font-weight:600; font-size:13.5px; padding:9px 16px; cursor:pointer;
  display:inline-flex; align-items:center; gap:7px; transition:filter .12s, transform .08s; }
.si .btn:hover{ filter:brightness(.97); transform:translateY(-1px); }
.si .btn:disabled{ opacity:.5; cursor:not-allowed; transform:none; }
.si .btn.pri{ background:var(--lav-btn); color:var(--purple-d); box-shadow:var(--soft); }
.si .btn.ghost{ background:#fff; color:var(--ink); border:1px solid var(--line); }
.si .btn.ghost.active{ border-color:var(--lav); background:var(--lav-soft); color:var(--purple-d); }
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
.si .funnel{ display:grid; grid-template-columns:repeat(4,1fr) 1.5fr; gap:12px; margin-bottom:26px; }
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
.si .modes{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.si .mode{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:22px; box-shadow:var(--soft);
  display:flex; flex-direction:column; }
.si .tag{ font-size:10.5px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:var(--lav); }
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
.si .chips{ display:flex; gap:9px; margin-top:16px; flex-wrap:wrap; }
.si .chip{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--line); background:#fff;
  border-radius:11px; padding:9px 13px; font-size:13px; font-weight:600; cursor:pointer; color:var(--ink);
  transition:border-color .12s, background .12s; }
.si .chip:hover{ background:var(--hover); border-color:var(--lav); }
.si .chip:disabled{ opacity:.5; cursor:not-allowed; }
.si .chip .dot{ width:9px; height:9px; border-radius:50%; }
.si .chip.wa .dot{ background:var(--wa); } .si .chip.sms .dot{ background:var(--sms); }
.si .chip.copy .dot{ background:var(--lav); } .si .chip.qr .dot{ background:var(--ink); }
.si .chip.remind .dot{ background:#E0A458; }
.si .note{ display:flex; gap:8px; align-items:flex-start; margin-top:auto; padding-top:16px; font-size:12px; color:var(--muted); }
.si .note .k{ color:var(--purple); font-weight:600; }
.si .tg{ position:relative; width:42px; height:24px; border-radius:999px; cursor:pointer; flex:none; border:none; padding:0; }
.si .tg.on{ background:var(--purple); } .si .tg.off{ background:#d7d4da; }
.si .tg i{ position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:left .15s; }
.si .tg.on i{ left:21px; } .si .tg.off i{ left:3px; }
.si .connect{ display:flex; align-items:center; gap:10px; margin-top:16px; padding:11px 14px; border-radius:12px;
  background:var(--amber-bg); border:1px solid var(--amber-bd); font-size:12.5px; color:var(--amber-tx); line-height:1.4; }
.si .connect .dp{ background:var(--amber-bd); color:var(--amber-tx); font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:999px; flex:none; }
.si .connect a{ margin-left:auto; flex:none; background:var(--purple); color:#fff; text-decoration:none; font-weight:600; padding:8px 14px; border-radius:999px; font-size:12px; }
.si .gt{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); margin-top:24px; box-shadow:var(--soft); overflow:hidden; }
.si .gth{ display:flex; align-items:center; gap:14px; padding:18px 20px; border-bottom:1px solid var(--line); }
.si .gth h2{ font-size:18px; font-weight:600; }
.si .gth .cnt{ color:var(--muted); font-size:12px; }
.si .gth .gsearch{ flex:0 1 240px; min-width:150px; border:1px solid var(--line); border-radius:10px;
  padding:8px 12px; font-size:13px; color:var(--ink); background:#fff; }
.si .gth .gsearch:focus{ outline:none; border-color:var(--lav); }
.si .gth .acts{ margin-left:auto; display:flex; gap:9px; align-items:center; }
.si .seg{ display:inline-flex; border:1px solid var(--line); border-radius:10px; overflow:hidden; }
.si .seg .sg{ background:#fff; border:none; padding:8px 12px; font-size:12.5px; font-weight:600; color:var(--muted); cursor:pointer; }
.si .seg .sg + .sg{ border-left:1px solid var(--line); }
.si .seg .sg.on{ background:var(--lav-soft); color:var(--purple-d); }
.si .seg .sg:hover:not(.on){ background:var(--hover); }
.si .empty{ padding:40px 20px; text-align:center; color:var(--muted); font-size:14px; }
.si table{ width:100%; border-collapse:collapse; font-size:13.5px; }
.si th{ text-align:left; font-size:10.5px; letter-spacing:.6px; text-transform:uppercase; color:var(--faint);
  padding:12px 20px; border-bottom:1px solid var(--line); font-weight:600; }
.si td{ padding:14px 20px; border-bottom:1px solid var(--line); }
.si tr:last-child td{ border-bottom:none; }
.si tbody tr:hover td{ background:var(--hover); }
.si .who{ font-weight:600; } .si .contact{ color:var(--muted); font-size:12px; }
.si .mini{ display:inline-flex; align-items:center; gap:7px; border:1px solid var(--line); border-radius:9px;
  padding:5px 10px; font-size:12px; font-weight:600; }
.si .mini .dot{ width:8px; height:8px; border-radius:50%; }
.si .mini.whatsapp .dot{ background:var(--wa); } .si .mini.sms .dot{ background:var(--sms); }
.si .status{ display:inline-flex; align-items:center; gap:7px; font-size:11.5px; font-weight:600; padding:4px 11px; border-radius:999px; }
.si .status::before{ content:""; width:6px; height:6px; border-radius:50%; }
.si .s-none{ background:#f3f2f5; color:var(--muted); } .si .s-none::before{ background:var(--muted); }
.si .s-sent{ background:var(--lav-soft); color:var(--purple); } .si .s-sent::before{ background:var(--purple); }
.si .s-view{ background:#eef3ff; color:var(--sms); } .si .s-view::before{ background:var(--sms); }
.si .s-yes{ background:var(--ok-bg); color:var(--ok-tx); } .si .s-yes::before{ background:var(--ok-tx); }
.si .s-no{ background:#fcecec; color:#c0392b; } .si .s-no::before{ background:#c0392b; }
.si .s-maybe{ background:#fff5e6; color:#b9791a; } .si .s-maybe::before{ background:#b9791a; }
.si .ra{ display:flex; gap:7px; justify-content:flex-end; }
.si .ia{ width:32px; height:32px; border-radius:9px; border:1px solid var(--line); background:#fff; cursor:pointer;
  display:grid; place-items:center; }
.si .ia:hover{ background:var(--hover); border-color:var(--lav); }
.si .ia.wa{ color:var(--wa); } .si .ia.sms{ color:var(--sms); } .si .ia.copy{ color:var(--purple); }
.si .ck{ width:15px; height:15px; accent-color:var(--purple); }
@media(max-width:900px){ .si .modes{ grid-template-columns:1fr; } .si .funnel{ grid-template-columns:repeat(2,1fr); }
  .si .funnel .quota{ grid-column:span 2; } }
`
