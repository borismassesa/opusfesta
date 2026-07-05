'use client'

import { type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ScanLine, Users, BarChart3, User } from 'lucide-react'
import { readSession, clearAttendant } from '@/lib/session'
import LocaleToggle from './LocaleToggle'

/**
 * Shared Scan/Guests/Stats shell for the door-staff scanner. Layout ported
 * from the design prototype in apps/untitled (top nav on desktop, bottom
 * tab bar on mobile — this is primarily a mobile PWA, so the bottom bar is
 * what staff actually use); colors/type match the rest of OpusPass rather
 * than the prototype's amber/stone palette. Real routes, not client-side
 * tab state, so each screen is independently linkable/refreshable.
 */
export default function ScannerShell({ eventId, children }: { eventId: string; children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const base = `/event/${eventId}`
  const tabs = [
    { key: 'scan', label: 'Scan', href: `${base}/scan`, icon: ScanLine },
    { key: 'guests', label: 'Guests', href: `${base}/guests`, icon: Users },
    { key: 'stats', label: 'Stats', href: `${base}/stats`, icon: BarChart3 },
  ]
  const active = tabs.find((t) => pathname?.startsWith(t.href))?.key ?? 'scan'

  const [attendantName, setAttendantName] = useState('')
  const [attendantAssigned, setAttendantAssigned] = useState(false)
  useEffect(() => {
    const s = readSession(eventId)
    setAttendantName(s?.attendantName ?? '')
    setAttendantAssigned(Boolean(s?.attendantAssigned))
  }, [eventId])

  function switchAttendant() {
    clearAttendant(eventId)
    router.push(base)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1A1A1A]">
      {/* Mobile: plain flex (logo left, controls right) — the nav column is
          hidden below md, so the 3-column grid used on desktop would leave
          the controls stuck at the midpoint of an empty middle column
          instead of flush with the edge. Desktop: grid so the nav can sit
          truly centered regardless of the width on either side of it. */}
      <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-black/[0.06] bg-white/80 px-8 backdrop-blur-md md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-2.5 md:justify-self-start">
          <Image src="/assets/logo/OpusPass Logo.svg" alt="OpusPass" width={203} height={65} unoptimized className="h-8 w-auto" />
        </div>

        <nav className="hidden items-center gap-1 md:flex md:justify-self-center">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex h-16 items-center border-b-2 px-5 text-xs font-medium tracking-wide uppercase transition-colors ${
                active === tab.key
                  ? 'border-[#8e57b3] text-[#8e57b3]'
                  : 'border-transparent text-[#1A1A1A] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:justify-self-end">
          <LocaleToggle />
          {attendantName ? (
            attendantAssigned ? (
              // Admin-assigned code: the badge is informational only — no
              // way to "switch" to a different identity on the same code.
              <span
                className="flex items-center gap-2.5 rounded-full border border-black/[0.1] px-4 py-2 text-xs font-medium text-[#1A1A1A]"
                title={`${attendantName} (assigned by admin)`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0DFF6] text-[#8e57b3]">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span className="hidden sm:inline">{attendantName}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={switchAttendant}
                className="flex items-center gap-2.5 rounded-full border border-black/[0.1] px-4 py-2 text-xs font-medium text-[#1A1A1A] transition-colors hover:border-black/[0.2] hover:bg-black/[0.03]"
                title="Switch attendant"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0DFF6] text-[#8e57b3]">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span className="hidden sm:inline">{attendantName}</span>
              </button>
            )
          ) : null}
        </div>
      </header>

      <main className="flex-1 pt-16 pb-20 md:pb-0">{children}</main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-black/[0.06] bg-white/90 px-6 py-3.5 backdrop-blur-lg md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex w-20 flex-col items-center justify-center gap-1.5 rounded-lg py-2.5 transition-colors ${
                active === tab.key ? 'bg-[#F0DFF6] text-[#8e57b3]' : 'text-[#1A1A1A]'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="text-[10px] tracking-wide uppercase">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
