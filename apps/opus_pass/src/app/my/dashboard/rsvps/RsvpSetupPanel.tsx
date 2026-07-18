'use client'

import { useMemo, useState, useSyncExternalStore, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  enableInviteSharing,
  type RsvpQuestionInput,
} from '@/lib/dashboard/actions'
import { EVENT_QUESTION_PRESETS, GENERAL_QUESTION_PRESETS, type RsvpQuestionPreset } from '@/lib/dashboard/rsvp-presets'
import { eventInvitePath } from '@/lib/dashboard/share'
import type { RsvpEventSummary, RsvpAnswerSummary } from '@/lib/dashboard/queries'
import {
  RSVP_QUESTION_KIND_LABELS,
  type RsvpQuestion,
  type WeddingEvent,
} from '@/lib/dashboard/types'

type EditorState =
  | { open: false }
  | { open: true; scope: 'event' | 'general'; eventId: string | null; eventName?: string; initial: RsvpQuestion | null }

// Not a real subscription (the value never changes after mount) — just lets
// useSyncExternalStore read window.location.origin without an SSR mismatch,
// so the copyable link is localhost while developing, not the prod domain.
function subscribeToNothing() {
  return () => {}
}
function getOrigin() {
  return window.location.origin
}
function getServerOrigin() {
  return ''
}

export default function RsvpSetupPanel({
  events,
  selectedEventId,
  questions,
  summaries,
  answerSummaries,
}: {
  events: WeddingEvent[]
  /** Which event's card to show — Setup is per-event config, not a merged view. */
  selectedEventId: string | null
  questions: RsvpQuestion[]
  summaries: RsvpEventSummary[]
  answerSummaries: Record<string, RsvpAnswerSummary>
}) {
  const router = useRouter()
  const origin = useSyncExternalStore(subscribeToNothing, getOrigin, getServerOrigin)
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

  const event = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? events[0] ?? null,
    [events, selectedEventId],
  )
  // This event's own invite link — not a couple-wide slug, so switching
  // events above also switches which link this banner shows/copies.
  const published = Boolean(event?.invite_sharing_enabled && event?.invite_slug)
  const anyCollecting = useMemo(() => events.some((e) => e.allow_rsvp), [events])

  // One reconciled status so the toggle(s) and the banner never contradict:
  //  paused        — nothing is collecting; sharing a link would lead nowhere.
  //  live_unshared — collecting, but this event's invite link isn't on yet.
  //  live_shared   — collecting AND shared; RSVPs are fully live.
  const status: 'paused' | 'live_unshared' | 'live_shared' = !anyCollecting
    ? 'paused'
    : !published
      ? 'live_unshared'
      : 'live_shared'

  function enableSharing() {
    if (!event) return
    startTransition(async () => {
      try {
        await enableInviteSharing(event.id)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not turn on sharing')
      }
    })
  }

  function copyShareLink() {
    if (!event?.invite_slug || !origin) return
    const url = `${origin}${eventInvitePath(event.invite_slug)}`
    navigator.clipboard?.writeText(url).then(
      () => toast.success('Invite link copied'),
      () => toast.error('Could not copy link'),
    )
  }

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
      {/* Reconciled status — toggle state + share state in one clear message */}
      <StatusBanner status={status} onCopyLink={copyShareLink} onShare={enableSharing} sharing={pending} />

      {/* Selected event's follow-up questions — Setup is per-event config,
          use the switcher in the tab bar above to work on a different event. */}
      {event ? (
        <Card key={event.id} className="overflow-hidden shadow-sm ring-1 ring-black/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
            <h2 className="text-base font-semibold text-[#1A1A1A]">{event.name}</h2>
            <label
              className="inline-flex cursor-pointer items-center gap-2.5"
              title={event.allow_rsvp ? 'Guests can RSVP to this event' : "Off — guests can't RSVP to this event yet"}
            >
              <span className="text-sm text-[#1A1A1A]/70">
                Collect RSVPs <span className="text-[#1A1A1A]/40">· {event.allow_rsvp ? 'On' : 'Off'}</span>
              </span>
              <Toggle
                checked={event.allow_rsvp}
                disabled={pending}
                onChange={(v) => toggleEvent(event.id, v)}
              />
            </label>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[auto_1fr]">
            <AttendanceDonut summary={summaryByEvent.get(event.id)} />

            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Follow-up questions</h3>
              <p className="mb-3 mt-0.5 text-xs text-[#1A1A1A]/55">
                Asked to everyone who RSVPs to {event.name}.
              </p>

              <QuestionList
                questions={questionsByEvent.get(event.id) ?? []}
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
      ) : null}

      {/* General questions */}
      <Card className="p-5 shadow-sm ring-1 ring-black/[0.04]">
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

/**
 * One reconciled status so the per-event toggles and the share state never give
 * contradictory "off" signals. Three states, one clear next step each.
 */
function StatusBanner({
  status,
  onCopyLink,
  onShare,
  sharing,
}: {
  status: 'paused' | 'live_unshared' | 'live_shared'
  onCopyLink: () => void
  onShare: () => void
  sharing: boolean
}) {
  const pill =
    status === 'paused' ? (
      <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]/55">
        Paused
      </span>
    ) : (
      <span className="rounded-full bg-[#9FE870]/35 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#2f5417]">
        Live
      </span>
    )

  if (status === 'paused') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F2D9A0] bg-[#FBF3DD] px-4 py-3.5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">RSVPs are paused {pill}</p>
          <p className="mt-0.5 text-xs text-[#8a6a14]">
            Guests can’t reply yet. Turn on <b>Collect RSVPs</b> for an event below to start.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Turn on collection first — sharing a link now would lead nowhere"
          className="shrink-0 cursor-not-allowed rounded-full border border-black/[0.12] bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A]/40"
        >
          Share invite
        </button>
      </div>
    )
  }

  if (status === 'live_unshared') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C9A0DC]/50 bg-[#F0DFF6]/60 px-4 py-3.5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">RSVPs are live — one step left {pill}</p>
          <p className="mt-0.5 text-xs text-[#5d3a78]">
            Generate this event&apos;s invite link so guests can find it and reply.
          </p>
        </div>
        <Button onClick={onShare} disabled={sharing} className="shrink-0">
          {sharing ? 'Generating…' : 'Get invite link'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#9FE870]/60 bg-[#9FE870]/15 px-4 py-3.5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#14342B]">RSVPs are live {pill}</p>
        <p className="mt-0.5 text-xs text-[#3f6b1f]">
          Collection is on and your invite is shared. Replies appear here as guests respond.
        </p>
      </div>
      <button
        type="button"
        onClick={onCopyLink}
        className="shrink-0 rounded-full border border-[#9FE870]/70 bg-white px-4 py-2 text-sm font-semibold text-[#2f5417] hover:bg-[#9FE870]/15"
      >
        Copy link
      </button>
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
              <span aria-hidden>·</span>
              {q.required ? (
                <span className="font-semibold text-[#b4456b]">Required</span>
              ) : (
                <span>Optional</span>
              )}
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
