'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, SectionTitle, EmptyState } from '@/components/dashboard/primitives'
import { Button, ConfirmDialog, Toggle } from '@/components/dashboard/controls'
import { QuestionEditorSlideover } from '@/components/dashboard/QuestionEditorSlideover'
import {
  setEventAllowRsvp,
  createRsvpQuestion,
  updateRsvpQuestion,
  deleteRsvpQuestion,
  type RsvpQuestionInput,
} from '@/lib/dashboard/actions'
import { EVENT_QUESTION_PRESETS, GENERAL_QUESTION_PRESETS, type RsvpQuestionPreset } from '@/lib/dashboard/rsvp-presets'
import type { RsvpEventSummary, RsvpAnswerSummary, MyPublicInvite } from '@/lib/dashboard/queries'
import {
  RSVP_QUESTION_KIND_LABELS,
  type RsvpQuestion,
  type WeddingEvent,
} from '@/lib/dashboard/types'

type EditorState =
  | { open: false }
  | { open: true; scope: 'event' | 'general'; eventId: string | null; eventName?: string; initial: RsvpQuestion | null }

export default function RsvpSetupPanel({
  events,
  questions,
  summaries,
  answerSummaries,
  publicInvite,
}: {
  events: WeddingEvent[]
  questions: RsvpQuestion[]
  summaries: RsvpEventSummary[]
  answerSummaries: Record<string, RsvpAnswerSummary>
  publicInvite: MyPublicInvite
}) {
  const [editor, setEditor] = useState<EditorState>({ open: false })
  const [deleting, setDeleting] = useState<RsvpQuestion | null>(null)
  const [pending, startTransition] = useTransition()

  const generalQuestions = useMemo(() => questions.filter((q) => q.event_id === null), [questions])
  const questionsByEvent = useMemo(() => {
    const map = new Map<string, RsvpQuestion[]>()
    for (const q of questions) {
      if (!q.event_id) continue
      const list = map.get(q.event_id) ?? []
      list.push(q)
      map.set(q.event_id, list)
    }
    return map
  }, [questions])

  const summaryByEvent = useMemo(
    () => new Map(summaries.map((s) => [s.event.id, s])),
    [summaries],
  )

  const published = publicInvite.enabled && Boolean(publicInvite.slug)

  function toggleEvent(eventId: string, allow: boolean) {
    startTransition(async () => {
      try {
        await setEventAllowRsvp(eventId, allow)
        toast.success(allow ? 'RSVPs turned on' : 'RSVPs turned off')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not update')
      }
    })
  }

  function saveQuestion(input: RsvpQuestionInput) {
    if (!editor.open) return
    const eventId = editor.eventId
    const existing = editor.initial
    startTransition(async () => {
      try {
        if (existing) {
          await updateRsvpQuestion(existing.id, { ...input, event_id: eventId })
          toast.success('Question updated')
        } else {
          const siblings = eventId ? (questionsByEvent.get(eventId)?.length ?? 0) : generalQuestions.length
          await createRsvpQuestion({ ...input, event_id: eventId, sort_order: siblings })
          toast.success('Question added')
        }
        setEditor({ open: false })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save question')
      }
    })
  }

  function addPreset(preset: RsvpQuestionPreset, eventId: string | null) {
    const siblings = eventId ? (questionsByEvent.get(eventId)?.length ?? 0) : generalQuestions.length
    startTransition(async () => {
      try {
        await createRsvpQuestion({ ...preset.input, event_id: eventId, sort_order: siblings })
        toast.success('Question added')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not add question')
      }
    })
  }

  function confirmDelete() {
    if (!deleting) return
    const id = deleting.id
    startTransition(async () => {
      try {
        await deleteRsvpQuestion(id)
        toast.success('Question removed')
        setDeleting(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not remove')
      }
    })
  }

  // Presets the couple hasn't added yet (matched by prompt text).
  const usedPrompts = useMemo(() => new Set(questions.map((q) => q.prompt.toLowerCase())), [questions])
  const eventPresetsLeft = EVENT_QUESTION_PRESETS.filter((p) => !usedPrompts.has(p.input.prompt.toLowerCase()))
  const generalPresetsLeft = GENERAL_QUESTION_PRESETS.filter((p) => !usedPrompts.has(p.input.prompt.toLowerCase()))

  if (events.length === 0) {
    return (
      <EmptyState
        title="Add an event first"
        description="Create at least one event, then set up the RSVP questions your guests will answer."
        action={
          <Link href="/my/dashboard/events">
            <Button>Go to events</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Publish heads-up — shown until the couple has shared their invite link */}
      {!published ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F2D9A0] bg-[#FBF3DD] px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#1A1A1A]">Heads up!</p>
            <p className="text-xs text-[#1A1A1A]/60">
              No one can RSVP until you’ve shared your invitation link.
            </p>
          </div>
          <Link href="/my/dashboard/invitations">
            <Button className="shrink-0">Share invite</Button>
          </Link>
        </div>
      ) : null}

      {/* Per-event follow-up questions */}
      {events.map((event) => {
        const summary = summaryByEvent.get(event.id)
        const followUps = questionsByEvent.get(event.id) ?? []
        return (
          <Card key={event.id} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
              <h2 className="text-base font-semibold text-[#1A1A1A]">{event.name}</h2>
              <label className="inline-flex cursor-pointer items-center gap-2.5">
                <span className="text-sm text-[#1A1A1A]/70">Collect RSVPs</span>
                <Toggle
                  checked={event.allow_rsvp}
                  disabled={pending}
                  onChange={(v) => toggleEvent(event.id, v)}
                />
              </label>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[auto_1fr]">
              <AttendanceDonut summary={summary} />

              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">Follow-up questions</h3>
                <p className="mb-3 mt-0.5 text-xs text-[#1A1A1A]/55">
                  Asked to guests on the {event.name} list who RSVP.
                </p>

                <QuestionList
                  questions={followUps}
                  answerSummaries={answerSummaries}
                  onEdit={(q) => setEditor({ open: true, scope: 'event', eventId: event.id, eventName: event.name, initial: q })}
                  onDelete={(q) => setDeleting(q)}
                />

                {/* Popular presets quick-add */}
                {eventPresetsLeft.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {eventPresetsLeft.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        disabled={pending}
                        onClick={() => addPreset(p, event.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/70 hover:bg-black/[0.07] disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" /> {p.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setEditor({ open: true, scope: 'event', eventId: event.id, eventName: event.name, initial: null })}
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#7E5896] ring-1 ring-inset ring-[#C9A0DC]/60 hover:bg-[#F0DFF6]/50"
                >
                  <Plus className="h-4 w-4" /> Add a follow-up question
                </button>
              </div>
            </div>
          </Card>
        )
      })}

      {/* General questions */}
      <Card className="p-5">
        <SectionTitle
          title="General questions"
          subtitle="Asked to everyone who RSVPs, whether or not they can attend."
        />
        <div className="mt-4">
          <QuestionList
            questions={generalQuestions}
            answerSummaries={answerSummaries}
            onEdit={(q) => setEditor({ open: true, scope: 'general', eventId: null, initial: q })}
            onDelete={(q) => setDeleting(q)}
          />
          {generalPresetsLeft.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {generalPresetsLeft.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  disabled={pending}
                  onClick={() => addPreset(p, null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/70 hover:bg-black/[0.07] disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" /> {p.label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setEditor({ open: true, scope: 'general', eventId: null, initial: null })}
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#7E5896] ring-1 ring-inset ring-[#C9A0DC]/60 hover:bg-[#F0DFF6]/50"
          >
            <Plus className="h-4 w-4" /> Add a general question
          </button>
        </div>
      </Card>

      <QuestionEditorSlideover
        key={editor.open ? `${editor.scope}:${editor.eventId ?? 'g'}:${editor.initial?.id ?? 'new'}` : 'closed'}
        open={editor.open}
        onClose={() => setEditor({ open: false })}
        scope={editor.open ? editor.scope : 'general'}
        eventName={editor.open ? editor.eventName : undefined}
        initial={editor.open ? editor.initial : null}
        saving={pending}
        onSave={saveQuestion}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Remove this question?"
        description={deleting ? `“${deleting.prompt}” and any answers guests gave will be deleted.` : ''}
        confirmLabel="Remove"
        pending={pending}
      />
    </div>
  )
}

function QuestionList({
  questions,
  answerSummaries,
  onEdit,
  onDelete,
}: {
  questions: RsvpQuestion[]
  answerSummaries: Record<string, RsvpAnswerSummary>
  onEdit: (q: RsvpQuestion) => void
  onDelete: (q: RsvpQuestion) => void
}) {
  if (questions.length === 0) {
    return <p className="text-sm text-[#1A1A1A]/45">No questions yet.</p>
  }
  return (
    <ul className="space-y-2">
      {questions.map((q) => {
        const summary = answerSummaries[q.id]
        return (
        <li
          key={q.id}
          className="group flex items-start gap-3 rounded-2xl border border-black/[0.08] px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#1A1A1A]">{q.prompt}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#1A1A1A]/50">
              <span>{RSVP_QUESTION_KIND_LABELS[q.kind]}</span>
              {q.kind === 'multiple_choice' ? <span>· {q.options.length} options</span> : null}
              {q.required ? <span>· Required</span> : <span>· Optional</span>}
              {q.event_id && q.attending_only ? <span>· Attending only</span> : null}
              {summary ? <span className="text-[#7E5896]">· {summary.total} response{summary.total === 1 ? '' : 's'}</span> : null}
            </p>
            {summary && summary.byOption.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {summary.byOption.map((o) => (
                  <span
                    key={o.label}
                    className="inline-flex items-center gap-1 rounded-full bg-[#F0DFF6]/70 px-2.5 py-0.5 text-xs text-[#5d3a78]"
                  >
                    {o.label} <b>{o.count}</b>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(q)}
              aria-label="Edit question"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/55 hover:bg-black/[0.05]"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(q)}
              aria-label="Remove question"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1A1A1A]/55 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
        )
      })}
    </ul>
  )
}

/** Compact attendance ring: accepted / declined / no-response for one event. */
function AttendanceDonut({ summary }: { summary?: RsvpEventSummary }) {
  const accepted = summary?.accepted ?? 0
  const declined = summary?.declined ?? 0
  const maybe = summary?.maybe ?? 0
  const noResponse = summary?.noResponse ?? 0
  const invited = summary?.invited ?? 0

  const r = 52
  const c = 2 * Math.PI * r
  const seg = (n: number) => (invited > 0 ? (n / invited) * c : 0)
  // Order around the ring: accepted, declined, maybe, then no-response (track).
  const segs = [
    { len: seg(accepted), color: '#10b981' },
    { len: seg(declined), color: '#f43f5e' },
    { len: seg(maybe), color: '#f59e0b' },
  ]
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#e9e4ee" strokeWidth="12" />
          {invited > 0 &&
            segs.map((s, i) => {
              const el = (
                <circle
                  key={i}
                  cx="64"
                  cy="64"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="12"
                  strokeDasharray={`${s.len} ${c - s.len}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += s.len
              return el
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-[#1A1A1A]">{invited}</span>
          <span className="text-[10px] uppercase tracking-wide text-[#1A1A1A]/50">invited</span>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        <DonutLegend color="#10b981" label="Accepted" value={accepted} />
        <DonutLegend color="#f43f5e" label="Declined" value={declined} />
        {maybe > 0 ? <DonutLegend color="#f59e0b" label="Maybe" value={maybe} /> : null}
        <DonutLegend color="#cfc6d8" label="No response" value={noResponse} />
      </ul>
    </div>
  )
}

function DonutLegend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[#1A1A1A]/60">{label}</span>
      <span className="ml-auto font-semibold tabular-nums text-[#1A1A1A]">{value}</span>
    </li>
  )
}
