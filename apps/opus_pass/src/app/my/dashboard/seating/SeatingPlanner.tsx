'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Armchair,
  Check,
  ChevronDown,
  Download,
  GripVertical,
  Pencil,
  Plus,
  Share2,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, EmptyState } from '@/components/dashboard/primitives'
import { Button, ConfirmDialog, Dialog, Field, inputClass } from '@/components/dashboard/controls'
import {
  assignGuestToTable,
  createSeatingTable,
  deleteSeatingTable,
  unassignGuest,
  updateSeatingTable,
} from '@/lib/dashboard/actions'
import type { SeatableGuest, SeatingData, SeatingTable } from '@/lib/dashboard/types'

type EventLite = { id: string; name: string }

/** Card chrome, as a class string so drop zones can be plain divs with drag handlers. */
const CARD_BASE = 'rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]'

/** Headcount a list of guest parties occupies. */
function seatsOf(list: SeatableGuest[]): number {
  return list.reduce((n, g) => n + g.seats, 0)
}

/** "Pilau · Halal" — meal choice and any dietary note, joined. */
function mealLine(g: SeatableGuest): string {
  return [g.meal_choice, g.dietary_notes].filter(Boolean).join(' · ')
}

export default function SeatingPlanner({
  events,
  data,
}: {
  events: EventLite[]
  data: SeatingData
}) {
  const router = useRouter()
  const eventId = data.event.id

  // Local mirror of the plan for snappy drag-and-drop; resynced whenever the
  // server re-renders (after a table add/edit/delete -> router.refresh()).
  const [tables, setTables] = useState<SeatingTable[]>(data.tables)
  const [guests, setGuests] = useState<SeatableGuest[]>(data.guests)
  useEffect(() => {
    setTables(data.tables)
    setGuests(data.guests)
  }, [data])

  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const draggedId = useRef<string | null>(null)
  const [dropZone, setDropZone] = useState<string | null>(null) // table id | 'pool'
  const [menuFor, setMenuFor] = useState<string | null>(null) // guest id with open move-menu
  const [editTable, setEditTable] = useState<SeatingTable | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // ── Derived ──────────────────────────────────────────────────────────────
  const pool = useMemo(() => guests.filter((g) => g.table_id === null), [guests])
  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pool
    return pool.filter((g) => g.full_name.toLowerCase().includes(q))
  }, [pool, search])

  const seatedTotal = seatsOf(guests.filter((g) => g.table_id !== null))
  const toSeatTotal = seatsOf(pool)
  const totalCapacity = tables.reduce((n, t) => n + t.capacity, 0)

  function guestsAtTable(tableId: string): SeatableGuest[] {
    return guests.filter((g) => g.table_id === tableId)
  }

  // ── Assignment (optimistic) ────────────────────────────────────────────────
  function moveGuest(guestId: string, tableId: string | null) {
    setMenuFor(null)
    const snapshot = guests
    setGuests((gs) =>
      gs.map((g) => (g.guest_contact_id === guestId ? { ...g, table_id: tableId } : g)),
    )
    startTransition(async () => {
      try {
        if (tableId === null) {
          await unassignGuest({ eventId, guestContactId: guestId })
        } else {
          await assignGuestToTable({ eventId, guestContactId: guestId, tableId })
        }
      } catch {
        setGuests(snapshot) // revert
        toast.error('Could not save that change. Please try again.')
      }
    })
  }

  // ── Drag and drop ──────────────────────────────────────────────────────────
  function onDragStart(e: React.DragEvent, guestId: string) {
    draggedId.current = guestId
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragEnd() {
    draggedId.current = null
    setDropZone(null)
  }
  function onDropTo(target: string | null) {
    const id = draggedId.current
    draggedId.current = null
    setDropZone(null)
    if (!id) return
    const current = guests.find((g) => g.guest_contact_id === id)?.table_id ?? null
    if (current === target) return
    moveGuest(id, target)
  }

  // ── Table CRUD ──────────────────────────────────────────────────────────────
  function addTable() {
    setBusy(true)
    startTransition(async () => {
      try {
        await createSeatingTable({ eventId })
        router.refresh()
      } catch {
        toast.error('Could not add a table.')
      } finally {
        setBusy(false)
      }
    })
  }

  function removeTable(tableId: string) {
    setConfirmDeleteId(null)
    setBusy(true)
    startTransition(async () => {
      try {
        await deleteSeatingTable(tableId)
        router.refresh()
      } catch {
        toast.error('Could not remove the table.')
      } finally {
        setBusy(false)
      }
    })
  }

  // ── Share / export ───────────────────────────────────────────────────────────
  function buildPlanText(): string {
    const lines: string[] = [`${data.event.name} — Seating plan`, '']
    for (const t of tables) {
      const gs = guestsAtTable(t.id)
      lines.push(`${t.is_head ? '★ ' : ''}${t.name}  (${seatsOf(gs)}/${t.capacity})`)
      if (gs.length === 0) {
        lines.push('   —')
      } else {
        for (const g of gs) {
          const meal = mealLine(g)
          lines.push(`   • ${g.full_name} ×${g.seats}${meal ? ` — ${meal}` : ''}`)
        }
      }
      lines.push('')
    }
    if (pool.length > 0) {
      lines.push(`Not yet seated (${toSeatTotal}):`)
      for (const g of pool) lines.push(`   • ${g.full_name} ×${g.seats}`)
    }
    return lines.join('\n')
  }

  async function shareWithVenue() {
    try {
      await navigator.clipboard.writeText(buildPlanText())
      toast.success('Seating plan copied — paste it to your venue or WhatsApp.')
    } catch {
      toast.error('Could not copy. Try the Export button instead.')
    }
  }

  function exportPdf() {
    const w = window.open('', '_blank', 'noopener,noreferrer')
    if (!w) {
      toast.error('Allow pop-ups to export the plan.')
      return
    }
    const esc = (s: string) =>
      s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)
    const tableBlocks = tables
      .map((t) => {
        const gs = guestsAtTable(t.id)
        const rows =
          gs.length === 0
            ? '<li class="empty">—</li>'
            : gs
                .map((g) => {
                  const meal = mealLine(g)
                  return `<li><span>${esc(g.full_name)} <em>×${g.seats}</em></span>${
                    meal ? `<span class="meal">${esc(meal)}</span>` : ''
                  }</li>`
                })
                .join('')
        return `<section class="tbl"><h2>${t.is_head ? '★ ' : ''}${esc(t.name)} <span>${seatsOf(
          gs,
        )}/${t.capacity}</span></h2><ul>${rows}</ul></section>`
      })
      .join('')
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(
      data.event.name,
    )} — Seating plan</title><style>
      *{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1A1A1A}
      body{margin:32px}
      h1{font-size:22px;margin:0 0 4px}
      .sub{color:#666;font-size:13px;margin:0 0 24px}
      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
      .tbl{border:1px solid #e6e6ea;border-radius:12px;padding:12px 14px;break-inside:avoid}
      .tbl h2{font-size:14px;margin:0 0 8px;display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:6px}
      .tbl h2 span{color:#8e57b3;font-weight:700}
      ul{list-style:none;margin:0;padding:0}
      li{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:3px 0}
      li em{color:#8e57b3;font-style:normal;font-weight:600}
      .meal{color:#888;font-size:11px}
      .empty{color:#bbb}
    </style></head><body>
      <h1>${esc(data.event.name)}</h1>
      <p class="sub">Seating plan · ${seatedTotal} seated · ${tables.length} tables</p>
      <div class="grid">${tableBlocks}</div>
    </body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  const noGuests = guests.length === 0

  return (
    <div className="space-y-5">
      {/* Toolbar: event selector + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {events.length > 1 ? (
          <label className="relative inline-flex items-center">
            <span className="pointer-events-none absolute left-3 text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/40">
              Event
            </span>
            <select
              value={eventId}
              onChange={(e) => router.push(`/my/dashboard/seating?event=${e.target.value}`)}
              className="appearance-none rounded-xl border border-black/[0.12] bg-white py-2.5 pl-[68px] pr-9 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#1A1A1A]/40" />
          </label>
        ) : (
          <span className="text-sm font-semibold text-[#1A1A1A]">{data.event.name}</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" onClick={exportPdf} disabled={noGuests}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={shareWithVenue} disabled={noGuests}>
            <Share2 className="h-4 w-4" /> Share with venue
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="seated" value={seatedTotal} />
        <Stat label="to seat" value={toSeatTotal} />
        <Stat label="tables" value={tables.length} />
        <Stat label="seats used" value={`${seatedTotal} / ${totalCapacity}`} />
      </div>

      {noGuests ? (
        <EmptyState
          icon={<Armchair className="h-7 w-7" />}
          title="No attending guests yet"
          description="Once guests RSVP “attending” to this event, they’ll appear here ready to drag onto tables."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Pool */}
          <div
            className={
              CARD_BASE +
              ' flex max-h-[760px] flex-col overflow-hidden ' +
              (dropZone === 'pool' ? 'ring-2 ring-[#C9A0DC]/50' : '')
            }
            onDragOver={(e) => {
              e.preventDefault()
              setDropZone('pool')
            }}
            onDragLeave={() => setDropZone((z) => (z === 'pool' ? null : z))}
            onDrop={() => onDropTo(null)}
          >
            <div className="border-b border-black/[0.06] px-4 pb-3 pt-4">
              <h2 className="text-base font-semibold text-[#1A1A1A]">To be seated</h2>
              <p className="mt-0.5 text-xs text-[#1A1A1A]/55">
                Attending guests not yet at a table. Drag them onto any table.
              </p>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guests"
                className={inputClass + ' mt-3'}
              />
            </div>
            <div className="flex-1 space-y-2 overflow-auto p-3">
              {filteredPool.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs text-[#1A1A1A]/40">
                  {pool.length === 0 ? 'Everyone is seated 🎉' : 'No matches.'}
                </p>
              ) : (
                filteredPool.map((g) => (
                  <GuestChip
                    key={g.guest_contact_id}
                    guest={g}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    menuOpen={menuFor === g.guest_contact_id}
                    onToggleMenu={() =>
                      setMenuFor((m) => (m === g.guest_contact_id ? null : g.guest_contact_id))
                    }
                    tables={tables}
                    currentTableId={null}
                    onMove={moveGuest}
                  />
                ))
              )}
            </div>
          </div>

          {/* Floor */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tables.map((t) => {
              const gs = guestsAtTable(t.id)
              const used = seatsOf(gs)
              const full = used >= t.capacity
              const over = used > t.capacity
              return (
                <div
                  key={t.id}
                  className={
                    CARD_BASE +
                    ' flex min-h-[180px] flex-col ' +
                    (t.is_head ? 'border-[#C9A0DC]/50 bg-[#C9A0DC]/[0.06] ' : '') +
                    (dropZone === t.id ? 'ring-2 ring-[#C9A0DC]/60' : '')
                  }
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDropZone(t.id)
                  }}
                  onDragLeave={() => setDropZone((z) => (z === t.id ? null : z))}
                  onDrop={() => onDropTo(t.id)}
                >
                  <div className="flex items-center gap-2 border-b border-black/[0.06] px-3.5 py-3">
                    {t.is_head ? <Star className="h-3.5 w-3.5 fill-[#8e57b3] text-[#8e57b3]" /> : null}
                    <span className="truncate text-sm font-semibold text-[#1A1A1A]">{t.name}</span>
                    <span
                      className={
                        'ml-auto text-xs font-bold ' +
                        (over ? 'text-rose-600' : full ? 'text-emerald-600' : 'text-[#1A1A1A]/45')
                      }
                    >
                      {used} / {t.capacity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditTable(t)}
                      aria-label={`Edit ${t.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#1A1A1A]/40 hover:bg-black/[0.05] hover:text-[#1A1A1A]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2 p-3">
                    {gs.length === 0 ? (
                      <p className="flex h-full items-center justify-center px-2 py-6 text-center text-xs leading-relaxed text-[#1A1A1A]/35">
                        Drag guests here
                        <br />
                        to fill this table
                      </p>
                    ) : (
                      gs.map((g) => (
                        <GuestChip
                          key={g.guest_contact_id}
                          guest={g}
                          seated
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          menuOpen={menuFor === g.guest_contact_id}
                          onToggleMenu={() =>
                            setMenuFor((m) =>
                              m === g.guest_contact_id ? null : g.guest_contact_id,
                            )
                          }
                          tables={tables}
                          currentTableId={t.id}
                          onMove={moveGuest}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}

            {/* New table */}
            <button
              type="button"
              onClick={addTable}
              disabled={busy}
              className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C9A0DC]/60 bg-[#C9A0DC]/[0.06] text-sm font-semibold text-[#8e57b3] transition hover:bg-[#C9A0DC]/[0.12] disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                <Plus className="h-5 w-5" />
              </span>
              New table
            </button>
          </div>
        </div>
      )}

      <EditTableDialog
        table={editTable}
        onClose={() => setEditTable(null)}
        onAskDelete={(id) => {
          setEditTable(null)
          setConfirmDeleteId(id)
        }}
        onSaved={() => {
          setEditTable(null)
          router.refresh()
        }}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && removeTable(confirmDeleteId)}
        title="Remove this table?"
        description="Guests seated here will go back to the “to be seated” list. This can’t be undone."
        confirmLabel="Remove table"
        pending={busy}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="flex items-baseline gap-2 px-4 py-3">
      <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">{value}</span>
      <span className="text-xs text-[#1A1A1A]/55">{label}</span>
    </Card>
  )
}

function GuestChip({
  guest,
  seated,
  onDragStart,
  onDragEnd,
  menuOpen,
  onToggleMenu,
  tables,
  currentTableId,
  onMove,
}: {
  guest: SeatableGuest
  seated?: boolean
  onDragStart: (e: React.DragEvent, guestId: string) => void
  onDragEnd: () => void
  menuOpen: boolean
  onToggleMenu: () => void
  tables: SeatingTable[]
  currentTableId: string | null
  onMove: (guestId: string, tableId: string | null) => void
}) {
  const meal = mealLine(guest)
  return (
    <div className="relative">
      <div
        draggable
        onDragStart={(e) => onDragStart(e, guest.guest_contact_id)}
        onDragEnd={onDragEnd}
        className="flex cursor-grab items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-2.5 py-2 transition hover:border-[#C9A0DC]/60 active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]/25" />
        <button
          type="button"
          onClick={onToggleMenu}
          className="min-w-0 flex-1 text-left"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="block truncate text-sm font-semibold text-[#1A1A1A]">
            {guest.full_name}
          </span>
          {meal ? (
            <span className="mt-0.5 block truncate text-[11px] text-[#1A1A1A]/50">{meal}</span>
          ) : guest.group_tag ? (
            <span className="mt-0.5 block truncate text-[11px] text-[#1A1A1A]/50">
              {guest.group_tag}
            </span>
          ) : null}
        </button>
        <span className="shrink-0 rounded-full bg-[#C9A0DC]/15 px-2 py-0.5 text-[11px] font-bold text-[#8e57b3]">
          ×{guest.seats}
        </span>
        {seated ? (
          <button
            type="button"
            onClick={() => onMove(guest.guest_contact_id, null)}
            aria-label={`Remove ${guest.full_name} from table`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#1A1A1A]/35 hover:bg-black/[0.05] hover:text-[#8e57b3]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {menuOpen ? (
        <>
          <div className="fixed inset-0 z-20" onClick={onToggleMenu} />
          <div
            role="menu"
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-black/[0.08] bg-white p-1 shadow-xl"
          >
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/40">
              Move to
            </p>
            {tables.length === 0 ? (
              <p className="px-2.5 py-1.5 text-xs text-[#1A1A1A]/45">Add a table first.</p>
            ) : (
              tables.map((t) => {
                const isCurrent = t.id === currentTableId
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="menuitem"
                    disabled={isCurrent}
                    onClick={() => onMove(guest.guest_contact_id, t.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-[#1A1A1A] hover:bg-black/[0.04] disabled:opacity-40"
                  >
                    {t.is_head ? <Star className="h-3 w-3 text-[#8e57b3]" /> : null}
                    <span className="flex-1 truncate">{t.name}</span>
                    {isCurrent ? <Check className="h-3.5 w-3.5 text-[#8e57b3]" /> : null}
                  </button>
                )
              })
            )}
            {currentTableId ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => onMove(guest.guest_contact_id, null)}
                className="mt-1 flex w-full items-center gap-2 border-t border-black/[0.06] px-2.5 py-1.5 text-left text-sm text-[#1A1A1A]/70 hover:bg-black/[0.04]"
              >
                <X className="h-3.5 w-3.5" /> Back to “to be seated”
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

function EditTableDialog({
  table,
  onClose,
  onAskDelete,
  onSaved,
}: {
  table: SeatingTable | null
  onClose: () => void
  onAskDelete: (id: string) => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [isHead, setIsHead] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (table) {
      setName(table.name)
      setCapacity(table.capacity)
      setIsHead(table.is_head)
    }
  }, [table])

  if (!table) return null

  async function save() {
    if (!table) return
    setSaving(true)
    try {
      await updateSeatingTable(table.id, { name, capacity, isHead })
      onSaved()
    } catch {
      toast.error('Could not save the table.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={table !== null}
      onClose={onClose}
      title="Edit table"
      footer={
        <>
          <Button
            variant="ghost"
            className="mr-auto text-rose-600 hover:bg-rose-50"
            onClick={() => onAskDelete(table.id)}
          >
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Table name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Familia ya Bibi"
          />
        </Field>
        <Field label="Seats (capacity)">
          <input
            type="number"
            min={0}
            value={capacity}
            onChange={(e) => setCapacity(Math.max(0, Number(e.target.value) || 0))}
            className={inputClass}
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.08] px-3.5 py-3">
          <input
            type="checkbox"
            checked={isHead}
            onChange={(e) => setIsHead(e.target.checked)}
            className="h-4 w-4 accent-[#8e57b3]"
          />
          <span className="text-sm">
            <span className="font-medium text-[#1A1A1A]">Top table</span>
            <span className="ml-1 text-[#1A1A1A]/55">— highlighted for the head party</span>
          </span>
        </label>
      </div>
    </Dialog>
  )
}
