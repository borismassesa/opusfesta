'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  CalendarHeart,
  MapPin,
  Plus,
  Trash2,
  Clock,
  Globe2,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/dashboard/primitives'
import { Button, ConfirmDialog, Field, inputClass } from '@/components/dashboard/controls'
import { cn } from '@/lib/utils'
import { createEvent, updateEvent, deleteEvent, type EventInput } from '@/lib/dashboard/actions'
import { EVENT_TYPE_LABELS, type EventType, type WeddingEvent } from '@/lib/dashboard/types'

const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[]
const NAME_MAX = 100
const ATTIRE_MAX = 400
const NOTE_MAX = 1000

// ----------------------------------------------------------------------- types

type FormState = {
  name: string
  event_type: EventType
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  venue_name: string
  address: string
  city: string
  is_public: boolean
  allow_rsvp: boolean
  dress_code: string
  description: string
  collect_meal_choice: boolean
  meal_options: string[]
}

const EMPTY_FORM: FormState = {
  name: '',
  event_type: 'ceremony',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  venue_name: '',
  address: '',
  city: '',
  is_public: true,
  allow_rsvp: false,
  dress_code: '',
  description: '',
  collect_meal_choice: false,
  meal_options: [],
}

// ------------------------------------------------------------------- helpers

function splitLocal(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  const s = local.toISOString()
  return { date: s.slice(0, 10), time: s.slice(11, 16) }
}

function combineLocal(date: string, time: string): string | null {
  if (!date) return null
  const t = time || '00:00'
  const local = new Date(`${date}T${t}`)
  if (Number.isNaN(local.getTime())) return null
  return local.toISOString()
}

function fromEvent(e: WeddingEvent): FormState {
  const start = splitLocal(e.starts_at)
  const end = splitLocal(e.ends_at)
  return {
    name: e.name,
    event_type: e.event_type,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    venue_name: e.venue_name ?? '',
    address: e.address ?? '',
    city: e.city ?? '',
    is_public: e.is_public,
    allow_rsvp: e.allow_rsvp,
    dress_code: e.dress_code ?? '',
    description: e.description ?? '',
    collect_meal_choice: e.collect_meal_choice,
    meal_options: e.meal_options,
  }
}

function toPayload(f: FormState): EventInput {
  return {
    name: f.name.trim(),
    event_type: f.event_type,
    description: f.description.trim() || null,
    venue_name: f.venue_name.trim() || null,
    address: f.address.trim() || null,
    city: f.city.trim() || null,
    starts_at: combineLocal(f.startDate, f.startTime),
    ends_at: combineLocal(f.endDate, f.endTime),
    dress_code: f.dress_code.trim() || null,
    is_public: f.is_public,
    allow_rsvp: f.allow_rsvp,
    collect_meal_choice: f.collect_meal_choice,
    meal_options: f.collect_meal_choice ? f.meal_options.filter((m) => m.trim()) : [],
  }
}

