import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import SearchForm from '@/components/advice-ideas/SearchForm'
import { Hero } from '@/components/registry/Hero'
import { CategoryIcons } from '@/components/registry/CategoryIcons'
import { CollectionsRow } from '@/components/registry/CollectionsRow'
import { BrandStrip } from '@/components/registry/BrandStrip'
import { PriceBandRow } from '@/components/registry/PriceBandRow'
import { PopularGiftsGrid } from '@/components/registry/PopularGiftsGrid'
import { PerksRow } from '@/components/registry/PerksRow'
import { NewArrivalsRow } from '@/components/registry/NewArrivalsRow'
import RegistryBagButton from '@/components/registry/RegistryBagButton'
import { REGISTRY_CATEGORIES } from '@/lib/registry-categories'
import { PRICE_BANDS } from '@/lib/registry-products'

export const metadata: Metadata = {
  title: 'Gift Registry | OpusFesta',
  description:
    'Build your wedding gift registry on OpusFesta — browse curated kitchen, home, and experience gifts and let guests give exactly what you need.',
}

export default function RegistryPage() {
  return (
    <>
      <Navbar />
      <div className="sticky top-0 z-30 bg-black text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-8">
          <nav aria-label="Browse registry categories" className="min-w-0 md:flex-1">
            <ul className="hide-scrollbar flex gap-6 overflow-x-auto pr-6 text-sm md:pr-4">
              {REGISTRY_CATEGORIES.map((c) => (
                <li key={c.slug} className="shrink-0">
                  <Link
                    href={`/registry/${c.slug}`}
                    className="whitespace-nowrap font-medium text-white/80 transition-colors hover:text-[var(--accent)]"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <Suspense fallback={null}>
              <SearchForm placeholder="Search the registry" ariaLabel="Search the registry" />
            </Suspense>
            <RegistryBagButton />
          </div>
        </div>
      </div>

      <main>
        <Hero />
        <CategoryIcons />
        <CollectionsRow />
        <BrandStrip />
        {PRICE_BANDS.map((band) => (
          <PriceBandRow key={band.id} band={band} />
        ))}
        <PopularGiftsGrid />
        <PerksRow />
        <NewArrivalsRow />
      </main>
      <Footer />
    </>
  )
}
