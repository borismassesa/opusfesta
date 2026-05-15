'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListTodo, MessageCircle, User2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/my/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/my/planning', label: 'Planning', Icon: ListTodo },
  { href: '/my/inquiries', label: 'Inquiries', Icon: MessageCircle },
  { href: '/my/profile', label: 'Profile', Icon: User2 },
]

function isActive(href: string, pathname: string) {
  if (href === '/my/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export function MySidebarNav() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex w-52 shrink-0 flex-col border-r border-gray-100 bg-white pt-8 pb-6 px-3 sticky top-0 self-start h-[calc(100vh-65px)] overflow-y-auto">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-300 px-3 mb-3">
        My Wedding
      </p>
      <nav className="space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                active
                  ? 'bg-(--accent) text-(--on-accent)'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A]',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function MyMobileNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden flex overflow-x-auto border-b border-gray-100 bg-white px-3 py-2 gap-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
      {NAV.map(({ href, label, Icon }) => {
        const active = isActive(href, pathname)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors',
              active
                ? 'bg-(--accent) text-(--on-accent)'
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A]',
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
