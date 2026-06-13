'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { PROMO_CODE, ProductInfo } from '@/components/guests/productInfo'
import type { CatalogProduct } from '@/data/invitations-products'
import { useScrollCarousel } from '@/hooks/useScrollCarousel'
import type { InvitationsPromoBannerContent } from '@/lib/cms/invitations-promo-banner'
import type { InvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import type { InvitationsExploreStylesContent } from '@/lib/cms/invitations-explore-styles'
import type { InvitationsFreeWebsitePromoContent } from '@/lib/cms/invitations-free-website-promo'

export type { CatalogProduct }
type Product = CatalogProduct

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

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  // Number of batches auto-loaded on scroll so far. After AUTO_LOAD_BATCHES we
  // switch to a manual "Load more" button so the page footer stays reachable.
  const [autoLoads, setAutoLoads] = useState(0)

  // Reset the visible window whenever the source products change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setAutoLoads(0)
  }, [products])

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  )
  const hasMore = visibleCount < products.length
  const autoLoading = hasMore && autoLoads < AUTO_LOAD_BATCHES

  const loadMore = () =>
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, products.length))

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
  }, [autoLoading, products.length])

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

      {/* Product grid (full-width) */}
      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl pt-8 sm:pt-10">
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
          {products.length > 0 && (
            <p className="mt-6 text-center text-[12px] text-[#1A1A1A]/45">
              Showing {visibleProducts.length} of {products.length}
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
