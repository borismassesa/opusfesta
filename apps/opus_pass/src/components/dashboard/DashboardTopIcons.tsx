'use client'

import Link from 'next/link'
import { MessagesSquare, Heart } from 'lucide-react'
import CartMenu from '@/components/CartMenu'
import NotificationsBell from '@/components/NotificationsBell'

// Shared right-aligned icon cluster for the dashboard header (desktop + mobile).
// Message → vendor inquiries; Heart → favorites (destination still to be wired);
// Bell + Cart reuse the existing navbar components so behaviour stays identical
// to the public site (unread polling, cart count).
const ICON_BUTTON =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 sm:h-10 sm:w-10 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2'

export default function DashboardTopIcons() {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <Link href="/my/dashboard/inquiries" aria-label="Messages" className={ICON_BUTTON}>
        <MessagesSquare size={18} className="text-[#1A1A1A]" />
      </Link>
      {/* Favorites — destination still to be wired; kept in place per the header design. */}
      <Link href="#" aria-label="Favorites" className={ICON_BUTTON}>
        <Heart size={18} />
      </Link>
      <NotificationsBell />
      <CartMenu />
    </div>
  )
}
