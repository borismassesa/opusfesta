export type StatItem = {
  label: string
  value: string
  tone?: 'default' | 'positive' | 'negative'
}

const TONE_CLASS: Record<NonNullable<StatItem['tone']>, string> = {
  default: 'text-gray-900',
  positive: 'text-emerald-700',
  negative: 'text-rose-700',
}

export default function StatsStrip({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]"
        >
          <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{item.label}</div>
          <div className={`mt-1 text-[18px] font-semibold tabular-nums ${TONE_CLASS[item.tone ?? 'default']}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
