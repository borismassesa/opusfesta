'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Car,
  Check,
  CheckCircle2,
  CloudUpload,
  FileCheck2,
  FileSignature,
  FileText,
  MessageCircleQuestion,
  MessageSquare,
  PackageOpen,
  Paperclip,
  Pencil,
  Plane,
  Plus,
  Send,
  ShoppingCart,
  StickyNote,
  UserPlus,
  Wallet,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeaderBadgeSlot } from '@/components/HeaderPortals'
import { APPROVAL_STATUSES, APPROVER_ROSTER } from './data'
import type {
  ApprovalActivity,
  ApprovalActor,
  ApprovalApprover,
  ApprovalCategory,
  ApprovalField,
  ApprovalRequest,
  ApprovalStatus,
} from './types'
import {
  notifyApproved,
  notifyInfoRequested,
  notifyRefused,
  notifySubmitted,
  type EmailDispatchSummary,
} from './actions'

// Decisions an approver can take on a submitted request. `info` keeps
// the request in flight but routes it back to the submitter for edits.
export type DecisionKind = 'approve' | 'refuse' | 'info'

const ICONS: Record<ApprovalCategory['iconKey'], LucideIcon> = {
  Plane,
  PackageOpen,
  FileCheck2,
  FileSignature,
  Wallet,
  Car,
  UserPlus,
  ShoppingCart,
  FileText,
}

export type RequestFormDraft = {
  category: ApprovalCategory['key']
  subject: string
  fields: Record<string, string>
  approvers: ApprovalApprover[]
}

