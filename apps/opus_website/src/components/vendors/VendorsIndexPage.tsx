'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BadgeCheck,
  CakeSlice,
  Camera,
  CarFront,
  Eye,
  Flower2,
  Gem,
  Globe,
  Heart,
  Lightbulb,
  Mail,
  MapPin,
  Mic2,
  Music4,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Tent,
  Users,
  UtensilsCrossed,
  Video,
} from 'lucide-react'
import {
  VENDORS_BASE_PATH,
  vendorCategories,
  vendorCities,
  vendors,
  getFeaturedVendors,
  getVendorsByCategory,
} from '@/lib/vendors'

const pageClass = 'mx-auto w-full max-w-[72rem] 2xl:max-w-[90rem] 3xl:max-w-[112rem] 4xl:max-w-[140rem]'

const heroVendor = getFeaturedVendors()[0] ?? vendors[0]
const ROW_SIZE = 6

const guestFavourites = [...vendors]
  .sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return b.reviewCount - a.reviewCount
  })
  .slice(0, ROW_SIZE)

const planningRow = (() => {
  const picks = [
    ...getVendorsByCategory('videographers').slice(0, 2),
    ...getVendorsByCategory('djs-bands').slice(0, 2),
    ...getVendorsByCategory('florists').slice(0, 1),
    ...getVendorsByCategory('transportation').slice(0, 1),
  ]
  if (picks.length >= ROW_SIZE) return picks.slice(0, ROW_SIZE)
  const ids = new Set(picks.map((v) => v.id))
  const fallbacks = vendors.filter((v) => !ids.has(v.id))
  return [...picks, ...fallbacks].slice(0, ROW_SIZE)
})()

const promotionsRow = (() => {
  const badged = vendors.filter((v) => v.badge)
  if (badged.length >= ROW_SIZE) return badged.slice(0, ROW_SIZE)
  const ids = new Set(badged.map((v) => v.id))
  const fallbacks = vendors.filter((v) => !ids.has(v.id))
  return [...badged, ...fallbacks].slice(0, ROW_SIZE)
})()

const newVendorsRow = (() => {
  const newOnes = vendors.filter((v) => v.badge === 'New')
  if (newOnes.length >= ROW_SIZE) return newOnes.slice(0, ROW_SIZE)
  const ids = new Set(newOnes.map((v) => v.id))
  const fallbacks = [...vendors].reverse().filter((v) => !ids.has(v.id))
  return [...newOnes, ...fallbacks].slice(0, ROW_SIZE)
})()

const categoryIcons: Record<string, LucideIcon> = {
  venues: MapPin,
  photographers: Camera,
  videographers: Video,
  'djs-bands': Music4,
  florists: Flower2,
  caterers: UtensilsCrossed,
  'hair-makeup': Sparkles,
  'wedding-cakes': CakeSlice,
  transportation: CarFront,
  'wedding-planners': Users,
  'decor-styling': Sparkles,
  'bridal-wear': Shirt,
  'groom-wear': Shirt,
  'jewellery-rings': Gem,
  'invitations-stationery': Mail,
  'sound-lighting': Lightbulb,
  'tents-marquees': Tent,
  'photo-booths': Camera,
  'officiant-mc': Mic2,
  'honeymoon-travel': Globe,
  'security': ShieldCheck,
  'caricature-entertainment': Users,
}

const featurePoints = [
  {
    icon: ShieldCheck,
    title: 'Find verified vendors',
    body: 'Profiles with cleaner review signals and pricing guidance before you open the full page.',
  },
  {
    icon: Sparkles,
    title: 'Get the style you want',
    body: 'Browse destination-ready venues, beauty teams, and photo specialists that fit the mood.',
  },
  {
    icon: Users,
    title: 'Read useful reviews',
    body: 'See why couples keep shortlisting the same teams for intimate weddings and big guest weekends.',
  },
]

const faqs = [
  'What is OpusFesta and how does vendor search work?',
  'How do I use search filters?',
  'Do I need to contact vendors individually?',
  'What if I need destination-wedding help?',
  'Need more information?',
]

