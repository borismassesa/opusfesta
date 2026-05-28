'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarHeart,
  Send,
  ClipboardCheck,
  Globe,
  Settings,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/my/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/my/dashboard/guests', label: 'Guest list', icon: Users },
  { href: '/my/dashboard/events', label: 'Events', icon: CalendarHeart },
  { href: '/my/dashboard/invitations', label: 'Send invites', icon: Send },
  { href: '/my/dashboard/rsvps', label: 'RSVPs', icon: ClipboardCheck },
  { href: '/my/dashboard/website', label: 'Wedding website', icon: Globe },
  { href: '/my/dashboard/settings', label: 'Settings', icon: Settings },
] as const

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/my/dashboard' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-[#C9A0DC]/15 text-[#1A1A1A]'
                : 'text-[#1A1A1A]/60 hover:bg-black/[0.04] hover:text-[#1A1A1A]'
            )}
          >
            <Icon className={cn('h-[18px] w-[18px]', active ? 'text-[#8e57b3]' : 'text-[#1A1A1A]/40')} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function DashboardShell({
  coupleName,
  userEmail,
  userInitial,
  children,
}: {
  coupleName: string
  userEmail: string
  userInitial: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/[0.06] bg-white px-4 py-6 lg:flex">
        <Link href="/" className="px-2">
          <Logo className="text-2xl" />
        </Link>
        <p className="mt-1 px-2 text-xs text-[#1A1A1A]/45">{coupleName}</p>
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <div className="space-y-2 border-t border-black/[0.06] pt-4">
          <Link
            href="/invitations"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#1A1A1A]/60 hover:bg-black/[0.04]"
          >
            <ExternalLink className="h-4 w-4" /> Browse designs
          </Link>
          <AccountFooter email={userEmail} initial={userInitial} />
        </div>
      </aside>

      {/* Top bar — mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/[0.05]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo className="text-xl" />
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A0DC]/25 text-xs font-bold text-[#8e57b3]"
          aria-hidden="true"
        >
          {userInitial}
        </span>
      </header>

      {/* Drawer — mobile */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Logo className="text-xl" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-black/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-[#1A1A1A]/45">{coupleName}</p>
            <div className="mt-6">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="mt-6 border-t border-black/[0.06] pt-4">
              <AccountFooter email={userEmail} initial={userInitial} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  )
}

function AccountFooter({ email, initial }: { email: string; initial: string }) {
  return (
    <div className="flex items-center gap-3 px-3 pt-1">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A0DC]/25 text-xs font-bold text-[#8e57b3]"
        aria-hidden="true"
      >
        {initial}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-[#1A1A1A]/60" title={email}>
        {email}
      </span>
    </div>
  )
}
