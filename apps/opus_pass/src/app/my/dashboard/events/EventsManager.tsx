'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CalendarHeart, MapPin, Plus, Pencil, Trash2, Clock } from 'lucide-react'
import { Card, SectionTitle, EmptyState } from '@/components/dashboard/primitives'
import { Button, Dialog, Field, inputClass } from '@/components/dashboard/controls'
import { createEvent, updateEvent, deleteEvent, type EventInput } from '@/lib/dashboard/actions'
import { EVENT_TYPE_LABELS, type EventType, type WeddingEvent } from '@/lib/dashboard/types'

const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[]

function toLocalInput(value: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

function formatWhen(e: WeddingEvent): string {
  if (!e.starts_at) return 'Date to be confirmed'
  return new Date(e.starts_at).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const emptyForm: EventInput = {
  name: '',
  event_type: 'ceremony',
  venue_name: '',
  address: '',
  city: '',
  starts_at: '',
  dress_code: '',
  description: '',
  collect_meal_choice: false,
  meal_options: [],
}

export default function EventsManager({ initialEvents }: { initialEvents: WeddingEvent[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<WeddingEvent | null>(null)
  const [form, setForm] = useState<EventInput>(emptyForm)
  const [mealsText, setMealsText] = useState('')
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setMealsText('')
    setOpen(true)
  }

  function openEdit(e: WeddingEvent) {
    setEditing(e)
    setForm({
      name: e.name,
      event_type: e.event_type,
      venue_name: e.venue_name ?? '',
      address: e.address ?? '',
      city: e.city ?? '',
      starts_at: toLocalInput(e.starts_at),
      dress_code: e.dress_code ?? '',
      description: e.description ?? '',
      collect_meal_choice: e.collect_meal_choice,
      meal_options: e.meal_options,
    })
    setMealsText(e.meal_options.join(', '))
    setOpen(true)
  }

  function save() {
    if (!form.name.trim()) {
      toast.error('Give the event a name')
      return
    }
    const payload: EventInput = {
      ...form,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      meal_options: form.collect_meal_choice
        ? mealsText.split(',').map((m) => m.trim()).filter(Boolean)
        : [],
    }
    startTransition(async () => {
      try {
        if (editing) {
          await updateEvent(editing.id, payload)
          toast.success('Event updated')
        } else {
          await createEvent(payload)
          toast.success('Event added')
        }
        setOpen(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  function remove(e: WeddingEvent) {
    if (!confirm(`Delete "${e.name}"? This also removes its invitations.`)) return
    startTransition(async () => {
      try {
        await deleteEvent(e.id)
        toast.success('Event deleted')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not delete')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Events" subtitle="The moments your guests will RSVP to" />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add event
        </Button>
      </div>

      {initialEvents.length === 0 ? (
        <EmptyState
          icon={<CalendarHeart className="h-7 w-7" />}
          title="No events yet"
          description="Add your ceremony, reception or any gathering. Guests can RSVP to each one separately."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add your first event
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {initialEvents.map((e) => (
            <Card key={e.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A0DC]/15 text-[#8e57b3]">
                  <CalendarHeart className="h-5 w-5" />
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(e)}
                    aria-label="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/50 hover:bg-black/[0.05]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(e)}
                    aria-label="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#1A1A1A]">{e.name}</h3>
              <span className="mt-1 inline-block rounded-full bg-[#C9A0DC]/15 px-2.5 py-0.5 text-xs font-medium text-[#8e57b3]">
                {EVENT_TYPE_LABELS[e.event_type]}
              </span>
              <div className="mt-4 space-y-1.5 text-sm text-[#1A1A1A]/60">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-[#1A1A1A]/35" /> {formatWhen(e)}
                </p>
                {e.venue_name || e.city ? (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#1A1A1A]/35" />
                    {[e.venue_name, e.city].filter(Boolean).join(', ')}
                  </p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit event' : 'Add event'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? 'Saving…' : editing ? 'Save changes' : 'Add event'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Event name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Wedding Ceremony"
            />
          </Field>
          <Field label="Type">
            <select
              className={inputClass}
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date & time">
            <input
              type="datetime-local"
              className={inputClass}
              value={form.starts_at ?? ''}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Venue">
              <input
                className={inputClass}
                value={form.venue_name ?? ''}
                onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                placeholder="Venue name"
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city ?? ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Dar es Salaam"
              />
            </Field>
          </div>
          <Field label="Address">
            <input
              className={inputClass}
              value={form.address ?? ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street / directions"
            />
          </Field>
          <Field label="Dress code">
            <input
              className={inputClass}
              value={form.dress_code ?? ''}
              onChange={(e) => setForm({ ...form, dress_code: e.target.value })}
              placeholder="e.g. Formal / Traditional"
            />
          </Field>
          <Field label="Note to guests" hint="Shown on the RSVP page">
            <textarea
              className={inputClass}
              rows={2}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-[#1A1A1A]/80">
            <input
              type="checkbox"
              checked={form.collect_meal_choice}
              onChange={(e) => setForm({ ...form, collect_meal_choice: e.target.checked })}
              className="h-4 w-4 rounded border-black/20 accent-[#C9A0DC]"
            />
            Collect meal choices for this event
          </label>
          {form.collect_meal_choice ? (
            <Field label="Meal options" hint="Comma-separated, e.g. Beef, Chicken, Vegetarian">
              <input
                className={inputClass}
                value={mealsText}
                onChange={(e) => setMealsText(e.target.value)}
                placeholder="Beef, Chicken, Vegetarian"
              />
            </Field>
          ) : null}
        </div>
      </Dialog>
    </div>
  )
}