function formatWhen(date: string, time: string): string | null {
  const iso = combineLocal(date, time)
  if (!iso) return null
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ------------------------------------------------------------------ component

type SelectedId = string | 'new'

export default function EventsManager({ initialEvents }: { initialEvents: WeddingEvent[] }) {
  const [selectedId, setSelectedId] = useState<SelectedId>(
    initialEvents[0]?.id ?? 'new',
  )
  const [form, setForm] = useState<FormState>(
    initialEvents[0] ? fromEvent(initialEvents[0]) : EMPTY_FORM,
  )
  const [original, setOriginal] = useState<FormState>(form)
  const [pendingDelete, setPendingDelete] = useState<WeddingEvent | null>(null)
  const [pending, startTransition] = useTransition()

  const editing = useMemo(
    () => (selectedId === 'new' ? null : initialEvents.find((e) => e.id === selectedId) ?? null),
    [initialEvents, selectedId],
  )

  // Re-hydrate the form whenever the user switches event tabs.
  useEffect(() => {
    const next = editing ? fromEvent(editing) : EMPTY_FORM
    setForm(next)
    setOriginal(next)
  }, [editing, selectedId])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(original), [form, original])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function selectEvent(id: SelectedId) {
    if (dirty && !confirm('You have unsaved changes. Discard them?')) return
    setSelectedId(id)
  }

  function resetAddress() {
    setForm((prev) => ({ ...prev, address: '', city: '' }))
  }

  function save() {
    if (!form.name.trim()) {
      toast.error('Give the event a name')
      return
    }
    const payload = toPayload(form)
    startTransition(async () => {
      try {
        if (editing) {
          await updateEvent(editing.id, payload)
          toast.success('Event updated')
        } else {
          await createEvent(payload)
          toast.success('Event added')
          // After create, hop onto the newest event tab. Server-revalidated list
          // arrives on the next render via initialEvents; for now sit on 'new'
          // until the page revalidates and the new id appears.
        }
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
        await deleteEvent(target.id)
        toast.success('Event deleted')
        setPendingDelete(null)
        // Fall back to the first remaining event, or the new-event tab.
        const next = initialEvents.find((e) => e.id !== target.id)
        setSelectedId(next?.id ?? 'new')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not delete')
      }
    })
  }

  // -------------------------------------------------------------------- render

  return (
    <div className="space-y-6">
      <header className="border-b border-black/[0.06] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
          Events
        </h1>
        <p className="mt-2 text-sm text-[#1A1A1A]/65 sm:text-base">
          Set up every moment of your ceremony, reception and everything in between. Guests will
          see the right details and RSVP to each event separately.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
        {/* ──────────────────────── Left: editor ──────────────────────── */}
        <div className="min-w-0 space-y-6">
          <EventTabs
            events={initialEvents}
            selectedId={selectedId}
            onSelect={selectEvent}
            onAdd={() => selectEvent('new')}
          />

          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
              {editing ? editing.name || 'Untitled event' : 'New event'}
            </h2>
            <p className="text-sm text-[#1A1A1A]/60">
              Edit the details below, and see how they&apos;ll look on your wedding website.
            </p>
          </div>

          {/* Event type + name */}
          <div className="space-y-4">
            <Field label="Event type" required>
              <select
                className={inputClass}
                value={form.event_type}
                onChange={(e) => set('event_type', e.target.value as EventType)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Event name" required>
              <input
                className={inputClass}
                value={form.name}
                maxLength={NAME_MAX}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Our ceremony"
              />
              <CounterRow value={form.name.length} max={NAME_MAX} hint="Maximum 100 characters" />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start date" required>
                <input
                  type="date"
                  className={inputClass}
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                />
              </Field>
              <Field label="Start time" required>
                <input
                  type="time"
                  className={inputClass}
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                />
              </Field>
              <Field label="End time">
                <input
                  type="time"
                  className={inputClass}
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Event location */}
          <Section title="Event location">
            <Field
              label="Venue name"
              hintInline={
                form.address || form.city ? (
                  <button
                    type="button"
                    onClick={resetAddress}
                    className="text-xs font-medium text-[#7E5896] hover:text-[#5d3a78]"
                  >
                    Reset address →
                  </button>
                ) : null
              }
            >
              <input
                className={inputClass}
                value={form.venue_name}
                onChange={(e) => set('venue_name', e.target.value)}
                placeholder="Brooklyn Winery"
              />
            </Field>
            <Field label="Street address">
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </Field>
            <Field label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="e.g. Dar es Salaam"
              />
            </Field>
          </Section>

          {/* Website settings */}
          <Section title="Event settings on website">
            <Toggle
              label="Make event public to all guests"
              checked={form.is_public}
              onChange={(v) => set('is_public', v)}
            />
            <Toggle
              label="Let guests RSVP on website"
              checked={form.allow_rsvp}
              onChange={(v) => set('allow_rsvp', v)}
            />
          </Section>

          {/* Attire + Note */}
          <div className="space-y-4">
            <Field label="Attire suggestions">
              <textarea
                className={inputClass}
                rows={2}
                value={form.dress_code}
                maxLength={ATTIRE_MAX}
                onChange={(e) => set('dress_code', e.target.value)}
                placeholder="This event is black-tie optional. The grass can be soft, so maybe rethink stilettos."
              />
              <CounterRow value={form.dress_code.length} max={ATTIRE_MAX} hint="Maximum 400 characters" />
            </Field>
            <Field label="Note to guests">
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                maxLength={NOTE_MAX}
                onChange={(e) => set('description', e.target.value)}
                placeholder="There will be a few light bites in addition to cocktails. Can't wait to see you!"
              />
              <CounterRow value={form.description.length} max={NOTE_MAX} />
            </Field>
          </div>

          {/* Meal preferences */}
          <Section title="Ask for meal preferences">
            <Toggle
              label="Collect meal choices for this event"
              checked={form.collect_meal_choice}
              onChange={(v) => set('collect_meal_choice', v)}
            />
            {form.collect_meal_choice ? (
              <MealOptionsEditor
                options={form.meal_options}
                onChange={(next) => set('meal_options', next)}
              />
            ) : null}
          </Section>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-black/[0.06] pt-5">
            {editing ? (
              <button
                type="button"
                onClick={() => setPendingDelete(editing)}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete event
              </button>
            ) : null}
            <Button onClick={save} disabled={pending || !dirty || !form.name.trim()}>
              {pending ? 'Saving…' : editing ? 'Save changes' : 'Add event'}
            </Button>
          </div>
        </div>

        {/* ──────────────────────── Right: preview ──────────────────────── */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <PreviewCard form={form} editing={editing} />
          <PromoCard />
        </aside>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmRemove}
        title={pendingDelete ? `Delete "${pendingDelete.name}"?` : ''}
        description="This also removes the event from every guest's invitation. It can't be undone."
        confirmLabel="Delete event"
        pending={pending}
      />
    </div>
  )
}

