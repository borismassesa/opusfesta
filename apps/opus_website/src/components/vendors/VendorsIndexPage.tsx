import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  CalendarDays,
  CakeSlice,
  Camera,
  CarFront,
  ChevronDown,
  Flower2,
  MapPin,
  Music4,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
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

const pageClass = 'mx-auto max-w-[72rem]'

const heroVendor = getFeaturedVendors()[0] ?? vendors[0]
const guestFavourites = [...vendors]
  .sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return b.reviewCount - a.reviewCount
  })
  .slice(0, 4)

const destinationRow = [
  ...getVendorsByCategory('venues').slice(0, 1),
  ...getVendorsByCategory('photographers').slice(0, 1),
  ...getVendorsByCategory('caterers').slice(0, 1),
  ...getVendorsByCategory('hair-makeup').slice(0, 1),
]

const planningRow = [
  ...getVendorsByCategory('videographers').slice(0, 1),
  ...getVendorsByCategory('djs-bands').slice(0, 1),
  ...getVendorsByCategory('florists').slice(0, 1),
  ...getVendorsByCategory('transportation').slice(0, 1),
].filter(Boolean)

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

function SearchField({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-[#1A1A1A]">{value}</span>
        {Icon ? <Icon size={14} className="shrink-0 text-gray-400" /> : <ChevronDown size={14} className="shrink-0 text-gray-400" />}
      </div>
    </div>
  )
}

function ListingCard({ vendor }: { vendor: (typeof vendors)[number] }) {
  return (
    <Link
      href={`${VENDORS_BASE_PATH}/${vendor.slug}`}
      className="group overflow-hidden rounded-[22px] border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(17,17,17,0.07)]"
    >
      <div className="relative aspect-[1.18] overflow-hidden bg-gray-100">
        <VendorMedia
          src={vendor.heroMedia.src}
          alt={vendor.heroMedia.alt}
          type={vendor.heroMedia.type}
          poster={vendor.heroMedia.poster}
        />
        {vendor.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#1A1A1A]">
            {vendor.badge}
          </span>
        ) : null}
      </div>

      <div className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
          <span className="truncate">{vendor.city}</span>
          <span className="shrink-0">{vendor.priceRange}</span>
        </div>
        <h3 className="line-clamp-2 text-[15px] font-black leading-[1.05] tracking-tight text-[#1A1A1A]">
          {vendor.name}
        </h3>
        <p className="line-clamp-2 text-[12px] font-medium leading-relaxed text-gray-600">
          {vendor.excerpt}
        </p>
        <div className="flex items-center justify-between gap-3 text-[12px] font-semibold text-gray-500">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 items-center gap-1">
              <Star size={11} className="text-[var(--accent)]" fill="currentColor" />
              <span className="font-bold text-[#1A1A1A]">{vendor.rating.toFixed(1)}</span>
              <span>({vendor.reviewCount})</span>
            </span>
          </div>
          <span className="truncate">{vendor.category}</span>
        </div>
      </div>
    </Link>
  )
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-5 flex flex-col gap-1.5">
      <h2 className="text-[1.35rem] font-black tracking-tighter text-[#1A1A1A] sm:text-[1.55rem]">
        {title}
      </h2>
      <p className="text-[13px] font-medium leading-relaxed text-gray-500">{description}</p>
    </div>
  )
}

