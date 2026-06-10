'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import CartMenu from '@/components/CartMenu'
import { UserButton, useUser } from '@clerk/nextjs'
import {
  Menu,
  X,
  ChevronDown,
  Heart,
  Users,
  MapPin,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Link as LinkIcon,
  Globe,
  BookOpen,
  PenLine,
  Monitor,
  Image as ImageIcon,
  Share2,
} from 'lucide-react'

type NavLink = { label: string; href?: string; Icon?: LucideIcon; subLinks?: string[] }
type PhotoGridItem = { label: string; image: string; href?: string }

const guestsPhotoGrid: PhotoGridItem[] = [
  { label: 'Guest List', image: '/assets/images/mauzo_crew.jpg', href: '/guests-and-rsvp' },
  { label: 'RSVP Tracking', image: '/assets/images/churchcouples.jpg', href: '/guests-and-rsvp' },
  { label: 'Invitations', image: '/assets/images/cutesy_couple.jpg', href: '/invitations' },
  { label: 'Seating Plan', image: '/assets/images/couples_together.jpg', href: '/guests-and-rsvp' },
]

const websitesPhotoGrid: PhotoGridItem[] = [
  { label: 'Templates', image: '/assets/images/coupleswithpiano.jpg' },
  { label: 'Photo Gallery', image: '/assets/images/beautiful_bride.jpg' },
  { label: 'RSVPs', image: '/assets/images/authentic_couple.jpg' },
  { label: 'Travel Info', image: '/assets/images/bride_umbrella.jpg' },
]

