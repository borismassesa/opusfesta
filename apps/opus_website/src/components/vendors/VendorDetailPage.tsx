'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Star,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Users,
  BadgeCheck,
  Trophy,
  Home,
  Heart,
  Upload,
  LayoutGrid,
  Search,
  Globe,
  Calendar,
  X,
  Zap,
  UserCheck,
  Minus,
  Camera,
  Video,
  UtensilsCrossed,
  Building2,
  Flower2,
  Music2,
  Cake,
  Sparkles,
  Shirt,
  Car,
  Gem,
  ClipboardList,
  Mail,
  BookOpen,
  Lightbulb,
  Tent,
  Banknote,
  Check,
  ImagePlus,
} from 'lucide-react'
import { VENDORS_BASE_PATH, generateAvailability, type Vendor } from '@/lib/vendors'

type GalleryTabKey = 'portfolio' | 'photos' | 'videos' | 'reviews'


function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}
          fill="currentColor"
        />
      ))}
    </span>
  )
}


/* ─────────────────────────────────────────────────────────────
   VENDOR SECTION — Header + Tabs + AboutSection + PricingSection
   + Sidebar, inserted as new content below the bento gallery.
───────────────────────────────────────────────────────────── */

// ── Header ────────────────────────────────────────────────
function ratingLabel(rating: number): { text: string; color: string } {
  if (rating >= 5.0) return { text: 'Fantastic', color: 'text-emerald-600' }
  if (rating >= 4.5) return { text: 'Excellent', color: 'text-emerald-500' }
  if (rating >= 4.0) return { text: 'Great', color: 'text-green-500' }
  if (rating >= 3.5) return { text: 'Good', color: 'text-yellow-500' }
  if (rating >= 3.0) return { text: 'Average', color: 'text-orange-400' }
  return { text: 'Mixed', color: 'text-gray-400' }
}