function VendorMedia({
  src,
  alt,
  type,
  poster,
}: {
  src: string
  alt: string
  type: 'image' | 'video'
  poster?: string
}) {
  if (type === 'video') {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  )
}

const HERO_TABS = [
  { label: 'Venues', icon: MapPin },
  { label: 'Photographers', icon: Camera },
  { label: 'Catering', icon: UtensilsCrossed },
  { label: 'MCs', icon: Users },
]

const topVendorNames = [...vendors]
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 3)
  .map((v) => v.name)

const topVenueNames = vendors
  .filter((v) => v.categoryId === 'venues')
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 3)
  .map((v) => v.name)

const topPhotographerNames = vendors
  .filter((v) => v.categoryId === 'photographers')
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 3)
  .map((v) => v.name)

const topCatererNames = vendors
  .filter((v) => v.categoryId === 'caterers')
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 3)
  .map((v) => v.name)

const POPULAR_BY_TAB: Record<string, { label: string; items: string[] }> = {
  Venues: { label: 'Popular:', items: topVenueNames },
  Photographers: { label: 'Popular:', items: topPhotographerNames },
  Catering: { label: 'Popular:', items: topCatererNames },
  MCs: { label: 'Popular:', items: ['DJ Mwanga', 'MC Livanga', 'Bongo MC'] },
}

const HERO_VIDEOS = [
  { src: '/assets/vendors_hero_ads/dribble.mp4',   name: 'The Zanzibar Pearl',  avatar: '/assets/images/coupleswithpiano.jpg' },
  { src: '/assets/vendors_hero_ads/dribble_1.mp4', name: 'OpusStudio',          avatar: '/assets/images/beautiful_bride.jpg' },
  { src: '/assets/vendors_hero_ads/dribble_3.mp4', name: 'Serengeti Sounds',    avatar: '/assets/images/mauzo_crew.jpg' },
  { src: '/assets/vendors_hero_ads/dribble_4.mp4', name: 'Bloom & Petals',      avatar: '/assets/images/flowers_pinky.jpg' },
  { src: '/assets/vendors_hero_ads/dribble_6.mp4', name: 'Ivory Table Co.',     avatar: '/assets/images/couples_together.jpg' },
]

function HeroVideoCard() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const [displayed, setDisplayed] = useState(0)

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_VIDEOS.length)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.src = HERO_VIDEOS[current].src
    video.play().catch(() => {})

    // fade out → swap content → fade in
    setVisible(false)
    const t = setTimeout(() => {
      setDisplayed(current)
      setVisible(true)
    }, 250)
    return () => clearTimeout(t)
  }, [current])

  const vendor = HERO_VIDEOS[displayed]

  return (
    <div className="overflow-hidden rounded-2xl bg-[#1A1A1A] relative aspect-[4/3] shadow-2xl sm:rounded-3xl">
      <video
        ref={videoRef}
        src={HERO_VIDEOS[0].src}
        autoPlay
        muted
        playsInline
        onEnded={advance}
        className="h-full w-full object-cover"
      />

      {/* Animated vendor badge */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 py-1 pl-1 pr-2.5 shadow-sm backdrop-blur-sm"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vendor.avatar}
          alt={vendor.name}
          className="h-5 w-5 rounded-full object-cover"
        />
        <span className="text-[11px] font-bold text-[#1A1A1A]">{vendor.name}</span>
      </div>
    </div>
  )
}

