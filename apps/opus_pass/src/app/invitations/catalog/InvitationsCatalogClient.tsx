'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check as CheckIcon, ChevronLeft, ChevronRight, Heart, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { PROMO_CODE, ProductInfo } from '@/components/guests/productInfo'
import type { CatalogProduct } from '@/data/invitations-products'
import { useScrollCarousel } from '@/hooks/useScrollCarousel'
import { useBodyLock } from '@/hooks/useBodyLock'
import type { InvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import type { InvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import type { InvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import type { InvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'

export type { CatalogProduct }
type Product = CatalogProduct

// ─────────────────────────────────────────────────────────────────────────────
//  FILTER STATE
// ─────────────────────────────────────────────────────────────────────────────

export type CommittedFilters = {
  priceRange: string
  customLow: string
  customHigh: string
  categories: string[]
  designers: string[]
  freeSampleOnly: boolean
}

const EMPTY_FILTERS: CommittedFilters = {
  priceRange: 'any',
  customLow: '',
  customHigh: '',
  categories: [],
  designers: [],
  freeSampleOnly: false,
}

function countActiveFilters(f: CommittedFilters): number {
  return (
    (f.priceRange !== 'any' ? 1 : 0) +
    f.categories.length +
    f.designers.length +
    (f.freeSampleOnly ? 1 : 0)
  )
}

function applyFilters(products: Product[], f: CommittedFilters): Product[] {
  return products.filter((p) => {
    if (f.categories.length > 0 && !f.categories.includes(p.category)) return false
    if (f.designers.length > 0 && !f.designers.includes(p.designer)) return false
    if (f.freeSampleOnly && !p.freeSample) return false
    // Price filter — operates on priceNow (product data)
    if (f.priceRange !== 'any') {
      const price = p.priceNow
      if (f.priceRange === 'under-50k' && price >= 50000) return false
      if (f.priceRange === '50k-100k' && (price < 50000 || price > 100000)) return false
      if (f.priceRange === '100k-150k' && (price < 100000 || price > 150000)) return false
      if (f.priceRange === '150k-200k' && (price < 150000 || price > 200000)) return false
      if (f.priceRange === 'over-200k' && price <= 200000) return false
      if (f.priceRange === 'custom') {
        const low = parseInt(f.customLow, 10)
        const high = parseInt(f.customHigh, 10)
        if (!isNaN(low) && price < low) return false
        if (!isNaN(high) && price > high) return false
      }
    }
    return true
  })
}

const PAGE_SIZE = 12
// How many extra batches auto-load on scroll before the "Load more" button
// takes over (keeps the footer reachable on large result sets).
const AUTO_LOAD_BATCHES = 2

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function InvitationsCatalogClient({
  products = [],
  fromGuestPrice,
  title = 'Wedding Invitations',
  subtitle = 'A handpicked edit of digital invitation designs, browse by style.',
  promoBanner,
  styleStrip,
  exploreStyles,
  freeWebsitePromo,
}: {
  products?: Product[]
  /** Lowest per-guest package price — the "From TZS X per guest" card anchor. */
  fromGuestPrice?: number
  title?: string
  subtitle?: string
  promoBanner: InvitationsPromoBannerContent
  styleStrip: InvitationsStyleStripContent
  exploreStyles: InvitationsExploreStylesContent
  freeWebsitePromo: InvitationsFreeWebsitePromoContent
}) {
  const [favourites, setFavourites] = useState<Set<string>>(new Set())
  const toggleFavourite = (id: string) =>
    setFavourites((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const [filters, setFilters] = useState<CommittedFilters>(EMPTY_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  // Number of batches auto-loaded on scroll so far. After AUTO_LOAD_BATCHES we
  // switch to a manual "Load more" button so the page footer stays reachable.
  const [autoLoads, setAutoLoads] = useState(0)

  const filteredProducts = useMemo(() => applyFilters(products, filters), [products, filters])

  // Filter options are derived from the products on this page, so the drawer
  // only ever offers choices that can actually match something.
  const categoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  )
  const designerOptions = useMemo(
    () => [...new Set(products.map((p) => p.designer))].sort(),
    [products],
  )

  // Reset the visible window whenever filters or source products change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setAutoLoads(0)
  }, [filters, products])

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  )
  const hasMore = visibleCount < filteredProducts.length
  const autoLoading = hasMore && autoLoads < AUTO_LOAD_BATCHES

  const loadMore = () =>
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredProducts.length))

  // Infinite scroll for the first AUTO_LOAD_BATCHES — grow the window when the
  // sentinel near the grid's end scrolls into view. rootMargin pre-loads the
  // next batch before it's reached. Past that, the "Load more" button takes over.
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!autoLoading) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setAutoLoads((n) => n + 1)
          loadMore()
        }
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoading, filteredProducts.length])

  return (
    <div className="bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Sitewide promo banner — replaces the per-card 'With code KARIBU40' line */}
      <div
        className="border-b border-[#E8D9A7]/50 py-2.5"
        style={{ backgroundColor: promoBanner.background_color }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-center gap-3 text-center flex-wrap">
          <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.18em] text-[#1A1A1A]">
            {promoBanner.eyebrow}
          </span>
          <span className="text-[12px] sm:text-[13px] text-[#1A1A1A]/85">
            {promoBanner.body}{' '}
            <strong className="font-bold text-[#1A1A1A]">{promoBanner.promo_code || PROMO_CODE}</strong>
          </span>
        </div>
      </div>

      {/* Title — matches the serif heading pattern used on /invitations */}
      <header className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl pt-10 sm:pt-14 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-gray-900 mb-4">
            {title}
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-700 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </header>

      {/* Style strip */}
      <CategoryStrip items={styleStrip.items} />

      {/* Filter trigger bar + product grid (full-width) */}
      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl pt-8 sm:pt-10">
          <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8">
            <InvitationsFilterDrawer
              filters={filters}
              onApply={setFilters}
              categoryOptions={categoryOptions}
              designerOptions={designerOptions}
            />
          </div>
          <ProductGrid
            products={visibleProducts}
            fromGuestPrice={fromGuestPrice}
            favourites={favourites}
            onToggleFavourite={toggleFavourite}
          />
          {autoLoading && (
            <div ref={sentinelRef} aria-hidden className="mt-10 flex justify-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A1A1A]/15 border-t-[#1A1A1A]/60" />
            </div>
          )}
          {hasMore && !autoLoading && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex items-center rounded-full border border-[#1A1A1A]/20 bg-white px-7 py-3 text-[13px] font-bold text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]"
              >
                Load more
              </button>
            </div>
          )}
          {filteredProducts.length > 0 && (
            <p className="mt-6 text-center text-[12px] text-[#1A1A1A]/45">
              Showing {visibleProducts.length} of {filteredProducts.length}
            </p>
          )}
        </div>
      </div>

      {/* Explore other styles */}
      <ExploreOtherStyles content={exploreStyles} />

      {/* Free wedding website promo */}
      <FreeWebsitePromo content={freeWebsitePromo} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CATEGORY STRIP — circular-photo carousel matching /invitations Shop-by-Category
// ─────────────────────────────────────────────────────────────────────────────

type StyleStripItem = InvitationsStyleStripContent['items'][number]

function CategoryStrip({ items }: { items: StyleStripItem[] }) {
  const { scrollRef, progress, scrollNext, scrollPrev } = useScrollCarousel()

  return (
    <div className="px-4 sm:px-6">
      <div className="mx-auto max-w-7xl pt-8 sm:pt-10">
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex gap-5 sm:gap-6 md:gap-8 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            {items.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href ?? '/invitations/catalog'}
                className="group/tile flex flex-col items-center text-center shrink-0 snap-start w-[110px] sm:w-[130px] md:w-[calc((100%-128px)/5)]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-full bg-white ring-1 ring-gray-200 mb-3 transition-shadow group-hover/tile:shadow-md">
                  <Image
                    src={cat.img}
                    alt={cat.alt}
                    fill
                    sizes="(min-width: 768px) 20vw, 130px"
                    className="object-cover group-hover/tile:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-gray-800 group-hover/tile:underline leading-tight">
                  {cat.label}
                  <ArrowRight size={14} className="shrink-0 transition-transform group-hover/tile:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          {progress > 1 && (
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Scroll left"
              className="hidden md:grid absolute top-1/2 -translate-y-1/2 left-2 h-10 w-10 place-items-center rounded-full bg-[#1A1A1A]/80 shadow-lg hover:bg-[#1A1A1A] z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}

          {progress < 99 && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Scroll right"
              className="hidden md:grid absolute top-1/2 -translate-y-1/2 right-2 h-10 w-10 place-items-center rounded-full bg-[#1A1A1A]/80 shadow-lg hover:bg-[#1A1A1A] z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  FILTER DRAWER — same pattern as /attire-and-rings FilterDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_RANGES = [
  { id: 'any',         label: 'Any price' },
  { id: 'under-50k',   label: 'Under TZS 50,000' },
  { id: '50k-100k',    label: 'TZS 50,000 – 100,000' },
  { id: '100k-150k',   label: 'TZS 100,000 – 150,000' },
  { id: '150k-200k',   label: 'TZS 150,000 – 200,000' },
  { id: 'over-200k',   label: 'Over TZS 200,000' },
]

function FilterSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-gray-900 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      <div className="space-y-2.5 pt-2">{children}</div>
    </div>
  )
}

function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer text-sm text-gray-800 hover:text-gray-900">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
      />
      {label}
    </label>
  )
}

