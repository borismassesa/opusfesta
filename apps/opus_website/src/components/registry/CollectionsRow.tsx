import Link from 'next/link'
import { REGISTRY_COLLECTIONS } from '@/lib/registry-products'

export function CollectionsRow() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-serif font-medium text-gray-900">Shop by collection</h2>
        <Link href="/registry/kitchen-dining" className="text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900">
          View all
        </Link>
      </div>
      <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:px-0">
        {REGISTRY_COLLECTIONS.map((c) => (
          <Link key={c.id} href={c.href} className="group w-40 shrink-0 lg:w-auto">
            <div className="mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 transition-shadow duration-300 group-hover:shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <h3 className="text-sm font-medium leading-snug text-gray-900 group-hover:underline">{c.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
