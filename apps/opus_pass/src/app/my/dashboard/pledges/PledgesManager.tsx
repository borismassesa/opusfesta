'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  HandCoins,
  Plus,
  Search,
  SlidersHorizontal,
  Check,
  Pencil,
  Trash2,
  MessageCircle,
  Mail,
  Smartphone,
  Copy,
  BellRing,
  Banknote,
  ListChecks,
  BarChart3,
  Download,
  Send,
  Palette,
  ExternalLink,
  Target,
  Wallet,
} from 'lucide-react'
import { Card, EmptyState } from '@/components/dashboard/primitives'
import { ChartCard, BarRows, Funnel, LineChart } from '@/components/dashboard/charts'
import { Button, ConfirmDialog, Dialog, Slideover, Field, inputClass } from '@/components/dashboard/controls'
import { cn } from '@/lib/utils'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import {
  createPledge,
  updatePledge,
  deletePledge,
  recordPledgeReminder,
  updatePledgeCollection,
  type PledgeInput,
} from '@/lib/dashboard/actions'
import { PAYMENT_PROVIDERS, type PledgePaymentMethod } from '@/lib/dashboard/pledge-page'
import {
  pledgeUrl,
  pledgeReminderMessage,
  pledgeRequestMessage,
  whatsappShareUrl,
  smsShareUrl,
  emailShareUrl,
} from '@/lib/dashboard/share'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'
import type { PledgesDashboardCopy } from '@/lib/cms/dashboard-copy'
import type {
  AttendanceAnswer,
  CardStatus,
  PaymentMethod,
  PledgeStats,
  PledgeStatus,
  PledgeWithContact,
  ReminderCadence,
} from '@/lib/dashboard/types'
import {
  ATTENDANCE_LABELS,
  CADENCE_LABELS,
  CARD_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PLEDGE_STATUS_LABELS,
} from '@/lib/dashboard/types'

type ContactLite = {
  id: string
  full_name: string
  phone: string | null
  whatsapp_phone: string | null
  email: string | null
}

type PledgeView = 'all' | PledgeStatus | 'cards'

const VIEW_TABS: { id: PledgeView; label: string }[] = [
  { id: 'all', label: 'All pledges' },
  { id: 'invited', label: 'Awaiting pledge' },
  { id: 'pledged', label: 'Pledged' },
  { id: 'partial', label: 'Partly paid' },
  { id: 'paid', label: 'Paid' },
  { id: 'cards', label: 'Cards to prepare' },
]

