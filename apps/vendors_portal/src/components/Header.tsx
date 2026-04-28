'use client'

import Link from 'next/link'
import { Bell, ChevronRight, ExternalLink, HelpCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { bookings } from '@/lib/mock-data'
import { eventDateLabel, relativeDays } from '@/lib/bookings'

const SEGMENT_LABELS: Record<string, string> = {
  leads: 'Leads',
  storefront: 'Storefront',
  portfolio: 'Portfolio',
  bookings: 'Bookings',
  reviews: 'Reviews',
  'lead-preferences': 'Lead preferences',
  plans: 'Plans',
  boost: 'Boost storefront',
  insights: 'Insights',
  help: 'Help center',
  feedback: 'Feedback',
  settings: 'Settings',
  resources: 'Resources',
}

type PageHeading = { title: string; subtitle: string }

const PAGE_HEADINGS: Record<string, PageHeading> = {
  '/': {
    title: 'Welcome back, OpusFesta Photography.',
    subtitle: "Here's what's happening with your storefront today.",
  },
  '/leads': {
    title: 'Leads',
    subtitle: 'Inquiries from interested couples. Reply within 24 hours to boost your match rate.',
  },
  '/reviews': {
    title: 'Reviews',
    subtitle: 'Auto-collected from couples after every event. Reply, pin, or request a review.',
  },
}

function humanize(seg: string): string {
  return seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type Crumb = { label: string; href: string }

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === '/') return []
  const segs = pathname.split('/').filter(Boolean)
  return segs.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? humanize(seg),
    href: '/' + segs.slice(0, i + 1).join('/'),
  }))
}

function useStorefrontHeading(pathname: string): PageHeading | null {
  const { draft, hydrated } = useOnboardingDraft()
  if (!pathname.startsWith('/storefront')) return null
  if (!hydrated) return { title: 'Storefront', subtitle: 'Manage your storefront.' }
  const section = getStorefrontSections(draft).find(
    (s) => pathname === s.href || pathname.startsWith(s.href + '/'),
  )
  if (!section) return { title: 'Storefront', subtitle: 'Manage your storefront.' }
  return { title: section.pageTitle, subtitle: section.pageDescription }
}

function useBookingsHeading(pathname: string): PageHeading | null {
  if (!pathname.startsWith('/bookings')) return null

  if (pathname === '/bookings') {
    return {
      title: 'Bookings',
      subtitle: 'Track every couple from quote to wedding day.',
    }
  }
  if (pathname === '/bookings/calendar') {
    return {
      title: 'Bookings calendar',
      subtitle: 'See every booked, pending, and off-day at a glance.',
    }
  }

  // /bookings/[id]
  const id = pathname.split('/')[2]
  const b = bookings.find((x) => x.id === id)
  if (!b) {
    return { title: 'Booking', subtitle: 'Booking details and timeline.' }
  }
  return {
    title: b.couple,
    subtitle: `${eventDateLabel(b.date)} · ${relativeDays(b.date).toLowerCase()} · ${b.packageName}`,
  }
}

export function Header() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)
  const storefrontHeading = useStorefrontHeading(pathname)
  const bookingsHeading = useBookingsHeading(pathname)
  const heading = PAGE_HEADINGS[pathname] ?? storefrontHeading ?? bookingsHeading
  const isStorefront = pathname.startsWith('/storefront')

  return (
    <header className="flex items-center justify-between py-6 px-8 bg-gray-50/50 relative z-10 w-full shrink-0">
      {heading ? (
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight truncate">
            {heading.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1 truncate">{heading.subtitle}</p>
        </div>
      ) : (
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500 truncate">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1
              return (
                <li key={c.href} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden />
                  )}
                  {isLast ? (
                    <span className="font-semibold text-gray-900 truncate">{c.label}</span>
                  ) : (
                    <Link
                      href={c.href}
                      className="hover:text-gray-900 transition-colors truncate"
                    >
                      {c.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <div className="flex items-center gap-4 shrink-0">
        {isStorefront ? (
          <Link
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
          >
            View public storefront
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : null}

        <button
          type="button"
          aria-label="Help"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 border-2 border-gray-50 rounded-full" />
        </button>

        <div className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm bg-[#F0DFF6] text-[#7E5896] font-bold flex items-center justify-center text-sm">
          OP
        </div>
      </div>
    </header>
  )
}
