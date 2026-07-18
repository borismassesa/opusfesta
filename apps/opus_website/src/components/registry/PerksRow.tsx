import { Truck, BadgePercent, Gift } from 'lucide-react'

const PERKS = [
  { Icon: Truck, title: 'Free shipping and returns', subtitle: 'On registry orders across Tanzania' },
  { Icon: BadgePercent, title: 'Price matching', subtitle: 'We match verified local prices' },
  { Icon: Gift, title: '20% post-wedding discount', subtitle: 'On anything left on your registry' },
]

export function PerksRow() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <h2 className="mb-6 text-lg font-serif font-medium text-gray-900">Your perks</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PERKS.map((perk) => (
          <div key={perk.title} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
            <perk.Icon size={20} className="shrink-0 text-gray-700" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{perk.title}</p>
              <p className="text-xs text-gray-500">{perk.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