export default function RequestFormView({
  actor,
  category,
  request,
  isNew,
  onSave,
  onDiscard,
  onTransition,
  onAppendNote,
}: {
  actor: ApprovalActor
  category: ApprovalCategory
  // For an existing request, pass the record. For a brand-new one, pass
  // null and `isNew=true`; the form starts empty and "Save" promotes it.
  request: ApprovalRequest | null
  isNew: boolean
  // Persist the current draft to the in-memory store. Returns the
  // saved (or freshly-created) request so the parent can swap in the
  // canonical reference.
  onSave: (draft: RequestFormDraft) => ApprovalRequest
  onDiscard: () => void
  onTransition: (id: string, next: ApprovalStatus, decision?: { kind: DecisionKind; note?: string }) => void
  onAppendNote: (id: string, body: string) => void
}) {
  const Icon = ICONS[category.iconKey]

  // Local draft state — survives across re-renders without saving.
  const [subject, setSubject] = useState(request?.subject ?? '')
  const [values, setValues] = useState<Record<string, string>>(() =>
    request?.fields ?? defaultsFor(category.fields),
  )
  const [approvers, setApprovers] = useState<ApprovalApprover[]>(request?.approvers ?? [])
  const [activeTab, setActiveTab] = useState<'description' | 'approvers'>('description')
  const [rightPanel, setRightPanel] = useState<'activity' | 'note'>('activity')
  const [noteText, setNoteText] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Decision dialog state — null when nothing's open. Decision flows
  // share one dialog with different copy/required-vs-optional note rules.
  const [decision, setDecision] = useState<DecisionKind | null>(null)
  // Pending state for any in-flight server action (email dispatch).
  const [busy, setBusy] = useState(false)
  // Surfaces email dispatch outcome — success, partial failure, or
  // gracefully-degraded when Resend isn't configured.
  const [dispatchToast, setDispatchToast] = useState<string | null>(null)
  // Tracks whether any local edit has happened so the save controls
  // know they have work to flush.
  const [dirty, setDirty] = useState(false)

  // Reset when the underlying record changes (eg. user clicks a
  // different request from the dashboard list).
  useEffect(() => {
    setSubject(request?.subject ?? '')
    setValues(request?.fields ?? defaultsFor(category.fields))
    setApprovers(request?.approvers ?? [])
    setDirty(false)
    setError(null)
    setNoteText('')
  }, [request, category.fields])

  const status: ApprovalStatus = request?.status ?? 'To Submit'

  function setValue(id: string, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }))
    setDirty(true)
  }

  function setApproverList(list: ApprovalApprover[]) {
    setApprovers(list)
    setDirty(true)
  }

  function save(): ApprovalRequest | null {
    setError(null)
    const trimmed = subject.trim()
    if (!trimmed) {
      setError('Approval subject is required.')
      return null
    }
    for (const f of category.fields) {
      // Subject is held in its own `subject` state, not in the values
      // dict — skip it here so we don't double-check against an empty
      // values.subject entry that never gets written.
      if (f.id === 'subject') continue
      if (!f.required) continue
      const v = values[f.id]?.trim()
      if (!v) {
        setError(`"${f.label}" is required.`)
        return null
      }
      if (f.kind === 'date-range') {
        const [s, e] = v.split('/')
        if (!s || !e || new Date(e) < new Date(s)) {
          setError(`"${f.label}" — end date must be on or after start date.`)
          return null
        }
      }
    }
    const saved = onSave({
      category: category.key,
      subject: trimmed,
      fields: values,
      approvers,
    })
    setDirty(false)
    return saved
  }

  // ----- Server-action wrappers ----------------------------------------------

  function approvalLink(): string {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/approvals`
  }

  function actorParty() {
    return { name: actor.name, email: actor.email, role: actor.role ?? null }
  }

  function summarizeDispatch(verb: string, summary: EmailDispatchSummary): string {
    if (!summary.configured) {
      return `${verb} saved. Email not sent — RESEND_API_KEY is not configured.`
    }
    if (summary.attempted === 0) {
      return `${verb} saved.`
    }
    if (summary.errors.length === 0) {
      return `${verb} saved and ${summary.sent} email${summary.sent === 1 ? '' : 's'} sent.`
    }
    return `${verb} saved. ${summary.sent}/${summary.attempted} email${summary.attempted === 1 ? '' : 's'} sent — ${summary.errors.length} failed.`
  }

  async function submit() {
    const saved = request ?? save()
    if (!saved) return
    if (dirty && request) save()
    onTransition(saved.id, 'Submitted')
    setBusy(true)
    setDispatchToast(null)
    try {
      const summary = await notifySubmitted({
        approvalSubject: saved.subject,
        approvalCategory: category.label,
        approvalLink: approvalLink(),
        submitter: { name: saved.owner, email: saved.ownerEmail },
        approvers: saved.approvers.map((a) => ({
          name: a.name,
          email: a.email,
          role: a.role ?? null,
        })),
      })
      setDispatchToast(summarizeDispatch('Submitted', summary))
    } catch (err) {
      setDispatchToast(`Submitted, but email send failed: ${err instanceof Error ? err.message : 'unknown error'}`)
    } finally {
      setBusy(false)
    }
  }

  async function runDecision(kind: DecisionKind, note: string) {
    if (!request) return
    const trimmed = note.trim()
    const nextStatus: ApprovalStatus =
      kind === 'approve' ? 'Approved' : kind === 'refuse' ? 'Refused' : 'To Submit'

    onTransition(request.id, nextStatus, { kind, note: trimmed })
    setDecision(null)
    setBusy(true)
    setDispatchToast(null)
    try {
      const payload = {
        approvalSubject: request.subject,
        approvalCategory: category.label,
        approvalLink: approvalLink(),
        submitter: { name: request.owner, email: request.ownerEmail },
        actor: actorParty(),
        note: trimmed,
      }
      const send =
        kind === 'approve'
          ? notifyApproved
          : kind === 'refuse'
            ? notifyRefused
            : notifyInfoRequested
      const summary = await send(payload)
      const verb = kind === 'approve' ? 'Approved' : kind === 'refuse' ? 'Refused' : 'Info requested'
      setDispatchToast(summarizeDispatch(verb, summary))
    } catch (err) {
      setDispatchToast(`Saved, but email send failed: ${err instanceof Error ? err.message : 'unknown error'}`)
    } finally {
      setBusy(false)
    }
  }

  function appendNote() {
    if (!request || !noteText.trim()) return
    onAppendNote(request.id, noteText.trim())
    setNoteText('')
    setRightPanel('activity')
  }

  return (
    <div className="space-y-4">
      <TopBar
        request={request}
        isNew={isNew}
        dirty={dirty}
        onSave={save}
        onDiscard={onDiscard}
        status={status}
      />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <ActionBar
          status={status}
          busy={busy}
          onSubmit={submit}
          onApprove={() => setDecision('approve')}
          onRefuse={() => setDecision('refuse')}
          onRequestInfo={() => setDecision('info')}
          onReopen={() => request && onTransition(request.id, 'To Submit')}
          onLogNote={() => setRightPanel((p) => (p === 'note' ? 'activity' : 'note'))}
          noteActive={rightPanel === 'note'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Form panel */}
          <div className="border-b border-gray-100 p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Approval Subject
                  </span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value)
                      setDirty(true)
                    }}
                    placeholder={category.label}
                    className="mt-1 block w-full border-0 border-b border-transparent bg-transparent px-0 py-1 text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 focus:border-[#C9A0DC]"
                  />
                </label>
              </div>
              <span
                className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: category.tint, color: category.accent }}
              >
                <Icon className="h-6 w-6" />
              </span>
            </div>

            <dl className="mt-4 divide-y divide-gray-50 rounded-xl border border-gray-100 bg-gray-50/40">
              <FieldRow label="Request Owner">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-700">
                    B
                  </span>
                  <span className="text-sm font-semibold text-[#5B2D8E] hover:underline">
                    {request?.owner ?? 'Boris Masesa'}
                  </span>
                </div>
              </FieldRow>
              <FieldRow label="Category">
                <span className="text-sm text-gray-800">{category.label}</span>
              </FieldRow>
              {category.fields
                .filter((f) => f.id !== 'subject' && f.id !== 'description' && f.kind !== 'list')
                .map((f) => (
                  <FieldRow key={f.id} label={f.label} required={f.required}>
                    <FieldInput
                      field={f}
                      value={values[f.id] ?? ''}
                      onChange={(v) => setValue(f.id, v)}
                      compact
                    />
                  </FieldRow>
                ))}
            </dl>

            <TabBar
              tabs={[
                { key: 'description', label: 'Description' },
                { key: 'approvers', label: `Approver(s) (${approvers.length})` },
              ]}
              current={activeTab}
              onSelect={(k) => setActiveTab(k as typeof activeTab)}
            />

            <div className="mt-4">
              {activeTab === 'description' ? (
                <DescriptionTab
                  category={category}
                  values={values}
                  onChange={setValue}
                />
              ) : (
                <ApproversTab value={approvers} onChange={setApproverList} />
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}
            {dispatchToast && (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                {dispatchToast}
              </p>
            )}
          </div>

          {/* Activity / log note panel */}
          <ActivityPanel
            activity={request?.activity ?? []}
            isNew={isNew && !request}
            owner={request?.owner ?? actor.name}
            ownerInitials={request?.ownerInitials ?? actor.initials}
            panel={rightPanel}
            onPanel={setRightPanel}
            noteText={noteText}
            onNoteText={setNoteText}
            onAppendNote={appendNote}
            canNote={Boolean(request)}
          />
        </div>
      </div>

      {decision && (
        <DecisionDialog
          kind={decision}
          busy={busy}
          onClose={() => setDecision(null)}
          onConfirm={(note) => runDecision(decision, note)}
        />
      )}
    </div>
  )
}

// ----- Top bar ---------------------------------------------------------------

function TopBar({
  request,
  isNew,
  dirty,
  status,
  onSave,
  onDiscard,
}: {
  request: ApprovalRequest | null
  isNew: boolean
  dirty: boolean
  status: ApprovalStatus
  onSave: () => ApprovalRequest | null
  onDiscard: () => void
}) {
  // Breadcrumb (back arrow + category name) is rendered by the admin
  // Header via useSetPageHeading. The NEW chip is portaled into the
  // header's badge slot. We keep dirty-state save / discard inline
  // because they're page actions and need to sit next to the form.
  //
  // 3-column grid (1fr | auto | 1fr) keeps the StatusStepper visually
  // centred in the bar regardless of how many left-rail chips render.
  return (
    <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
      {isNew && !request && (
        <HeaderBadgeSlot>
          <span className="inline-flex items-center rounded-md border border-[#C9A0DC] bg-[#F8EDFF] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#5B2D8E]">
            New
          </span>
        </HeaderBadgeSlot>
      )}

      <div className="flex items-center gap-2">
        {dirty && (
          <button
            type="button"
            onClick={() => onSave()}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1.5 text-[#5B2D8E] hover:bg-[#F0DFF6]"
            title="Save"
            aria-label="Save"
          >
            <CloudUpload className="h-4 w-4" />
          </button>
        )}
        {dirty && (
          <button
            type="button"
            onClick={onDiscard}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1.5 text-gray-400 hover:bg-gray-50 hover:text-rose-600"
            title="Discard changes"
            aria-label="Discard"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <StatusStepper status={status} />
      </div>

      {/* Right-rail spacer so the stepper sits centred. Kept as an
          empty cell rather than `hidden` so a future right-aligned
          action drops in cleanly. */}
      <div className="hidden lg:block" />
    </div>
  )
}

// ----- Status stepper --------------------------------------------------------

type StepState = 'done' | 'current' | 'skipped' | 'pending'

function stepStateFor(i: number, currentIndex: number, status: ApprovalStatus): StepState {
  if (i === currentIndex) return 'current'
  // Refused is an alternate terminal to Approved — when we land on it,
  // Approved was never actually reached, so it shows as skipped rather
  // than completed.
  if (status === 'Refused' && i === APPROVAL_STATUSES.indexOf('Approved')) return 'skipped'
  if (i < currentIndex) return 'done'
  return 'pending'
}

function StatusStepper({ status }: { status: ApprovalStatus }) {
  const currentIndex = APPROVAL_STATUSES.indexOf(status)
  return (
    <ol className="flex items-start">
      {APPROVAL_STATUSES.map((s, i) => {
        const state = stepStateFor(i, currentIndex, status)
        const isLast = i === APPROVAL_STATUSES.length - 1
        const isRefusedCurrent = state === 'current' && s === 'Refused'

        const dotBase = 'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors'
        const dotClass = cn(
          dotBase,
          state === 'done' && 'bg-emerald-500 text-white',
          state === 'current' && !isRefusedCurrent && 'bg-emerald-500 text-white ring-4 ring-emerald-100',
          state === 'current' && isRefusedCurrent && 'bg-rose-500 text-white ring-4 ring-rose-100',
          state === 'skipped' && 'border-2 border-gray-200 bg-white text-gray-300',
          state === 'pending' && 'border-2 border-gray-200 bg-white text-gray-400',
        )
        const labelClass = cn(
          'mt-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider',
          state === 'done' && 'text-gray-700',
          state === 'current' && !isRefusedCurrent && 'text-emerald-700',
          state === 'current' && isRefusedCurrent && 'text-rose-700',
          state === 'skipped' && 'text-gray-300 line-through',
          state === 'pending' && 'text-gray-400',
        )
        // Line connects step i → i+1. Colour based on whether progress
        // has reached past step i.
        const segmentDone = state === 'done' || (state === 'current' && i < currentIndex)
        const segmentRefused =
          status === 'Refused' && i >= APPROVAL_STATUSES.indexOf('Submitted')
        const lineClass = cn(
          'mt-2.5 h-0.5 w-10 shrink-0 rounded-full transition-colors',
          segmentDone && !segmentRefused && 'bg-emerald-500',
          segmentRefused && i === APPROVAL_STATUSES.indexOf('Approved') && 'bg-rose-300',
          segmentRefused && i < APPROVAL_STATUSES.indexOf('Approved') && 'bg-emerald-500',
          !segmentDone && !segmentRefused && 'bg-gray-200',
        )

        return (
          <li key={s} className="flex items-start">
            <div className="flex flex-col items-center">
              <span className={dotClass}>
                {state === 'done' ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : state === 'current' && isRefusedCurrent ? (
                  <X className="h-3 w-3" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span className={labelClass}>{s}</span>
            </div>
            {!isLast && <span className={lineClass} />}
          </li>
        )
      })}
    </ol>
  )
}

// ----- Action bar ------------------------------------------------------------

function ActionBar({
  status,
  busy,
  onSubmit,
  onApprove,
  onRefuse,
  onRequestInfo,
  onReopen,
  onLogNote,
  noteActive,
}: {
  status: ApprovalStatus
  busy: boolean
  onSubmit: () => void
  onApprove: () => void
  onRefuse: () => void
  onRequestInfo: () => void
  onReopen: () => void
  onLogNote: () => void
  noteActive: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        <Paperclip className="h-3.5 w-3.5" />
        Attach Document
      </button>

      {status === 'To Submit' && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {busy ? 'Submitting…' : 'Submit'}
        </button>
      )}
      {status === 'Submitted' && (
        <>
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            type="button"
            onClick={onRefuse}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Refuse
          </button>
          <button
            type="button"
            onClick={onRequestInfo}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
          >
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            Request More Info
          </button>
        </>
      )}
      {(status === 'Approved' || status === 'Refused') && (
        <button
          type="button"
          onClick={onReopen}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Reopen as draft
        </button>
      )}

      <div className="ml-auto flex items-center gap-1">
        <ToolbarChip icon={<MessageSquare className="h-3.5 w-3.5" />} label="Send message" />
        <ToolbarChip
          icon={<StickyNote className="h-3.5 w-3.5" />}
          label="Log note"
          active={noteActive}
          onClick={onLogNote}
        />
        <ToolbarChip icon={<Activity className="h-3.5 w-3.5" />} label="Activity" />
      </div>
    </div>
  )
}

function ToolbarChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold transition',
        active
          ? 'bg-[#F0DFF6] text-[#5B2D8E]'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

// ----- Field row + inputs ----------------------------------------------------

function FieldRow({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 px-4 py-2.5">
      <dt className="flex items-center gap-1 text-xs font-semibold text-gray-500">
        {label}
        {required && <span className="text-[10px] font-bold text-rose-500">*</span>}
      </dt>
      <dd className="min-w-0 text-sm text-gray-800">{children}</dd>
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
  compact,
}: {
  field: ApprovalField
  value: string
  onChange: (v: string) => void
  compact?: boolean
}) {
  const baseInput = cn(
    'w-full border-0 border-b border-transparent bg-transparent px-0 outline-none placeholder:text-gray-300 focus:border-[#C9A0DC]',
    compact ? 'py-1 text-sm' : 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]',
  )

  if (field.kind === 'text') {
    return (
      <input
        type="text"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={baseInput}
      />
    )
  }
  if (field.kind === 'textarea') {
    return (
      <textarea
        value={value}
        rows={5}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
      />
    )
  }
  if (field.kind === 'date') {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseInput}
      />
    )
  }
  if (field.kind === 'date-range') {
    const [start, end] = (value || '/').split('/')
    return (
      <div className="flex flex-col gap-1 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-10 text-gray-500">From:</span>
          <input
            type="date"
            value={start ?? ''}
            onChange={(e) => onChange(`${e.target.value}/${end ?? ''}`)}
            className={cn(baseInput, 'text-sm')}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 text-gray-500">to:</span>
          <input
            type="date"
            value={end ?? ''}
            onChange={(e) => onChange(`${start ?? ''}/${e.target.value}`)}
            className={cn(baseInput, 'text-sm')}
          />
        </div>
      </div>
    )
  }
  if (field.kind === 'amount') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-gray-500">TZS</span>
        <input
          type="text"
          inputMode="decimal"
          value={value.replace(/^TZS\s*/, '')}
          placeholder="0.00"
          onChange={(e) => onChange(e.target.value ? `TZS ${e.target.value}` : '')}
          className={baseInput}
        />
      </div>
    )
  }
  if (field.kind === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseInput}
      />
    )
  }
  return <ListInput value={value} placeholder={field.placeholder} onChange={onChange} />
}

function ListInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder?: string
  onChange: (v: string) => void
}) {
  const lines = value ? value.split('\n') : ['']
  function setLine(i: number, v: string) {
    const next = [...lines]
    next[i] = v
    onChange(next.join('\n'))
  }
  function remove(i: number) {
    const next = lines.filter((_, idx) => idx !== i)
    onChange(next.length === 0 ? '' : next.join('\n'))
  }
  return (
    <div className="space-y-2">
      {lines.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={l}
            placeholder={placeholder}
            onChange={(e) => setLine(i, e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
          />
          {lines.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove line"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...lines, ''].join('\n'))}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B2D8E] hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Add a line
      </button>
    </div>
  )
}

// ----- Tab bar + tabs --------------------------------------------------------

function TabBar({
  tabs,
  current,
  onSelect,
}: {
  tabs: { key: string; label: string }[]
  current: string
  onSelect: (k: string) => void
}) {
  return (
    <div className="mt-6 flex items-center gap-1 border-b border-gray-200">
      {tabs.map((t) => {
        const active = current === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onSelect(t.key)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors',
              active
                ? 'border-[#7E5896] text-[#5B2D8E]'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function DescriptionTab({
  category,
  values,
  onChange,
}: {
  category: ApprovalCategory
  values: Record<string, string>
  onChange: (id: string, v: string) => void
}) {
  const descriptionField = category.fields.find((f) => f.id === 'description')
  const listFields = category.fields.filter((f) => f.kind === 'list')

  return (
    <div className="space-y-4">
      {listFields.map((f) => (
        <div key={f.id}>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {f.label}
          </p>
          <FieldInput field={f} value={values[f.id] ?? ''} onChange={(v) => onChange(f.id, v)} />
        </div>
      ))}
      {descriptionField && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Description
          </p>
          <FieldInput
            field={descriptionField}
            value={values[descriptionField.id] ?? ''}
            onChange={(v) => onChange(descriptionField.id, v)}
          />
        </div>
      )}
    </div>
  )
}

function ApproversTab({
  value,
  onChange,
}: {
  value: ApprovalApprover[]
  onChange: (v: ApprovalApprover[]) => void
}) {
  const [picking, setPicking] = useState(false)
  const available = APPROVER_ROSTER.filter((a) => !value.some((v) => v.id === a.id))
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <div className="grid grid-cols-[minmax(0,1.6fr)_120px_120px_60px] items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          <span>Approver</span>
          <span>Required</span>
          <span>Status</span>
          <span />
        </div>
        {value.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            No approvers yet. Add one to route this request.
          </div>
        ) : (
          value.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-[minmax(0,1.6fr)_120px_120px_60px] items-center gap-3 border-b border-gray-100 px-4 py-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F0DFF6] text-[10px] font-bold text-[#5B2D8E]">
                  {initials(a.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{a.name}</p>
                  {a.role && <p className="truncate text-[11px] text-gray-500">{a.role}</p>}
                </div>
              </div>
              <span className="text-xs text-gray-600">Required</span>
              <span className="text-xs text-gray-500">Pending</span>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v.id !== a.id))}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-rose-600"
                  aria-label={`Remove ${a.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {available.length > 0 && (
        <div className="mt-3">
          {picking ? (
            <div className="rounded-lg border border-gray-200 bg-white p-2">
              <ul className="max-h-48 overflow-y-auto">
                {available.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange([...value, a])
                        setPicking(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F0DFF6] text-[10px] font-bold text-[#5B2D8E]">
                        {initials(a.name)}
                      </span>
                      <span className="font-semibold text-gray-900">{a.name}</span>
                      {a.role && <span className="text-gray-500">· {a.role}</span>}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPicking(false)}
                className="mt-1 w-full rounded-md py-1.5 text-xs text-gray-500 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B2D8E] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add a line
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ----- Activity panel --------------------------------------------------------

function ActivityPanel({
  activity,
  isNew,
  owner,
  ownerInitials,
  panel,
  onPanel,
  noteText,
  onNoteText,
  onAppendNote,
  canNote,
}: {
  activity: ApprovalActivity[]
  isNew: boolean
  owner: string
  ownerInitials: string
  panel: 'activity' | 'note'
  onPanel: (p: 'activity' | 'note') => void
  noteText: string
  onNoteText: (v: string) => void
  onAppendNote: () => void
  canNote: boolean
}) {
  const groups = useMemo(() => groupByDay(activity), [activity])

  return (
    <aside className="flex flex-col bg-gray-50/40 p-6">
      {panel === 'note' && canNote ? (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Log note
          </p>
          <textarea
            value={noteText}
            onChange={(e) => onNoteText(e.target.value)}
            rows={4}
            placeholder="Internal note — visible to approvers, not to the requester."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onPanel('activity')}
              className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAppendNote}
              disabled={!noteText.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Log
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-2 flex-1 overflow-y-auto">
        {isNew ? (
          <ActivityDay label="Today">
            <ActivityRow
              author={owner}
              initials={ownerInitials}
              color="#10B981"
              time={now()}
              body="Creating a new record…"
            />
          </ActivityDay>
        ) : groups.length === 0 ? (
          <p className="text-xs text-gray-400">No activity yet.</p>
        ) : (
          groups.map((g) => (
            <ActivityDay key={g.label} label={g.label}>
              {g.items.map((a) => (
                <ActivityRow
                  key={a.id}
                  author={a.author}
                  initials={a.authorInitials}
                  color={a.authorColor}
                  time={formatTime(a.at)}
                  body={a.body}
                  muted={a.kind === 'system'}
                />
              ))}
            </ActivityDay>
          ))
        )}
      </div>
    </aside>
  )
}

function ActivityDay({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex-1 border-t border-gray-200" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </span>
        <span className="flex-1 border-t border-gray-200" />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ActivityRow({
  author,
  initials,
  color,
  time,
  body,
  muted,
}: {
  author: string
  initials: string
  color: string
  time: string
  body: string
  muted?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs">
          <span className="font-semibold text-gray-900">{author}</span>
          <span className="ml-1.5 text-gray-400">{time}</span>
        </p>
        <p className={cn('mt-0.5 text-sm', muted ? 'text-gray-500' : 'text-gray-800')}>{body}</p>
      </div>
    </div>
  )
}

// ----- Helpers ---------------------------------------------------------------

function defaultsFor(fields: ApprovalField[]): Record<string, string> {
  const out: Record<string, string> = {}
  const today = new Date().toISOString().slice(0, 10)
  for (const f of fields) {
    if (f.kind === 'date') out[f.id] = today
    else if (f.kind === 'date-range') out[f.id] = `${today}/${today}`
    else out[f.id] = ''
  }
  return out
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function now(): string {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupByDay(items: ApprovalActivity[]): { label: string; items: ApprovalActivity[] }[] {
  if (items.length === 0) return []
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const buckets = new Map<string, ApprovalActivity[]>()
  for (const a of items) {
    const day = a.at.slice(0, 10)
    if (!buckets.has(day)) buckets.set(day, [])
    buckets.get(day)!.push(a)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([day, group]) => ({
      label: day === today ? 'Today' : day === yesterday ? 'Yesterday' : formatDay(day),
      items: group,
    }))
}

function formatDay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// ----- Decision dialog -------------------------------------------------------

const DECISION_COPY: Record<
  DecisionKind,
  { title: string; intro: string; cta: string; ctaClass: string; noteLabel: string; placeholder: string; required: boolean }
> = {
  approve: {
    title: 'Approve request',
    intro: 'The submitter will be notified by email. Add an optional note.',
    cta: 'Confirm approval',
    ctaClass: 'bg-emerald-600 hover:bg-emerald-700',
    noteLabel: 'Approver note (optional)',
    placeholder: 'Anything the submitter should know — context, conditions, next steps…',
    required: false,
  },
  refuse: {
    title: 'Refuse request',
    intro: 'The submitter will be notified by email — please share why so they can revise and resubmit.',
    cta: 'Confirm refusal',
    ctaClass: 'bg-rose-600 hover:bg-rose-700',
    noteLabel: 'Reason for refusal',
    placeholder: 'Why this can’t move forward as written.',
    required: true,
  },
  info: {
    title: 'Request more information',
    intro: 'The submitter will be notified by email. The request goes back to their queue as a draft.',
    cta: 'Send request',
    ctaClass: 'bg-amber-600 hover:bg-amber-700',
    noteLabel: 'What do you need?',
    placeholder: 'List the specific information missing — be precise so the submitter can resolve it.',
    required: true,
  },
}

function DecisionDialog({
  kind,
  busy,
  onClose,
  onConfirm,
}: {
  kind: DecisionKind
  busy: boolean
  onClose: () => void
  onConfirm: (note: string) => void
}) {
  const copy = DECISION_COPY[kind]
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function confirm() {
    const trimmed = note.trim()
    if (copy.required && !trimmed) {
      setError(`${copy.noteLabel} is required.`)
      return
    }
    onConfirm(trimmed)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{copy.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{copy.intro}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <label className="block">
            <span className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {copy.noteLabel}
              </span>
              {copy.required && (
                <span className="text-[10px] font-bold text-rose-500">Required</span>
              )}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder={copy.placeholder}
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </label>
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50',
              copy.ctaClass,
            )}
          >
            {busy ? 'Sending…' : copy.cta}
          </button>
        </div>
      </div>
    </div>
  )
}