function HeroSection() {
  const [activeTab, setActiveTab] = useState('Venues')

  return (
    <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-16 2xl:gap-24 3xl:gap-32">
      <div className="flex-1 pt-2 lg:pt-6">
        <h1 className="text-[2rem] font-extrabold tracking-tight leading-[1.05] mb-5 text-[#1A1A1A] sm:text-[2.6rem] md:text-5xl lg:text-[3.2vw] xl:text-[56px] 2xl:text-[68px] 3xl:text-[80px]">
          Discover the<br /><span className="whitespace-nowrap">Best Wedding Vendors</span>
        </h1>
        <p className="mb-8 text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
          Verified wedding professionals across Tanzania, all in one place.
        </p>

        <div className="mb-7 flex items-center gap-1">
          {HERO_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.label
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                  isActive ? 'bg-[#C9A0DC] text-[#1A1A1A]' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="relative mb-6 group/search">
          <div className="absolute -inset-[2px] rounded-full bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-[#C9A0DC]/20 via-[#C9A0DC] to-[#C9A0DC]/20 opacity-50 group-focus-within/search:opacity-80 transition-opacity" />
          <input
            type="text"
            placeholder={`What type of ${activeTab.toLowerCase()} are you interested in?`}
            className="relative w-full rounded-full border-0 bg-white py-4 pl-5 pr-14 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none"
          />
          <button className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--accent)] transition-colors hover:bg-[var(--accent-hover)]">
            <Search size={18} className="text-[var(--on-accent)]" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-[#1A1A1A]">{POPULAR_BY_TAB[activeTab]?.label ?? 'Popular:'}</span>
          {(POPULAR_BY_TAB[activeTab]?.items ?? []).map((tag) => (
            <button
              key={tag}
              className="rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-w-0 lg:pt-6">
        <HeroVideoCard />
      </div>
    </div>
  )
}

function CardImageCarousel({ vendor }: { vendor: (typeof vendors)[number] }) {
  const images = vendor.gallery?.length ? vendor.gallery : [vendor.heroMedia.src]
  const [idx, setIdx] = useState(0)
  const dragStart = useRef<number | null>(null)

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    setIdx((i) => (i - 1 + images.length) % images.length)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    setIdx((i) => (i + 1) % images.length)
  }

  const onTouchStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStart.current === null) return
    const diff = dragStart.current - e.changedTouches[0].clientX
    if (diff > 40) setIdx((i) => (i + 1) % images.length)
    else if (diff < -40) setIdx((i) => (i - 1 + images.length) % images.length)
    dragStart.current = null
  }

  return (
    <div
      className="group/img relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[idx]}
        alt={vendor.heroMedia.alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />

      {/* Prev / Next arrows — only show if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 transition-opacity group-hover/img:opacity-100 hover:bg-white"
          >
            <ArrowRight size={13} className="rotate-180 text-[#000]" />
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 transition-opacity group-hover/img:opacity-100 hover:bg-white"
          >
            <ArrowRight size={13} className="text-[#000]" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setIdx(i) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-3.5 bg-white' : 'w-1.5 bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Top-left badges */}
      <div className="absolute left-3 top-3 flex flex-wrap gap-1">
        {vendor.featured && (
          <span className="rounded-full border border-[#C9A0DC] bg-[rgba(201,160,220,0.85)] px-2.5 py-0.5 text-[10px] font-semibold text-[#000] backdrop-blur-sm">
            Featured
          </span>
        )}
        {vendor.badge && (
          <span className="rounded-full border border-white/40 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#000] backdrop-blur-sm">
            {vendor.badge}
          </span>
        )}
      </div>

      {/* Top-right heart */}
      <button
        onClick={(e) => e.preventDefault()}
        aria-label="Save to favourites"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
      >
        <Heart size={13} className="text-gray-500" />
      </button>
    </div>
  )
}

function ListingCard({ vendor }: { vendor: (typeof vendors)[number] }) {
  const isNew = vendor.badge === 'New'
  const startingPrice = vendor.priceRange.split('–')[0].trim()

  return (
    <Link
      href={`${VENDORS_BASE_PATH}/${vendor.slug}`}
      className="font-sans-dm group flex flex-col bg-white transition-all duration-300 hover:-translate-y-1"
    >
      <CardImageCarousel vendor={vendor} />

      {/* Body zone — no border, clean white */}
      <div className="pt-3">
        {/* Row 1: Name (left) · Rating + Views (right) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <h3 className="font-display truncate text-[16px] leading-snug text-[#000]">{vendor.name}</h3>
            {vendor.badge === 'Verified' && (
              <BadgeCheck size={15} className="shrink-0 text-[#C9A0DC]" fill="currentColor" color="white" title="Verified vendor" />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-[11px] text-gray-400">
            {vendor.reviewCount > 0 && (
              <>
                <Star size={9} className="text-[#F5A623]" fill="currentColor" />
                <span className="font-semibold text-[#000]">{vendor.rating.toFixed(1)}</span>
                <span className="text-gray-300">·</span>
              </>
            )}
            <Eye size={9} />
            <span>
              {vendor.reviewCount * 18 >= 1000
                ? `${(vendor.reviewCount * 18 / 1000).toFixed(1).replace(/\.0$/, '')}k`
                : vendor.reviewCount * 18}
            </span>
          </div>
        </div>


        {/* Row 2: Location */}
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
          <MapPin size={9} className="shrink-0" />
          <span className="truncate">{vendor.city}</span>
        </div>

        {/* Row 3: Trust signals */}
        {(vendor.badge === 'Top Rated' || vendor.featured || vendor.reviewCount >= 30) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
            {(vendor.badge === 'Top Rated' || vendor.featured) && (
              <>
                <span>🏆 Award winner (1x)</span>
                {vendor.reviewCount >= 30 && <span className="text-gray-300">·</span>}
              </>
            )}
            {vendor.reviewCount >= 30 && <span>⚡ Responds quickly</span>}
          </div>
        )}

        {/* Row 4: Price + CTA */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-gray-400">starting at</p>
            <p className="font-display text-[16px] leading-none text-[#000]">{startingPrice}</p>
          </div>
          {isNew ? (
            <span className="rounded-full border border-[#C9A0DC] px-4 py-1.5 text-[12px] font-semibold text-[#000] transition-colors group-hover:bg-[rgba(201,160,220,0.15)]">
              Get a quote
            </span>
          ) : (
            <span className="rounded-full bg-[#C9A0DC] px-4 py-1.5 text-[12px] font-semibold text-[#000] transition-colors group-hover:bg-[#b98dcc]">
              Get a quote
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function CategoryStrip() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className={`${pageClass} px-4 sm:px-6 2xl:px-10 3xl:px-16`}>
        <div className="flex items-center gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {vendorCategories.map((category) => {
            const Icon = categoryIcons[category.id]
            const isActive = active === category.id
            return (
              <button
                key={category.id}
                onClick={() => setActive(isActive ? null : category.id)}
                className="group flex shrink-0 flex-col items-center gap-1.5 px-4 py-2 relative"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-[#1A1A1A]' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                  {Icon && (
                    <Icon
                      size={17}
                      className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#1A1A1A]'}
                    />
                  )}
                </div>
                <span className={`text-[11px] font-semibold whitespace-nowrap transition-colors ${isActive ? 'text-[#1A1A1A]' : 'text-gray-400 group-hover:text-[#1A1A1A]'}`}>
                  {category.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#1A1A1A]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Maps card index → Tailwind classes that hide it below the breakpoint where a new column appears
const cardVisibility = [
  '',                                    // index 0 — always visible (1 col+)
  'hidden sm:block',                     // index 1 — visible at sm+ (2 cols)
  'hidden lg:block',                     // index 2 — visible at lg+ (3 cols)
  'hidden xl:block',                     // index 3 — visible at xl+ (4 cols)
  'hidden 2xl:block',                    // index 4 — visible at 2xl+ (5 cols)
  'hidden 3xl:block',                    // index 5 — visible at 3xl+ (6 cols)
]

function VendorRow({ vendors: rows }: { vendors: (typeof vendors) }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
      {rows.map((vendor, i) => (
        <div key={vendor.id} className={cardVisibility[i] ?? 'hidden'}>
          <ListingCard vendor={vendor} />
        </div>
      ))}
    </div>
  )
}

function SectionHeader({
  title,
  description,
  href,
  ctaLabel,
}: {
  title: string
  description?: string
  href?: string
  ctaLabel?: string
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-[1.25rem] font-semibold text-[#1A1A1A] sm:text-[1.4rem] 2xl:text-[1.65rem] 3xl:text-[1.9rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-gray-400">{description}</p>
        )}
      </div>
      {href ? (
        <Link
          href={href}
          className="group shrink-0 self-center flex items-center gap-1.5 text-[13px] font-bold text-[#1A1A1A] underline underline-offset-4 decoration-[#C9A0DC]"
        >
          {ctaLabel ?? 'View all'}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  )
}

function CategoryBrowseStrip() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const syncArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 500 : -500, behavior: 'smooth' })
    setTimeout(syncArrows, 400)
  }

  return (
    <section className="py-10 sm:py-14 2xl:py-18 bg-[#F7F5F2]">
      {/* Header */}
      <div className={`${pageClass} mb-6 flex items-end justify-between px-4 sm:px-6 2xl:px-10 3xl:px-16`}>
        <div>
          <h2 className="font-display text-[1.5rem] sm:text-[1.8rem] 2xl:text-[2.1rem] leading-tight text-[#1A1A1A]">
            Browse by category
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Prev / Next arrows */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              style={{ background: canScrollLeft ? '#C9A0DC' : '#ffffff' }}
              className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all"
            >
              <ArrowRight size={14} className="rotate-180 text-[#1A1A1A]" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              disabled={!canScrollRight}
              style={{ background: canScrollRight ? '#C9A0DC' : '#ffffff' }}
              className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all"
            >
              <ArrowRight size={14} className="text-[#1A1A1A]" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll strip */}
      <div className={pageClass}>
        <div
          ref={scrollRef}
          onScroll={syncArrows}
          className="flex gap-3 overflow-x-auto px-4 sm:px-6 2xl:px-10 3xl:px-16 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {vendorCategories.map((category) => {
            const Icon = categoryIcons[category.id]
            const coverVendor = vendors.find((v) => v.categoryId === category.id)
            const coverSrc = coverVendor?.heroMedia.src ?? '/assets/images/coupleswithpiano.jpg'

            return (
              <Link
                key={category.id}
                href={`${VENDORS_BASE_PATH}?category=${category.id}`}
                className="group snap-start shrink-0 w-[138px] sm:w-[158px] lg:w-[178px] xl:w-[198px] 2xl:w-[215px]"
              >
                <div className="relative w-full overflow-hidden rounded-2xl aspect-[3/4] bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverSrc}
                    alt={category.label}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                  {Icon && (
                    <div className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                      <Icon size={13} className="text-[#1A1A1A]" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-[12px] font-bold leading-tight text-white">{category.label}</p>
                    <p className="mt-0.5 text-[10px] text-white/60">{category.count} vendors</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function VendorsIndexPage() {
  return (
    <main className="bg-white text-[#1A1A1A]">
      <section className="px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14 2xl:px-10 2xl:pt-20 3xl:px-16 3xl:pt-24">
        <div className={pageClass}>
          <HeroSection />

        </div>
      </section>


      <CategoryBrowseStrip />

      <section className="px-4 py-6 sm:px-6 sm:py-8" id="guest-favourites">
        <div className={pageClass}>
          <SectionHeader
            title="Loved by couples"
            description="Vendors couples have been booking for their special day."
            href={VENDORS_BASE_PATH}
            ctaLabel="Browse all"
          />
          <VendorRow vendors={guestFavourites} />
        </div>
      </section>




      <section className="px-4 py-6 sm:px-6 sm:py-8 2xl:px-10 2xl:py-12 3xl:px-16 3xl:py-16">
        <div className={pageClass}>
          <SectionHeader
            title="Beyond the venue"
            description="Music, florals, transport, and everything in between."
            href={VENDORS_BASE_PATH}
            ctaLabel="Explore all"
          />
          <VendorRow vendors={planningRow} />
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8 2xl:px-10 2xl:py-12 3xl:px-16 3xl:py-16">
        <div className={pageClass}>
          <SectionHeader
            title="Guests keep coming back"
            description="Vendors with a history of happy couples and memorable weddings."
            href={VENDORS_BASE_PATH}
            ctaLabel="See more"
          />
          <VendorRow vendors={promotionsRow} />
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8 2xl:px-10 2xl:py-12 3xl:px-16 3xl:py-16">
        <div className={pageClass}>
          <SectionHeader
            title="Discover more vendors"
            description="More talented vendors ready to make your day special."
            href={VENDORS_BASE_PATH}
            ctaLabel="Explore all"
          />
          <VendorRow vendors={newVendorsRow} />
        </div>
      </section>

    </main>
  )
}