function VendorHeader({ vendor, onSave, saved }: { vendor: Vendor; onSave: () => void; saved: boolean }) {
  // A new vendor with zero reviews must not advertise a rating. Showing
  // "0.0 / 0 reviews" is misleading; we hide the row entirely until the
  // vendor has earned at least one review.
  const hasReviews = vendor.reviewCount > 0
  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">{vendor.name}</h1>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-gray-400 mb-3">{vendor.category}</p>
          <div className="flex flex-col gap-1.5 text-sm">
            {hasReviews ? (
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i <= Math.round(vendor.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="font-bold ml-1">{vendor.rating.toFixed(1)}</span>
                <span className={`ml-1.5 text-xs font-bold ${ratingLabel(vendor.rating).color}`}>{ratingLabel(vendor.rating).text}</span>
                <span className="text-gray-500 mx-1">·</span>
                <a href="#vendor-reviews" className="underline font-medium">
                  {vendor.reviewCount} {vendor.reviewCount === 1 ? 'review' : 'reviews'}
                </a>
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">No reviews yet</div>
            )}
            {vendor.city && (
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{vendor.city}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={onSave}
            className={`p-2 border rounded-full transition-colors ${saved ? 'border-(--accent) bg-(--accent)/10 text-(--accent-hover)' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <Heart className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200" />
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────
const VENDOR_TABS = ['Photos', 'About', 'Services', 'Pricing', 'Availability', 'Team', 'FAQ\'s', 'Reviews', 'Location']

function VendorTabs({ onPhotos, saved, onSave, active, onActiveChange }: {
  onPhotos: () => void
  saved: boolean
  onSave: () => void
  active: string
  onActiveChange: (tab: string) => void
}) {
  function handleClick(tab: string) {
    if (tab === 'Photos') { onPhotos(); return }
    onActiveChange(tab)
    document.getElementById(`vendor-${tab.toLowerCase()}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex items-center gap-6 py-3">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none flex-1">
        {VENDOR_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleClick(tab)}
            className={`shrink-0 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              active === tab
                ? 'border-[#1A1A1A] text-[#1A1A1A]'
                : 'border-transparent text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          aria-label="Share"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-400 hover:text-[#1A1A1A]"
        >
          <Upload size={15} />
        </button>
        <button
          aria-label="Save vendor"
          onClick={onSave}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
            saved
              ? 'border-(--accent) bg-(--accent)/10 text-(--accent-hover)'
              : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-[#1A1A1A]'
          }`}
        >
          <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}

// ── AboutSection ──────────────────────────────────────────
function AboutText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = text.split('\n\n')
  const hasMore = paragraphs.length > 1
  return (
    <div className="prose prose-sm max-w-none text-gray-700 mb-6">
      <p>{paragraphs[0]}</p>
      {hasMore && expanded && paragraphs.slice(1).map((p, i) => <p key={i}>{p}</p>)}
      {hasMore && (
        <button className="font-semibold underline mt-2" onClick={() => setExpanded(v => !v)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

function VendorAboutSection({ vendor }: { vendor: Vendor }) {
  return (
    <section id="vendor-about" className="scroll-mt-28 pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">About this {vendor.category.toLowerCase().replace(/s$/, '')}</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Vendor profile card */}
        <div className="w-full md:w-[200px] shrink-0 flex flex-col items-center text-center gap-3">
          {/* Circular avatar — show only a real uploaded image (team avatar
              or hero). Fall back to initials when neither exists rather than
              borrowing media from elsewhere. */}
          {(() => {
            const avatarSrc =
              (vendor.team?.[0]?.avatar && vendor.team[0].avatar.trim() !== '')
                ? vendor.team[0].avatar
                : vendor.heroMedia.src && vendor.heroMedia.src.trim() !== ''
                  ? vendor.heroMedia.src
                  : null
            return (
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-md shrink-0 bg-gray-100 flex items-center justify-center">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt={vendor.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold text-gray-500">
                    {(vendor.name || '?').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            )
          })()}
          {/* Name + role */}
          <div>
            <p className="font-bold text-[#1A1A1A] leading-snug">{vendor.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {vendor.team?.[0]?.role ?? vendor.category}
            </p>
          </div>
          {/* Social icons — render only the ones the vendor actually
              provided. Empty links would dead-end on '#' and falsely imply
              the vendor has a profile on every network. */}
          {(vendor.socialLinks?.instagram || vendor.socialLinks?.facebook || vendor.socialLinks?.website) && (
            <div className="flex items-center gap-3">
              {vendor.socialLinks?.instagram && (
                <a href={vendor.socialLinks.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-75">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <defs>
                      <radialGradient id="ig-grad-profile" cx="30%" cy="107%" r="150%">
                        <stop offset="0%" stopColor="#fdf497"/>
                        <stop offset="5%" stopColor="#fdf497"/>
                        <stop offset="45%" stopColor="#fd5949"/>
                        <stop offset="60%" stopColor="#d6249f"/>
                        <stop offset="90%" stopColor="#285AEB"/>
                      </radialGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" fill="url(#ig-grad-profile)"/>
                    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
                    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                  </svg>
                </a>
              )}
              {vendor.socialLinks?.facebook && (
                <a href={vendor.socialLinks.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-75">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                    <rect width="24" height="24" rx="5" fill="#1877F2"/>
                    <path d="M15.12 13H13v7h-2.88v-7H8.5v-2.5h1.62v-1.5c0-2.2 1.3-3.5 3.28-3.5.94 0 1.93.17 1.93.17V8H14.1c-1.07 0-1.4.67-1.4 1.35V10.5h2.38L14.77 13h-.01z" fill="white"/>
                  </svg>
                </a>
              )}
              {vendor.socialLinks?.website && (
                <a href={vendor.socialLinks.website} aria-label="Website" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-75">
                  <Globe className="w-6 h-6 text-gray-400" />
                </a>
              )}
            </div>
          )}
          {/* CTA */}
          <button className="w-full py-2.5 rounded-full bg-[#1A1A1A] text-white font-semibold text-sm hover:bg-[#333] transition-colors">
            Message Vendor
          </button>
        </div>

        <div className="flex-1">
          <AboutText text={vendor.about ?? vendor.excerpt} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-600">
            {vendor.responseTime && (
              <div className="flex items-center gap-2">
                <Zap size={13} className="shrink-0 text-gray-400" />
                <span>Responds {vendor.responseTime.toLowerCase()}</span>
              </div>
            )}
            {vendor.badge === 'Top Rated' && (
              <div className="flex items-center gap-2">
                <Star size={13} className="shrink-0 text-gray-400" />
                <span>Top Rated</span>
              </div>
            )}
            {vendor.badge === 'Verified' && (
              <div className="flex items-center gap-2">
                <BadgeCheck size={13} className="shrink-0 text-gray-400" />
                <span>Verified vendor</span>
              </div>
            )}
            {vendor.awards?.length ? (
              <div className="flex items-center gap-2">
                <Trophy size={13} className="shrink-0 text-gray-400" />
                <span>{vendor.awards.length}× award winner</span>
              </div>
            ) : null}
            {vendor.locallyOwned && (
              <div className="flex items-center gap-2">
                <Home size={13} className="shrink-0 text-gray-400" />
                <span>Locally owned business</span>
              </div>
            )}
            {vendor.yearsInBusiness != null && (
              <div className="flex items-center gap-2">
                <Calendar size={13} className="shrink-0 text-gray-400" />
                <span>{vendor.yearsInBusiness} years in business</span>
              </div>
            )}
            {vendor.languages?.length ? (
              <div className="flex items-center gap-2">
                <Globe size={13} className="shrink-0 text-gray-400" />
                <span>Speaks {vendor.languages.join(', ')}</span>
              </div>
            ) : null}
            {vendor.team?.length ? (
              <div className="flex items-center gap-2">
                <Users size={13} className="shrink-0 text-gray-400" />
                <span>{vendor.team.length} team member{vendor.team.length !== 1 ? 's' : ''}</span>
              </div>
            ) : null}
            {vendor.capacity && (
              <div className="flex items-center gap-2">
                <UserCheck size={13} className="shrink-0 text-gray-400" />
                <span>{vendor.capacity.min}–{vendor.capacity.max} guests</span>
              </div>
            )}
            {vendor.style && (
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="shrink-0 text-gray-400" />
                <span>{vendor.style} style</span>
              </div>
            )}
            {vendor.personality && (
              <div className="flex items-center gap-2">
                <Heart size={13} className="shrink-0 text-gray-400" />
                <span>{vendor.personality} energy</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function parsePrice(value: string): number {
  const m = value.match(/([\d.]+)M/i)
  return m ? parseFloat(m[1]) * 1_000_000 : parseFloat(value.replace(/[^\d.]/g, '')) || 0
}

// ── Service description resolver ─────────────────────────
function getServiceDescription(service: string): string {
  const s = service.toLowerCase()
  if (/full.day.coverage|full day/.test(s)) return 'Complete wedding day documentation from bridal preparations through to the last dance — nothing is missed.'
  if (/engagement|pre.wedding session/.test(s)) return 'A relaxed session before the wedding to get comfortable in front of the camera and build chemistry with your photographer.'
  if (/second shooter/.test(s)) return 'An additional photographer who covers different angles and moments simultaneously, ensuring broader and more complete coverage.'
  if (/drone/.test(s)) return 'Aerial footage and photography captured by a licensed drone operator, adding a cinematic perspective to your wedding visuals.'
  if (/online gallery|digital galler/.test(s)) return 'A private, password-protected online gallery where you can view, download, and share your edited images with family and friends.'
  if (/print.ready|digital file/.test(s)) return 'High-resolution files delivered in formats suitable for professional printing at any size, from wallet cards to wall art.'
  if (/bridal prep/.test(s)) return 'Coverage of the getting-ready moments — hair, makeup, dressing, and the quiet time before the ceremony begins.'
  if (/destination/.test(s)) return 'Available to travel for weddings held outside the local area, including international destinations. Travel costs are discussed separately.'
  if (/photo|shoot|portrait/.test(s)) return 'Professional photography capturing the key moments, emotions, and details of your wedding day using high-end equipment.'
  if (/video|film|cinemat/.test(s)) return 'Cinematic wedding film capturing the atmosphere, vows, speeches, and highlights of your day, delivered as a polished edit.'
  if (/reel|highlight/.test(s)) return 'A short, shareable highlight film — typically 3–5 minutes — distilling the best moments of your wedding into one cinematic sequence.'
  if (/full.venue buyout|exclusive venue/.test(s)) return 'Sole use of the entire venue for your celebration — no other events run simultaneously, giving you complete privacy and flexibility.'
  if (/venue|hall|space|pavilion/.test(s)) return 'Dedicated use of the event space, including setup and breakdown time, for your ceremony, reception, or both.'
  if (/accommodation|villa|room|overnight/.test(s)) return 'On-site or nearby lodging for the couple and guests, making it easy for everyone to celebrate without worrying about travel.'
  if (/in.house cater|catering/.test(s)) return 'Food and beverage service managed directly by the venue or vendor — menus are often customisable and include a tasting session.'
  if (/seated dinner|reception dinner/.test(s)) return 'A formal plated dinner service with dedicated waitstaff, customisable menus, and full table décor included.'
  if (/waiter|waitstaff/.test(s)) return 'Professional service staff who manage table service, drinks, and guest needs throughout the reception.'
  if (/menu|tasting/.test(s)) return 'A pre-wedding tasting session where you select and approve the dishes that will be served on your wedding day.'
  if (/bar service|drink/.test(s)) return 'Managed bar service providing soft drinks, juices, or an optional alcohol package for your guests throughout the event.'
  if (/floral|flower|bouquet|bloom/.test(s)) return 'Fresh floral arrangements — bouquets, centrepieces, ceremony arches, and decorative accents — designed to your colour palette and style.'
  if (/decor|styling|setup|teardown/.test(s)) return 'Full decoration setup and post-event breakdown, covering furniture arrangement, table styling, lighting, and all decorative elements.'
  if (/transfer|transport|shuttle|car|limo/.test(s)) return 'Organised guest or couple transportation — from hotel pick-ups and venue transfers to the bridal car and send-off.'
  if (/coordinat|day.of|manag|organis/.test(s)) return 'A dedicated professional who manages the full flow of your wedding day — liaising with suppliers, keeping timings on track, and handling any issues so you can focus on enjoying every moment.'
  if (/planner/.test(s)) return 'End-to-end wedding planning support, from initial concept and supplier sourcing through to full day-of management.'
  if (/mc|master of ceremon/.test(s)) return 'A charismatic emcee who guides guests through the programme, introduces speeches, and keeps the energy flowing throughout the reception.'
  if (/dj/.test(s)) return 'A professional DJ providing curated music sets, seamless transitions, and crowd-reading skills to keep the dance floor alive all night.'
  if (/live band|band set/.test(s)) return 'A live band performance — typically covering popular genres like Afrobeats, Bongo Flava, and international hits — creating an electric atmosphere.'
  if (/sound system|pa system/.test(s)) return 'Professional audio equipment including speakers, microphones, and mixing gear, ensuring crystal-clear sound across the entire venue.'
  if (/acoustic/.test(s)) return 'A live acoustic performance — typically guitar and vocals — creating an intimate and elegant atmosphere for the ceremony or cocktail hour.'
  if (/stage light|lighting rig/.test(s)) return 'Professional stage and dance floor lighting that transforms the venue atmosphere as the evening progresses.'
  if (/cake|dessert/.test(s)) return 'A custom-designed wedding cake or dessert display, crafted to your flavour preferences and visual style.'
  if (/makeup|beauty|hair|glam/.test(s)) return 'Professional bridal hair and makeup services, ensuring you look and feel your best from ceremony through to the last dance.'
  if (/ring|jewel|gem/.test(s)) return 'Bespoke or curated jewellery and ring services, from custom design to expert fitting and engraving.'
  if (/invite|stationer|print|card/.test(s)) return 'Professionally designed and printed wedding stationery — invitations, RSVP cards, menus, seating charts, and signage.'
  if (/officiant|celebrant|vow|blessing/.test(s)) return 'A licensed officiant or celebrant who leads your ceremony, helping craft and deliver personalised vows and readings.'
  if (/light|illum|candle/.test(s)) return 'Ambient and decorative lighting design — fairy lights, uplighting, candles, and feature installations that set the mood for your celebration.'
  if (/tent|marquee|canopy/.test(s)) return 'A professionally installed tent or marquee structure, providing a beautiful sheltered space for outdoor ceremonies or receptions.'
  return `Ask ${'{VENDOR}'} about this service for full details on what is covered and how it fits into your wedding package.`
}

// ── Service icon resolver ─────────────────────────────────
function getServiceIcon(service: string) {
  const s = service.toLowerCase()
  if (/photo|shoot|portrait|engagement|bridal prep|gallery|print|digital file|shoot/.test(s)) return Camera
  if (/video|drone|film|reel|cinemat/.test(s)) return Video
  if (/cater|food|meal|menu|dinner|dining|bar|drink|waiter/.test(s)) return UtensilsCrossed
  if (/venue|hall|space|accommodation|room|villa|chapel|pavilion/.test(s)) return Building2
  if (/floral|flower|bloom|bouquet|decor|arrangement|styling/.test(s)) return Flower2
  if (/music|dj|band|live|song|sound|mc|vocalist|perform/.test(s)) return Music2
  if (/cake|dessert|pastry|sweet/.test(s)) return Cake
  if (/makeup|beauty|hair|groom|spa|glam|sparkl/.test(s)) return Sparkles
  if (/dress|attire|suit|fashion|shirt|outfit|wear/.test(s)) return Shirt
  if (/transfer|transport|car|shuttle|limo|driver/.test(s)) return Car
  if (/ring|jewel|gem|diamond/.test(s)) return Gem
  if (/coordinat|planner|manag|organis|day-of|logistics/.test(s)) return ClipboardList
  if (/invite|print|stationer|mail|card/.test(s)) return Mail
  if (/officiant|ceremony|vow|celebrant|blessing/.test(s)) return BookOpen
  if (/light|illum|candle|glow/.test(s)) return Lightbulb
  if (/tent|marquee|canopy/.test(s)) return Tent
  if (/price|rate|cost|fee|budget/.test(s)) return Banknote
  if (/setup|breakdown|teardown/.test(s)) return Tent
  return Minus
}

// ── ServicesSection ───────────────────────────────────────
function VendorServicesSection({ vendor }: { vendor: Vendor }) {
  const services = vendor.services ?? []
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  if (!services.length) return null

  return (
    <section id="vendor-services" className="scroll-mt-28 border-t border-gray-200 pt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Services</h2>
        <p className="mt-1 text-sm text-gray-500">Everything included when you book {vendor.name}.</p>
      </div>

      <div className="rounded-[20px] border border-gray-100 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden divide-y divide-gray-100">
        {services.map((service, i) => {
          const open = openIdx === i
          const Icon = getServiceIcon(service)
          return (
            <div key={service}>
              <button
                onClick={() => setOpenIdx(open ? null : i)}
                className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <Icon size={15} className="shrink-0 text-(--accent-hover)" />
                <span className="flex-1 text-sm font-medium text-[#1A1A1A]">{service}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {getServiceDescription(service).replace('{VENDOR}', vendor.name)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── PricingSection ────────────────────────────────────────
function VendorPricingSection({ vendor }: { vendor: Vendor }) {
  const packages = [...(vendor.pricingDetails ?? [])].sort((a, b) => parsePrice(a.value) - parsePrice(b.value))
  const popularIdx = packages.length > 1 ? Math.floor(packages.length / 2) : -1

  return (
    <section id="vendor-pricing" className="scroll-mt-28 border-t border-gray-200 pt-12">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Packages</h2>
          <p className="mt-1 text-sm text-gray-500">Choose the package that fits your day. Every option includes our full commitment.</p>
        </div>
      </div>

      {packages.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5 pt-4">
          {packages.map((pkg, i) => {
            const popular = i === popularIdx
            return (
              <div
                key={pkg.label}
                className={`group relative flex flex-col rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${
                  popular ? 'border-2 border-(--accent)' : 'border border-gray-100'
                }`}
              >
                {/* Top center pill badge */}
                {popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--accent) px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#1A1A1A] shadow-sm z-10">
                    Most popular
                  </span>
                )}

                <div className="flex flex-col flex-1 p-5 pt-6">
                  {/* Label */}
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-4">{pkg.label}</p>

                  {/* Price */}
                  <p className="text-2xl font-black leading-none tracking-tight text-[#1A1A1A] mb-1">{pkg.value}</p>

                  {/* Divider */}
                  <div className="my-4 h-px bg-gray-100" />

                  {/* Services checklist — use services array or fall back to parsing note by comma */}
                  {(() => {
                    const items = pkg.services?.length
                      ? pkg.services
                      : pkg.note?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
                    return items.length ? (
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 mb-3">Includes</p>
                        <ul className="flex flex-col">
                          {items.map((s) => (
                            <li key={s} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 text-[13px] text-gray-700">
                              <svg viewBox="0 0 12 10" className="w-3 h-3 shrink-0 text-(--accent-hover)" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 5l3.5 3.5L11 1" />
                              </svg>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : <div className="flex-1" />
                  })()}

                  {/* CTA */}
                  <button className={`mt-5 w-full rounded-full py-2.5 text-sm font-semibold transition-colors ${
                    popular
                      ? 'bg-(--accent) text-[#1A1A1A] hover:bg-(--accent-hover)'
                      : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                  }`}>
                    Get a quote
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400 mb-5">
          Contact vendor for package pricing
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <svg className="mt-0.5 w-4 h-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-sm text-amber-800 leading-snug">
          <span className="font-semibold">Starting rates only.</span> Final price varies by date, number of guests, and selected add-ons.
        </p>
      </div>
    </section>
  )
}

// ── TeamSection ───────────────────────────────────────────

function VendorTeamSection({ vendor }: { vendor: Vendor }) {
  const team = vendor.team ?? []
  if (!team.length) return null

  // Photo pool: explicit avatars first, then gallery, then hero
  const photoPool = [
    ...team.map((m) => m.avatar).filter(Boolean) as string[],
    ...(vendor.gallery ?? []),
    vendor.heroMedia.src,
  ]

  return (
    <section id="vendor-team" className="scroll-mt-28 border-t border-gray-200 pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Meet the Team</h2>
        <p className="mt-1 text-sm text-gray-500">
          The people behind {vendor.name} — your day is in their hands.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {team.map((member, i) => {
          const avatarSrc = member.avatar ?? photoPool[i % photoPool.length]
          return (
          <div key={member.name} className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
              />
            </div>

            {/* Name + role */}
            <p className="font-bold text-[#1A1A1A] text-base leading-snug">{member.name}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-3">
              {member.role}
            </p>

            {/* Divider */}
            <div className="w-8 h-px bg-gray-200 mb-3" />

            {/* Bio */}
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{member.bio}</p>
          </div>
          )
        })}
      </div>
    </section>
  )
}

// ── ReviewsSection ────────────────────────────────────────
function authorColor(name: string) {
  const palette = ['#f59e0b', '#2D6A4F', '#5B2D8E', '#ea580c', '#0ea5e9']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

const PAGE_SIZE = 4

// ── Write Review Modal ──────────────────────────────────────
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
const RATING_COLORS = ['', 'text-red-400', 'text-orange-400', 'text-yellow-500', 'text-green-500', 'text-emerald-500']

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
            className="transition-all duration-150 hover:scale-125 active:scale-95"
            style={{ transform: active >= i ? 'scale(1.08)' : undefined }}
          >
            <Star
              size={40}
              className={active >= i ? 'text-amber-400 drop-shadow-sm' : 'text-gray-200'}
              fill="currentColor"
            />
          </button>
        ))}
      </div>
      <div className="h-6 flex items-center">
        {active > 0 && (
          <span className={`text-sm font-bold tracking-wide ${RATING_COLORS[active]}`}>
            {RATING_LABELS[active]}
          </span>
        )}
      </div>
    </div>
  )
}

const inputCls = "w-full rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-(--accent) focus:bg-white focus:ring-4 focus:ring-(--accent)/10 transition-all duration-200"

function WriteReviewModal({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [helpedHire, setHelpedHire] = useState<'yes' | 'no' | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const { submitVendorReview } = await import(
        '@/app/vendors/[slug]/review-actions'
      )
      const res = await submitVendorReview({
        vendorSlug: vendor.slug,
        authorName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        authorEmail: email.trim(),
        rating,
        body: reviewText.trim(),
        weddingDate: weddingDate || null,
      })
      if (!res.ok) {
        setSubmitError(res.error)
        return
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not submit your review.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const step1Valid = rating > 0 && reviewText.trim().length >= 10 && helpedHire !== null
  const step2Valid = firstName.trim() && lastName.trim() && email.trim() && weddingDate

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos(prev => [...prev, ...Array.from(e.target.files!)])
  }

  const STEPS = [
    { label: 'Your experience' },
    { label: 'About you' },
    { label: 'Photos' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" data-lenis-prevent onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Write a review"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-5 shrink-0">
          <div className="flex items-start justify-between mb-5">
            <div className="min-w-0">
              {!submitted && (
                <p className="text-xs font-semibold uppercase tracking-widest text-(--accent) mb-1">
                  {STEPS[step - 1].label}
                </p>
              )}
              <p className="text-base font-black text-[#1A1A1A] truncate">{vendor.name}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
            >
              <X size={16} />
            </button>
          </div>

          {/* Step dots */}
          {!submitted && (
            <div className="flex items-center gap-0">
              {STEPS.map((_s, i) => {
                const n = i + 1
                const done = step > n
                const active = step === n
                return (
                  <div key={n} className="flex items-center flex-1 last:flex-none">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all duration-300 ${
                      done ? 'bg-(--accent) text-[#1A1A1A]' :
                      active ? 'bg-[#1A1A1A] text-white ring-4 ring-[#1A1A1A]/10' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? <Check size={13} strokeWidth={3} /> : n}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-px mx-2 overflow-hidden bg-gray-100">
                        <div className={`h-full bg-(--accent) transition-all duration-500 ${done ? 'w-full' : 'w-0'}`} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 shrink-0 mx-6" />

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6" data-lenis-prevent>

          {/* ── Step 1 ── */}
          {!submitted && step === 1 && (
            <div className="space-y-7">
              {/* Star rating — hero element */}
              <div className="rounded-2xl bg-gray-50 border border-gray-100 py-8 flex flex-col items-center gap-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your rating</p>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              {/* Review textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={3500}
                  rows={5}
                  placeholder="Tell other couples about the professionalism, communication, quality of service, and overall value…"
                  className={`${inputCls} resize-none leading-relaxed`}
                />
                <div className="flex items-center justify-between mt-2 px-1">
                  <p className="text-xs text-gray-400">{reviewText.length < 10 && reviewText.length > 0 ? `${10 - reviewText.length} more characters needed` : ''}</p>
                  <p className="text-xs text-gray-400">{reviewText.length}<span className="text-gray-300">/3500</span></p>
                </div>
              </div>

              {/* Helped hire */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Did OpusFesta help you connect with this vendor?</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { val: 'yes' as const, label: 'Yes, it did', sub: 'We found them on OpusFesta' },
                    { val: 'no' as const,  label: 'No, it didn\'t', sub: 'We found them elsewhere' },
                  ]).map(({ val, label, sub }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setHelpedHire(val)}
                      className={`flex flex-col items-start gap-1 rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200 ${
                        helpedHire === val
                          ? 'border-(--accent) bg-(--accent)/8 shadow-sm'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${helpedHire === val ? 'border-(--accent)' : 'border-gray-300'}`}>
                        {helpedHire === val && <div className="h-2 w-2 rounded-full bg-(--accent)" />}
                      </div>
                      <p className="text-sm font-bold text-[#1A1A1A]">{label}</p>
                      <p className="text-xs text-gray-400 leading-snug">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {!submitted && step === 2 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-black text-[#1A1A1A] mb-1">About you</h2>
                <p className="text-sm text-gray-400">Your email stays private — only your name appears on your review.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'First name', value: firstName, set: setFirstName, placeholder: 'Jane', type: 'text' },
                  { label: 'Last name', value: lastName, set: setLastName, placeholder: 'Doe', type: 'text' },
                ].map(({ label, value, set, placeholder, type }) => (
                  <div key={label} className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</label>
                    <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={inputCls} />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" className={inputCls} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Wedding date</label>
                <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className={inputCls} />
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {!submitted && step === 3 && (
            <div className="space-y-5">
              <div className="mb-6">
                <h2 className="text-lg font-black text-[#1A1A1A] mb-1">Add photos</h2>
                <p className="text-sm text-gray-400">Photos from your event help couples picture what to expect from this vendor.</p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-(--accent)/5 hover:border-(--accent) transition-all duration-300 py-12 flex flex-col items-center gap-3 group"
              >
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md group-hover:border-(--accent)/30 transition-all duration-300">
                  <ImagePlus size={24} className="text-gray-300 group-hover:text-(--accent) transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1A1A1A]">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP · Up to 10 MB per photo</p>
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />

              {photos.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{photos.length} photo{photos.length > 1 ? 's' : ''} selected</p>
                  <div className="grid grid-cols-4 gap-2">
                    {photos.map((file, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          type="button"
                          onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                        >
                          <X size={11} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Success ── */}
          {submitted && (
            <div className="flex flex-col items-center text-center py-10 gap-5">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-(--accent)/15 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-(--accent) flex items-center justify-center shadow-lg shadow-(--accent)/30">
                    <Check size={28} className="text-[#1A1A1A]" strokeWidth={3} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#1A1A1A]">Thank you!</h2>
                <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Your review is in our moderation queue. Once our team verifies it, it&rsquo;ll appear publicly on this profile.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 rounded-full bg-[#1A1A1A] px-10 py-3 text-sm font-bold text-white hover:bg-black/80 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 pb-6 pt-4 shrink-0">
            <div className="h-px bg-gray-100 mb-4" />
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="rounded-full border border-gray-200 px-6 py-3 text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              ) : <div />}
              {step < totalSteps ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 ? !step1Valid : step === 2 ? !step2Valid : false}
                  className="rounded-full bg-(--accent) px-8 py-3 text-sm font-bold text-[#1A1A1A] hover:bg-(--accent-hover) transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  Continue
                </button>
              ) : (
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-full bg-[#1A1A1A] px-8 py-3 text-sm font-bold text-white hover:bg-black/80 transition-colors shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting…' : 'Submit review'}
                  </button>
                  {submitError && (
                    <p className="text-xs text-rose-700 max-w-xs text-right">
                      {submitError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const limit = 160
  const isLong = text.length > limit
  return (
    <p className="text-sm text-[#1A1A1A] leading-relaxed">
      {isLong && !expanded ? <>{text.slice(0, limit).trimEnd()}…{' '}<button className="font-semibold underline underline-offset-2 text-[#1A1A1A]" onClick={() => setExpanded(true)}>Read more</button></> : text}
    </p>
  )
}

function VendorReviewsSection({ vendor }: { vendor: Vendor }) {
  const allReviews = vendor.detailedReviews ?? []
  // Hooks must be called unconditionally — keep them before the early
  // return below.
  const [sortBy, setSortBy] = useState<'top' | 'recent'>('top')
  const [filterStar, setFilterStar] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // No reviews yet — render an empty state instead of pretending the vendor
  // has a 0.0/5 rating across 0 reviews. The "Write a review" button stays so
  // future couples can still leave the first review.
  if (allReviews.length === 0 && vendor.reviewCount === 0) {
    return (
      <section id="vendor-reviews" className="scroll-mt-28 border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Be the first couple to share your experience with {vendor.name}.
          </p>
          <button
            onClick={() => setShowReviewModal(true)}
            className="mt-4 rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-[#1A1A1A] hover:bg-(--accent-hover) transition-colors"
          >
            Write a review
          </button>
        </div>
        {showReviewModal && (
          <WriteReviewModal vendor={vendor} onClose={() => setShowReviewModal(false)} />
        )}
      </section>
    )
  }

  const avg = allReviews.length
    ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    : vendor.rating
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => Math.round(r.rating) === star).length,
    pct: allReviews.length ? Math.round((allReviews.filter((r) => Math.round(r.rating) === star).length / allReviews.length) * 100) : 0,
  }))

  const sorted = [...allReviews].sort((a, b) => {
    if (sortBy === 'top') return b.rating - a.rating
    const ta = new Date(a.date).getTime()
    const tb = new Date(b.date).getTime()
    return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta)
  })
  const afterStar = filterStar ? sorted.filter((r) => Math.round(r.rating) === filterStar) : sorted
  const filtered = searchQuery.trim()
    ? afterStar.filter((r) =>
        r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : afterStar
  const shown = filtered.slice(0, visible)

  // Collect all review media (photos + videos) from review entries; fall back to gallery
  const reviewMedia = allReviews.flatMap((r) => r.media ?? [])
  const mediaStrip = reviewMedia.length > 0
    ? reviewMedia.slice(0, 8)
    : (vendor.gallery ?? []).slice(0, 8).map((src) => ({ type: 'photo' as const, src }))

  return (
    <section id="vendor-reviews" className="scroll-mt-28 border-t border-gray-200 pt-12">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>

      {/* ── Rating summary ── */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {/* Score */}
          <div className="flex flex-col items-start gap-2 p-6 sm:w-52 shrink-0">
            <p className="text-4xl font-black text-[#1A1A1A]">{avg.toFixed(1)} <span className="text-base font-medium text-gray-400">out of 5.0</span></p>
            <StarRow rating={avg} size={18} />
            <p className="text-sm text-gray-500">{vendor.reviewCount} reviews</p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="mt-2 rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-[#1A1A1A] hover:bg-(--accent-hover) transition-colors"
            >
              Write a review
            </button>
          </div>

          {/* Bar chart */}
          <div className="flex-1 flex flex-col justify-center gap-3 p-6">
            {dist.map(({ star, pct }) => (
              <button
                key={star}
                onClick={() => setFilterStar(filterStar === star ? null : star)}
                className="flex items-center gap-3 group"
              >
                <span className="w-12 shrink-0 text-sm text-gray-600">{star} Star</span>
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: filterStar === star ? '#1A1A1A' : '#1A1A1A' }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm text-gray-500">{pct}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trust banner */}
        <div className="flex items-center gap-3 border-t border-gray-200 px-6 py-3 bg-gray-50">
          <Users size={16} className="shrink-0 text-gray-400" />
          <p className="text-xs text-gray-500">Your trust is our goal. Our community relies on honest reviews to help couples make confident decisions.</p>
        </div>
      </div>

      {/* ── Review media strip (photos + videos) ── */}
      {mediaStrip.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold text-[#1A1A1A] mb-3">Review photos &amp; videos</p>
          <div className="relative flex items-center gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {mediaStrip.map((item, i) => (
                <div key={i} className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.type === 'video' ? (item.poster ?? item.src) : item.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1A1A1A]" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <ChevronRight size={16} className="text-[#1A1A1A]" />
            </button>
          </div>
        </div>
      )}

      {/* ── Source tabs (OpusFesta / Google) ── */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex items-end gap-8">
          {/* OpusFesta tab — active */}
          <div className="flex flex-col items-start pb-3 border-b-2 border-[#1A1A1A]">
            <div className="flex items-center gap-2.5 mb-1">
              {/* OF monogram */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A]">
                <span className="text-[10px] font-black text-white tracking-tight">OF</span>
              </div>
              <span className="text-sm font-bold text-[#1A1A1A]">OpusFesta</span>
            </div>
            <p className="text-sm text-gray-500 pl-10">
              <span className="font-semibold text-[#1A1A1A]">{vendor.rating.toFixed(1)}/5</span>
              {' · '}{vendor.reviewCount} reviews
            </p>
          </div>

          {/* Google tab — inactive */}
          <div className="flex flex-col items-start pb-3 opacity-60">
            <div className="flex items-center gap-2.5 mb-1">
              {/* Google G icon */}
              <svg className="h-8 w-8" viewBox="0 0 24 24" aria-label="Google">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-bold text-[#1A1A1A]">Google</span>
            </div>
            <p className="text-sm text-gray-500 pl-10">
              <span className="font-semibold text-[#1A1A1A]">4.3/5</span>
              {' · '}2,053 reviews
            </p>
          </div>
        </div>
      </div>

      {/* ── Search + Sort ── */}
      {allReviews.length > 0 && (
        <div className="mb-5 space-y-3">
          {/* Row 1: search + sort */}
          <div className="flex gap-3">
            {/* Search */}
            <div className="flex flex-1 items-stretch rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Search reviews"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisible(PAGE_SIZE) }}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none"
              />
              <button className="flex items-center justify-center bg-(--accent) px-4 text-[#1A1A1A] transition hover:bg-(--accent-hover)">
                <Search size={16} />
              </button>
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as 'top' | 'recent'); setVisible(PAGE_SIZE) }}
                className="h-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2.5 text-sm text-[#1A1A1A] focus:outline-none cursor-pointer"
              >
                <option value="top">Sort by: Top reviews</option>
                <option value="recent">Sort by: Most recent</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Row 2: star filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 mr-1">Filter by rating:</span>
            {[5,4,3,2,1].map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStar(filterStar === s ? null : s); setVisible(PAGE_SIZE) }}
                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                style={filterStar === s
                  ? { backgroundColor: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' }
                  : { backgroundColor: '#fff', color: '#374151', borderColor: '#d1d5db' }
                }
              >
                <Star size={10} fill="currentColor" className="text-amber-400" />
                {s} star
              </button>
            ))}
            {(filterStar || searchQuery) && (
              <button
                onClick={() => { setFilterStar(null); setSearchQuery(''); setVisible(PAGE_SIZE) }}
                className="ml-1 text-xs font-semibold text-gray-400 hover:text-[#1A1A1A] underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Results count when filtering */}
          {(filterStar || searchQuery.trim()) && (
            <p className="text-xs text-gray-400">
              {filtered.length} {filtered.length === 1 ? 'review' : 'reviews'} found
            </p>
          )}
        </div>
      )}

      {/* ── Review list ── */}
      {filtered.length ? (
        <div className="divide-y divide-gray-100">
          {shown.map((review, idx) => (
            <article key={review.id} className="py-6">
              <div className="flex items-start justify-between gap-4">
                {/* Left: avatar + name + stars */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black text-white"
                    style={{ backgroundColor: authorColor(review.author) }}
                  >
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">{review.author}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <StarRow rating={review.rating} size={13} />
                      <span className="text-sm font-bold text-[#1A1A1A]">{review.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                {/* Right: date */}
                <p className="shrink-0 text-sm text-gray-400">{review.date}</p>
              </div>

              {/* Text */}
              <div className="mt-3 ml-14">
                <ReviewText text={review.text} />

                {/* Attached media thumbnails */}
                {review.media && review.media.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {review.media.map((item, mi) => (
                      <div key={mi} className="relative h-20 w-20 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.type === 'video' ? (item.poster ?? item.src) : item.src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90">
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#1A1A1A]" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {/* overflow count badge on last thumb if > 4 */}
                        {mi === 3 && review.media!.length > 4 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-sm font-bold text-white">+{review.media!.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {review.weddingDate && (
                  <p className="mt-2 text-xs text-gray-400">Wedding · {review.weddingDate}</p>
                )}
              </div>

              {/* Mid-list nudge after 2nd review */}
              {idx === 1 && filtered.length > 3 && (
                <div className="mt-6 ml-14 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <Users size={16} className="shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Any questions?</p>
                    <button
                      onClick={() => document.getElementById('vendor-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="text-sm font-bold text-[#1A1A1A] underline underline-offset-2"
                    >
                      Start a conversation
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
          No reviews yet — be the first to share your experience.
        </div>
      )}

      {/* Read more reviews */}
      {visible < filtered.length && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-400 font-medium">
            Showing {Math.min(visible, filtered.length)} of {filtered.length} reviews
          </p>
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="group flex items-center gap-2 rounded-full bg-[#1A1A1A] px-8 py-3 text-sm font-bold text-white hover:bg-black/80 transition-all shadow-sm hover:shadow-md"
          >
            Read more reviews
            <ChevronDown size={15} className="transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      )}
      {showReviewModal && (
        <WriteReviewModal vendor={vendor} onClose={() => setShowReviewModal(false)} />
      )}
    </section>
  )
}

// ── FAQSection ────────────────────────────────────────────
function VendorFaqSection({ vendor }: { vendor: Vendor }) {
  const faqs = vendor.faqs ?? []
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  if (!faqs.length) return null

  return (
    <section id="vendor-faq" className="scroll-mt-28 border-t border-gray-200 pt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <p className="mt-1 text-sm text-gray-500">
          Everything couples typically ask before booking {vendor.name}.
        </p>
      </div>

      <div className="rounded-[20px] border border-gray-100 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden divide-y divide-gray-100">
        {faqs.map((faq, i) => {
          const open = openIdx === i
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(open ? null : i)}
                className="flex w-full items-start gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50"
              >
                {/* Number badge */}
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                  style={{ backgroundColor: open ? '#1A1A1A' : '#F4F4F4', color: open ? '#fff' : '#9CA3AF' }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-semibold text-[#1A1A1A] leading-snug">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={`mt-0.5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 pl-16">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom nudge */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A]">
          <BookOpen size={14} className="text-white" />
        </div>
        <p className="text-sm text-gray-600">
          Still have questions?{' '}
          <button
            onClick={() => document.getElementById('vendor-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="font-semibold text-[#1A1A1A] underline underline-offset-2"
          >
            Send {vendor.name} a message
          </button>{' '}
          — they typically respond {vendor.responseTime ? vendor.responseTime.toLowerCase() : 'within 48 hours'}.
        </p>
      </div>
    </section>
  )
}

// ── ServiceAreaContactSection ─────────────────────────────
function VendorServiceAreaSection({ vendor }: { vendor: Vendor }) {
  const hasMap  = !!vendor.location
  const hasArea = !!vendor.serviceArea?.length
  if (!hasMap && !hasArea) return null

  const { location, serviceArea, city } = vendor

  const mapSrc = location
    ? `https://maps.google.com/maps?q=${encodeURIComponent(location.address)}&ll=${location.lat},${location.lng}&z=16&output=embed`
    : null

  return (
    <section id="vendor-location" className="scroll-mt-28 border-t border-gray-200 pt-12">
      <h2 className="text-2xl font-bold mb-6">Location &amp; Service Area</h2>

      {/* Map */}
      {mapSrc && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 h-64">
          <iframe
            src={mapSrc}
            className="h-full w-full"
            loading="lazy"
            title="Vendor location map"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            style={{ border: 0 }}
          />
        </div>
      )}

      {/* Address row */}
      {location && (
        <div className="flex items-center justify-between border-b border-gray-100 py-3">
          <div className="flex items-center gap-2 text-sm text-[#1A1A1A]">
            <MapPin size={15} className="shrink-0 text-gray-400" />
            <span>{location.address}</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#1A1A1A] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Open map
          </a>
        </div>
      )}

      {/* Service area */}
      <div className="mt-4">
        {hasArea && (() => {
          const areas = [
            ...serviceArea!,
            ...(city && !serviceArea!.includes(city) ? [city] : []),
          ]
          return (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 mb-3">Service area</p>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3.5 py-2 text-sm font-medium text-[#1A1A1A] border border-gray-200"
                  >
                    <MapPin size={11} className="text-gray-400" />
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </section>
  )
}

// ── AvailabilitySection ───────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_ABBRS = ['Su','Mo','Tu','We','Th','Fr','Sa']

// Brand palette — do not substitute Tailwind named colours for these
const CLR_EMERALD     = '#2D6A4F'
const CLR_PURPLE      = '#5B2D8E'
const CLR_AMBER_BG    = '#FEF3C7'
const CLR_AMBER_TEXT  = '#F59E0B'
const CLR_RED_BG      = '#FEE2E2'
const CLR_RED_TEXT    = '#EF4444'

function MiniCalendar({
  year, month, bookedSet, limitedSet, selectedDate, onDateClick,
}: {
  year: number
  month: number
  bookedSet: Set<string>
  limitedSet: Set<string>
  selectedDate: string | null
  onDateClick: (ds: string, kind: 'available' | 'limited' | 'booked') => void
}) {
  const now    = new Date()
  const todayY = now.getFullYear()
  const todayM = now.getMonth()
  const todayD = now.getDate()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow    = new Date(year, month, 1).getDay()

  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="min-w-0">
      <p className="mb-3 text-center text-[13px] font-bold text-[#1A1A1A]">{MONTH_NAMES[month]} {year}</p>
      <div className="grid grid-cols-7">
        {DAY_ABBRS.map((d) => (
          <div key={d} className="pb-2 text-center text-[12px] font-semibold text-[#1A1A1A]">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />

          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isPast     = year < todayY || (year === todayY && month < todayM) || (year === todayY && month === todayM && day < todayD)
          const isToday    = year === todayY && month === todayM && day === todayD
          const isBooked   = bookedSet.has(ds)
          const isLimited  = !isPast && !isToday && !isBooked && limitedSet.has(ds)
          const isSelected = !isPast && !isToday && !isBooked && !isLimited && ds === selectedDate
          const isAvailable = !isPast && !isToday && !isBooked && !isLimited && !isSelected

          // All colours via inline style — no Tailwind arbitrary values for brand hex
          const base = 'relative flex aspect-square items-center justify-center rounded-lg text-[11px] font-medium m-px select-none'

          const cellBg = isPast      ? undefined
            : isToday    ? CLR_PURPLE
            : isBooked   ? CLR_RED_BG
            : isSelected ? CLR_EMERALD
            : isLimited  ? CLR_AMBER_BG
            : '#D1FAE5'  // available

          const cellFg = isPast      ? undefined
            : isToday    ? '#fff'
            : isBooked   ? CLR_RED_TEXT
            : isSelected ? '#fff'
            : isLimited  ? CLR_AMBER_TEXT
            : '#1A1A1A'  // available

          const extra = isPast     ? 'text-gray-200'
            : isToday    ? 'font-bold'
            : isBooked   ? 'cursor-pointer'
            : isSelected ? 'cursor-pointer font-semibold'
            : isLimited  ? 'cursor-pointer font-semibold'
            : 'cursor-pointer'  // available

          return (
            <div
              key={ds}
              style={cellBg ? { backgroundColor: cellBg, color: cellFg } : undefined}
              className={`${base} ${extra}`}
              onMouseEnter={(e) => {
                if (isAvailable)
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#A7F3D0'
              }}
              onMouseLeave={(e) => {
                if (isAvailable)
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#D1FAE5'
              }}
              onClick={() => {
                if (!isPast && !isToday)
                  onDateClick(ds, isBooked ? 'booked' : isLimited ? 'limited' : 'available')
              }}
            >
              <span className={isBooked ? 'line-through' : undefined}>{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Vendor's weekly operating hours. Driven by `vendor.hours`; hidden when
// the vendor hasn't supplied them. Days are listed Mon–Sun with closed
// days clearly marked.
function VendorHoursSection({ vendor }: { vendor: Vendor }) {
  if (!vendor.hours) return null
  const days: Array<{ key: keyof NonNullable<Vendor['hours']>; label: string }> = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' },
  ]
  const entries = days
    .map((d) => ({ ...d, value: vendor.hours?.[d.key] }))
    .filter((d) => d.value)
  if (entries.length === 0) return null
  return (
    <section id="vendor-hours" className="scroll-mt-28 border-t border-gray-200 pt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Hours of operation</h2>
        <p className="mt-1 text-sm text-gray-500">
          When {vendor.name} is available for consultations and events.
        </p>
      </div>
      <ul className="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 bg-white">
        {entries.map(({ key, label, value }) => (
          <li key={key} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-gray-700 font-medium">{label}</span>
            <span className="font-mono tabular-nums text-gray-900">
              {value!.open
                ? `${value!.from || '—'} – ${value!.to || '—'}`
                : <span className="text-gray-400 italic">Closed</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function VendorAvailabilitySection({ vendor }: { vendor: Vendor }) {
  // Hooks must run unconditionally — keep them above the early return below.
  const [monthOffset, setMonthOffset]   = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [statusMsg, setStatusMsg]       = useState<{ text: string; warn: boolean } | null>(null)

  // Hide the calendar entirely when the vendor hasn't posted real
  // availability. The legacy `generateAvailability` synthesises booked /
  // limited dates from the vendor id, which is not honest data — couples
  // would book against a fictional calendar.
  if (!vendor.availability) return null
  const avail = vendor.availability

  const now = new Date()
  const bookedSet = new Set(avail?.bookedDates ?? [])
  const limitedSet = new Set(avail?.limitedDates ?? [])
  const leadTimeCutoff = new Date(now)
  leadTimeCutoff.setDate(leadTimeCutoff.getDate() + (avail?.leadTimeWeeks ?? 0) * 7)

  // Always compute 2 months; desktop shows both, mobile shows only [0] via CSS
  const months = [0, 1].map((n) => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset + n, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const canGoBack    = monthOffset > 0
  const canGoForward = monthOffset < 11

  function handleDateClick(ds: string, kind: 'available' | 'limited' | 'booked') {
    if (kind === 'booked') {
      setSelectedDate(null)
      setStatusMsg({ text: 'This date is taken — try a nearby date', warn: true })
    } else if (kind === 'limited') {
      setSelectedDate(ds)
      setStatusMsg({ text: 'Only 1 slot remaining — act fast', warn: true })
    } else {
      setSelectedDate(ds === selectedDate ? null : ds)
      setStatusMsg(null)
    }
  }

  return (
    <section id="vendor-availability" className="scroll-mt-28 border-t border-gray-200 pt-12">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Availability</h2>
        <p className="mt-1 text-sm text-gray-500">Check dates before you reach out — availability updates regularly.</p>
      </div>


      {/* Calendar card */}
      <>
          <div className="rounded-[20px] border border-gray-100 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sm:p-6">

            {/* Inline status after a click */}
            {statusMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                style={statusMsg.warn
                  ? { backgroundColor: CLR_AMBER_BG, color: '#92400E' }
                  : { backgroundColor: '#ECFDF5', color: '#065F46' }}>
                <span>{statusMsg.warn ? '⚠️' : 'ℹ️'}</span>
                {statusMsg.text}
              </div>
            )}

            {/* Month grids with flanking nav arrows */}
            <div className="flex items-start gap-3">
              <button
                onClick={() => setMonthOffset((o) => o - 1)}
                disabled={!canGoBack}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-sm transition hover:bg-[#333] disabled:opacity-25 disabled:cursor-not-allowed"
                aria-label="Previous month"
              >
                <ChevronLeft size={17} />
              </button>

              <div className="flex-1 grid grid-cols-1 gap-8 md:grid-cols-2">
                {months.map(({ year, month }, idx) => (
                  <div key={`${year}-${month}`} className={idx === 1 ? 'hidden md:block' : undefined}>
                    <MiniCalendar
                      year={year} month={month}
                      bookedSet={bookedSet} limitedSet={limitedSet}
                      selectedDate={selectedDate}
                      onDateClick={handleDateClick}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setMonthOffset((o) => o + 1)}
                disabled={!canGoForward}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-sm transition hover:bg-[#333] disabled:opacity-25 disabled:cursor-not-allowed"
                aria-label="Next month"
              >
                <ChevronRight size={17} />
              </button>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-5">
              {[
                { bg: '#D1FAE5',              label: 'Available' },
                { bg: CLR_EMERALD,            label: 'Selected'  },
                { bg: CLR_PURPLE,             label: 'Today'     },
                { bg: CLR_AMBER_BG,           label: 'Limited'   },
                { bg: CLR_RED_BG,             label: 'Booked'    },
              ].map(({ bg, label }) => (
                <div key={label} className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: bg }} />
                  {label}
                </div>
              ))}
              {avail.leadTimeWeeks ? (
                <p className="ml-auto text-[11px] text-gray-400">Min. {avail.leadTimeWeeks} weeks notice</p>
              ) : null}
            </div>
          </div>

          {/* Urgency banner */}
          <div className="mt-3 flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: 'rgba(45,106,79,0.07)', border: '1px solid rgba(45,106,79,0.22)' }}>
            <Zap size={14} className="mt-0.5 shrink-0" style={{ color: CLR_EMERALD }} />
            <p className="text-sm leading-snug" style={{ color: '#1A3C2E' }}>
              <span className="font-semibold">Peak Saturdays (June–Aug & December) book 6–18 months out.</span>{' '}
              Couples who enquired early confirmed within 48hrs.
            </p>
          </div>
      </>

    </section>
  )
}

// ── Sidebar ───────────────────────────────────────────────
function VendorContactSidebar({ vendor, compact = false }: { vendor: Vendor; compact?: boolean }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    weddingDate: '', flexibleDate: false, guests: '', phone: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          vendorName: vendor.name,
          ...form,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }
  const inputCls = `w-full rounded border border-gray-300 text-sm focus:outline-none focus:border-(--accent) ${
    compact ? 'p-2.5' : 'p-3'
  }`
  const stackCls = compact ? 'space-y-3' : 'space-y-4'
  const headingCls = compact ? 'text-xl' : 'text-2xl'
  const textareaCls = compact
    ? 'w-full h-24 resize-none rounded border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-(--accent)'
    : 'w-full h-32 resize-none rounded border border-gray-300 p-3 text-sm focus:outline-none focus:border-(--accent)'

  return (
    <div
      id="vendor-contact"
      className={`scroll-mt-28 w-full rounded-lg border border-gray-200 bg-white shadow-sm ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      }`}
    >
      {/* Header */}
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gray-50 px-5 py-4">
        <h2 className={`${headingCls} font-bold text-[#1A1A1A]`}>Start the Conversation</h2>
        {vendor.startingPrice && (
          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Starting Price</p>
            <p className="text-lg font-black text-[#1A1A1A]">
              {vendor.startingPrice.replace(/TZS\s*([\d.]+)M/, (_, n) =>
                `TZS ${(parseFloat(n) * 1_000_000).toLocaleString()}`
              )}
            </p>
          </div>
        )}
      </div>

      {status === 'success' ? (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-6 text-center space-y-2">
          <p className="text-lg font-bold text-green-800">Request sent!</p>
          <p className="text-sm text-green-700">
            {vendor.name} will get back to you soon. Check your inbox for a confirmation.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus('idle')
              setForm({ firstName: '', lastName: '', email: '', weddingDate: '', flexibleDate: false, guests: '', phone: '', message: '' })
            }}
            className="mt-2 text-xs underline text-green-700 hover:text-green-900"
          >
            Send another request
          </button>
        </div>
      ) : (
      <form className={stackCls} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input type="text" placeholder="First name*" required value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className={inputCls} />
          <input type="text" placeholder="Last name*" required value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className={inputCls} />
        </div>
        <input type="tel" placeholder="Phone number" value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className={inputCls} />
        <input type="email" placeholder="Email*" required value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputCls} />
        <input type="text" placeholder="Wedding date*" required value={form.weddingDate}
          onChange={(e) => setForm((f) => ({ ...f, weddingDate: e.target.value }))}
          className={inputCls} />

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.flexibleDate}
            onChange={(e) => setForm((f) => ({ ...f, flexibleDate: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 accent-(--accent)" />
          My wedding date is flexible
        </label>

        <div className="relative">
          <select required value={form.guests}
            onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))}
            className={`w-full appearance-none rounded border border-gray-300 bg-white text-sm focus:outline-none focus:border-(--accent) ${
              compact ? 'p-2.5' : 'p-3'
            }`}>
            <option value="" disabled>Number of guests*</option>
            <option value="50">50-100</option>
            <option value="100">100-200</option>
            <option value="200">200+</option>
          </select>
          <ChevronDown className={`pointer-events-none absolute right-3 text-gray-400 ${compact ? 'top-3 w-4 h-4' : 'top-3.5 w-5 h-5'}`} />
        </div>

        <textarea placeholder="Introduce yourself and share your wedding details..."
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={textareaCls}
        />

        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-semibold underline cursor-pointer">Why use OpusFesta to message vendors?</p>
          <p>
            By clicking "Request quote," you accept our{' '}
            <a href="#" className="underline">Terms of Use</a> and agree to OpusFesta creating an
            account for you. See our <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>

        {status === 'error' && errorMsg && (
          <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-200 px-3 py-2">{errorMsg}</p>
        )}

        <button type="submit" disabled={status === 'submitting'}
          className={`w-full rounded-full bg-(--accent) font-semibold text-[#1A1A1A] transition-colors hover:bg-(--accent-hover) disabled:opacity-60 disabled:cursor-not-allowed ${
            compact ? 'py-2.5' : 'py-3'
          }`}>
          {status === 'submitting' ? 'Sending…' : 'Request quote'}
        </button>
      </form>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */

export default function VendorDetailPage({ vendor }: { vendor: Vendor }) {
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('About')
  const [tabsSticky, setTabsSticky] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [galleryTab, setGalleryTab] = useState<GalleryTabKey>('portfolio')
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const tabsRailRef = useRef<HTMLDivElement>(null)
  const tabsHeightRef = useRef(0)
  // Mirror sidebarStopped / tabsStopped into refs so the layout effect can
  // read the latest value (and apply hysteresis) without re-registering the
  // ResizeObserver. Reading state from React closure inside the effect would
  // capture a stale value.
  const sidebarStoppedRef = useRef(false)
  const tabsStoppedRef = useRef(false)
  const sidebarColumnRef = useRef<HTMLDivElement>(null)
  const sidebarCardRef = useRef<HTMLDivElement>(null)
  const reviewsSentinelRef = useRef<HTMLDivElement>(null)
  const [tabsFrame, setTabsFrame] = useState({ left: 0, width: 0, height: 0 })
  const [sidebarFrame, setSidebarFrame] = useState({ left: 0, width: 0, height: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const [compactSidebar, setCompactSidebar] = useState(false)
  const [sidebarStopped, setSidebarStopped] = useState(false)
  const [tabsStopped, setTabsStopped] = useState(false)

  // Sync active tab with scroll position
  useEffect(() => {
    const sectionTabMap: Record<string, string> = {
      'vendor-about': 'About',
      'vendor-services': 'Services',
      'vendor-pricing': 'Pricing',
      'vendor-availability': 'Availability',
      'vendor-team': 'Team',
      "vendor-faq": "FAQ's",
      'vendor-reviews': 'Reviews',
      'vendor-location': 'Location',

    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tab = sectionTabMap[entry.target.id]
            if (tab) setActiveTab(tab)
          }
        })
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    )
    // Relaxed observer for last section — fires as soon as any part enters viewport
    const lastObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveTab('Location')
        })
      },
      { rootMargin: '-10% 0px 0px 0px', threshold: 0 }
    )
    Object.keys(sectionTabMap).forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      if (id === 'vendor-location') lastObserver.observe(el)
      else observer.observe(el)
    })
    return () => { observer.disconnect(); lastObserver.disconnect() }
  }, [])

  useEffect(() => {
    let frameId = 0

    const updateLayout = () => {
      const gallery = galleryRef.current
      const leftColumn = leftColumnRef.current
      const tabsRail = tabsRailRef.current
      const sidebarColumn = sidebarColumnRef.current
      const sidebarCard = sidebarCardRef.current
      const reviewsSentinel = reviewsSentinelRef.current
      if (!gallery || !leftColumn || !sidebarColumn || !sidebarCard) return

      const nextIsDesktop = window.innerWidth >= 1024
      setIsDesktop((prev) => (prev === nextIsDesktop ? prev : nextIsDesktop))
      const nextCompactSidebar = nextIsDesktop && (window.innerWidth < 1440 || window.innerHeight < 900)
      setCompactSidebar((prev) => (prev === nextCompactSidebar ? prev : nextCompactSidebar))

      const nextTabsSticky = gallery.getBoundingClientRect().bottom <= 0
      setTabsSticky((prev) => (prev === nextTabsSticky ? prev : nextTabsSticky))

      const leftRect = leftColumn.getBoundingClientRect()
      const nextTabsFrame = {
        left: Math.round(leftRect.left),
        width: Math.round(leftRect.width),
        height: Math.round(tabsRail?.offsetHeight ?? tabsRailRef.current?.offsetHeight ?? 0),
      }
      setTabsFrame((prev) => (
        prev.left === nextTabsFrame.left
        && prev.width === nextTabsFrame.width
        && prev.height === nextTabsFrame.height
      ) ? prev : nextTabsFrame)

      const sidebarColumnRect = sidebarColumn.getBoundingClientRect()
      const nextSidebarFrame = {
        left: Math.round(sidebarColumnRect.left),
        width: Math.round(sidebarColumnRect.width),
        height: Math.round(sidebarCard.offsetHeight),
      }
      setSidebarFrame((prev) => (
        prev.left === nextSidebarFrame.left
        && prev.width === nextSidebarFrame.width
        && prev.height === nextSidebarFrame.height
      ) ? prev : nextSidebarFrame)

      // Hysteresis: when the sidebar / tabs cross their "stop" threshold, the
      // resulting layout change can shift the measured boundary back across
      // the threshold on the very next frame, producing an infinite render
      // loop ("Maximum update depth"). We add a small dead-band so the state
      // only flips once the measurement is clearly past the boundary,
      // breaking the oscillation cycle.
      const HYSTERESIS_PX = 24
      if (reviewsSentinel && nextIsDesktop) {
        const sentinelTop = reviewsSentinel.getBoundingClientRect().top
        const stopBoundary = 24 + sidebarCard.offsetHeight
        const nextSidebarStopped = sidebarStoppedRef.current
          ? nextTabsSticky && sentinelTop <= stopBoundary + HYSTERESIS_PX
          : nextTabsSticky && sentinelTop <= stopBoundary - HYSTERESIS_PX
        if (nextSidebarStopped !== sidebarStoppedRef.current) {
          sidebarStoppedRef.current = nextSidebarStopped
          setSidebarStopped(nextSidebarStopped)
        }
      }

      // Cache tabs height while the rail is mounted so the value survives when tabs unmount
      if (tabsRail) tabsHeightRef.current = tabsRail.offsetHeight

      const locationEl = document.getElementById('vendor-location')
      if (locationEl && nextIsDesktop) {
        const locationTop = locationEl.getBoundingClientRect().top
        const tabsStopBoundary = tabsHeightRef.current
        const nextTabsStopped = tabsStoppedRef.current
          ? nextTabsSticky && locationTop <= tabsStopBoundary + HYSTERESIS_PX
          : nextTabsSticky && locationTop <= tabsStopBoundary - HYSTERESIS_PX
        if (nextTabsStopped !== tabsStoppedRef.current) {
          tabsStoppedRef.current = nextTabsStopped
          setTabsStopped(nextTabsStopped)
        }
      }
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(updateLayout)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    const resizeObserver = new ResizeObserver(requestUpdate)
    if (leftColumnRef.current) resizeObserver.observe(leftColumnRef.current)
    if (tabsRailRef.current) resizeObserver.observe(tabsRailRef.current)
    if (sidebarColumnRef.current) resizeObserver.observe(sidebarColumnRef.current)
    if (sidebarCardRef.current) resizeObserver.observe(sidebarCardRef.current)
    if (reviewsSentinelRef.current) resizeObserver.observe(reviewsSentinelRef.current)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      resizeObserver.disconnect()
    }
  }, [])
  // Gallery sources, filtered to only real image URLs. A fresh vendor that
  // hasn't uploaded any media has no gallery and an empty hero src — we treat
  // that as zero images and let the render layer show a "no media uploaded"
  // placeholder instead of an <img src=""> (which Next.js warns about).
  const images: string[] = (() => {
    const fromGallery = (vendor.gallery ?? []).filter((s): s is string => typeof s === 'string' && s.trim() !== '')
    if (fromGallery.length > 0) return fromGallery
    if (vendor.heroMedia.src && vendor.heroMedia.src.trim() !== '') return [vendor.heroMedia.src]
    return []
  })()
  const hasMedia = images.length > 0 || vendor.heroMedia.type === 'video'
  const videos = vendor.heroMedia.type === 'video'
    ? [{ src: vendor.heroMedia.src, poster: vendor.heroMedia.poster ?? images[0] }]
    : []
  const portfolioItems = [
    ...images.map((src, index) => ({ kind: 'photo' as const, src, index })),
    ...videos.map((video, index) => ({ kind: 'video' as const, ...video, index })),
  ]
  const galleryTabs: Array<{ key: GalleryTabKey; label: string; count: number }> = [
    { key: 'portfolio', label: 'Portfolio', count: portfolioItems.length },
    { key: 'photos', label: 'Photos', count: images.length },
    { key: 'videos', label: 'Videos', count: videos.length },
    { key: 'reviews', label: 'Reviews', count: vendor.detailedReviews?.length ?? 0 },
  ]
  const visiblePortfolioItems = galleryTab === 'photos'
    ? images.map((src, index) => ({ kind: 'photo' as const, src, index }))
    : galleryTab === 'videos'
      ? videos.map((video, index) => ({ kind: 'video' as const, ...video, index }))
      : portfolioItems
  const previewItem = previewIndex !== null ? visiblePortfolioItems[previewIndex] : null

  function openGallery(tab: GalleryTabKey = 'portfolio') {
    setGalleryTab(tab)
    setPreviewIndex(null)
    setLightboxOpen(true)
  }

  function closeGallery() {
    setPreviewIndex(null)
    setLightboxOpen(false)
  }

  function openPreview(index: number) {
    const clampedIndex = Math.max(0, Math.min(index, visiblePortfolioItems.length - 1))
    setPreviewIndex(clampedIndex)
  }

  function closePreview() {
    setPreviewIndex(null)
  }

  function showPreviousPreview() {
    if (!visiblePortfolioItems.length) return
    setPreviewIndex((current) => {
      const safeIndex = current ?? 0
      return (safeIndex - 1 + visiblePortfolioItems.length) % visiblePortfolioItems.length
    })
  }

  function showNextPreview() {
    if (!visiblePortfolioItems.length) return
    setPreviewIndex((current) => {
      const safeIndex = current ?? 0
      return (safeIndex + 1) % visiblePortfolioItems.length
    })
  }

  useEffect(() => {
    if (!lightboxOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (previewIndex !== null) {
          closePreview()
          return
        }
        closeGallery()
      }
      if (previewIndex !== null && event.key === 'ArrowLeft') {
        showPreviousPreview()
      }
      if (previewIndex !== null && event.key === 'ArrowRight') {
        showNextPreview()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxOpen, previewIndex, visiblePortfolioItems.length])

  useEffect(() => {
    setPreviewIndex(null)
  }, [galleryTab])

  function handleRequestQuoteFromGallery() {
    closeGallery()
    requestAnimationFrame(() => {
      document.getElementById('vendor-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }


  return (
    <main className="bg-white text-[#1A1A1A]">

      {/* ─── Top bar: back link + search + location ──────────── */}
      <div className="px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {/* Back link */}
          <Link
            href={VENDORS_BASE_PATH}
            className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-[#1A1A1A]"
          >
            <ArrowLeft size={12} />
            {vendor.category} vendors
          </Link>

          {/* Combined search + location bar */}
          <div className="ml-auto hidden sm:flex items-stretch rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            {/* Search field */}
            <div className="flex items-center px-4 py-2">
              <input
                type="text"
                placeholder="Search by vendor, style or details"
                className="w-52 bg-transparent text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none lg:w-72"
              />
            </div>
            {/* Divider */}
            <div className="w-px self-stretch bg-gray-200" />
            {/* Location field */}
            <div className="flex flex-col justify-center px-4 py-1.5">
              <span className="text-[10px] font-semibold text-gray-400 leading-none">Location</span>
              <input
                type="text"
                defaultValue={vendor.city}
                className="mt-0.5 w-32 bg-transparent text-sm font-semibold text-[#1A1A1A] focus:outline-none"
              />
            </div>
            {/* Search button */}
            <button className="flex items-center justify-center bg-(--accent) px-4 text-[#1A1A1A] transition hover:bg-(--accent-hover)">
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bento gallery ───────────────────────────────────── */}
      <div ref={galleryRef} className="px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {!hasMedia ? (
            // Empty state: vendor hasn't uploaded any media yet. Show a
            // neutral placeholder with their name + initials instead of a
            // synthesised stock photo.
            <div className="h-[240px] sm:h-[420px] md:h-[480px] rounded-lg bg-gray-100 flex flex-col items-center justify-center border border-dashed border-gray-300">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-semibold text-gray-500 mb-3 border border-gray-200">
                {(vendor.name || '?').slice(0, 2).toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-gray-700">{vendor.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                This vendor hasn&rsquo;t uploaded photos yet.
              </p>
            </div>
          ) : (
          /* Mobile: single image. Desktop: flat 3-col × 2-row grid, left spans both rows */
          <div className="h-[240px] overflow-hidden rounded-lg sm:h-[420px] md:h-[480px]
                          grid grid-cols-1
                          sm:grid-cols-[2fr_0.95fr_0.95fr] lg:grid-cols-[2.4fr_0.8fr_0.8fr] sm:grid-rows-2 sm:gap-1.5">

            {/* Cell 1 — left, spans 2 rows */}
            <button
              type="button"
              onClick={() => openGallery(vendor.heroMedia.type === 'video' ? 'videos' : 'photos')}
              className="relative overflow-hidden sm:row-span-2"
              aria-label="Open media"
            >
              {vendor.heroMedia.type === 'video' ? (
                <>
                  <video
                    src={vendor.heroMedia.src}
                    poster={vendor.heroMedia.poster}
                    autoPlay muted loop playsInline
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#1A1A1A]">
                    <LayoutGrid size={11} /> Video
                  </div>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt={vendor.heroMedia.alt} className="h-full w-full object-cover" />
              )}
            </button>

            {/* Cells 2–5: pull from portfolioItems so videos appear too */}
            {portfolioItems.slice(1, 4).map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openGallery(item.kind === 'video' ? 'videos' : 'photos')}
                className="relative hidden overflow-hidden sm:block"
                aria-label={`Open ${item.kind} ${i + 2}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.kind === 'video' ? (item as { poster: string }).poster : item.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {item.kind === 'video' && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#1A1A1A]">
                      <LayoutGrid size={9} /> Video
                    </div>
                  </>
                )}
              </button>
            ))}

            {/* Cell 5 — "See all" overlay */}
            {portfolioItems[4] && (
              <div className="relative hidden sm:block overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portfolioItems[4].kind === 'video' ? (portfolioItems[4] as { poster: string }).poster : portfolioItems[4].src}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                <button
                  onClick={() => openGallery('portfolio')}
                  className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-[#1A1A1A] shadow-lg transition hover:bg-white"
                >
                  <LayoutGrid size={15} />
                  <span className="text-sm font-bold">See all</span>
                  <span className="text-xs font-medium text-gray-500">({portfolioItems.length})</span>
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* ─── Two-column layout ──────────��────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem] 2xl:grid-cols-[minmax(0,1fr)_27rem]">

          {/* ── Col 1: header + tabs (sticky) + content ────────── */}
          <div ref={leftColumnRef} className="min-w-0 self-start">
            <VendorHeader vendor={vendor} onSave={() => setSaved((v) => !v)} saved={saved} />

            {/* Tabs — only rendered when sticky (after gallery scrolls off) and before location section */}
            {tabsSticky && !tabsStopped && (
              <div
                className="z-20"
                style={{
                  left: tabsFrame.left || undefined,
                  position: 'fixed',
                  top: 0,
                  width: tabsFrame.width || undefined,
                }}
              >
                <div
                  ref={tabsRailRef}
                  className="border-b border-gray-200 bg-white/95 backdrop-blur-md"
                >
                  <VendorTabs onPhotos={() => openGallery('photos')} saved={saved} onSave={() => setSaved((v) => !v)} active={activeTab} onActiveChange={setActiveTab} />
                </div>
              </div>
            )}

            <div className="space-y-12">
              <VendorAboutSection vendor={vendor} />
              <VendorServicesSection vendor={vendor} />
              <VendorPricingSection vendor={vendor} />
              <VendorHoursSection vendor={vendor} />
              <VendorAvailabilitySection vendor={vendor} />
              <VendorTeamSection vendor={vendor} />
              <VendorFaqSection vendor={vendor} />
              <VendorReviewsSection vendor={vendor} />
              <VendorServiceAreaSection vendor={vendor} />
              {/* Sentinel: sidebar stops being sticky after Location section ends */}
              <div ref={reviewsSentinelRef} id="vendor-reviews-sentinel" />
            </div>
          </div>

          {/* ── Col 2: quote card — sticky, stops after Location ────── */}
          <div ref={sidebarColumnRef} className="relative">
            <div
              className={tabsSticky ? 'z-10' : undefined}
              style={
                sidebarStopped
                  ? { position: 'absolute', bottom: 0, width: sidebarFrame.width || undefined }
                  : tabsSticky && isDesktop
                  ? { left: sidebarFrame.left || undefined, position: 'fixed', top: 24, width: sidebarFrame.width || undefined }
                  : undefined
              }
            >
              <div ref={sidebarCardRef}>
                <VendorContactSidebar vendor={vendor} compact={compactSidebar} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Gallery Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden overscroll-none bg-white"
          data-lenis-prevent
          onClick={closeGallery}
          role="dialog"
          aria-modal="true"
          aria-label={`${vendor.name} gallery`}
        >
          <div
            className="flex h-full flex-col overflow-hidden bg-white"
            onClick={(e) => e.stopPropagation()}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-md">
              <div className="mx-auto flex max-w-384 flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="min-w-0 flex flex-1 flex-wrap items-center gap-3 lg:gap-4">
                  <h2 className="truncate text-sm font-semibold text-[#1A1A1A]">{vendor.name}</h2>
                  <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {galleryTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setGalleryTab(tab.key)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          galleryTab === tab.key
                            ? 'border-[#1A1A1A] bg-white text-[#1A1A1A]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-[#1A1A1A]'
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSaved((value) => !value)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                      saved
                        ? 'bg-(--accent)/10 text-(--accent-hover)'
                        : 'text-(--accent-hover) hover:bg-(--accent)/10'
                    }`}
                  >
                    <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
                    <span className="hidden sm:inline">Save Vendor</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestQuoteFromGallery}
                    className="inline-flex items-center rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition hover:bg-(--accent-hover)"
                  >
                    Request quote
                  </button>
                  <button
                    type="button"
                    onClick={closeGallery}
                    className="inline-flex items-center gap-2 rounded-full border border-(--accent)/30 bg-(--accent)/10 px-3 py-2 text-sm font-semibold text-(--accent-hover) transition hover:border-(--accent) hover:bg-(--accent)/18 hover:text-[#1A1A1A]"
                    aria-label="Close gallery"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Close</span>
                  </button>
                </div>
              </div>
            </div>

            <div
              className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              data-lenis-prevent
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
            >
              <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {galleryTab === 'reviews' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {(vendor.detailedReviews ?? []).length ? (
                      vendor.detailedReviews?.map((review) => (
                        <article
                          key={review.id}
                          className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_18px_60px_rgba(17,17,17,0.06)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-[#1A1A1A]">{review.author}</h3>
                              <p className="mt-1 text-sm text-gray-500">{review.date}</p>
                            </div>
                            <StarRow rating={review.rating} />
                          </div>
                          <p className="mt-4 text-sm leading-7 text-gray-700">{review.text}</p>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#faf8fb] p-10 text-center text-sm text-gray-500 md:col-span-2">
                        No review highlights available yet.
                      </div>
                    )}
                  </div>
                ) : visiblePortfolioItems.length ? (
                  <div className="columns-1 gap-4 md:columns-2">
                    {visiblePortfolioItems.map((item, index) => (
                      <button
                        key={`${item.kind}-${item.index}-${item.src}`}
                        type="button"
                        onClick={() => openPreview(index)}
                        className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-[18px] border border-gray-100 bg-[#f8f6f2] text-left shadow-[0_12px_40px_rgba(17,17,17,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(17,17,17,0.08)]"
                      >
                        {item.kind === 'video' ? (
                          <div className="group relative">
                            <div className="overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.poster}
                                alt={`${vendor.name} video preview`}
                                className="block h-auto w-full transition duration-500 group-hover:scale-[1.02]"
                              />
                            </div>
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                            <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A1A1A]">
                              Video
                            </div>
                            <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1A1A1A] shadow-lg">
                              <LayoutGrid size={16} />
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.src}
                              alt={`${vendor.name} gallery image ${index + 1}`}
                              className="block h-auto w-full transition duration-500 group-hover:scale-[1.02]"
                            />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-gray-200 bg-[#faf8fb] p-10 text-center text-sm text-gray-500">
                    No {galleryTab} assets available yet.
                  </div>
                )}
              </div>
            </div>

            {previewItem && (
              <div
                className="absolute inset-0 z-30 bg-[rgba(16,14,20,0.55)] backdrop-blur-sm"
                onClick={closePreview}
              >
                <div
                  className="flex h-full flex-col px-3 py-4 sm:px-6 sm:py-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-3 text-white">
                    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-white/85">
                      {previewIndex !== null ? `${previewIndex + 1} / ${visiblePortfolioItems.length}` : ''}
                    </div>
                    <button
                      type="button"
                      onClick={closePreview}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/16"
                      aria-label="Close image preview"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Close Preview</span>
                    </button>
                  </div>

                  <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center">
                    {visiblePortfolioItems.length > 1 && (
                      <button
                        type="button"
                        onClick={showPreviousPreview}
                        className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none sm:left-2"
                        aria-label="Previous media"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}

                    <div className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-[28px]">
                      {previewItem.kind === 'video' ? (
                        <video
                          src={previewItem.src}
                          poster={previewItem.poster}
                          controls
                          autoPlay
                          playsInline
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewItem.src}
                          alt={`${vendor.name} gallery preview ${previewIndex !== null ? previewIndex + 1 : 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>

                    {visiblePortfolioItems.length > 1 && (
                      <button
                        type="button"
                        onClick={showNextPreview}
                        className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none sm:right-2"
                        aria-label="Next media"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </main>
  )
}
