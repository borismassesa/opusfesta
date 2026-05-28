'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Link2,
  Upload,
  Mail,
  Phone,
  MessageCircle,
  Minus,
  X,
  ClipboardSignature,
} from 'lucide-react'
import { Card, EmptyState, StatusPill } from '@/components/dashboard/primitives'
import { Button, Slideover, Tabs, Field, inputClass } from '@/components/dashboard/controls'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import CollectorShareSlideover from './CollectorShareSlideover'
import {
  createGuest,
  updateGuest,
  deleteGuest,
  bulkImportGuests,
  recordSend,
  type GuestInput,
} from '@/lib/dashboard/actions'
import { inviteMessage, rsvpUrl, whatsappShareUrl } from '@/lib/dashboard/share'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'
import type {
  GuestWithInvitations,
  RsvpStatus,
  WeddingEvent,
} from '@/lib/dashboard/types'

type FormTab = 'info' | 'invitations'

const emptyForm: GuestInput = {
  full_name: '',
  email: '',
  phone: '',
  whatsapp_phone: '',
  group_tag: '',
  max_party_size: 1,
  notes: '',
  eventIds: [],
}

function summaryStatus(g: GuestWithInvitations): RsvpStatus | null {
  if (g.invitations.length === 0) return null
  if (g.invitations.some((i) => i.rsvp_status === 'attending')) return 'attending'
  if (g.invitations.every((i) => i.rsvp_status === 'declined')) return 'declined'
  if (g.invitations.some((i) => i.rsvp_status === 'maybe')) return 'maybe'
  return 'pending'
}

