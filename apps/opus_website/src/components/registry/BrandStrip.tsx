import Link from 'next/link'
import { REGISTRY_BRANDS } from '@/lib/registry-products'

export function BrandStrip() {
  return (
    <div className="border-y border-gray-100 bg-[#faf9f7] py-8">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Trusted local brands</span>
          <Link href="/registry/kitchen-dining" className="text-xs font-semibold text-gray-900 underline underline-offset-4">
            Shop all brands →
          </Link>
        </div>
        <div className="hide-scrollbar flex items-center gap-8 overflow-x-auto">
          {REGISTRY_BRANDS.map((b) => (
            <span
              key={b.name}
              className="shrink-0 whitespace-nowrap text-lg font-serif font-medium text-gray-400 grayscale transition-colors hover:text-gray-700"
            >
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