export default function VendorsIndexPage() {
  return (
    <main className="bg-white text-[#1A1A1A]">
      <section className="px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14">
        <div className={pageClass}>
          <div className="mb-4">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent-hover)]">
              Find Vendors
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_12px_28px_rgba(17,17,17,0.05)] sm:p-5">
              <h1 className="max-w-[12ch] text-[1.6rem] font-black tracking-tighter text-[#1A1A1A]">
                House wedding vendors in Tanzania
              </h1>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-600">
                Find and book vendors with a cleaner browse experience.
              </p>

              <div className="mt-4 space-y-2.5">
                <SearchField label="Category" value="Venues" />
                <SearchField label="City" value="Zanzibar" />
                <SearchField label="Date" value="Add dates" icon={CalendarDays} />
                <SearchField label="Budget" value="Flexible" />
              </div>

              <Link
                href="#guest-favourites"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                <Search size={15} />
                Search
              </Link>
            </div>

            <div className="overflow-hidden rounded-[30px] bg-[#F6F1F8] shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
              <div className="aspect-[16/9] overflow-hidden rounded-[28px]">
                <VendorMedia
                  src={heroVendor.heroMedia.src}
                  alt={heroVendor.heroMedia.alt}
                  type={heroVendor.heroMedia.type}
                  poster={heroVendor.heroMedia.poster}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 text-center md:grid-cols-3">
            {featurePoints.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F1F8] text-[var(--accent-hover)]">
                  <Icon size={16} />
                </div>
                <h2 className="mt-3 text-sm font-black text-[#1A1A1A]">{title}</h2>
                <p className="mt-2 text-[12px] font-medium leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 sm:pb-10">
        <div className={pageClass}>
          <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {vendorCategories.map((category) => {
              const Icon = categoryIcons[category.id]
              const count = vendors.filter((vendor) => vendor.categoryId === category.id).length

              return (
                <Link
                  key={category.id}
                  href={`${VENDORS_BASE_PATH}?category=${category.id}`}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-[#1A1A1A] transition-colors hover:border-[var(--accent)] hover:bg-[#FAF7FB]"
                >
                  {Icon ? <Icon size={14} className="text-[var(--accent-hover)]" /> : null}
                  <span>{category.label}</span>
                  <span className="text-gray-400">{count}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8" id="guest-favourites">
        <div className={pageClass}>
          <SectionHeader
            title="Guest favourites in Tanzania"
            description="These vendor profiles have great reviews and get lots of attention on Opus."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {guestFavourites.map((vendor) => (
              <ListingCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8">
        <div className={pageClass}>
          <SectionHeader
            title="Vendors for destination weekends"
            description="Find vendors whose service style works well for travel weekends, beach ceremonies, and guest-heavy celebrations."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {destinationRow.map((vendor) => (
              <ListingCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8">
        <div className={pageClass}>
          <SectionHeader
            title="Finish the shortlist"
            description="Beauty, music, floral, and moving-parts vendors that usually complete the final booking list."
          />
          <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {planningRow.map((vendor) => (
                <ListingCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-[#FCF8FB] p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Browse by city</p>
              <div className="mt-4 space-y-3">
                {vendorCities.slice(0, 5).map((city) => (
                  <Link
                    key={city.id}
                    href={`${VENDORS_BASE_PATH}?city=${city.id}`}
                    className="group flex items-center justify-between gap-4 rounded-[20px] border border-white bg-white px-4 py-3 transition-colors hover:border-[var(--accent)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={city.image} alt={city.label} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black tracking-tight text-[#1A1A1A]">{city.label}</p>
                        <p className="text-[12px] font-medium text-gray-500">{city.vendorCount} vendors</p>
                      </div>
                    </div>
                    <ArrowRight size={15} className="shrink-0 text-gray-400 group-hover:text-[#1A1A1A]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        <div className={`${pageClass} grid gap-8 lg:grid-cols-[0.34fr_0.66fr]`}>
          <div>
            <h2 className="text-[1.5rem] font-black tracking-tighter text-[#1A1A1A] sm:text-[1.8rem]">
              Your questions, answered
            </h2>
          </div>

          <div className="divide-y divide-gray-200 rounded-[28px] border border-gray-200 bg-white">
            {faqs.map((faq, index) => (
              <details key={faq} className="group" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-sm font-semibold text-[#1A1A1A]">{faq}</span>
                  <span className="shrink-0 text-gray-400 transition-colors group-open:text-[#1A1A1A]">+</span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-[13px] font-medium leading-relaxed text-gray-500">
                    OpusFesta keeps vendor discovery focused on fit, reviews, and practical planning details so couples can shortlist faster.
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
