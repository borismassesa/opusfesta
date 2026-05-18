'use client'

import { useCallback, useMemo, useState } from 'react'
import { useSetPageHeading } from '@/components/PageHeading'
import {
  Car,
  FileCheck2,
  FileSignature,
  FileText,
  PackageOpen,
  Plane,
  Plus,
  Search,
  ShoppingCart,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, findCategory } from './data'
import type {
  ApprovalActivity,
  ApprovalActor,
  ApprovalApprover,
  ApprovalCategory,
  ApprovalCategoryKey,
  ApprovalRequest,
  ApprovalStatus,
} from './types'
import RequestFormView, {
  type DecisionKind,
  type RequestFormDraft,
} from './RequestFormView'

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

const STATUS_TONE: Record<ApprovalStatus, string> = {
  'To Submit': 'bg-gray-100 text-gray-700',
  Submitted: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Refused: 'bg-rose-50 text-rose-700',
}

type View =
  | { kind: 'dashboard' }
  | { kind: 'list'; category: ApprovalCategoryKey }
  | { kind: 'request'; requestId: string }
  | { kind: 'new'; category: ApprovalCategoryKey }

export default function ApprovalsClient({
  actor,
  initialRequests,
}: {
  actor: ApprovalActor
  initialRequests: ApprovalRequest[]
}) {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initialRequests)
  const [view, setView] = useState<View>({ kind: 'dashboard' })

  // Stable identity matters here — useSetPageHeading puts the onClick
  // into a useEffect dep list, so an unstable function would tear the
  // heading down and rebuild it every render. setView is React-stable.
  const backToDashboard = useCallback(() => {
    setView({ kind: 'dashboard' })
  }, [])

  // Page heading is view-dependent — the dashboard shows the "Approvals"
  // title + subtitle, while category/list/request views collapse to a
  // back-link in the admin header ("← Business Trip"). The back action
  // is `onClick: backToDashboard` (not a Next.js href) because dashboard
  // / list / form views all live on the same `/approvals` URL — an
  // href would be a no-op since the URL already matches.
  const heading = useMemo(() => {
    if (view.kind === 'dashboard') {
      return {
        title: 'Approvals',
        subtitle: 'Trip auth, contracts, payments, procurement and RFQs — one inbox.',
      }
    }
    const category =
      view.kind === 'request'
        ? requests.find((r) => r.id === view.requestId)?.category
        : view.category
    const label = category ? findCategory(category).label : 'Approvals'
    return {
      title: 'Approvals',
      back: { onClick: backToDashboard, label },
    }
  }, [view, requests, backToDashboard])
  useSetPageHeading(heading)

  function startNew(category: ApprovalCategoryKey) {
    setView({ kind: 'new', category })
  }

  function openRequest(id: string) {
    setView({ kind: 'request', requestId: id })
  }

  function openCategoryList(category: ApprovalCategoryKey) {
    setView({ kind: 'list', category })
  }

  function saveDraft(draft: RequestFormDraft): ApprovalRequest {
    const now = new Date().toISOString()
    const editingId =
      view.kind === 'request' ? view.requestId : view.kind === 'new' ? null : null

    if (editingId) {
      const existing = requests.find((r) => r.id === editingId)
      if (!existing) throw new Error('Request not found')
      const updated: ApprovalRequest = {
        ...existing,
        subject: draft.subject,
        fields: draft.fields,
        approvers: draft.approvers,
        updatedAt: now,
      }
      setRequests((prev) => prev.map((r) => (r.id === editingId ? updated : r)))
      return updated
    }

    const created: ApprovalRequest = {
      id: `apr_${Math.random().toString(36).slice(2, 8)}`,
      category: draft.category,
      subject: draft.subject,
      owner: actor.name,
      ownerEmail: actor.email,
      ownerInitials: actor.initials,
      fields: draft.fields,
      approvers: draft.approvers,
      status: 'To Submit',
      createdAt: now,
      updatedAt: now,
      activity: [systemEntry(now, `${actor.name} created this request.`)],
    }
    setRequests((prev) => [created, ...prev])
    setView({ kind: 'request', requestId: created.id })
    return created
  }

  function transition(id: string, next: ApprovalStatus, decision?: { kind: DecisionKind; note?: string }) {
    const now = new Date().toISOString()
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const entries: ApprovalActivity[] = [
          systemEntry(now, transitionMessage(next, actor.name, decision?.kind)),
        ]
        if (decision?.note?.trim()) {
          entries.push({
            id: `act_${Math.random().toString(36).slice(2, 8)}`,
            kind: 'note',
            at: now,
            author: actor.name,
            authorInitials: actor.initials,
            authorColor: actor.color,
            body: decision.note.trim(),
          })
        }
        return {
          ...r,
          status: next,
          updatedAt: now,
          activity: [...r.activity, ...entries],
        }
      }),
    )
  }

  function appendNote(id: string, body: string) {
    const now = new Date().toISOString()
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== id
          ? r
          : {
              ...r,
              updatedAt: now,
              activity: [
                ...r.activity,
                {
                  id: `act_${Math.random().toString(36).slice(2, 8)}`,
                  kind: 'note' as const,
                  at: now,
                  author: actor.name,
                  authorInitials: actor.initials,
                  authorColor: actor.color,
                  body,
                },
              ],
            },
      ),
    )
  }

  function discardCurrent() {
    if (view.kind === 'new') backToDashboard()
    else if (view.kind === 'request') {
      // No persisted edits to discard since `save` is what writes —
      // just return the user to the dashboard.
      backToDashboard()
    }
  }

  if (view.kind === 'new') {
    return (
      <RequestFormView
        actor={actor}
        category={findCategory(view.category)}
        request={null}
        isNew
        onSave={saveDraft}
        onDiscard={discardCurrent}
        onTransition={transition}
        onAppendNote={appendNote}
      />
    )
  }

  if (view.kind === 'request') {
    const r = requests.find((x) => x.id === view.requestId)
    if (!r) {
      // Shouldn't happen, but bail back to dashboard rather than crash.
      backToDashboard()
      return null
    }
    return (
      <RequestFormView
        actor={actor}
        category={findCategory(r.category)}
        request={r}
        isNew={false}
        onSave={saveDraft}
        onDiscard={discardCurrent}
        onTransition={transition}
        onAppendNote={appendNote}
      />
    )
  }

  if (view.kind === 'list') {
    return (
      <CategoryListView
        category={findCategory(view.category)}
        requests={requests.filter((r) => r.category === view.category)}
        onOpen={openRequest}
        onNew={() => startNew(view.category)}
      />
    )
  }

  // Dashboard
  return (
    <Dashboard
      requests={requests}
      onPickCategory={openCategoryList}
      onNew={startNew}
    />
  )
}

