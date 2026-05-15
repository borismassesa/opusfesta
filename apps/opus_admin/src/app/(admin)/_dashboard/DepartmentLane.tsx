import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { DepartmentLane as DepartmentLaneData, LaneCard, LaneTone } from './queries'

// "Decisions for today" — the department-flavoured band that sits below
// the cross-cutting ActionQueue. Each card is a count or short status
// with strong verb-led label and a CTA into the page that resolves it.
//
// Why a single component switches on department in the data layer rather
// than one component per department: the visual treatment is identical
// (card grid + optional list panel); only the data differs. queries.ts
// owns the per-department logic so this stays pure presentation.

const TONE_RAIL: Record<LaneTone, string> = {
  red: 'border-l-4 border-l-rose-500',
  amber: 'border-l-4 border-l-amber-500',
  blue: 'border-l-4 border-l-sky-500',
  green: 'border-l-4 border-l-emerald-500',
  gray: 'border-l-4 border-l-gray-200',
}

const TONE_DOT: Record<LaneTone, string> = {
  red: 'bg-rose-500',
  amber: 'bg-amber-500',
  blue: 'bg-sky-500',
  green: 'bg-emerald-500',
  gray: 'bg-gray-300',
}

const TONE_COUNT: Record<LaneTone, string> = {
  red: 'text-rose-600',
  amber: 'text-amber-600',
  blue: 'text-gray-900',
  green: 'text-emerald-600',
  gray: 'text-gray-400',
}

export default function DepartmentLane({ lane }: { lane: DepartmentLaneData }) {
  if (lane.cards.length === 0 && !lane.list) return null

  return (
    <section aria-labelledby="department-lane-heading" className="space-y-3">
      <header className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-900" aria-hidden />
        <h2
          id="department-lane-heading"
          className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
        >
          {lane.title}
        </h2>
      </header>

      <div
        className={
          lane.list
            ? 'grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]'
            : ''
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lane.cards.map((card) => (
            <Card key={card.label} card={card} />
          ))}
        </div>

        {lane.list && (
          <aside className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <header className="border-b border-gray-100 px-5 py-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {lane.list.title}
              </h3>
            </header>
            <ul className="divide-y divide-gray-100">
              {lane.list.items.map((item, i) => (
                <li key={`${item.primary}-${i}`}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                    >
                      <ListBody item={item} />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-5 py-3">
                      <ListBody item={item} />
                    </div>
                  )}
                </li>
              ))}
              {lane.list.items.length === 0 && (
                <li className="px-5 py-6 text-center text-xs text-gray-400">
                  {lane.list.emptyMessage ?? 'Nothing here yet'}
                </li>
              )}
            </ul>
          </aside>
        )}
      </div>
    </section>
  )
}

function Card({ card }: { card: LaneCard }) {
  const body = (
    <div
      className={`group relative flex h-full flex-col gap-2 rounded-2xl bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] ${TONE_RAIL[card.tone]}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${TONE_DOT[card.tone]}`} aria-hidden />
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {card.label}
        </p>
      </div>
      <p
        className={`text-3xl font-semibold tracking-tight tabular-nums ${TONE_COUNT[card.tone]}`}
      >
        {card.count}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2">
        {card.hint && <p className="text-xs text-gray-500">{card.hint}</p>}
        {card.blocked && (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
            Blocked
          </span>
        )}
      </div>
      {card.href && (
        <ArrowRight className="absolute right-4 top-4 h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-900" />
      )}
    </div>
  )

  return card.href ? (
    <Link href={card.href} className="block transition-shadow hover:shadow-md">
      {body}
    </Link>
  ) : (
    body
  )
}

function ListBody({
  item,
}: {
  item: { primary: string; secondary?: string; meta?: string }
}) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{item.primary}</p>
        {item.secondary && (
          <p className="truncate text-xs text-gray-500">{item.secondary}</p>
        )}
      </div>
      {item.meta && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-gray-600">
          {item.meta}
        </span>
      )}
    </>
  )
}
