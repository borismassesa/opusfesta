'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import {
  Menu,
  X,
  ChevronDown,
  Heart,
  Users,
  Camera,
  Music,
  MapPin,
  Sparkles,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Link as LinkIcon,
  Shirt,
  Video,
  Utensils,
  Flower2,
  Globe,
  CalendarCheck,
  BookOpen,
  Gem,
  Clock,
  BarChart2,
  FileText,
  Star,
  Tag,
  HelpCircle,
  Building2,
  PenLine,
  Monitor,
  Image,
  Share2,
  Gift,
  PartyPopper,
  ShoppingBag,
} from 'lucide-react'

type NavLink = { label: string; Icon?: LucideIcon; subLinks?: string[] }
type PhotoGridItem = { label: string; image: string }

const attirePhotoGrid: PhotoGridItem[] = [
  { label: 'Wedding Dresses', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80' },
  { label: 'Engagement Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Suits & Tuxedos', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80' },
  { label: 'Bridesmaid Dresses', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80' },
]

const navItems: Array<{
  label: string
  card: { image: string; title: string; description: string; linkText: string }
  columns: Array<{ title: string; links: NavLink[] }>
}> = [
  {
    label: 'Planning Tools',
    card: {
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
      title: 'PLANNING TOOLS',
      description: 'Everything you need to plan your wedding: checklists, budgets, guest lists and more.',
      linkText: 'Explore tools',
    },
    columns: [
      {
        title: 'Features',
        links: [
          { Icon: CheckCircle2, label: 'Wedding Checklist' },
          { Icon: CreditCard, label: 'Budget Planner' },
          { Icon: Users, label: 'Guest List Manager' },
          { Icon: CalendarCheck, label: 'Seating Chart' },
          { Icon: MessageCircle, label: 'Vendor Manager' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { Icon: Clock, label: 'Planning Timeline' },
          { Icon: BarChart2, label: 'Budget Breakdown Guide' },
          { Icon: FileText, label: 'Checklist Templates' },
        ],
      },
    ],
  },
  {
    label: 'Vendors',
    card: {
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      title: 'FIND VENDORS',
      description: 'Discover and book verified wedding professionals across Tanzania.',
      linkText: 'Browse all vendors',
    },
    columns: [
      {
        title: 'Categories',
        links: [
          { Icon: MapPin, label: 'Venues' },
          { Icon: Camera, label: 'Photographers' },
          { Icon: Video, label: 'Videographers' },
          { Icon: Music, label: 'DJs & Bands' },
          { Icon: Flower2, label: 'Florists' },
          { Icon: Utensils, label: 'Caterers' },
          { Icon: Sparkles, label: 'Hair & Makeup' },
          { Icon: Gift, label: 'Wedding Cakes' },
          { Icon: Shirt, label: 'Bridal Salons' },
          { Icon: PartyPopper, label: 'MC & Officiants' },
          { Icon: Image, label: 'Photo Booths' },
          { Icon: ShoppingBag, label: 'Rentals' },
          { Icon: Share2, label: 'Transportation' },
          { Icon: Gem, label: 'Jewellers' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { Icon: Star, label: 'Verified Reviews' },
          { Icon: Tag, label: 'Pricing Guide' },
          { Icon: HelpCircle, label: 'How to Choose a Vendor' },
          { Icon: Building2, label: 'Vendors by City' },
        ],
      },
    ],
  },
  {
    label: 'Guests',
    card: {
      image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
      title: 'GUEST MANAGEMENT',
      description: 'Invite guests, track RSVPs, manage plus-ones and seating. All in one place.',
      linkText: 'Manage your guests',
    },
    columns: [
      {
        title: 'Features',
        links: [
          { Icon: Users, label: 'Guest List' },
          { Icon: CheckCircle2, label: 'RSVP Tracking' },
          { Icon: MessageCircle, label: 'Send Invitations' },
          { Icon: MapPin, label: 'Seating Planner' },
          { Icon: Heart, label: 'Dietary & Plus-ones' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { Icon: BookOpen, label: 'Guest List Tips' },
          { Icon: PenLine, label: 'RSVP Wording Ideas' },
        ],
      },
    ],
  },
  {
    label: 'Websites',
    card: {
      image: 'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?auto=format&fit=crop&w=800&q=80',
      title: 'WEDDING WEBSITES',
      description: 'Build a beautiful wedding website in minutes and share it with your guests.',
      linkText: 'Create your website',
    },
    columns: [
      {
        title: 'Features',
        links: [
          { Icon: Globe, label: 'Free Wedding Website' },
          { Icon: LinkIcon, label: 'Custom Link' },
          { Icon: Heart, label: 'Beautiful Templates' },
          { Icon: CheckCircle2, label: 'RSVP Collection' },
          { Icon: MapPin, label: 'Venue & Travel Info' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { Icon: Monitor, label: 'Website Examples' },
          { Icon: Image, label: 'Photo Gallery Tips' },
          { Icon: Share2, label: 'Sharing with Guests' },
        ],
      },
    ],
  },
  {
    label: 'Advice & Ideas',
    card: {
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
      title: 'ADVICE & IDEAS',
      description: 'Browse real weddings, trending themes, and expert advice for every couple.',
      linkText: 'Get inspired',
    },
    columns: [
      {
        title: 'Inspiration',
        links: [
          { Icon: Heart, label: 'Real Weddings' },
          { Icon: Sparkles, label: 'Themes & Styles' },
          { Icon: Camera, label: 'Photo & Video Ideas' },
          { Icon: MapPin, label: 'Honeymoon Ideas' },
          { Icon: Globe, label: 'Destination Weddings' },
        ],
      },
      {
        title: 'Advice',
        links: [
          { Icon: CheckCircle2, label: 'Planning Guides' },
          { Icon: MessageCircle, label: 'Etiquette & Wording' },
          { Icon: Users, label: 'For Families & Guests' },
          { Icon: Gift, label: 'Bridal Shower Ideas' },
          { Icon: PartyPopper, label: 'Engagement Party Tips' },
        ],
      },
    ],
  },
  {
    label: 'Attire & Rings',
    card: {
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      title: 'ATTIRE & RINGS',
      description: 'Find your perfect look from verified local boutiques across East Africa.',
      linkText: 'Explore attire',
    },
    columns: [
      {
        title: 'Attire',
        links: [
          { Icon: Heart, label: 'Wedding Dresses' },
          { Icon: Shirt, label: 'Suits & Tuxedos' },
          { Icon: Users, label: 'Bridesmaid Dresses' },
          { Icon: Sparkles, label: 'Mother of the Bride' },
          { Icon: Star, label: 'Flower Girl & Ring Bearer' },
        ],
      },
      {
        title: 'Rings & Jewellery',
        links: [
          { Icon: Gem, label: 'Engagement Rings' },
          { Icon: BookOpen, label: 'Wedding Rings' },
          { Icon: Sparkles, label: 'Wedding Jewellery' },
          { Icon: ShoppingBag, label: 'Wedding Accessories' },
        ],
      },
    ],
  },
]

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const activeItem = activeMenu ? navItems.find((i) => i.label === activeMenu) ?? null : null

  const closeMobile = () => {
    setMobileOpen(false)
    setMobileExpanded(null)
  }

  return (
    <div
      className="relative border-b border-gray-100 bg-white"
      onMouseLeave={() => setActiveMenu(null)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setActiveMenu(null)
          closeMobile()
        }
      }}
    >
      {/* ── Top bar ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto relative z-50 bg-white">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-8">
          <Logo className="h-10 w-auto" />

          <div className="hidden lg:flex gap-1 font-semibold text-sm">
            {navItems.map((item) => (
              <button
                key={item.label}
                onMouseEnter={() => setActiveMenu(item.label)}
                aria-expanded={activeMenu === item.label}
                aria-haspopup="true"
                className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                  activeMenu === item.label
                    ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: auth + hamburger */}
        <div className="flex items-center gap-3 font-semibold text-sm">
          <a
            href="#"
            className="hidden lg:block text-gray-700 hover:text-[#1A1A1A] transition-colors whitespace-nowrap px-4 py-2 rounded-full hover:bg-gray-100"
          >
            Log in
          </a>
          <button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-5 py-2 rounded-full font-bold transition-colors whitespace-nowrap text-sm">
            Sign up
          </button>
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Desktop mega-menu dropdown ── */}
      {activeItem && (
        <div className="hidden lg:block absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40">
          <div className="max-w-6xl mx-auto px-6 py-8 flex gap-10">

            {/* Featured card */}
            <div className="w-[260px] shrink-0 rounded-2xl overflow-hidden flex flex-col border border-gray-200 shadow-md bg-white">
              <div className="h-36 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.card.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold mb-1.5 text-[#1A1A1A] leading-tight">
                  {activeItem.card.title}
                </h3>
                <p className="text-gray-500 text-xs font-medium mb-5 leading-relaxed">
                  {activeItem.card.description}
                </p>
                <a
                  href="#"
                  className="mt-auto inline-flex items-center gap-2 text-[#1A1A1A] font-bold text-sm hover:gap-3 transition-all group"
                >
                  {activeItem.card.linkText}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            <div className="flex-1 flex gap-10 pt-1">
              {activeItem.columns.map((col, idx) => (
                <div key={idx} className="flex-1 min-w-0">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4 pb-3 border-b border-gray-200">
                    {col.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <a
                          href="#"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl group hover:bg-white transition-colors"
                        >
                          {link.Icon && (
                            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-[var(--on-accent)] transition-colors shrink-0">
                              <link.Icon size={13} />
                            </div>
                          )}
                          <span className="font-semibold text-sm text-[#1A1A1A] leading-tight group-hover:text-[#1A1A1A]">
                            {link.label}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Attire photo grid */}
            {activeItem.label === 'Attire & Rings' && (
              <div className="shrink-0 w-[240px] pt-1">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4 pb-3 border-b border-gray-200">
                  Get Inspired
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {attirePhotoGrid.map((item) => (
                    <a key={item.label} href="#" className="group flex flex-col gap-1.5">
                      <div className="rounded-xl overflow-hidden h-[88px] border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="font-semibold text-xs text-[#1A1A1A] leading-tight px-0.5">
                        {item.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile: full-screen menu ── */}
      <div
        className={`lg:hidden fixed inset-0 bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        aria-label="Navigation menu"
      >
        {/* Header — changes based on which panel is active */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          {mobileExpanded ? (
            <button
              onClick={() => setMobileExpanded(null)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              aria-label="Back to menu"
            >
              <ChevronDown size={18} className="rotate-90" />
              Back
            </button>
          ) : (
            <Logo className="h-8 w-auto" />
          )}
          <button
            onClick={closeMobile}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sliding panels container */}
        <div className="flex-1 overflow-hidden relative">
          {/* Panel 1 — main nav list */}
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
              mobileExpanded ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="flex-1 overflow-y-auto py-3 px-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-xl font-semibold text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => setMobileExpanded(item.label)}
                >
                  <span>{item.label}</span>
                  <ChevronDown size={16} className="-rotate-90 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="shrink-0 px-4 py-5 border-t border-gray-100 flex flex-col gap-2.5">
              <a
                href="#"
                className="w-full text-center py-3 rounded-full border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log in
              </a>
              <button className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] py-3 rounded-full font-bold text-sm transition-colors">
                Sign up, it&apos;s free
              </button>
            </div>
          </div>

          {/* Panel 2 — sub-items for the selected section */}
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
              mobileExpanded ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {(() => {
              const item = navItems.find((i) => i.label === mobileExpanded)
              if (!item) return null
              return (
                <>
                  {/* Section title */}
                  <div className="px-5 pt-3 pb-2 shrink-0">
                    <h2 className="text-xl font-bold text-[#1A1A1A]">
                      {item.label}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 pb-6">
                    {/* Featured image banner */}
                    <div className="relative rounded-2xl overflow-hidden h-36 mb-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.card.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
                        <p className="text-white text-xs font-medium leading-snug mb-2 opacity-90">
                          {item.card.description}
                        </p>
                        <a
                          href="#"
                          className="inline-flex items-center gap-1.5 bg-white text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full"
                        >
                          {item.card.linkText}
                          <ArrowRight size={11} />
                        </a>
                      </div>
                    </div>

                    {/* Link columns */}
                    {item.columns.map((col, idx) => (
                      <div key={idx} className="mb-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 mb-2 px-1">
                          {col.title}
                        </p>
                        <ul className="flex flex-col gap-0.5">
                          {col.links.map((link, lIdx) => (
                            <li key={lIdx}>
                              <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                              >
                                {link.Icon && (
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                                    <link.Icon size={15} />
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-[#1A1A1A] flex-1">{link.label}</span>
                                <ChevronDown size={14} className="-rotate-90 text-gray-300 shrink-0" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