// ----- Dashboard -------------------------------------------------------------

function Dashboard({
  requests,
  onPickCategory,
  onNew,
}: {
  requests: ApprovalRequest[]
  onPickCategory: (k: ApprovalCategoryKey) => void
  onNew: (k: ApprovalCategoryKey) => void
}) {
  const counts = useMemo(() => {
    const acc = new Map<ApprovalCategoryKey, number>()
    for (const c of CATEGORIES) acc.set(c.key, 0)
    for (const r of requests) acc.set(r.category, (acc.get(r.category) ?? 0) + 1)
    return acc
  }, [requests])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {CATEGORIES.map((c) => (
        <CategoryTile
          key={c.key}
          category={c}
          count={counts.get(c.key) ?? 0}
          onOpen={() => onPickCategory(c.key)}
          onNew={() => onNew(c.key)}
        />
      ))}
    </div>
  )
}

function CategoryTile({
  category,
  count,
  onOpen,
  onNew,
}: {
  category: ApprovalCategory
  count: number
  onOpen: () => void
  onNew: () => void
}) {
  const Icon = ICONS[category.iconKey]
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition hover:border-gray-200 hover:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)]">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: category.tint, color: category.accent }}
        aria-label={`Open ${category.label}`}
      >
        <Icon className="h-7 w-7" />
      </button>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpen}
          className="block text-left"
        >
          <p className="truncate text-sm font-semibold text-gray-900 hover:underline">
            {category.label}
          </p>
        </button>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-700"
          >
            <Plus className="h-3 w-3" />
            New Request
          </button>
          {count > 0 && (
            <span className="text-[11px] text-gray-500">
              {count} <span className="text-gray-400">total</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ----- Category list view ----------------------------------------------------

function CategoryListView({
  category,
  requests,
  onOpen,
  onNew,
}: {
  category: ApprovalCategory
  requests: ApprovalRequest[]
  onOpen: (id: string) => void
  onNew: () => void
}) {
  const Icon = ICONS[category.iconKey]
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>('All')
  const [search, setSearch] = useState('')

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false
      if (!q) return true
      return r.subject.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q)
    })
  }, [requests, statusFilter, search])

  return (
    <div className="space-y-4">
      {/* Back arrow + category breadcrumb live in the admin Header. The
          per-category metadata card below carries the icon, blurb,
          search and status filters; "New Request" sits as the primary
          CTA on the right of that card. */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: category.tint, color: category.accent }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{category.label}</p>
          <p className="text-xs text-gray-500">{category.blurb}</p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject or owner…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </div>
          <div className="flex gap-1.5">
            {(['All', 'To Submit', 'Submitted', 'Approved', 'Refused'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  statusFilter === s
                    ? 'bg-[#F0DFF6] text-[#5B2D8E]'
                    : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" />
            New Request
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-700">
            No {category.label.toLowerCase()} requests
            {statusFilter !== 'All' ? ` in ${statusFilter.toLowerCase()}` : ''} yet.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Click <span className="font-semibold text-[#5B2D8E]">New Request</span> to start one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="grid min-w-[760px] grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_120px] items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            <span>Subject</span>
            <span>Owner</span>
            <span>Approvers</span>
            <span>Status</span>
          </div>
          {visible.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onOpen(r.id)}
              className="grid w-full min-w-[760px] grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_120px] items-center gap-3 border-b border-gray-100 px-5 py-3 text-left last:border-b-0 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{r.subject}</p>
                <p className="truncate text-xs text-gray-500">{summariseFields(r, category)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F0DFF6] text-[10px] font-bold text-[#5B2D8E]">
                  {r.ownerInitials}
                </span>
                <span className="truncate text-sm text-gray-700">{r.owner}</span>
              </div>
              <div className="min-w-0 text-xs text-gray-600">
                {r.approvers.length === 0 ? (
                  <span className="text-gray-400">No approvers</span>
                ) : (
                  r.approvers.map((a) => a.name).join(', ')
                )}
              </div>
              <span
                className={cn(
                  'inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  STATUS_TONE[r.status],
                )}
              >
                {r.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ----- Helpers ---------------------------------------------------------------

function summariseFields(r: ApprovalRequest, cat: ApprovalCategory): string {
  const parts: string[] = []
  for (const f of cat.fields) {
    if (f.id === 'subject' || f.id === 'description') continue
    const v = r.fields[f.id]
    if (!v) continue
    parts.push(v.split('\n')[0])
    if (parts.length === 2) break
  }
  if (parts.length === 0 && r.fields.description) parts.push(r.fields.description)
  return parts.join(' · ')
}

function systemEntry(at: string, body: string): ApprovalActivity {
  return {
    id: `act_${Math.random().toString(36).slice(2, 8)}`,
    kind: 'system',
    at,
    author: 'System',
    authorInitials: 'SY',
    authorColor: '#94A3B8',
    body,
  }
}

function transitionMessage(next: ApprovalStatus, actorName: string, decisionKind?: DecisionKind): string {
  // Info-request transitions land back on To Submit but read very
  // differently from a plain reopen — give the activity feed the
  // sharper description.
  if (next === 'To Submit' && decisionKind === 'info') {
    return `${actorName} requested more information.`
  }
  switch (next) {
    case 'Submitted':
      return `${actorName} submitted this for approval.`
    case 'Approved':
      return `${actorName} approved this request.`
    case 'Refused':
      return `${actorName} refused this request.`
    case 'To Submit':
      return `${actorName} reopened this as a draft.`
  }
}