// ---------------------------------------------------------------- subcomponents

function EventTabs({
  events,
  selectedId,
  onSelect,
  onAdd,
}: {
  events: WeddingEvent[]
  selectedId: SelectedId
  onSelect: (id: SelectedId) => void
  onAdd: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {events.map((e) => {
        const active = selectedId === e.id
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onSelect(e.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                : 'border-black/[0.12] bg-white text-[#1A1A1A] hover:bg-black/[0.03]',
            )}
          >
            <span className="max-w-[12ch] truncate">{e.name || 'Untitled event'}</span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={onAdd}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-dashed px-4 py-2 text-sm font-medium transition-colors',
          selectedId === 'new'
            ? 'border-[#C9A0DC] bg-[#F0DFF6] text-[#5d3a78]'
            : 'border-black/[0.18] text-[#1A1A1A]/70 hover:border-[#C9A0DC] hover:text-[#5d3a78]',
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {selectedId === 'new' ? 'New event' : 'Add event'}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t border-black/[0.06] pt-5">
      <h3 className="text-base font-semibold text-[#1A1A1A]">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function CounterRow({ value, max, hint }: { value: number; max: number; hint?: string }) {
  return (
    <div className="mt-1 flex items-center justify-between text-[11px] text-[#1A1A1A]/45">
      <span>{hint ?? ''}</span>
      <span>
        {value}/{max}
      </span>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm text-[#1A1A1A]">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
          checked ? 'bg-[#1A1A1A]' : 'bg-black/[0.15]',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  )
}

function MealOptionsEditor({
  options,
  onChange,
}: {
  options: string[]
  onChange: (next: string[]) => void
}) {
  const [draft, setDraft] = useState('')

  function add() {
    const v = draft.trim()
    if (!v) return
    if (options.includes(v)) {
      setDraft('')
      return
    }
    onChange([...options, v])
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <span
            key={opt}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F0DFF6] px-3 py-1 text-xs font-medium text-[#5d3a78]"
          >
            {opt}
            <button
              type="button"
              onClick={() => onChange(options.filter((o) => o !== opt))}
              className="text-[#5d3a78]/60 hover:text-[#5d3a78]"
              aria-label={`Remove ${opt}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          className={inputClass}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Add a meal option (e.g. Vegetarian)"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-black/[0.03]"
        >
          <Plus className="h-3.5 w-3.5" /> Add meal option
        </button>
      </div>
    </div>
  )
}

function PreviewCard({
  form,
  editing,
}: {
  form: FormState
  editing: WeddingEvent | null
}) {
  const when = formatWhen(form.startDate, form.startTime)
  const whereParts = [form.venue_name, form.city].filter(Boolean)
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-black/[0.06] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/55">
        Preview
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-[#1A1A1A]/55">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#C9A0DC]" />
          {EVENT_TYPE_LABELS[form.event_type]}
          {form.is_public ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-[#1A1A1A]/70">
              <Globe2 className="h-3 w-3" /> Visible to guests
            </span>
          ) : (
            <span className="ml-auto rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-[#1A1A1A]/55">
              Hidden
            </span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
            {form.name || (editing ? editing.name : 'Your event name')}
          </h3>
          <div className="mt-3 space-y-1.5 text-sm text-[#1A1A1A]/70">
            {when ? (
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-[#1A1A1A]/40" /> {when}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-[#1A1A1A]/45">
                <Clock className="h-4 w-4 shrink-0" /> Add a start date and time
              </p>
            )}
            {whereParts.length ? (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#1A1A1A]/40" />{' '}
                {whereParts.join(', ')}
              </p>
            ) : null}
          </div>
        </div>
        {form.dress_code ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/55">
              Attire
            </p>
            <p className="mt-1 text-sm text-[#1A1A1A]/75">{form.dress_code}</p>
          </div>
        ) : null}
        {form.description ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/55">
              Note to guests
            </p>
            <p className="mt-1 text-sm text-[#1A1A1A]/75">{form.description}</p>
          </div>
        ) : null}
        {form.collect_meal_choice && form.meal_options.length ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/55">
              Meal choices
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {form.meal_options.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-xs text-[#1A1A1A]/80"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

function PromoCard() {
  return (
    <Card className="overflow-hidden bg-[#F0DFF6] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#5d3a78]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-[#1A1A1A]">
            Share each event by WhatsApp
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-[#1A1A1A]/70">
            Every guest gets a personal RSVP link for each event you create. Send it via
            WhatsApp, SMS or email from the Guest list.
          </p>
          <a
            href="/my/dashboard/guests"
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#5d3a78] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4b2f63]"
          >
            <CalendarHeart className="h-3.5 w-3.5" /> Go to guest list
          </a>
        </div>
      </div>
    </Card>
  )
}
