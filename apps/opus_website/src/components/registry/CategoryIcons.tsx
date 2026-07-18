import Link from 'next/link'
import { REGISTRY_CATEGORIES } from '@/lib/registry-categories'

export function CategoryIcons() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:gap-6">
        {REGISTRY_CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/registry/${cat.slug}`} className="group flex flex-col items-center gap-2.5">
            <div className="aspect-square w-full overflow-hidden rounded-full bg-violet-50 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.img}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="text-center text-[11px] font-medium leading-snug text-gray-800 group-hover:underline sm:text-xs">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