const navItems: Array<{
  label: string
  card: { image: string; title: string; description: string; linkText: string; href?: string }
  columns: Array<{ title: string; links: NavLink[] }>
  photoGridTitle?: string
  photoGrid?: PhotoGridItem[]
}> = [
  {
    label: 'Invitations',
    card: {
      image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
      title: 'WEDDING INVITATIONS',
      description: 'Designer-worthy digital invitations for every wedding moment, sent by WhatsApp or SMS.',
      linkText: 'Browse all designs',
      href: '/invitations',
    },
    columns: [
      {
        title: 'Browse',
        links: [
          { Icon: Users, label: 'All Designs', href: '/invitations/catalog' },
          { Icon: CheckCircle2, label: 'Save the Dates', href: '/invitations/save-the-date' },
          { Icon: MessageCircle, label: 'Wedding Invitations', href: '/invitations/wedding' },
          { Icon: MapPin, label: 'Send-Off & Kitchen Party', href: '/invitations/send-off' },
          { Icon: Heart, label: 'Kadi za Michango', href: '/invitations/kadi-za-michango' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { Icon: BookOpen, label: 'Invitation Wording', href: '/invitations' },
          { Icon: PenLine, label: 'RSVP Wording Ideas', href: '/invitations' },
        ],
      },
    ],
    photoGridTitle: 'Wedding Paper',
    photoGrid: guestsPhotoGrid.map((item) => ({ ...item, href: '/invitations' })),
  },
  {
    label: "Guests & RSVP's",
    card: {
      image: '/assets/images/mauzo_crew.jpg',
      title: 'GUESTS & RSVPS',
      description: 'Send digital invites by WhatsApp or SMS and watch RSVPs roll in live.',
      linkText: 'Manage your guests',
      href: '/guests-and-rsvp',
    },
    columns: [
      {
        title: 'Manage',
        links: [
          { Icon: Users, label: 'Guest List Manager', href: '/guests-and-rsvp' },
          { Icon: CheckCircle2, label: 'RSVP Tracking', href: '/guests-and-rsvp' },
          { Icon: Share2, label: 'WhatsApp & SMS Send', href: '/guests-and-rsvp' },
          { Icon: MapPin, label: 'Seating Chart', href: '/guests-and-rsvp' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { Icon: BookOpen, label: 'RSVP Wording Ideas', href: '/guests-and-rsvp' },
          { Icon: PenLine, label: 'Guest Etiquette Tips', href: '/guests-and-rsvp' },
        ],
      },
    ],
    photoGridTitle: 'Guest Tools',
    photoGrid: guestsPhotoGrid,
  },
  {
    label: 'Wedding Website',
    card: {
      image: 'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?auto=format&fit=crop&w=800&q=80',
      title: 'WEDDING WEBSITE',
      description: 'Build a beautiful wedding website in minutes and share it with your guests.',
      linkText: 'Create your website',
      href: '/websites',
    },
    columns: [
      {
        title: 'Features',
        links: [
          { Icon: Globe, label: 'Free Wedding Website', href: '/websites' },
          { Icon: LinkIcon, label: 'Custom Link', href: '/websites' },
          { Icon: Heart, label: 'Beautiful Templates', href: '/websites' },
          { Icon: CheckCircle2, label: 'RSVP Collection', href: '/websites' },
          { Icon: MapPin, label: 'Venue & Travel Info', href: '/websites' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { Icon: Monitor, label: 'Website Examples', href: '/websites' },
          { Icon: ImageIcon, label: 'Photo Gallery Tips', href: '/websites' },
          { Icon: Share2, label: 'Sharing with Guests', href: '/websites' },
        ],
      },
    ],
    photoGridTitle: 'Website Ideas',
    photoGrid: websitesPhotoGrid.map((item) => ({ ...item, href: '/websites' })),
  },
]

export default function Navbar() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const { isSignedIn, isLoaded } = useUser()
  const activeItem = activeMenu ? navItems.find((i) => i.label === activeMenu) ?? null : null

  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)

  // Body lock + focus management for mobile nav
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    mobileCloseRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      hamburgerRef.current?.focus()
    }
  }, [mobileOpen])

  const closeMobile = () => {
    setMobileOpen(false)
    setMobileExpanded(null)
  }

  const getNavHref = (href?: string) => href ?? '#'

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
      <nav className="relative z-50 mx-auto flex max-w-344 items-center justify-between bg-white px-3 py-3.5 sm:px-4 sm:py-4 lg:px-3 xl:px-2">
        {/* Left: logo + desktop nav */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-6 lg:gap-5">
          <Link href="/" aria-label="OpusPass home" className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden lg:flex gap-1 font-semibold text-[15px]">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onMouseEnter={() => setActiveMenu(item.label)}
                onFocus={() => setActiveMenu(item.label)}
                onClick={() => {
                  setActiveMenu(null)
                  router.push(getNavHref(item.card.href))
                }}
                aria-expanded={activeMenu === item.label}
                aria-haspopup="true"
                className={`px-4 py-2.5 rounded-full transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
                  activeMenu === item.label
                    ? 'bg-(--accent) text-(--on-accent)'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: cart + auth + hamburger */}
        <div className="flex shrink-0 items-center gap-1 font-semibold text-sm sm:gap-2 lg:text-[15px]">
          {/* Cart — available signed in or out so guests can build an order pre-signup */}
          <CartMenu />

          {/* Auth — Log in / Sign up when signed out, Dashboard + account when signed in */}
          {isLoaded && !isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="hidden shrink-0 rounded-full px-3.5 py-2 text-xs font-bold whitespace-nowrap text-gray-700 transition-colors hover:bg-gray-100 sm:inline-flex sm:px-5 sm:text-sm lg:px-5.5 lg:py-2.5 lg:text-[15px]"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="shrink-0 rounded-full bg-(--accent) px-3.5 py-2 text-xs font-bold whitespace-nowrap text-(--on-accent) transition-colors hover:bg-(--accent-hover) sm:px-5 sm:text-sm lg:px-5.5 lg:py-2.5 lg:text-[15px]"
              >
                Sign up
              </Link>
            </>
          ) : isLoaded ? (
            <>
              <Link
                href="/my/dashboard"
                className="shrink-0 rounded-full bg-(--accent) px-3.5 py-2 text-xs font-bold whitespace-nowrap text-(--on-accent) transition-colors hover:bg-(--accent-hover) sm:px-5 sm:text-sm lg:px-5.5 lg:py-2.5 lg:text-[15px]"
              >
                Dashboard
              </Link>
              <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
            </>
          ) : null}
          <button
            ref={hamburgerRef}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 lg:hidden sm:h-10 sm:w-10 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
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
              <div className="relative h-36 overflow-hidden">
                <Image
                  src={activeItem.card.image}
                  alt=""
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold mb-1.5 text-[#1A1A1A] leading-tight">
                  {activeItem.card.title}
                </h3>
                <p className="text-gray-500 text-xs font-medium mb-5 leading-relaxed">
                  {activeItem.card.description}
                </p>
                <Link
                  href={getNavHref(activeItem.card.href)}
                  className="mt-auto inline-flex items-center gap-2 text-[#1A1A1A] font-bold text-sm hover:gap-3 transition-all group"
                >
                  {activeItem.card.linkText}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>

              </div>
            </div>

            {/* Link columns */}
            <div className="flex-1 flex gap-10 pt-1">
              {activeItem.columns.map((col, idx) => (
                <div key={idx} className="flex-1 min-w-[180px]">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4 pb-3 border-b border-gray-200">
                    {col.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link
                          href={getNavHref(link.href)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl group hover:bg-white transition-colors"
                        >
                          {link.Icon && (
                            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-(--accent) group-hover:text-(--on-accent) transition-colors shrink-0">
                              <link.Icon size={13} />
                            </div>
                          )}
                          <span className="font-semibold text-sm text-[#1A1A1A] leading-tight whitespace-nowrap group-hover:text-[#1A1A1A]">
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Visual support grid */}
            {activeItem.photoGrid ? (
              <div className="shrink-0 w-[240px] pt-1">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4 pb-3 border-b border-gray-200">
                  {activeItem.photoGridTitle ?? 'Get Inspired'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {activeItem.photoGrid.map((item) => (
                    <Link key={item.label} href={getNavHref(item.href)} className="group flex flex-col gap-1.5">
                      <div className="relative rounded-xl overflow-hidden h-[88px] border border-gray-200">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="120px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="font-semibold text-xs text-[#1A1A1A] leading-tight px-0.5">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

        </div>
      )}

      {/* ── Mobile: full-screen menu ──
          `invisible` must accompany the off-screen translate: Tailwind v4 compiles
          translate utilities to the standalone `translate` property, which old
          Android WebViews (< Chromium 104, e.g. WhatsApp in-app browsers) ignore —
          without visibility the closed menu covers the page and blocks every tap. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`lg:hidden fixed inset-0 bg-white z-50 flex flex-col transition-[transform,translate,visibility] duration-300 ease-in-out ${
          mobileOpen ? 'visible translate-y-0' : 'invisible -translate-y-full'
        }`}
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
            <Link href="/" aria-label="OpusPass home" onClick={closeMobile}>
              <Logo />
            </Link>
          )}
          <button
            ref={mobileCloseRef}
            onClick={closeMobile}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sliding panels container */}
        <div className="flex-1 overflow-hidden relative">
          {/* Panel 1 — main nav list */}
          <div
            className={`absolute inset-0 flex flex-col transition-[transform,translate,visibility] duration-300 ease-in-out ${
              mobileExpanded ? 'invisible -translate-x-full' : 'visible translate-x-0'
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

            {/* Footer CTA — auth */}
            <div className="shrink-0 px-4 py-5 border-t border-gray-100 flex flex-col gap-2.5">
              {isLoaded && !isSignedIn ? (
                <>
                  <Link
                    href="/sign-up"
                    onClick={closeMobile}
                    className="w-full text-center bg-(--accent) hover:bg-(--accent-hover) text-(--on-accent) py-3 rounded-full font-bold text-sm transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={closeMobile}
                    className="w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 rounded-full font-bold text-sm transition-colors"
                  >
                    Log in
                  </Link>
                </>
              ) : isLoaded ? (
                <Link
                  href="/my/dashboard"
                  onClick={closeMobile}
                  className="w-full text-center bg-(--accent) hover:bg-(--accent-hover) text-(--on-accent) py-3 rounded-full font-bold text-sm transition-colors"
                >
                  Dashboard
                </Link>
              ) : null}
            </div>
          </div>

          {/* Panel 2 — sub-items for the selected section */}
          <div
            className={`absolute inset-0 flex flex-col transition-[transform,translate,visibility] duration-300 ease-in-out ${
              mobileExpanded ? 'visible translate-x-0' : 'invisible translate-x-full'
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
                      <Image
                        src={item.card.image}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
                        <p className="text-white text-xs font-medium leading-snug mb-2 opacity-90">
                          {item.card.description}
                        </p>
                        <Link
                          href={getNavHref(item.card.href)}
                          onClick={closeMobile}
                          className="inline-flex items-center gap-1.5 bg-white text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full"
                        >
                          {item.card.linkText}
                          <ArrowRight size={11} />
                        </Link>
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
                              <Link
                                href={getNavHref(link.href)}
                                onClick={closeMobile}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                              >
                                {link.Icon && (
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-500 shrink-0 shadow-sm">
                                    <link.Icon size={15} />
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-[#1A1A1A] flex-1">{link.label}</span>
                                <ChevronDown size={14} className="-rotate-90 text-gray-300 shrink-0" />
                              </Link>
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
