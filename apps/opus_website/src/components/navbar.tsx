'use client'

import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import {
  Menu,
  X,
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
  ChevronDown,
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
      description: 'Everything you need to plan your wedding — checklists, budgets, guest lists and more.',
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
      description: 'Invite guests, track RSVPs, manage plus-ones and seating — all in one place.',
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggleMobileSection = (label: string) => {
    setMobileExpanded((prev) => (prev === label ? null : label))
  }

  return (
    <>
      <div
        className="relative border-b border-gray-100"
        onMouseLeave={() => setActiveMenu(null)}
      >
        {/* ─── Top bar ─── */}
        <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-6xl mx-auto bg-white">
          <div className="flex items-center gap-8">
            <Logo className="h-8 sm:h-10 w-auto" />
            <div className="hidden lg:flex gap-2 font-semibold text-sm">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onMouseEnter={() => setActiveMenu(item.label)}
                  aria-expanded={activeMenu === item.label}
                  aria-haspopup="true"
                  className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                    activeMenu === item.label
                      ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                      : 'hover:bg-[var(--accent)] hover:text-[var(--on-accent)] text-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 font-semibold text-sm">
            <a href="#" className="hidden lg:block hover:text-[#1A1A1A] transition-colors whitespace-nowrap">
              Log in
            </a>
            <button className="hidden sm:block bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-6 py-2 rounded-full font-bold transition-colors whitespace-nowrap">
              Sign up
            </button>
            {/* Hamburger — uses inline style to guarantee visibility */}
            <button
              className="lg:hidden"
              style={{ padding: 8, WebkitTapHighlightColor: 'transparent' }}
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>

        {/* ─── Desktop mega-menu dropdown ─── */}
        {activeItem && (
          <div className="hidden lg:block absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 py-8 flex gap-12">
              <div className="w-[300px] shrink-0 border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
                <div className="h-40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeItem.card.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1 bg-white">
                  <h3 className="text-2xl font-black tracking-tighter uppercase mb-2 text-[#1A1A1A]">
                    {activeItem.card.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium mb-6">
                    {activeItem.card.description}
                  </p>
                  <a href="#" className="mt-auto flex items-center gap-2 text-[#1A1A1A] font-bold hover:underline">
                    {activeItem.card.linkText}
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>

              <div className="flex-1 flex gap-16 pt-2">
                {activeItem.columns.map((col, idx) => (
                    <div key={idx} className="flex-1">
                      <h4 className="text-gray-500 text-sm font-medium mb-6 border-b border-gray-100 pb-4">
                        {col.title}
                      </h4>
                      <ul className="space-y-3">
                        {col.links.map((link, lIdx) => (
                          <li key={lIdx}>
                            <a href="#" className="flex items-center gap-3 group">
                              {link.Icon && (
                                <div className="w-7 h-7 rounded-full bg-gray-100 text-[#1A1A1A] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-[var(--on-accent)] transition-colors shrink-0">
                                  <link.Icon size={14} />
                                </div>
                              )}
                              <span className="font-bold text-sm text-[#1A1A1A] group-hover:underline transition-colors leading-tight">
                                {link.label}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>

              {activeItem.label === 'Attire & Rings' && (
                <div className="shrink-0 w-[260px] pt-2">
                  <h4 className="text-[#1A1A1A] text-xs font-black uppercase tracking-widest mb-5 border-b border-gray-100 pb-4">
                    Get Fashion Inspiration
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {attirePhotoGrid.map((item) => (
                      <a key={item.label} href="#" className="group flex flex-col gap-1.5">
                        <div className="rounded-xl overflow-hidden h-[90px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className="font-bold text-xs text-[#1A1A1A] group-hover:underline leading-tight">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile fullscreen menu (conditional render, inline styles for reliability) ─── */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <Logo className="h-8 w-auto" />
            <button
              style={{ padding: 8, WebkitTapHighlightColor: 'transparent' }}
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable nav body */}
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="py-2">
              {navItems.map((item) => {
                const isExpanded = mobileExpanded === item.label
                return (
                  <div key={item.label} className="border-b border-gray-100">
                    <button
                      className="flex items-center justify-between w-full px-5 text-left"
                      style={{ minHeight: 52 }}
                      onClick={() => toggleMobileSection(item.label)}
                      aria-expanded={isExpanded}
                    >
                      <span className="font-bold text-[15px] text-[#1A1A1A]">{item.label}</span>
                      <ChevronDown
                        size={18}
                        className="text-gray-400"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4">
                        {/* Card preview */}
                        <a
                          href="#"
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-3"
                          onClick={() => setMobileOpen(false)}
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.card.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#1A1A1A] truncate">{item.card.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-snug mt-0.5">{item.card.description}</p>
                          </div>
                          <ArrowRight size={14} className="text-gray-400 shrink-0" />
                        </a>

                        {/* Link columns */}
                        {item.columns.map((col, idx) => (
                          <div key={idx} className="mb-3 last:mb-0">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                              {col.title}
                            </p>
                            <div className="space-y-0.5">
                              {col.links.map((link, lIdx) => (
                                <a
                                  key={lIdx}
                                  href="#"
                                  className="flex items-center gap-3 px-1 py-2 rounded-lg"
                                  style={{ minHeight: 44 }}
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {link.Icon && (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 text-[#1A1A1A] flex items-center justify-center shrink-0">
                                      <link.Icon size={15} />
                                    </div>
                                  )}
                                  <span className="font-semibold text-sm text-[#1A1A1A] leading-tight">
                                    {link.label}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Auth buttons */}
            <div className="px-5 py-6 border-t border-gray-100 space-y-3">
              <button className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] py-3 rounded-full font-bold text-[15px] transition-colors">
                Sign up
              </button>
              <button className="w-full border border-gray-200 text-[#1A1A1A] py-3 rounded-full font-bold text-[15px] hover:bg-gray-50 transition-colors">
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