export default function GuestsManager({
  initialGuests,
  events,
  coupleName,
  hero,
  collectorToken,
}: {
  initialGuests: GuestWithInvitations[]
  events: WeddingEvent[]
  coupleName: string
  hero: DashboardHeroContent
  collectorToken: string | null
}) {
  const [query, setQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<FormTab>('info')
  const [importOpen, setImportOpen] = useState(false)
  const [collectorOpen, setCollectorOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importEventIds, setImportEventIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<GuestWithInvitations | null>(null)
  const [form, setForm] = useState<GuestInput>(emptyForm)
  const [pending, startTransition] = useTransition()

  const groups = useMemo(
    () => [...new Set(initialGuests.map((g) => g.group_tag).filter(Boolean))] as string[],
    [initialGuests]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialGuests.filter((g) => {
      if (groupFilter !== 'all' && g.group_tag !== groupFilter) return false
      if (!q) return true
      return (
        g.full_name.toLowerCase().includes(q) ||
        (g.email ?? '').toLowerCase().includes(q) ||
        (g.group_tag ?? '').toLowerCase().includes(q)
      )
    })
  }, [initialGuests, query, groupFilter])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setTab('info')
    setOpen(true)
  }

  function openEdit(g: GuestWithInvitations) {
    setEditing(g)
    setForm({
      full_name: g.full_name,
      email: g.email ?? '',
      phone: g.phone ?? '',
      whatsapp_phone: g.whatsapp_phone ?? '',
      group_tag: g.group_tag ?? '',
      max_party_size: g.max_party_size,
      notes: g.notes ?? '',
      eventIds: g.invitations.map((i) => i.event_id),
    })
    setTab('info')
    setOpen(true)
  }

  function toggleEvent(id: string) {
    setForm((f) => {
      const set = new Set(f.eventIds ?? [])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...f, eventIds: [...set] }
    })
  }

  function adjustParty(delta: number) {
    setForm((f) => ({
      ...f,
      max_party_size: Math.max(1, (f.max_party_size ?? 1) + delta),
    }))
  }

  function save() {
    if (!form.full_name.trim()) {
      toast.error("Enter the guest's name")
      setTab('info')
      return
    }
    startTransition(async () => {
      try {
        if (editing) {
          await updateGuest(editing.id, form)
          toast.success('Guest updated')
        } else {
          await createGuest(form)
          toast.success('Guest added')
        }
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  function remove(g: GuestWithInvitations) {
    if (!confirm(`Remove ${g.full_name} from your guest list?`)) return
    startTransition(async () => {
      try {
        await deleteGuest(g.id)
        toast.success('Guest removed')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not remove')
      }
    })
  }

  async function copyLink(g: GuestWithInvitations) {
    const url = rsvpUrl(window.location.origin, g.public_token)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      toast.error('Could not copy link')
      return
    }
    toast.success('RSVP link copied')
    recordSend(g.id, 'link').catch(() => {})
  }

  function sendWhatsApp(g: GuestWithInvitations) {
    const link = rsvpUrl(window.location.origin, g.public_token)
    const msg = inviteMessage(coupleName, g.full_name, link)
    const url = whatsappShareUrl(g, msg)
    window.open(url, '_blank', 'noopener,noreferrer')
    recordSend(g.id, 'whatsapp').catch(() => {})
  }

  function pickImportFile() {
    fileInputRef.current?.click()
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const raw = await file.text()
      setImportText(csvToImportLines(raw))
    } catch {
      toast.error('Could not read file')
    } finally {
      e.target.value = '' // allow re-selecting the same file
    }
  }

  function runImport() {
    if (!importText.trim()) {
      toast.error('Paste at least one name')
      return
    }
    startTransition(async () => {
      try {
        const n = await bulkImportGuests(importText, importEventIds)
        toast.success(`${n} guest${n === 1 ? '' : 's'} added`)
        setImportOpen(false)
        setImportText('')
        setImportEventIds([])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Import failed')
      }
    })
  }

  const eventName = (id: string) => events.find((e) => e.id === id)?.name ?? 'Event'

  return (
    <div className="space-y-6">
      <DashboardHero
        content={hero}
        actions={
          <>
            {collectorToken ? (
              <button
                type="button"
                onClick={() => setCollectorOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-white"
              >
                <ClipboardSignature className="h-3.5 w-3.5" /> Collect addresses
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-white"
            >
              <Upload className="h-3.5 w-3.5" /> Upload spreadsheet
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-full bg-[#C9A0DC] px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#b97fd0]"
            >
              <Plus className="h-3.5 w-3.5" /> Add guests
            </button>
          </>
        }
      />

      {initialGuests.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search guests…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {groups.length > 0 ? (
            <select
              className={`${inputClass} w-auto`}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">All groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}

      {initialGuests.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="Build your guest list"
          description="Add guests one by one, or upload a spreadsheet to import them in bulk. Each guest gets a personal RSVP link you can send by WhatsApp."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add guests
              </Button>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" /> Upload spreadsheet
              </Button>
              {collectorToken ? (
                <Button variant="secondary" onClick={() => setCollectorOpen(true)}>
                  <ClipboardSignature className="h-4 w-4" /> Collect addresses
                </Button>
              ) : null}
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search className="h-6 w-6" />} title="No guests match your search" />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-black/[0.05]">
            {filtered.map((g) => {
              const status = summaryStatus(g)
              return (
                <div key={g.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-sm font-semibold text-[#1A1A1A]/70">
                      {g.full_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#1A1A1A]">{g.full_name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#1A1A1A]/50">
                        {g.group_tag ? <span>{g.group_tag}</span> : null}
                        {g.email ? (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {g.email}
                          </span>
                        ) : null}
                        {g.phone ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {g.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="hidden max-w-[180px] flex-wrap gap-1 md:flex">
                    {g.invitations.length === 0 ? (
                      <span className="text-xs text-[#1A1A1A]/40">Not invited yet</span>
                    ) : (
                      g.invitations.slice(0, 2).map((inv) => (
                        <span
                          key={inv.id}
                          className="rounded-full bg-black/[0.04] px-2 py-0.5 text-xs text-[#1A1A1A]/60"
                        >
                          {eventName(inv.event_id)}
                        </span>
                      ))
                    )}
                    {g.invitations.length > 2 ? (
                      <span className="text-xs text-[#1A1A1A]/40">+{g.invitations.length - 2}</span>
                    ) : null}
                  </div>

                  <div className="w-24 shrink-0 text-right">
                    {status ? <StatusPill status={status} /> : null}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    {g.whatsapp_phone || g.phone ? (
                      <button
                        onClick={() => sendWhatsApp(g)}
                        aria-label="Send invite on WhatsApp"
                        title="Send invite on WhatsApp"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#25D366] hover:bg-[#25D366]/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => copyLink(g)}
                      aria-label="Copy RSVP link"
                      title="Copy RSVP link"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/60 hover:bg-black/[0.05] hover:text-[#1A1A1A]"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEdit(g)}
                      aria-label="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/50 hover:bg-black/[0.05]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(g)}
                      aria-label="Remove"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Add / edit guest — slideover */}
      <Slideover
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit guest' : 'Add guests'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? 'Saving…' : editing ? 'Save changes' : 'Add to list'}
            </Button>
          </>
        }
      >
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'info', label: 'Guest info' },
            { id: 'invitations', label: 'Invitations' },
          ]}
        />

        {tab === 'info' ? (
          <div className="space-y-4">
            <Field label="Full name">
              <input
                className={inputClass}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Asha & Juma Mussa"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Email">
                <input
                  type="email"
                  className={inputClass}
                  value={form.email ?? ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone">
                <input
                  className={inputClass}
                  value={form.phone ?? ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="07XX XXX XXX"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="WhatsApp" hint="If different from phone">
                <input
                  className={inputClass}
                  value={form.whatsapp_phone ?? ''}
                  onChange={(e) => setForm({ ...form, whatsapp_phone: e.target.value })}
                  placeholder="07XX XXX XXX"
                />
              </Field>
              <Field label="Group">
                <input
                  className={inputClass}
                  value={form.group_tag ?? ''}
                  onChange={(e) => setForm({ ...form, group_tag: e.target.value })}
                  placeholder="e.g. Family"
                />
              </Field>
            </div>

            <Field label="Total seats" hint="Including the named guest, plus any plus-ones or kids">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustParty(-1)}
                  aria-label="Fewer seats"
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset ring-black/[0.12] hover:bg-black/[0.04]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2ch] text-center text-xl font-semibold tabular-nums text-[#1A1A1A]">
                  {form.max_party_size ?? 1}
                </span>
                <button
                  type="button"
                  onClick={() => adjustParty(1)}
                  aria-label="More seats"
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset ring-black/[0.12] hover:bg-black/[0.04]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </Field>

            <Field label="Notes" hint="Optional — meal preferences, accessibility, who they came with">
              <textarea
                rows={3}
                className={inputClass}
                value={form.notes ?? ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Vegetarian, requires wheelchair access…"
              />
            </Field>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#1A1A1A]/60">
              Pick which events this guest is invited to. They&apos;ll see only the events you tick on their RSVP page.
            </p>
            {events.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-black/[0.1] p-3">
                {events.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-3 text-sm text-[#1A1A1A]/80">
                    <input
                      type="checkbox"
                      checked={(form.eventIds ?? []).includes(ev.id)}
                      onChange={() => toggleEvent(ev.id)}
                      className="h-4 w-4 rounded border-black/20 accent-[#C9A0DC]"
                    />
                    <span className="flex-1">{ev.name}</span>
                    {ev.starts_at ? (
                      <span className="text-xs text-[#1A1A1A]/45">
                        {new Date(ev.starts_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Add an event first to invite this guest to it.
              </p>
            )}
          </div>
        )}
      </Slideover>

      {/* Bulk import — slideover with file or paste */}
      <Slideover
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Upload spreadsheet"
        footer={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={runImport} disabled={pending}>
              {pending ? 'Importing…' : 'Import'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-black/[0.15] bg-black/[0.02] p-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Drop a .csv file</p>
            <p className="mt-1 text-xs text-[#1A1A1A]/55">
              Columns we recognize: <span className="font-medium">Name, Email, Phone, Group</span>. The first
              row is treated as a header if it looks like one.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={pickImportFile}>
                <Upload className="h-4 w-4" /> Choose CSV file
              </Button>
              {importText ? (
                <button
                  type="button"
                  onClick={() => setImportText('')}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#1A1A1A]/55 hover:bg-black/[0.05]"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onImportFile}
            />
          </div>

          <Field label="Or paste names" hint="One per line. Optionally: Name, email, phone">
            <textarea
              className={inputClass}
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={'Asha Mussa, asha@email.com, 0712345678\nJuma Said\nGrace Mollel, grace@email.com'}
            />
          </Field>

          {events.length > 0 ? (
            <Field label="Invite all to">
              <div className="space-y-2 rounded-xl border border-black/[0.1] p-3">
                {events.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 text-sm text-[#1A1A1A]/80">
                    <input
                      type="checkbox"
                      checked={importEventIds.includes(ev.id)}
                      onChange={() =>
                        setImportEventIds((ids) =>
                          ids.includes(ev.id) ? ids.filter((x) => x !== ev.id) : [...ids, ev.id]
                        )
                      }
                      className="h-4 w-4 rounded border-black/20 accent-[#C9A0DC]"
                    />
                    {ev.name}
                  </label>
                ))}
              </div>
            </Field>
          ) : null}
        </div>
      </Slideover>

      <CollectorShareSlideover
        open={collectorOpen}
        onClose={() => setCollectorOpen(false)}
        collectorToken={collectorToken}
        coupleName={coupleName}
      />
    </div>
  )
}

/**
 * Convert raw CSV content into the line-based format `bulkImportGuests` expects:
 * `Name, email, phone` per line. Skips a leading header row when it looks like
 * one (i.e. cells contain the keywords name/email/phone). Tolerates quoted
 * fields and Windows line endings.
 */
function csvToImportLines(raw: string): string {
  const text = raw.replace(/\r\n?/g, '\n').trim()
  if (!text) return ''
  const rows = parseCsv(text)
  if (rows.length === 0) return ''

  const header = rows[0].map((c) => c.toLowerCase())
  const looksLikeHeader =
    header.some((c) => /(^|\b)(name|full ?name)\b/.test(c)) ||
    header.some((c) => c.includes('email')) ||
    header.some((c) => c.includes('phone'))

  const colIndex = (matchers: RegExp[]) =>
    header.findIndex((c) => matchers.some((re) => re.test(c)))

  let nameIdx = 0
  let emailIdx = 1
  let phoneIdx = 2
  if (looksLikeHeader) {
    const n = colIndex([/(^|\b)name\b/, /full ?name/])
    const e = colIndex([/email/])
    const p = colIndex([/phone|mobile|whatsapp/])
    if (n >= 0) nameIdx = n
    if (e >= 0) emailIdx = e
    if (p >= 0) phoneIdx = p
  }

  const dataRows = looksLikeHeader ? rows.slice(1) : rows
  return dataRows
    .map((cols) => {
      const name = (cols[nameIdx] ?? '').trim()
      const email = (cols[emailIdx] ?? '').trim()
      const phone = (cols[phoneIdx] ?? '').trim()
      if (!name) return null
      return [name, email, phone].filter(Boolean).join(', ')
    })
    .filter((line): line is string => line !== null)
    .join('\n')
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0))
}