const DAY = 86_400_000

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`
  }
}

function formatDueDate(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Days until the promised date — negative when overdue, null when no date. */
function daysUntil(value: string | null): number | null {
  if (!value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(value)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / DAY)
}

const OWING: PledgeStatus[] = ['invited', 'pledged', 'partial']

interface AgingBucket {
  key: string
  label: string
  count: number
  amount: number
}

/** Outstanding pledges bucketed by how overdue their promised date is — the
 *  single most actionable view for deciding who to chase first. */
function outstandingAging(pledges: PledgeWithContact[]): AgingBucket[] {
  const buckets: AgingBucket[] = [
    { key: 'over30', label: '30+ days overdue', count: 0, amount: 0 },
    { key: 'over8', label: '8–30 days overdue', count: 0, amount: 0 },
    { key: 'over1', label: '1–7 days overdue', count: 0, amount: 0 },
    { key: 'due', label: 'Not yet due', count: 0, amount: 0 },
    { key: 'nodate', label: 'No due date', count: 0, amount: 0 },
  ]
  const at = (k: string) => buckets.find((b) => b.key === k)!
  for (const p of pledges) {
    if (!OWING.includes(p.status)) continue
    const owing = Math.max(0, p.pledged_amount - p.amount_received)
    if (owing <= 0) continue
    const d = daysUntil(p.promised_date)
    const bucket =
      d === null ? at('nodate') : d >= 0 ? at('due') : d >= -7 ? at('over1') : d >= -30 ? at('over8') : at('over30')
    bucket.count += 1
    bucket.amount += owing
  }
  return buckets.filter((b) => b.count > 0)
}

/** Cumulative pledged amount over time (grouped by creation day) for the trend chart. */
function cumulativePledgedByDay(pledges: PledgeWithContact[]): { label: string; value: number }[] {
  const byDay = new Map<string, number>()
  for (const p of pledges) {
    if (p.status === 'declined') continue
    const day = (p.created_at || '').slice(0, 10)
    if (!day) continue
    byDay.set(day, (byDay.get(day) ?? 0) + p.pledged_amount)
  }
  const days = [...byDay.keys()].sort()
  let cumulative = 0
  return days.map((d) => {
    cumulative += byDay.get(d)!
    return { label: formatDueDate(d), value: cumulative }
  })
}

/** Largest pledges first (declined and zero-amount excluded) — feeds the
 *  "top contributors" recognition list. */
function topContributors(pledges: PledgeWithContact[], limit = 10): PledgeWithContact[] {
  return pledges
    .filter((p) => p.status !== 'declined' && p.pledged_amount > 0)
    .sort((a, b) => b.pledged_amount - a.pledged_amount || b.amount_received - a.amount_received)
    .slice(0, limit)
}

/** A pledge is "due for a follow-up" when it's still owing and either its
 *  scheduled reminder has come due or its promised date is near/overdue. */
function isReminderDue(p: PledgeWithContact): boolean {
  if (!OWING.includes(p.status)) return false
  const now = Date.now()
  if (p.next_reminder_at && new Date(p.next_reminder_at).getTime() <= now) return true
  const days = daysUntil(p.promised_date)
  return days !== null && days <= 7
}

const emptyForm = {
  id: undefined as string | undefined,
  mode: 'new' as 'new' | 'existing',
  guestContactId: '',
  full_name: '',
  phone: '',
  whatsapp_phone: '',
  email: '',
  pledged_amount: '',
  amount_received: '',
  currency: 'TZS',
  promised_date: '',
  status: 'invited' as PledgeStatus,
  payment_method: '' as PaymentMethod | '',
  will_attend: '' as AttendanceAnswer | '',
  card_status: 'none' as CardStatus,
  reminder_cadence: 'none' as ReminderCadence,
  notes: '',
}

type FormState = typeof emptyForm

type Section = 'manage' | 'invite' | 'collection' | 'followups' | 'reports'

export default function PledgesManager({
  initialPledges,
  stats,
  contacts,
  coupleName,
  paymentInstructions,
  paymentMethods,
  goalAmount,
  weddingDate,
  hero,
  pledgeToken,
  copy,
}: {
  initialPledges: PledgeWithContact[]
  stats: PledgeStats
  contacts: ContactLite[]
  coupleName: string
  paymentInstructions: string | null
  paymentMethods: PledgePaymentMethod[]
  goalAmount: number | null
  weddingDate: string | null
  hero: DashboardHeroContent
  pledgeToken: string | null
  copy: PledgesDashboardCopy
}) {
  const [section, setSection] = useState<Section>('manage')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<PledgeView>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [payTarget, setPayTarget] = useState<PledgeWithContact | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethod | ''>('')
  const [pendingDelete, setPendingDelete] = useState<PledgeWithContact | null>(null)
  const [pending, startTransition] = useTransition()

  // Pledge-collection settings (goal + structured how-to-pay methods)
  const [goalInput, setGoalInput] = useState(goalAmount ? String(goalAmount) : '')
  const [methods, setMethods] = useState<PledgePaymentMethod[]>(() =>
    paymentMethods.length ? paymentMethods : [{ label: '', value: '', name: '' }],
  )

  function saveCollection() {
    startTransition(async () => {
      try {
        await updatePledgeCollection({
          goalAmount: Number(goalInput) || null,
          paymentMethods: methods,
        })
        toast.success('Pledge collection settings saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save settings')
      }
    })
  }

  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])
  const shareLink = pledgeToken && origin ? pledgeUrl(origin, pledgeToken) : null

  // Close the filter popover on an outside click.
  useEffect(() => {
    if (!filterOpen) return
    const onDown = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [filterOpen])

  const remindersDue = useMemo(() => initialPledges.filter(isReminderDue), [initialPledges])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialPledges.filter((p) => {
      if (view === 'cards') {
        if (!(p.status === 'paid' && p.will_attend === 'yes' && p.card_status !== 'sent')) return false
      } else if (view !== 'all' && p.status !== view) {
        return false
      }
      if (!q) return true
      return (
        p.full_name.toLowerCase().includes(q) ||
        (p.group_tag ?? '').toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q)
      )
    })
  }, [initialPledges, query, view])

  function openCreate() {
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(p: PledgeWithContact) {
    setForm({
      id: p.id,
      mode: 'existing',
      guestContactId: p.guest_contact_id,
      full_name: p.full_name,
      phone: p.phone ?? '',
      whatsapp_phone: p.whatsapp_phone ?? '',
      email: p.email ?? '',
      pledged_amount: p.pledged_amount ? String(p.pledged_amount) : '',
      amount_received: p.amount_received ? String(p.amount_received) : '',
      currency: p.currency || 'TZS',
      promised_date: p.promised_date ?? '',
      status: p.status,
      payment_method: p.payment_method ?? '',
      will_attend: p.will_attend ?? '',
      card_status: p.card_status,
      reminder_cadence: p.reminder_cadence,
      notes: p.notes ?? '',
    })
    setOpen(true)
  }

  function buildInput(f: FormState): PledgeInput {
    const base: PledgeInput = {
      pledged_amount: Number(f.pledged_amount) || 0,
      amount_received: Number(f.amount_received) || 0,
      currency: f.currency || 'TZS',
      promised_date: f.promised_date || null,
      status: f.status,
      payment_method: f.payment_method || null,
      will_attend: f.will_attend || null,
      card_status: f.card_status,
      reminder_cadence: f.reminder_cadence,
      notes: f.notes || null,
    }
    // Editing always keeps the linked contact; creating either links an existing
    // contact or carries new-contributor details for the action to insert.
    if (f.id || f.mode === 'existing') {
      return { ...base, guestContactId: f.guestContactId }
    }
    return {
      ...base,
      full_name: f.full_name,
      phone: f.phone || null,
      whatsapp_phone: f.whatsapp_phone || null,
      email: f.email || null,
    }
  }

  function save() {
    if (!form.id && form.mode === 'new' && !form.full_name.trim()) {
      toast.error("Enter the contributor's name")
      return
    }
    if (form.mode === 'existing' && !form.guestContactId) {
      toast.error('Pick a contributor')
      return
    }
    startTransition(async () => {
      try {
        if (form.id) {
          await updatePledge(form.id, buildInput(form))
          toast.success('Pledge updated')
        } else {
          await createPledge(buildInput(form))
          toast.success(copy.toast_added)
        }
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  function confirmRemove() {
    const target = pendingDelete
    if (!target) return
    startTransition(async () => {
      try {
        await deletePledge(target.id)
        toast.success('Pledge removed')
        setPendingDelete(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not remove')
      }
    })
  }

  function openRecordPayment(p: PledgeWithContact) {
    setPayTarget(p)
    setPayAmount('')
    setPayMethod(p.payment_method ?? '')
  }

  /** Add a received payment to a pledge, re-deriving status from the new total. */
  function savePayment() {
    const target = payTarget
    if (!target) return
    const add = Number(payAmount) || 0
    if (add <= 0) {
      toast.error('Enter the amount received')
      return
    }
    const newReceived = target.amount_received + add
    // Send the full current pledge so updatePledge doesn't reset other fields;
    // omit status so it's re-derived from the new received-vs-pledged total.
    const input: PledgeInput = {
      guestContactId: target.guest_contact_id,
      pledged_amount: target.pledged_amount,
      amount_received: newReceived,
      currency: target.currency,
      promised_date: target.promised_date,
      payment_method: payMethod || target.payment_method || null,
      will_attend: target.will_attend,
      card_status: target.card_status,
      reminder_cadence: target.reminder_cadence,
      notes: target.notes,
    }
    startTransition(async () => {
      try {
        await updatePledge(target.id, input)
        toast.success(copy.toast_payment)
        setPayTarget(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not record payment')
      }
    })
  }

  function exportCsv() {
    const headers = [
      'Contributor', 'Group', 'Phone', 'Email', 'Currency', 'Pledged', 'Received',
      'Outstanding', 'Status', 'Payment method', 'Promised by', 'Coming', 'Card',
      'Reminders sent', 'Last reminded',
    ]
    const rows = initialPledges.map((p) => [
      p.full_name,
      p.group_tag ?? '',
      p.whatsapp_phone ?? p.phone ?? '',
      p.email ?? '',
      p.currency,
      p.pledged_amount,
      p.amount_received,
      Math.max(0, p.pledged_amount - p.amount_received),
      PLEDGE_STATUS_LABELS[p.status],
      p.payment_method ? PAYMENT_METHOD_LABELS[p.payment_method] : '',
      p.promised_date ?? '',
      p.will_attend ? ATTENDANCE_LABELS[p.will_attend] : '',
      CARD_STATUS_LABELS[p.card_status],
      p.reminder_count,
      p.last_reminded_at ? new Date(p.last_reminded_at).toISOString().slice(0, 10) : '',
    ])
    const esc = (v: string | number) => {
      const s = String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pledges-${coupleName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  /** Open a clean, printable contribution statement in a new window (Save as PDF
   *  from the print dialog). Self-contained HTML served via a blob URL so the
   *  dashboard chrome doesn't bleed into the printout — handy for the kamati
   *  treasurer who needs to report back to the family. */
  function printStatement() {
    const fmt = (n: number) => formatMoney(n, 'TZS')
    const esc = (s: string) =>
      s.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'))
    const collectionRate =
      stats.totalPledged > 0 ? Math.round((stats.totalReceived / stats.totalPledged) * 100) : 0
    const goalLine =
      goalAmount && goalAmount > 0
        ? `<p class="goal">Goal ${fmt(goalAmount)} · Raised ${fmt(stats.totalReceived)} (${Math.min(
            100,
            Math.round((stats.totalReceived / goalAmount) * 100),
          )}%)</p>`
        : ''

    const statusRows = (Object.keys(PLEDGE_STATUS_LABELS) as PledgeStatus[])
      .map((s) => {
        const rows = initialPledges.filter((p) => p.status === s)
        return `<tr><td>${PLEDGE_STATUS_LABELS[s]}</td><td class="r">${rows.length}</td><td class="r">${fmt(
          rows.reduce((n, p) => n + p.pledged_amount, 0),
        )}</td><td class="r">${fmt(rows.reduce((n, p) => n + p.amount_received, 0))}</td></tr>`
      })
      .join('')

    const aging = outstandingAging(initialPledges)
    const agingRows = aging.length
      ? aging
          .map((b) => `<tr><td>${b.label}</td><td class="r">${b.count}</td><td class="r">${fmt(b.amount)}</td></tr>`)
          .join('')
      : '<tr><td colspan="3" class="muted">Nothing outstanding</td></tr>'

    const topRows = topContributors(initialPledges, 10)
      .map(
        (p) =>
          `<tr><td>${esc(p.full_name)}</td><td class="r">${fmt(p.pledged_amount)}</td><td class="r">${fmt(
            p.amount_received,
          )}</td></tr>`,
      )
      .join('')

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Contribution statement — ${esc(
      coupleName,
    )}</title><style>
      *{box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1A1A1A;margin:40px;font-size:13px;line-height:1.4}
      h1{font-size:22px;margin:0 0 2px}
      .sub{color:#666;margin:0 0 4px}
      .goal{font-weight:600;color:#2f7d3a;margin:6px 0 0}
      h2{font-size:14px;margin:26px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
      .tiles{display:flex;gap:24px;margin-top:14px}
      .tile .l{color:#777;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
      .tile .v{font-size:18px;font-weight:700}
      table{width:100%;border-collapse:collapse;margin-top:4px}
      th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #eee}
      th{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#888}
      td.r,th.r{text-align:right}
      .muted{color:#999;text-align:center;padding:14px}
      .foot{margin-top:30px;color:#999;font-size:11px}
      @media print{body{margin:18mm}}
    </style></head><body onload="window.print()">
      <h1>${esc(coupleName)}</h1>
      <p class="sub">Contribution statement · ${today}</p>
      ${goalLine}
      <div class="tiles">
        <div class="tile"><div class="l">Pledged</div><div class="v">${fmt(stats.totalPledged)}</div></div>
        <div class="tile"><div class="l">Received</div><div class="v">${fmt(stats.totalReceived)}</div></div>
        <div class="tile"><div class="l">Outstanding</div><div class="v">${fmt(stats.outstanding)}</div></div>
        <div class="tile"><div class="l">Collection rate</div><div class="v">${collectionRate}%</div></div>
      </div>
      <h2>By status</h2>
      <table><thead><tr><th>Status</th><th class="r">Count</th><th class="r">Pledged</th><th class="r">Received</th></tr></thead><tbody>${statusRows}</tbody></table>
      <h2>Outstanding by age</h2>
      <table><thead><tr><th>Age</th><th class="r">Count</th><th class="r">Outstanding</th></tr></thead><tbody>${agingRows}</tbody></table>
      <h2>Top contributors</h2>
      <table><thead><tr><th>Contributor</th><th class="r">Pledged</th><th class="r">Received</th></tr></thead><tbody>${
        topRows || '<tr><td colspan="3" class="muted">No pledges yet</td></tr>'
      }</tbody></table>
      <p class="foot">Generated by OpusPass · ${esc(coupleName)} contributions</p>
    </body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    if (!win) {
      URL.revokeObjectURL(url)
      toast.error('Allow pop-ups to print the statement')
      return
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  function reminderText(p: PledgeWithContact): string {
    const owing = Math.max(0, p.pledged_amount - p.amount_received)
    const amountLabel = formatMoney(owing > 0 ? owing : p.pledged_amount, p.currency)
    return pledgeReminderMessage(
      coupleName,
      p.full_name,
      amountLabel,
      formatDueDate(p.promised_date) || null,
      paymentInstructions,
    )
  }

  function remindWhatsApp(p: PledgeWithContact) {
    window.open(whatsappShareUrl(p, reminderText(p)), '_blank', 'noopener,noreferrer')
    recordPledgeReminder(p.id, 'whatsapp').catch(() => {})
  }

  function remindSms(p: PledgeWithContact) {
    window.location.href = smsShareUrl(p, reminderText(p))
    recordPledgeReminder(p.id, 'sms').catch(() => {})
  }

  function remindEmail(p: PledgeWithContact) {
    window.location.href = emailShareUrl(p, `A gentle reminder — ${coupleName}`, reminderText(p))
    recordPledgeReminder(p.id, 'email').catch(() => {})
  }

  async function copyShareLink() {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success('Pledge link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  const viewLabels: Partial<Record<PledgeView, string>> = {
    all: copy.view_all,
    invited: copy.view_awaiting,
    pledged: copy.view_pledged,
    partial: copy.view_partial,
    paid: copy.view_paid,
    cards: copy.view_cards,
  }
  const viewLabel = (id: PledgeView): string => viewLabels[id] ?? copy.view_all

  return (
    <div className="space-y-6">
      <DashboardHero
        content={hero}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[#C9A0DC] px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#b97fd0]"
          >
            <Plus className="h-3.5 w-3.5" /> {copy.add_pledge_cta}
          </button>
        }
      />

      <PledgeSubNav
        section={section}
        onChange={setSection}
        dueCount={remindersDue.length}
        copy={copy}
      />

      {section === 'manage' || section === 'followups' ? (
      <>
      {/* Money + counts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="px-5 py-4">
          <div className="grid grid-cols-3 divide-x divide-black/[0.12] text-center">
            <MoneyStat label="Pledged" value={formatMoney(stats.totalPledged, 'TZS')} />
            <MoneyStat label="Received" value={formatMoney(stats.totalReceived, 'TZS')} accent="green" />
            <MoneyStat label="Outstanding" value={formatMoney(stats.outstanding, 'TZS')} accent="amber" />
          </div>
        </Card>
        <Card className="px-5 py-4">
          <div className="grid grid-cols-3 divide-x divide-black/[0.12] text-center">
            <CountStat value={stats.paidCount} label="Paid" />
            <CountStat value={stats.attendingCount} label="Coming" />
            <CountStat value={stats.cardsToPrepare} label="Cards to prepare" />
          </div>
        </Card>
      </div>

      {/* Reminders due */}
      {section === 'manage' && remindersDue.length > 0 ? (
        <Card className="border-amber-300/60 bg-amber-50/60 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
            <BellRing className="h-4 w-4 text-amber-600" />
            {remindersDue.length} {remindersDue.length === 1 ? 'follow-up' : 'follow-ups'} due
          </div>
          <p className="mt-0.5 text-xs text-[#1A1A1A]/60">
            Pledges that are still owing and due (or overdue) for a reminder.
          </p>
          <ul className="mt-3 space-y-2">
            {remindersDue.slice(0, 6).map((p) => {
              const days = daysUntil(p.promised_date)
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-black/[0.06]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1A1A1A]">{p.full_name}</p>
                    <p className="text-xs text-[#1A1A1A]/55">
                      {formatMoney(Math.max(0, p.pledged_amount - p.amount_received), p.currency)} owing
                      {days !== null
                        ? days < 0
                          ? ` · ${Math.abs(days)}d overdue`
                          : days === 0
                            ? ' · due today'
                            : ` · due in ${days}d`
                        : ''}
                    </p>
                  </div>
                  <div className="inline-flex gap-1">
                    <ReminderButtons p={p} onWa={remindWhatsApp} onSms={remindSms} onEmail={remindEmail} />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}
      </>
      ) : null}

      {section === 'invite' ? (
        <InviteSection
          shareLink={shareLink}
          coupleName={coupleName}
          onCopy={copyShareLink}
          copy={copy}
        />
      ) : null}

      {section === 'collection' ? (
        <CollectionSection
          goalInput={goalInput}
          setGoalInput={setGoalInput}
          methods={methods}
          setMethods={setMethods}
          pending={pending}
          onSave={saveCollection}
          copy={copy}
        />
      ) : null}

      {section === 'manage' ? (
      <>
      {/* Toolbar: view filter + search */}
      {initialPledges.length > 0 ? (
        <div className="flex flex-nowrap items-center gap-3">
          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              aria-expanded={filterOpen}
              aria-haspopup="true"
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] transition-colors hover:bg-black/[0.03]',
                view !== 'all' && 'border-[#C9A0DC] bg-[#F0DFF6] text-[#5d3a78]',
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{viewLabel(view) ?? copy.nav_manage}</span>
            </button>
            {filterOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-[calc(100%+6px)] z-20 w-56 rounded-xl border border-black/[0.08] bg-white p-2 shadow-lg ring-1 ring-black/[0.04]"
              >
                <ul className="space-y-1">
                  {VIEW_TABS.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setView(t.id)
                          setFilterOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-[#1A1A1A] hover:bg-black/[0.04]',
                          view === t.id && 'font-semibold text-[#5d3a78]',
                        )}
                      >
                        <span>{viewLabel(t.id)}</span>
                        {view === t.id ? <Check className="h-4 w-4" /> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search contributors…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {initialPledges.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="h-7 w-7" />}
          title={copy.empty_title}
          description={copy.empty_description}
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> {copy.empty_cta}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search className="h-6 w-6" />} title={copy.no_match_title} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm [&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_th:first-child]:pl-5 [&_th:last-child]:pr-5">
            <thead>
              <tr className="border-b border-black/[0.06]">
                <Th>Contributor</Th>
                <Th>Pledged</Th>
                <Th>Received</Th>
                <Th>Outstanding</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th>Coming?</Th>
                <Th>Card</Th>
                <Th>Payment</Th>
                <th className="w-1 py-3 pr-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filtered.map((p) => {
                const owing = Math.max(0, p.pledged_amount - p.amount_received)
                const days = daysUntil(p.promised_date)
                const overdue = days !== null && days < 0 && OWING.includes(p.status)
                return (
                  <tr key={p.id} className="align-middle hover:bg-black/[0.02]">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-xs font-semibold text-[#1A1A1A]/70">
                          {p.full_name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#1A1A1A]">{p.full_name}</p>
                          {p.group_tag ? (
                            <p className="truncate text-xs text-[#1A1A1A]/50">{p.group_tag}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-[#1A1A1A]/80">{formatMoney(p.pledged_amount, p.currency)}</td>
                    <td className="py-3.5 pr-4 text-emerald-700">{formatMoney(p.amount_received, p.currency)}</td>
                    <td className="py-3.5 pr-4 text-[#1A1A1A]/80">
                      {owing > 0 ? formatMoney(owing, p.currency) : '—'}
                    </td>
                    <td className="py-3.5 pr-4">
                      {p.promised_date ? (
                        <span className={cn('text-xs', overdue ? 'font-medium text-rose-600' : 'text-[#1A1A1A]/65')}>
                          {formatDueDate(p.promised_date)}
                          {overdue ? ' · overdue' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-[#1A1A1A]/35">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4"><PledgeStatusPill status={p.status} /></td>
                    <td className="py-3.5 pr-4">
                      {p.will_attend ? (
                        <span className="rounded-full bg-[#9FE870]/25 px-2 py-0.5 text-xs font-medium text-[#3f6b1f]">
                          {ATTENDANCE_LABELS[p.will_attend]}
                        </span>
                      ) : (
                        <span className="text-xs text-[#1A1A1A]/35">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="text-xs text-[#1A1A1A]/65">{CARD_STATUS_LABELS[p.card_status]}</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <button
                        onClick={() => openRecordPayment(p)}
                        disabled={p.status === 'declined'}
                        title="Record a payment"
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-emerald-50"
                      >
                        <Banknote className="h-3.5 w-3.5" /> Record
                      </button>
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          aria-label="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/50 hover:bg-black/[0.05]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setPendingDelete(p)}
                          aria-label="Remove"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
      </>
      ) : null}

      {section === 'followups' ? (
        <FollowUpsSection
          pledges={initialPledges}
          onWa={remindWhatsApp}
          onSms={remindSms}
          onEmail={remindEmail}
          onRecord={openRecordPayment}
          copy={copy}
        />
      ) : null}

      {section === 'reports' ? (
        <ReportsSection
          pledges={initialPledges}
          stats={stats}
          goalAmount={goalAmount}
          weddingDate={weddingDate}
          onExport={exportCsv}
          onPrint={printStatement}
          onChaseFollowups={() => setSection('followups')}
          onViewAwaiting={() => {
            setView('invited')
            setSection('manage')
          }}
          copy={copy}
        />
      ) : null}

      <PledgeSlideover
        open={open}
        form={form}
        setForm={setForm}
        contacts={contacts}
        pending={pending}
        onClose={() => setOpen(false)}
        onSave={save}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmRemove}
        title={pendingDelete ? `Remove ${pendingDelete.full_name}'s pledge?` : ''}
        description="The pledge and its reminder history will be deleted. The contributor stays in your guest list. This can't be undone."
        confirmLabel="Remove pledge"
        pending={pending}
      />

      <Dialog
        open={payTarget !== null}
        onClose={() => setPayTarget(null)}
        title={payTarget ? `Record a payment — ${payTarget.full_name}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayTarget(null)}>
              Cancel
            </Button>
            <Button onClick={savePayment} disabled={pending}>
              {pending ? 'Saving…' : 'Record payment'}
            </Button>
          </>
        }
      >
        {payTarget ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-black/[0.03] px-3 py-2">
                <div className="text-xs text-[#1A1A1A]/55">Pledged</div>
                <div className="font-semibold text-[#1A1A1A]">
                  {formatMoney(payTarget.pledged_amount, payTarget.currency)}
                </div>
              </div>
              <div className="rounded-lg bg-black/[0.03] px-3 py-2">
                <div className="text-xs text-[#1A1A1A]/55">Outstanding</div>
                <div className="font-semibold text-amber-700">
                  {formatMoney(
                    Math.max(0, payTarget.pledged_amount - payTarget.amount_received),
                    payTarget.currency,
                  )}
                </div>
              </div>
            </div>
            <Field label={`Amount received now (${payTarget.currency})`}>
              <input
                type="number"
                min="0"
                autoFocus
                className={inputClass}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="e.g. 50000"
              />
            </Field>
            <Field label="Paid via">
              <select
                className={inputClass}
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod | '')}
              >
                <option value="">—</option>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </Field>
            <p className="text-xs text-[#1A1A1A]/50">
              We’ll add this to the amount received and update the status automatically.
            </p>
          </div>
        ) : null}
      </Dialog>

    </div>
  )
}

// ──────────────────────────────── pieces ────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th scope="col" className="py-3 pr-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/55">{children}</span>
    </th>
  )
}

function MoneyStat({
  value,
  label,
  accent,
}: {
  value: string
  label: string
  accent?: 'green' | 'amber'
}) {
  return (
    <div>
      <div
        className={cn(
          'text-lg font-semibold leading-tight tracking-tight',
          accent === 'green' ? 'text-emerald-700' : accent === 'amber' ? 'text-amber-700' : 'text-[#1A1A1A]',
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-[#1A1A1A]/55">{label}</div>
    </div>
  )
}

function CountStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold leading-none tracking-tight text-[#1A1A1A]">{value}</div>
      <div className="mt-1 text-xs font-medium text-[#1A1A1A]/55">{label}</div>
    </div>
  )
}

const PILL_STYLES: Record<PledgeStatus, string> = {
  invited: 'bg-black/[0.06] text-[#1A1A1A]/65',
  pledged: 'bg-[#F0DFF6] text-[#5d3a78]',
  partial: 'bg-amber-100 text-amber-800',
  paid: 'bg-[#9FE870]/30 text-[#3f6b1f]',
  declined: 'bg-rose-100 text-rose-700',
}

function PledgeStatusPill({ status }: { status: PledgeStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', PILL_STYLES[status])}>
      {PLEDGE_STATUS_LABELS[status]}
    </span>
  )
}

function ReminderButtons({
  p,
  onWa,
  onSms,
  onEmail,
}: {
  p: PledgeWithContact
  onWa: (p: PledgeWithContact) => void
  onSms: (p: PledgeWithContact) => void
  onEmail: (p: PledgeWithContact) => void
}) {
  const hasPhone = Boolean(p.whatsapp_phone || p.phone)
  return (
    <>
      <button
        onClick={() => onWa(p)}
        disabled={!hasPhone}
        aria-label="Send reminder on WhatsApp"
        title={hasPhone ? 'Send reminder on WhatsApp' : 'No phone on file'}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#25D366] hover:bg-[#25D366]/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <MessageCircle className="h-4 w-4" />
      </button>
      <button
        onClick={() => onSms(p)}
        disabled={!hasPhone}
        aria-label="Send reminder by SMS"
        title={hasPhone ? 'Send reminder by SMS' : 'No phone on file'}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/60 hover:bg-black/[0.05] hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Smartphone className="h-4 w-4" />
      </button>
      <button
        onClick={() => onEmail(p)}
        disabled={!p.email}
        aria-label="Send reminder by email"
        title={p.email ? 'Send reminder by email' : 'No email on file'}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/60 hover:bg-black/[0.05] hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Mail className="h-4 w-4" />
      </button>
    </>
  )
}

function PledgeSubNav({
  section,
  onChange,
  dueCount,
  copy,
}: {
  section: Section
  onChange: (s: Section) => void
  dueCount: number
  copy: PledgesDashboardCopy
}) {
  const tabs: { id: Section; label: string; icon: typeof HandCoins; badge?: number }[] = [
    { id: 'manage', label: copy.nav_manage, icon: HandCoins },
    { id: 'invite', label: copy.nav_invite, icon: Send },
    { id: 'collection', label: copy.nav_collection, icon: Banknote },
    { id: 'followups', label: copy.nav_followups, icon: ListChecks, badge: dueCount },
    { id: 'reports', label: copy.nav_reports, icon: BarChart3 },
  ]
  return (
    <nav
      role="tablist"
      aria-label="Pledge views"
      className="-mx-4 flex flex-wrap items-center gap-x-6 gap-y-2 overflow-x-auto border-b border-black/[0.06] px-4 pb-2 sm:mx-0 sm:px-0"
    >
      {tabs.map(({ id, label, icon: Icon, badge }) => {
        const active = id === section
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={cn(
              '-mb-[9px] inline-flex items-center gap-2 border-b-2 pb-2.5 text-sm transition-colors',
              active
                ? 'border-[#1A1A1A] font-semibold text-[#1A1A1A]'
                : 'border-transparent font-medium text-[#1A1A1A]/55 hover:text-[#1A1A1A]',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {badge ? (
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums',
                  active ? 'bg-[#1A1A1A] text-white' : 'bg-amber-100 text-amber-800',
                )}
              >
                {badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}

// ──────────────────────────────── send invites ────────────────────────────────

function CollectionSection({
  goalInput,
  setGoalInput,
  methods,
  setMethods,
  pending,
  onSave,
  copy,
}: {
  goalInput: string
  setGoalInput: (v: string) => void
  methods: PledgePaymentMethod[]
  setMethods: React.Dispatch<React.SetStateAction<PledgePaymentMethod[]>>
  pending: boolean
  onSave: () => void
  copy: PledgesDashboardCopy
}) {
  const goalNum = Number(goalInput) || 0
  const presets = [1_000_000, 2_500_000, 5_000_000, 10_000_000]

  const setRow = (i: number, patch: Partial<PledgePaymentMethod>) =>
    setMethods((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setMethods((rows) => [...rows, { label: '', value: '', name: '' }])
  const removeRow = (i: number) => setMethods((rows) => rows.filter((_, idx) => idx !== i))
  const filled = methods.filter((m) => m.label?.trim() || m.value?.trim())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#C9A0DC]/15 text-[#8e57b3]">
          <Banknote className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
            {copy.collection_title}
          </h2>
          <p className="mt-0.5 text-sm text-[#1A1A1A]/55">{copy.collection_desc}</p>
        </div>
      </div>

      {/* Fundraising goal */}
      <Card className="px-6 py-5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#8e57b3]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">{copy.goal_title}</h3>
          <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1A1A1A]/45">
            Optional
          </span>
        </div>
        <p className="mt-1 text-sm text-[#1A1A1A]/55">{copy.goal_desc}</p>

        <div className="relative mt-4 max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#1A1A1A]/40">
            TSh
          </span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="5,000,000"
            className={`${inputClass} pl-[3.5rem] text-lg font-semibold`}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setGoalInput(String(p))}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                goalNum === p
                  ? 'border-[#C9A0DC] bg-[#F0DFF6] text-[#5d3a78]'
                  : 'border-black/[0.12] text-[#1A1A1A]/65 hover:bg-black/[0.03]',
              )}
            >
              {formatMoney(p, 'TZS')}
            </button>
          ))}
          {goalInput ? (
            <button
              type="button"
              onClick={() => setGoalInput('')}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/45 hover:text-[#1A1A1A]"
            >
              Clear
            </button>
          ) : null}
        </div>

        {goalNum > 0 ? (
          <p className="mt-3 text-sm text-[#1A1A1A]/60">
            Target: <span className="font-semibold text-[#1A1A1A]">{formatMoney(goalNum, 'TZS')}</span>
          </p>
        ) : null}
      </Card>

      {/* How to pay */}
      <Card className="px-6 py-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#3f6b1f]" />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">{copy.howtopay_title}</h3>
        </div>
        <p className="mt-1 text-sm text-[#1A1A1A]/55">{copy.howtopay_desc}</p>

        <datalist id="pay-providers">
          {PAYMENT_PROVIDERS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {/* Row editor */}
          <div className="space-y-3">
            {methods.map((m, i) => (
              <div key={i} className="rounded-xl border border-black/[0.1] bg-black/[0.015] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1A1A1A]/55">Method {i + 1}</span>
                  {methods.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      aria-label="Remove method"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <input
                  list="pay-providers"
                  value={m.label}
                  onChange={(e) => setRow(i, { label: e.target.value })}
                  placeholder="Provider — e.g. M-Pesa, CRDB Bank"
                  className={inputClass}
                />
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={m.value}
                    onChange={(e) => setRow(i, { value: e.target.value })}
                    placeholder="Account / number"
                    className={inputClass}
                  />
                  <input
                    value={m.name ?? ''}
                    onChange={(e) => setRow(i, { name: e.target.value })}
                    placeholder="Account name (optional)"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.14] bg-white px-3.5 py-2 text-sm font-semibold text-[#1A1A1A] hover:bg-black/[0.03]"
            >
              <Plus className="h-3.5 w-3.5" /> Add payment method
            </button>
          </div>

          {/* Live preview matching the public pledge page */}
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[#1A1A1A]/45">
              How guests see it
            </p>
            <div className="rounded-2xl border border-[#9FE870]/40 bg-[#F3FAEC] p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9FE870]/30 text-[#3f6b1f]">
                  <Wallet className="h-3.5 w-3.5" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f6b1f]">
                  How to pay
                </p>
              </div>
              {filled.length ? (
                <ul className="mt-3 space-y-2.5">
                  {filled.map((m, i) => (
                    <li key={i} className="text-sm leading-snug">
                      <span className="text-[#1A1A1A]/75">
                        {m.label?.trim() ? <span className="font-semibold text-[#1A1A1A]">{m.label.trim()}</span> : null}
                        {m.label?.trim() && m.value?.trim() ? ', ' : ''}
                        {m.value?.trim() ? (
                          <span className="font-bold tracking-wide text-[#3f6b1f]">{m.value.trim()}</span>
                        ) : null}
                      </span>
                      {m.name?.trim() ? (
                        <div className="text-xs italic text-[#1A1A1A]/60">{m.name.trim()}</div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[#1A1A1A]/35">Your payment details will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-[#FBF9F5] px-5 py-3.5">
        <p className="text-xs text-[#1A1A1A]/55">
          These appear on your public pledge page and in reminder messages.
        </p>
        <Button onClick={onSave} disabled={pending}>
          {pending ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </div>
  )
}

function InviteSection({
  shareLink,
  coupleName,
  onCopy,
  copy,
}: {
  shareLink: string | null
  coupleName: string
  onCopy: () => void
  copy: PledgesDashboardCopy
}) {
  if (!shareLink) {
    return (
      <EmptyState
        icon={<Send className="h-7 w-7" />}
        title={copy.nolink_title}
        description={copy.nolink_description}
      />
    )
  }

  const message = pledgeRequestMessage(coupleName, shareLink)
  const noone = { whatsapp_phone: null, phone: null, full_name: '' }
  const waUrl = whatsappShareUrl(noone, message)
  const smsUrl = smsShareUrl(noone, message)
  const emailUrl = emailShareUrl({ email: null }, `You're invited to contribute — ${coupleName}`, message)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#1A1A1A]/25 bg-white px-5 py-2.5 text-sm font-bold text-[#1A1A1A] transition hover:bg-black/[0.03]"
        >
          <ExternalLink className="h-4 w-4" /> Preview as guest
        </a>
        <Link
          href="/my/dashboard/pledges/customize"
          className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black/90"
        >
          <Palette className="h-4 w-4" /> Customize
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Share */}
        <Card className="space-y-5 px-5 py-5">
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">{copy.share_title}</h3>
            <p className="mt-1 text-sm text-[#1A1A1A]/55">{copy.share_description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 truncate rounded-xl border border-black/[0.12] bg-white px-3 py-2.5 text-sm text-[#1A1A1A]/80">
              {shareLink.replace(/^https?:\/\//, '')}
            </div>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.18] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-black/[0.03]"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={smsUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.14] bg-white px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-black/[0.03]"
            >
              <Smartphone className="h-4 w-4" /> SMS
            </a>
            <a
              href={emailUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.14] bg-white px-3 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:bg-black/[0.03]"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
        </Card>

        <Card className="space-y-2 px-5 py-5">
          <h4 className="text-sm font-semibold text-[#1A1A1A]">The message they’ll receive</h4>
          <div className="whitespace-pre-line rounded-xl bg-[#DCF8C6]/50 px-4 py-3 text-sm leading-relaxed text-[#1A1A1A]/85 ring-1 ring-black/[0.04]">
            {message}
          </div>
        </Card>
      </div>

    </div>
  )
}


// ──────────────────────────────── follow-ups ────────────────────────────────

function FollowUpsSection({
  pledges,
  onWa,
  onSms,
  onEmail,
  onRecord,
  copy,
}: {
  pledges: PledgeWithContact[]
  onWa: (p: PledgeWithContact) => void
  onSms: (p: PledgeWithContact) => void
  onEmail: (p: PledgeWithContact) => void
  onRecord: (p: PledgeWithContact) => void
  copy: PledgesDashboardCopy
}) {
  // Everyone still owing money, due-first (overdue and scheduled-due at the top).
  const owing = pledges.filter((p) => OWING.includes(p.status))
  const sorted = [...owing].sort((a, b) => {
    const ad = isReminderDue(a) ? 0 : 1
    const bd = isReminderDue(b) ? 0 : 1
    if (ad !== bd) return ad - bd
    const at = a.promised_date ? new Date(a.promised_date).getTime() : Infinity
    const bt = b.promised_date ? new Date(b.promised_date).getTime() : Infinity
    return at - bt
  })

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks className="h-7 w-7" />}
        title={copy.followups_empty_title}
        description={copy.followups_empty_description}
      />
    )
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm [&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_th:first-child]:pl-5 [&_th:last-child]:pr-5">
        <thead>
          <tr className="border-b border-black/[0.06]">
            <Th>Contributor</Th>
            <Th>Owing</Th>
            <Th>Due</Th>
            <Th>Reminders</Th>
            <Th>Cadence</Th>
            <th className="w-1 py-3 pr-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.05]">
          {sorted.map((p) => {
            const days = daysUntil(p.promised_date)
            const due = isReminderDue(p)
            const owingAmt = Math.max(0, p.pledged_amount - p.amount_received)
            return (
              <tr key={p.id} className={cn('align-middle hover:bg-black/[0.02]', due && 'bg-amber-50/40')}>
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2">
                    {due ? <BellRing className="h-4 w-4 shrink-0 text-amber-600" aria-label="Due" /> : null}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#1A1A1A]">{p.full_name}</p>
                      <p className="text-xs text-[#1A1A1A]/50">{PLEDGE_STATUS_LABELS[p.status]}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4 font-medium text-[#1A1A1A]/80">
                  {formatMoney(owingAmt, p.currency)}
                </td>
                <td className="py-3.5 pr-4">
                  {p.promised_date ? (
                    <div className="text-xs leading-snug">
                      <div className="text-[#1A1A1A]/80">{formatDueDate(p.promised_date)}</div>
                      {days !== null ? (
                        <div className={cn(days < 0 ? 'font-medium text-rose-600' : 'text-[#1A1A1A]/50')}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'today' : `in ${days}d`}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-xs text-[#1A1A1A]/35">No date</span>
                  )}
                </td>
                <td className="py-3.5 pr-4">
                  {p.reminder_count === 0 ? (
                    <span className="text-xs text-[#1A1A1A]/45">None sent</span>
                  ) : (
                    <div className="text-xs leading-snug">
                      <div className="text-[#1A1A1A]/80">{p.reminder_count} sent</div>
                      {p.last_reminded_at ? (
                        <div className="text-[#1A1A1A]/50">last {formatDueDate(p.last_reminded_at)}</div>
                      ) : null}
                    </div>
                  )}
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-xs text-[#1A1A1A]/65">{CADENCE_LABELS[p.reminder_cadence]}</span>
                </td>
                <td className="py-3.5 pr-3 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <ReminderButtons p={p} onWa={onWa} onSms={onSms} onEmail={onEmail} />
                    <button
                      onClick={() => onRecord(p)}
                      aria-label="Record payment"
                      title="Record a payment"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50"
                    >
                      <Banknote className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

// ──────────────────────────────── reports ────────────────────────────────

function ReportsSection({
  pledges,
  stats,
  goalAmount,
  weddingDate,
  onExport,
  onPrint,
  onChaseFollowups,
  onViewAwaiting,
  copy,
}: {
  pledges: PledgeWithContact[]
  stats: PledgeStats
  goalAmount: number | null
  weddingDate: string | null
  onExport: () => void
  onPrint: () => void
  onChaseFollowups: () => void
  onViewAwaiting: () => void
  copy: PledgesDashboardCopy
}) {
  const collectionRate =
    stats.totalPledged > 0 ? Math.round((stats.totalReceived / stats.totalPledged) * 100) : 0

  const byStatus = (Object.keys(PLEDGE_STATUS_LABELS) as PledgeStatus[]).map((s) => {
    const rows = pledges.filter((p) => p.status === s)
    return {
      label: PLEDGE_STATUS_LABELS[s],
      count: rows.length,
      pledged: rows.reduce((n, p) => n + p.pledged_amount, 0),
      received: rows.reduce((n, p) => n + p.amount_received, 0),
    }
  })

  const byMethod = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[])
    .map((m) => {
      const rows = pledges.filter((p) => p.payment_method === m && p.amount_received > 0)
      return {
        label: PAYMENT_METHOD_LABELS[m],
        count: rows.length,
        received: rows.reduce((n, p) => n + p.amount_received, 0),
      }
    })
    .filter((r) => r.count > 0)

  const byGroup = Object.entries(
    pledges.reduce<Record<string, { pledged: number; received: number; count: number }>>((acc, p) => {
      const key = p.group_tag?.trim() || 'Ungrouped'
      const g = acc[key] ?? { pledged: 0, received: 0, count: 0 }
      g.pledged += p.pledged_amount
      g.received += p.amount_received
      g.count += 1
      acc[key] = g
      return acc
    }, {}),
  ).sort((a, b) => b[1].received - a[1].received)

  const totalReminders = pledges.reduce((n, p) => n + p.reminder_count, 0)
  const aging = outstandingAging(pledges)

  // ── Chart datasets ──
  const trendPoints = cumulativePledgedByDay(pledges)
  const funnelStages = [
    { label: 'Contributors', value: pledges.filter((p) => p.status !== 'declined').length, color: '#C9A0DC' },
    {
      label: 'Pledged',
      value: pledges.filter((p) => p.status === 'pledged' || p.status === 'partial' || p.status === 'paid').length,
      color: '#b388d4',
    },
    {
      label: 'Partly or fully paid',
      value: pledges.filter((p) => p.status === 'partial' || p.status === 'paid').length,
      color: '#7EC8C0',
    },
    { label: 'Fully paid', value: stats.paidCount, color: '#9FE870' },
  ]
  const methodChart = byMethod.map((m) => ({ label: m.label, value: m.received, note: `${m.count}` }))
  const groupChart = byGroup.map(([name, g]) => ({
    label: name,
    value: g.pledged > 0 ? Math.round((g.received / g.pledged) * 100) : 0,
    note: formatMoney(g.received, 'TZS'),
  }))
  const overdueAmount = aging.filter((b) => b.key.startsWith('over')).reduce((n, b) => n + b.amount, 0)
  const awaitingCount = pledges.filter((p) => p.status === 'invited').length
  const top = topContributors(pledges, 10)

  // Pledge-amount mix (count-based fulfillment + average / largest).
  const contributing = pledges.filter((p) => p.status !== 'declined' && p.pledged_amount > 0)
  const avgPledge = contributing.length
    ? Math.round(contributing.reduce((n, p) => n + p.pledged_amount, 0) / contributing.length)
    : 0
  const largestPledge = contributing.reduce((m, p) => Math.max(m, p.pledged_amount), 0)
  const fulfillmentRate = stats.totalPledges > 0 ? Math.round((stats.paidCount / stats.totalPledges) * 100) : 0

  // Goal progress.
  const hasGoal = !!goalAmount && goalAmount > 0
  const receivedPct = hasGoal ? Math.min(100, Math.round((stats.totalReceived / goalAmount!) * 100)) : 0
  const pledgedPct = hasGoal ? Math.min(100, Math.round((stats.totalPledged / goalAmount!) * 100)) : 0
  const daysToWedding = daysUntil(weddingDate)
  const paceLine =
    daysToWedding === null
      ? null
      : daysToWedding > 0
        ? `${daysToWedding} ${daysToWedding === 1 ? 'day' : 'days'} until the wedding`
        : daysToWedding === 0
          ? 'The wedding is today'
          : `${Math.abs(daysToWedding)} ${Math.abs(daysToWedding) === 1 ? 'day' : 'days'} since the wedding`

  if (pledges.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-7 w-7" />}
        title={copy.reports_empty_title}
        description={copy.reports_empty_description}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#1A1A1A]/60">
          Contribution summary across {pledges.length} {pledges.length === 1 ? 'pledge' : 'pledges'}.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {overdueAmount > 0 ? (
            <Button variant="secondary" onClick={onChaseFollowups}>
              <BellRing className="h-4 w-4" /> Chase follow-ups
            </Button>
          ) : null}
          {awaitingCount > 0 ? (
            <Button variant="secondary" onClick={onViewAwaiting}>
              <HandCoins className="h-4 w-4" /> View awaiting ({awaitingCount})
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onPrint}>
            <BarChart3 className="h-4 w-4" /> Print summary
          </Button>
          <Button variant="secondary" onClick={onExport}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Fundraising goal + progress */}
      {hasGoal ? (
        <Card className="px-5 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-[#1A1A1A]">Fundraising goal</p>
            <p className="text-sm text-[#1A1A1A]/60">
              {formatMoney(stats.totalReceived, 'TZS')} of {formatMoney(goalAmount!, 'TZS')}
            </p>
          </div>
          <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-black/[0.06]">
            {/* Pledged (committed) underlay, with collected on top. */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-200" style={{ width: `${pledgedPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500" style={{ width: `${receivedPct}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold text-emerald-700">{receivedPct}% collected</span>
            <span className="text-[#1A1A1A]/55">
              {pledgedPct}% pledged{paceLine ? ` · ${paceLine}` : ''}
            </span>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
          <p className="text-sm text-[#1A1A1A]/60">
            Set a fundraising goal to track progress toward a target.
          </p>
          <Link
            href="/my/dashboard/settings"
            className="text-sm font-semibold text-[#1A1A1A] underline-offset-2 hover:underline"
          >
            Set a goal →
          </Link>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Total pledged" value={formatMoney(stats.totalPledged, 'TZS')} />
        <SummaryTile label="Received" value={formatMoney(stats.totalReceived, 'TZS')} accent="green" />
        <SummaryTile
          label="Outstanding"
          value={formatMoney(stats.outstanding, 'TZS')}
          accent="amber"
          hint={overdueAmount > 0 ? `${formatMoney(overdueAmount, 'TZS')} overdue` : undefined}
        />
        <SummaryTile
          label="Collection rate"
          value={`${collectionRate}%`}
          hint={`${stats.paidCount} of ${stats.totalPledges} paid (${fulfillmentRate}%)`}
        />
      </div>

      <ReportTable
        title="By status"
        head={['Status', 'Count', 'Pledged', 'Received']}
        rows={byStatus.map((r) => [r.label, String(r.count), formatMoney(r.pledged, 'TZS'), formatMoney(r.received, 'TZS')])}
      />

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Pledges over time" subtitle="Cumulative committed amount">
          <LineChart points={trendPoints} format={(n) => formatMoney(n, 'TZS')} />
        </ChartCard>
        <ChartCard title="Contribution funnel" subtitle="Where contributors are in the journey">
          <Funnel stages={funnelStages} />
        </ChartCard>
        {methodChart.length > 0 ? (
          <ChartCard title="Received by payment method">
            <BarRows rows={methodChart} accent="#9FE870" format={(n) => formatMoney(n, 'TZS')} />
          </ChartCard>
        ) : null}
        {groupChart.length > 1 ? (
          <ChartCard title="Collection rate by group" subtitle="Received vs pledged">
            <BarRows rows={groupChart} accent="#7EC8C0" format={(n) => `${n}%`} />
          </ChartCard>
        ) : null}
      </div>

      {/* Outstanding by age — who to chase first */}
      {aging.length > 0 ? (
        <ReportTable
          title="Outstanding by age"
          head={['Age', 'Count', 'Outstanding']}
          rows={aging.map((b) => [b.label, String(b.count), formatMoney(b.amount, 'TZS')])}
        />
      ) : null}

      {/* Top contributors */}
      {top.length > 0 ? (
        <ReportTable
          title="Top contributors"
          head={['Contributor', 'Pledged', 'Received']}
          rows={top.map((p) => [p.full_name, formatMoney(p.pledged_amount, 'TZS'), formatMoney(p.amount_received, 'TZS')])}
        />
      ) : null}

      {byMethod.length > 0 ? (
        <ReportTable
          title="Received by payment method"
          head={['Method', 'Payments', 'Received']}
          rows={byMethod.map((r) => [r.label, String(r.count), formatMoney(r.received, 'TZS')])}
        />
      ) : null}

      <ReportTable
        title="By group"
        head={['Group', 'Pledges', 'Pledged', 'Received', 'Rate']}
        rows={byGroup.map(([name, g]) => [
          name,
          String(g.count),
          formatMoney(g.pledged, 'TZS'),
          formatMoney(g.received, 'TZS'),
          `${g.pledged > 0 ? Math.round((g.received / g.pledged) * 100) : 0}%`,
        ])}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Average pledge" value={formatMoney(avgPledge, 'TZS')} />
        <SummaryTile label="Largest pledge" value={formatMoney(largestPledge, 'TZS')} />
        <SummaryTile
          label="Confirmed coming"
          value={String(stats.attendingCount)}
          hint={stats.attendingCount === 0 ? 'No one has confirmed yet' : undefined}
        />
        <SummaryTile
          label="Reminders sent"
          value={String(totalReminders)}
          hint={totalReminders === 0 ? 'No reminders sent yet' : undefined}
        />
      </div>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  accent,
  hint,
}: {
  label: string
  value: string
  accent?: 'green' | 'amber'
  hint?: string
}) {
  return (
    <Card className="px-4 py-3">
      <div className="text-xs font-medium text-[#1A1A1A]/55">{label}</div>
      <div
        className={cn(
          'mt-1 text-lg font-semibold leading-tight tracking-tight',
          accent === 'green' ? 'text-emerald-700' : accent === 'amber' ? 'text-amber-700' : 'text-[#1A1A1A]',
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-[#1A1A1A]/45">{hint}</div> : null}
    </Card>
  )
}

function ReportTable({
  title,
  head,
  rows,
}: {
  title: string
  head: string[]
  rows: string[][]
}) {
  return (
    <Card className="overflow-x-auto">
      <div className="px-5 pt-4 text-sm font-semibold text-[#1A1A1A]">{title}</div>
      <table className="mt-2 w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-black/[0.06]">
            {head.map((h, i) => (
              <th
                key={h}
                className={cn(
                  'px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/55',
                  i > 0 && 'text-right',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.05]">
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'px-5 py-2.5',
                    ci === 0 ? 'text-[#1A1A1A]' : 'text-right tabular-nums text-[#1A1A1A]/75',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function PledgeSlideover({
  open,
  form,
  setForm,
  contacts,
  pending,
  onClose,
  onSave,
}: {
  open: boolean
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  contacts: ContactLite[]
  pending: boolean
  onClose: () => void
  onSave: () => void
}) {
  const isEdit = Boolean(form.id)
  return (
    <Slideover
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit pledge' : 'Add pledge'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={pending}>
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add pledge'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Contributor */}
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-[#1A1A1A]">Contributor</h4>
          {!isEdit ? (
            <div className="flex gap-2">
              <ModeChip active={form.mode === 'new'} onClick={() => setForm((f) => ({ ...f, mode: 'new' }))}>
                New person
              </ModeChip>
              <ModeChip
                active={form.mode === 'existing'}
                onClick={() => setForm((f) => ({ ...f, mode: 'existing' }))}
              >
                From guest list
              </ModeChip>
            </div>
          ) : null}

          {!isEdit && form.mode === 'existing' ? (
            <Field label="Pick a contributor">
              <select
                className={inputClass}
                value={form.guestContactId}
                onChange={(e) => setForm((f) => ({ ...f, guestContactId: e.target.value }))}
              >
                <option value="">Select…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <Field label="Full name *">
                <input
                  className={inputClass}
                  value={form.full_name}
                  disabled={isEdit}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="e.g. Mzee Juma Said"
                />
              </Field>
              {!isEdit ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Mobile / WhatsApp">
                    <input
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value, whatsapp_phone: e.target.value }))}
                      placeholder="07XX XXX XXX"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>
              ) : (
                <p className="text-xs text-[#1A1A1A]/50">
                  Edit this person’s contact details from the Guest list.
                </p>
              )}
            </>
          )}
        </section>

        {/* The pledge */}
        <section className="space-y-3 border-t border-black/[0.06] pt-5">
          <h4 className="text-sm font-semibold text-[#1A1A1A]">The pledge</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
            <Field label="Currency">
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              >
                <option value="TZS">TZS</option>
                <option value="USD">USD</option>
                <option value="KES">KES</option>
                <option value="EUR">EUR</option>
              </select>
            </Field>
            <Field label="Amount pledged">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.pledged_amount}
                onChange={(e) => setForm((f) => ({ ...f, pledged_amount: e.target.value }))}
                placeholder="e.g. 200000"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Amount received">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.amount_received}
                onChange={(e) => setForm((f) => ({ ...f, amount_received: e.target.value }))}
                placeholder="0"
              />
            </Field>
            <Field label="Promised by">
              <input
                type="date"
                className={inputClass}
                value={form.promised_date}
                onChange={(e) => setForm((f) => ({ ...f, promised_date: e.target.value }))}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PledgeStatus }))}
              >
                {(Object.keys(PLEDGE_STATUS_LABELS) as PledgeStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PLEDGE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Payment method">
              <select
                className={inputClass}
                value={form.payment_method}
                onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value as PaymentMethod | '' }))}
              >
                <option value="">—</option>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Reminders" hint="Schedule follow-ups; we’ll surface them when due.">
            <select
              className={inputClass}
              value={form.reminder_cadence}
              onChange={(e) => setForm((f) => ({ ...f, reminder_cadence: e.target.value as ReminderCadence }))}
            >
              {(Object.keys(CADENCE_LABELS) as ReminderCadence[]).map((c) => (
                <option key={c} value={c}>
                  {CADENCE_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>
        </section>

        {/* Attendance + card */}
        <section className="space-y-3 border-t border-black/[0.06] pt-5">
          <h4 className="text-sm font-semibold text-[#1A1A1A]">Attendance & card</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Coming to the event?">
              <select
                className={inputClass}
                value={form.will_attend}
                onChange={(e) => setForm((f) => ({ ...f, will_attend: e.target.value as AttendanceAnswer | '' }))}
              >
                <option value="">Not confirmed</option>
                {(Object.keys(ATTENDANCE_LABELS) as AttendanceAnswer[]).map((a) => (
                  <option key={a} value={a}>
                    {ATTENDANCE_LABELS[a]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Card">
              <select
                className={inputClass}
                value={form.card_status}
                onChange={(e) => setForm((f) => ({ ...f, card_status: e.target.value as CardStatus }))}
              >
                {(Object.keys(CARD_STATUS_LABELS) as CardStatus[]).map((c) => (
                  <option key={c} value={c}>
                    {CARD_STATUS_LABELS[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notes" hint="Optional">
            <textarea
              rows={3}
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Anything to remember about this pledge…"
            />
          </Field>
        </section>
      </div>
    </Slideover>
  )
}

function ModeChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'border-[#C9A0DC] bg-[#F0DFF6] text-[#5d3a78]'
          : 'border-black/[0.12] text-[#1A1A1A]/70 hover:bg-black/[0.04]',
      )}
    >
      {children}
    </button>
  )
}