function RadioRow({
  name,
  id,
  label,
  checked,
  onChange,
}: {
  name: string
  id: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer text-sm text-gray-800 hover:text-gray-900">
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
      />
      {label}
    </label>
  )
}

function InvitationsFilterDrawer({
  filters,
  onApply,
  categoryOptions,
  designerOptions,
}: {
  filters: CommittedFilters
  onApply: (f: CommittedFilters) => void
  categoryOptions: string[]
  designerOptions: string[]
}) {
  const [open, setOpen] = useState(false)

  // Internal draft state — committed only on Apply
  const [priceRange, setPriceRange] = useState(filters.priceRange)
  const [customLow, setCustomLow] = useState(filters.customLow)
  const [customHigh, setCustomHigh] = useState(filters.customHigh)
  const [categories, setCategories] = useState<Set<string>>(new Set(filters.categories))
  const [designers, setDesigners] = useState<Set<string>>(new Set(filters.designers))
  const [freeSampleOnly, setFreeSampleOnly] = useState(filters.freeSampleOnly)

  const activeCount = countActiveFilters(filters)

  useBodyLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = (set: Set<string>, val: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    setter(next)
  }

  const clearAll = () => {
    setPriceRange('any')
    setCustomLow('')
    setCustomHigh('')
    setCategories(new Set())
    setDesigners(new Set())
    setFreeSampleOnly(false)
    onApply(EMPTY_FILTERS)
  }

  const apply = () => {
    onApply({
      priceRange,
      customLow,
      customHigh,
      categories: [...categories],
      designers: [...designers],
      freeSampleOnly,
    })
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition whitespace-nowrap shrink-0"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <SlidersHorizontal size={14} />
        All filters
        {activeCount > 0 && (
          <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gray-900 px-1.5 text-[11px] font-bold leading-none text-white">
            {activeCount}
          </span>
        )}
      </button>

      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setOpen(false)}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
        data-lenis-prevent
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="All filters"
        data-lenis-prevent
        className={cn(
          // `invisible` backstops the translate: old WebViews (< Chromium 104) ignore
          // the standalone `translate` property and the closed drawer would block taps.
          'fixed inset-y-0 left-0 w-full max-w-md bg-white z-50 shadow-xl overflow-y-auto overscroll-contain transition-[transform,translate,visibility] duration-200',
          open ? 'visible translate-x-0' : 'invisible -translate-x-full',
        )}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">All filters</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="w-10 h-10 rounded-full ring-2 ring-[var(--accent-hover)] flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8 pb-28">
          <FilterSection title="Price (TZS)" subtitle="Per 100-card pack">
            {PRICE_RANGES.map((r) => (
              <RadioRow
                key={r.id}
                name="price"
                id={`price-${r.id}`}
                label={r.label}
                checked={priceRange === r.id}
                onChange={() => setPriceRange(r.id)}
              />
            ))}
            <div className="flex items-center gap-2 pt-2">
              <RadioRow
                name="price"
                id="price-custom"
                label=""
                checked={priceRange === 'custom'}
                onChange={() => setPriceRange('custom')}
              />
              <span className="-ml-2 text-sm text-gray-800">Custom</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Low"
                value={customLow}
                onChange={(e) => setCustomLow(e.target.value)}
                onFocus={() => setPriceRange('custom')}
                className="h-9 w-24 rounded border border-gray-300 px-2 text-sm focus:outline-none focus:border-gray-500"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="High"
                value={customHigh}
                onChange={(e) => setCustomHigh(e.target.value)}
                onFocus={() => setPriceRange('custom')}
                className="h-9 w-24 rounded border border-gray-300 px-2 text-sm focus:outline-none focus:border-gray-500"
              />
              <button
                type="button"
                aria-label="Apply price range"
                onClick={() => setPriceRange('custom')}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <CheckIcon size={16} />
              </button>
            </div>
          </FilterSection>

          {categoryOptions.length > 1 && (
            <FilterSection title="Card type">
              {categoryOptions.map((c) => (
                <FilterCheckbox
                  key={c}
                  id={`cat-${c}`}
                  label={c}
                  checked={categories.has(c)}
                  onChange={() => toggle(categories, c, setCategories)}
                />
              ))}
            </FilterSection>
          )}

          {designerOptions.length > 1 && (
            <FilterSection title="Designer">
              {designerOptions.map((d) => (
                <FilterCheckbox
                  key={d}
                  id={`designer-${d}`}
                  label={d}
                  checked={designers.has(d)}
                  onChange={() => toggle(designers, d, setDesigners)}
                />
              ))}
            </FilterSection>
          )}

          <FilterSection title="Free sample">
            <FilterCheckbox
              id="free-sample-only"
              label="Only show designs with a free sample"
              checked={freeSampleOnly}
              onChange={setFreeSampleOnly}
            />
          </FilterSection>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={apply}
            className="bg-gray-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-800 transition"
          >
            Apply
          </button>
        </div>
      </aside>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT GRID
// ─────────────────────────────────────────────────────────────────────────────

function ProductGrid({
  products,
  fromGuestPrice,
  favourites,
  onToggleFavourite,
}: {
  products: Product[]
  fromGuestPrice?: number
  favourites: Set<string>
  onToggleFavourite: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          fromGuestPrice={fromGuestPrice}
          favourited={favourites.has(product.id)}
          onToggleFavourite={() => onToggleFavourite(product.id)}
        />
      ))}
    </div>
  )
}

