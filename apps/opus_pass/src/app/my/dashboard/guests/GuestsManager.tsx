'use client'

import { useMemo, useState, useTransition } from 'react'
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
} from 'lucide-react'
import { Card, SectionTitle, EmptyState, StatusPill } from '@/components/dashboard/primitives'
import { Button, Dialog, Field, inputClass } from '@/components/dashboard/controls'
import {
  createGuest,
  updateGuest,
  deleteGuest,
  bulkImportGuests,
  recordSend,
  type GuestInput,
} from '@/lib/dashboard/actions'
import { rsvpUrl } from '@/lib/dashboard/share'
import type { GuestWithInvitations, RsvpStatus, WeddingEvent } from '@/lib/dashboard/types'

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
}: {
  initialGuests: GuestWithInvitations[]
  events: WeddingEvent[]
}) {
  const [query, setQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importEventIds, setImportEventIds] = useState<string[]>([])
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
    setOpen(true)
  }

  function toggleEvent(id: string) {
    setForm((f) => {
      const set = new Set(f.eventIds ?? [])
      set.has(id) ? set.delete(id) : set.add(id)
      return { ...f, eventIds: [...set] }
    })
  }

  function save() {
    if (!form.full_name.trim()) {
      toast.error("Enter the guest's name")
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
      toast.success('RSVP link copied')
      await recordSend(g.id, 'link')
    } catch {
      toast.error('Could not copy link')
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="Guest list" subtitle={`${initialGuests.length} guests on your list`} />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add guest
          </Button>
        </div>
      </div>

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
          description="Add guests one by one, or paste a list to import them in bulk. Each guest gets a personal RSVP link."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add a guest
              </Button>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" /> Import a list
              </Button>
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
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A0DC]/15 text-sm font-semibold text-[#8e57b3]">
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
                    <button
                      onClick={() => copyLink(g)}
                      aria-label="Copy RSVP link"
                      title="Copy RSVP link"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e57b3] hover:bg-[#C9A0DC]/15"
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

      {/* Add / edit guest */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit guest' : 'Add guest'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? 'Saving…' : editing ? 'Save changes' : 'Add guest'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name">
            <input
              className={inputClass}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. Asha & Juma Mussa"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp" hint="If different from phone">
              <input
                className={inputClass}
                value={form.whatsapp_phone ?? ''}
                onChange={(e) => setForm({ ...form, whatsapp_phone: e.target.value })}
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
          <Field label="Seats allowed" hint="Max people this invite can bring">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.max_party_size ?? 1}
              onChange={(e) => setForm({ ...form, max_party_size: Math.max(1, Number(e.target.value) || 1) })}
            />
          </Field>
          {events.length > 0 ? (
            <Field label="Invite to events">
              <div className="space-y-2 rounded-xl border border-black/[0.1] p-3">
                {events.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 text-sm text-[#1A1A1A]/80">
                    <input
                      type="checkbox"
                      checked={(form.eventIds ?? []).includes(ev.id)}
                      onChange={() => toggleEvent(ev.id)}
                      className="h-4 w-4 rounded border-black/20 accent-[#C9A0DC]"
                    />
                    {ev.name}
                  </label>
                ))}
              </div>
            </Field>
          ) : (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Add an event first to invite this guest to it.
            </p>
          )}
        </div>
      </Dialog>

      {/* Bulk import */}
      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import guests"
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
          <Field label="Paste guests" hint="One per line. Optionally: Name, email, phone">
            <textarea
              className={inputClass}
              rows={7}
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
      </Dialog>
    </div>
  )
}
