'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Circle, Play, RotateCcw } from 'lucide-react'
import type { InternTaskRow } from './page'

// Renders the caller's tasks grouped into "Up next" (Todo + In Progress)
// and "Done". Each row has the appropriate state-change buttons:
//   Todo        → [Start] [Done]
//   In Progress → [Done]
//   Done        → [Reopen]
//
// useTransition keeps the UI responsive while the server action
// resolves — buttons disable but the page doesn't block.

type Actions = {
  start: (id: string) => Promise<void>
  complete: (id: string) => Promise<void>
  reopen: (id: string) => Promise<void>
}

const CATEGORY_TONE: Record<InternTaskRow['category'], string> = {
  Onboarding: 'bg-emerald-50 text-emerald-700',
  Reading: 'bg-sky-50 text-sky-700',
  Shadowing: 'bg-purple-50 text-purple-700',
  Project: 'bg-amber-50 text-amber-700',
  Admin: 'bg-gray-100 text-gray-700',
}

function formatDueDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueAt = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((dueAt.getTime() - today.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays < 7) return `Due in ${diffDays}d`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function MyTasksList({
  tasks,
  actions,
}: {
  tasks: InternTaskRow[]
  actions: Actions
}) {
  const open = tasks.filter((t) => t.status === 'Todo' || t.status === 'In Progress')
  const done = tasks.filter((t) => t.status === 'Done')

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <p className="text-sm font-semibold text-gray-900">No tasks assigned yet</p>
        <p className="mt-1 text-xs text-gray-500">
          Your manager will add onboarding and reading items here. Check back
          tomorrow.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Group title="Up next" tasks={open} actions={actions} emptyMessage="All caught up." />
      <Group title="Done" tasks={done} actions={actions} emptyMessage="Nothing closed yet." />
    </div>
  )
}

function Group({
  title,
  tasks,
  actions,
  emptyMessage,
}: {
  title: string
  tasks: InternTaskRow[]
  actions: Actions
  emptyMessage: string
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {title} <span className="ml-2 font-normal text-gray-400">{tasks.length}</span>
      </h2>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {tasks.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-gray-400">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} actions={actions} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function TaskRow({ task, actions }: { task: InternTaskRow; actions: Actions }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const done = task.status === 'Done'
  const due = formatDueDate(task.due_date)
  const overdue = due.endsWith('overdue')

  // Wraps a server action with explicit error surfacing. Without this
  // the action's throw bubbles into the transition error boundary and
  // the user just sees "nothing happened" — including the case where
  // the row's employee_id doesn't match (the server already records a
  // critical audit event, but the user deserves feedback too).
  function run(action: (id: string) => Promise<void>) {
    setError(null)
    start(async () => {
      try {
        await action(task.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update task.')
      }
    })
  }

  return (
    <li className="flex items-start gap-3 px-5 py-3.5">
      <span
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${done ? 'text-emerald-600' : 'text-gray-300'}`}
      >
        {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-sm font-semibold ${done ? 'text-gray-500 line-through' : 'text-gray-900'}`}
          >
            {task.title}
          </p>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_TONE[task.category]}`}
          >
            {task.category}
          </span>
          {due && !done && (
            <span
              className={`text-[11px] font-medium tabular-nums ${overdue ? 'text-rose-600' : 'text-gray-500'}`}
            >
              {due}
            </span>
          )}
        </div>
        {task.description && (
          <p className={`mt-1 text-xs ${done ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-1 text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {!done && task.status === 'Todo' && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(actions.start)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Play className="h-3 w-3" /> Start
          </button>
        )}
        {!done && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(actions.complete)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3 w-3" /> Done
          </button>
        )}
        {done && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(actions.reopen)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" /> Reopen
          </button>
        )}
      </div>
    </li>
  )
}