function ProductCard({
  product,
  fromGuestPrice,
  favourited,
  onToggleFavourite,
}: {
  product: Product
  fromGuestPrice?: number
  favourited: boolean
  onToggleFavourite: () => void
}) {
  // Card image: prefer the attached hero artwork, then fall back to the first
  // designer-uploaded design, then the built-in CSS treatment. Products created
  // via designer upload often have no `imageUrl` (only `designs`), so without
  // this fallback their catalog card would show a blank placeholder.
  const cardImage = product.imageUrl || product.designs?.[0]

  return (
    <div className="group flex flex-col">
      <Link
        href={`/invitations/p/${product.id}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_16px_-8px_rgba(0,0,0,0.12)] transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.06),0_18px_32px_-12px_rgba(0,0,0,0.18)]"
      >
        <span className="absolute inset-0">
          {cardImage ? (
            <Image src={cardImage} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover" unoptimized />
          ) : (
            <InvitationVisual treatment={product.treatment} />
          )}
        </span>

        {/* Heart button — stays put (above zoom layer) */}
        <button
          type="button"
          aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
          aria-pressed={favourited}
          onClick={(e) => {
            e.preventDefault()
            onToggleFavourite()
          }}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 shadow-sm hover:bg-white z-10"
        >
          <Heart className={cn('h-3.5 w-3.5', favourited ? 'fill-red-500 text-red-500' : 'text-[#1A1A1A]')} />
        </button>

      </Link>
      <ProductInfo product={product} fromGuestPrice={fromGuestPrice} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  EXPLORE OTHER STYLES
// ─────────────────────────────────────────────────────────────────────────────

function ExploreOtherStyles({ content }: { content: InvitationsExploreStylesContent }) {
  return (
    <section className="px-4 sm:px-6 mt-16 sm:mt-20 border-t border-gray-200">
      <div className="mx-auto max-w-7xl pt-10 sm:pt-14 pb-10 sm:pb-14">
        <h2 className="font-serif text-[20px] sm:text-[22px] text-[#1A1A1A]">{content.heading}</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {content.columns.map((c) => (
            <div key={c.id}>
              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#1A1A1A]/60">{c.heading}</p>
              <ul className="mt-3 space-y-2">
                {c.items.map((it) => (
                  <li key={it.id}>
                    <Link
                      href={it.href || '/invitations/catalog'}
                      className="text-[13px] text-[#1A1A1A]/85 hover:text-[var(--accent-hover)] hover:underline underline-offset-2"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  BOTTOM CTA — Free Wedding Website
// ─────────────────────────────────────────────────────────────────────────────

function FreeWebsitePromo({ content }: { content: InvitationsFreeWebsitePromoContent }) {
  return (
    <section className="px-4 sm:px-6 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative overflow-hidden rounded-md grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 p-8 sm:p-10 md:p-14 items-center"
          style={{ backgroundColor: content.background_color }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#1A1A1A]/60">{content.eyebrow}</p>
            <h2 className="mt-3 font-serif text-[26px] sm:text-[30px] md:text-[36px] leading-tight text-[#1A1A1A]">
              {content.heading}
            </h2>
            <p className="mt-3 text-[14px] text-[#1A1A1A]/75 max-w-md">{content.body}</p>
            <Link
              href={content.cta_href || '/my/planning'}
              className="mt-6 inline-flex items-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em]"
            >
              {content.cta_label}
            </Link>
          </div>
          <div className="relative h-[200px] sm:h-[240px] md:h-[280px]">
            {content.image_url ? (
              <Image
                src={content.image_url}
                alt={content.image_alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover rounded-md"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[60%] aspect-[3/4] shadow-md rotate-[-4deg]">
                  <InvitationVisual treatment="floral-border" />
                </div>
                <div className="absolute right-[6%] top-[10%] w-[34%] aspect-[3/4] shadow-md rotate-[6deg]">
                  <InvitationVisual treatment="navy-gold" />
                </div>
                <div className="absolute left-[6%] bottom-[6%] w-[28%] aspect-[3/4] shadow-md rotate-[3deg]">
                  <InvitationVisual treatment="classic-serif" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
