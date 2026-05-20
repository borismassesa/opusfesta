'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, SlidersHorizontal, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { PROMO_CODE, ProductInfo } from '@/components/guests/productInfo'
import { PRODUCTS, type CatalogProduct } from '@/data/invitations-products'
import type { InvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import type { InvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import type { InvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import type { InvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'

// Re-export the catalog dataset so existing imports of `../catalog/InvitationsCatalogClient`
// keep resolving. Canonical source now lives in /data/invitations-products.ts so server
// components (e.g. /invitations/p/[id]/page.tsx) can import the values cleanly without
// going through the 'use client' boundary.
export { PRODUCTS, type CatalogProduct }
type Product = CatalogProduct

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function InvitationsCatalogClient({
  products = PRODUCTS,
  title = 'Wedding Invitations',
  subtitle = 'A handpicked edit of digital invitation designs, browse by style.',
  promoBanner,
  styleStrip,
  exploreStyles,
  freeWebsitePromo,
}: {
  products?: Product[]
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
            <InvitationsFilterDrawer />
          </div>
          <ProductGrid
            products={products}
            favourites={favourites}
            onToggleFavourite={toggleFavourite}
          />
          <Pagination />
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const pageSize = (el: HTMLDivElement) => {
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    return el.clientWidth + gap
  }

  const scrollNext = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: pageSize(el), behavior: 'smooth' })
  }

  const scrollPrev = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: -pageSize(el), behavior: 'smooth' })
  }

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
                <div className="aspect-square w-full overflow-hidden rounded-full bg-white ring-1 ring-gray-200 mb-3 transition-shadow group-hover/tile:shadow-md">
                  <img
                    src={cat.img}
                    alt={cat.alt}
                    className="w-full h-full object-cover group-hover/tile:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-gray-800 group-hover/tile:underline leading-tight">
                  {cat.label}
                  <ArrowRight size={14} className="shrink-0 transition-transform group-hover/tile:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          {/* Left-side scroll-prev chevron — md+, hover-visible, hidden at start */}
          {progress > 1 && (
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Scroll left"
              className="hidden md:grid absolute top-[35px] lg:top-[61px] xl:top-[86px] left-[-50px] h-12 w-12 place-items-center rounded-full bg-[#1A1A1A] shadow-lg hover:bg-black z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
          )}

          {/* Right-side scroll-next chevron — md+, hover-visible, hidden at end */}
          {progress < 99 && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Scroll right"
              className="hidden md:grid absolute top-[35px] lg:top-[61px] xl:top-[86px] right-[-50px] h-12 w-12 place-items-center rounded-full bg-[#1A1A1A] shadow-lg hover:bg-black z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
            >
              <ChevronRight className="h-6 w-6 text-white" />
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

const STYLES = ['Modern', 'Classic', 'Rustic', 'Elegant', 'Heritage Karibu']
const FORMATS = ['Standard', 'Postcard', 'Foil-pressed', 'Vellum overlay', 'Trifold']
const PRINT_EDGES = ['Straight', 'Rounded', 'Deckled', 'Scalloped']
const SEASONS = ['Summer', 'Spring', 'Winter', 'Long rains', 'Short rains']
const PHOTO_COUNTS = ['0 photos', '1 photo', '2 photos', '3 photos', '4+ photos']
const FOIL_OPTIONS = [
  { id: 'any', label: 'Any' },
  { id: 'yes', label: 'Yes — foil-pressed' },
  { id: 'no',  label: 'No foil' },
]
const COLOR_THEMES: { label: string; color: string }[] = [
  { label: 'Blue',   color: '#1E2D54' },
  { label: 'Gold',   color: '#C8A35C' },
  { label: 'Green',  color: '#A6B89A' },
  { label: 'White',  color: '#FFFFFF' },
  { label: 'Purple', color: '#7A4F8E' },
  { label: 'Red',    color: '#7A1F2B' },
  { label: 'Pink',   color: '#F5DCE2' },
  { label: 'Beige',  color: '#F5EFE3' },
  { label: 'Orange', color: '#E89B5C' },
  { label: 'Black',  color: '#1A1A1A' },
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

function Check_Box({
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

function ColorSwatchPicker({
  options,
  selected,
  onToggle,
}: {
  options: { label: string; color: string }[]
  selected: Set<string>
  onToggle: (label: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const isOn = selected.has(o.label)
        return (
          <button
            key={o.label}
            type="button"
            onClick={() => onToggle(o.label)}
            title={o.label}
            aria-label={o.label}
            aria-pressed={isOn}
            className={cn(
              'h-7 w-7 rounded-full border transition',
              isOn ? 'ring-2 ring-offset-1 ring-gray-900 border-white' : 'border-gray-300',
            )}
            style={{ backgroundColor: o.color }}
          />
        )
      })}
    </div>
  )
}

function InvitationsFilterDrawer() {
  const [open, setOpen] = useState(false)
  const [priceRange, setPriceRange] = useState('any')
  const [customLow, setCustomLow] = useState('')
  const [customHigh, setCustomHigh] = useState('')
  const [styles, setStyles] = useState<Set<string>>(new Set())
  const [formats, setFormats] = useState<Set<string>>(new Set())
  const [printEdges, setPrintEdges] = useState<Set<string>>(new Set())
  const [colors, setColors] = useState<Set<string>>(new Set())
  const [foil, setFoil] = useState('any')
  const [seasons, setSeasons] = useState<Set<string>>(new Set())
  const [photoCount, setPhotoCount] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
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
    setStyles(new Set())
    setFormats(new Set())
    setPrintEdges(new Set())
    setColors(new Set())
    setFoil('any')
    setSeasons(new Set())
    setPhotoCount(new Set())
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
          'fixed inset-y-0 left-0 w-full max-w-md bg-white z-50 shadow-xl overflow-y-auto overscroll-contain transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">All filters</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="w-10 h-10 rounded-full ring-2 ring-[var(--accent-hover,#b97fd0)] flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 transition"
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
                <Check size={16} />
              </button>
            </div>
          </FilterSection>

          <FilterSection title="Style">
            {STYLES.map((s) => (
              <Check_Box
                key={s}
                id={`style-${s}`}
                label={s}
                checked={styles.has(s)}
                onChange={() => toggle(styles, s, setStyles)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Format">
            {FORMATS.map((f) => (
              <Check_Box
                key={f}
                id={`fmt-${f}`}
                label={f}
                checked={formats.has(f)}
                onChange={() => toggle(formats, f, setFormats)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Print edges">
            {PRINT_EDGES.map((e) => (
              <Check_Box
                key={e}
                id={`edge-${e}`}
                label={e}
                checked={printEdges.has(e)}
                onChange={() => toggle(printEdges, e, setPrintEdges)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Color theme">
            <ColorSwatchPicker
              options={COLOR_THEMES}
              selected={colors}
              onToggle={(label) => toggle(colors, label, setColors)}
            />
          </FilterSection>

          <FilterSection title="Foil">
            {FOIL_OPTIONS.map((f) => (
              <RadioRow
                key={f.id}
                name="foil"
                id={`foil-${f.id}`}
                label={f.label}
                checked={foil === f.id}
                onChange={() => setFoil(f.id)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Season">
            {SEASONS.map((s) => (
              <Check_Box
                key={s}
                id={`season-${s}`}
                label={s}
                checked={seasons.has(s)}
                onChange={() => toggle(seasons, s, setSeasons)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Number of photos">
            {PHOTO_COUNTS.map((p) => (
              <Check_Box
                key={p}
                id={`photo-${p}`}
                label={p}
                checked={photoCount.has(p)}
                onChange={() => toggle(photoCount, p, setPhotoCount)}
              />
            ))}
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
            onClick={() => setOpen(false)}
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
  favourites,
  onToggleFavourite,
}: {
  products: Product[]
  favourites: Set<string>
  onToggleFavourite: (id: string) => void
}) {
  const items = useMemo(() => {
    const out: Array<
      | { kind: 'upload' }
      | { kind: 'product'; product: Product }
    > = [{ kind: 'upload' }]
    products.forEach((p) => {
      out.push({ kind: 'product', product: p })
    })
    return out
  }, [products])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
      {items.map((it, i) => {
        if (it.kind === 'upload') return <UploadYourOwnCard key={`upload-${i}`} />
        return (
          <ProductCard
            key={it.product.id}
            product={it.product}
            favourited={favourites.has(it.product.id)}
            onToggleFavourite={() => onToggleFavourite(it.product.id)}
          />
        )
      })}
    </div>
  )
}

function UploadYourOwnCard() {
  return (
    <div className="group flex flex-col">
      <Link
        href="/my/guests"
        className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#FBF7F2] ring-1 ring-dashed ring-gray-300 flex flex-col items-center justify-center text-center px-4 hover:bg-white hover:ring-[#1A1A1A] transition"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm">
          <Upload className="h-4 w-4 text-[#1A1A1A]" />
        </span>
        <p className="mt-3 font-serif text-[15px] text-[#1A1A1A] leading-tight">Upload your own design</p>
        <p className="mt-1 text-[11px] text-[#1A1A1A]/60 max-w-[160px]">
          Bring your designer&rsquo;s artwork — we&rsquo;ll print and mail it.
        </p>
      </Link>
    </div>
  )
}

function ProductCard({
  product,
  favourited,
  onToggleFavourite,
}: {
  product: Product
  favourited: boolean
  onToggleFavourite: () => void
}) {
  return (
    <div className="group flex flex-col">
      <Link
        href={`/invitations/p/${product.id}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_16px_-8px_rgba(0,0,0,0.12)] transition-shadow duration-300 group-hover:shadow-xl"
      >
        {/* Zoom-on-hover wrapper around the invitation visual */}
        <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
          <InvitationVisual treatment={product.treatment} />
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
          <Heart className={cn('h-3.5 w-3.5', favourited ? 'fill-[#7A1F2B] text-[#7A1F2B]' : 'text-[#1A1A1A]')} />
        </button>

        {/* "Customise" CTA — fades + slides up on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-3 inline-flex items-center rounded-full bg-[#1A1A1A] text-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300"
        >
          Customise
        </span>
      </Link>
      <ProductInfo product={product} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

function Pagination() {
  const pages = [1, 2, 3, 4, 5]
  return (
    <nav aria-label="Pagination" className="mt-10 sm:mt-14 flex items-center justify-center gap-2">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === 1 ? 'page' : undefined}
          className={cn(
            'h-8 w-8 grid place-items-center rounded-full text-[13px] transition',
            p === 1
              ? 'bg-[#1A1A1A] text-white'
              : 'text-[#1A1A1A] hover:bg-gray-100',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="ml-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-[#1A1A1A] hover:bg-gray-100"
      >
        Next →
      </button>
    </nav>
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
              <img
                src={content.image_url}
                alt={content.image_alt}
                className="absolute inset-0 w-full h-full object-cover rounded-md"
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
