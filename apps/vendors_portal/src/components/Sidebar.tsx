'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CalendarCheck,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from './ui/Logo'

type NavItem = { icon: LucideIcon; label: string; href: string; badge?: string }

const topItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Inbox, label: 'Leads', href: '/leads', badge: '12' },
]

const mainItems: NavItem[] = [
  { icon: Store, label: 'Storefront', href: '/storefront' },
  { icon: ImageIcon, label: 'Portfolio', href: '/portfolio' },
  { icon: CalendarCheck, label: 'Bookings', href: '/bookings' },
  { icon: Star, label: 'Reviews', href: '/reviews' },
]

const growthItems: NavItem[] = [
  { icon: SlidersHorizontal, label: 'Lead preferences', href: '/lead-preferences' },
  { icon: Sparkles, label: 'Plans', href: '/plans' },
  { icon: Rocket, label: 'Boost storefront', href: '/boost', badge: 'NEW' },
  { icon: BarChart3, label: 'Insights', href: '/insights' },
]

const bottomNavItems: NavItem[] = [
  { icon: HelpCircle, label: 'Help center', href: '/help' },
  { icon: MessageSquare, label: 'Feedback', href: '/feedback' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

const COLLAPSED_KEY = 'opusfesta:vendors-sidebar-collapsed'

function isItemActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

function SidebarLink({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem
  collapsed: boolean
  pathname: string
}) {
  const Icon = item.icon
  const isActive = isItemActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'relative flex items-center rounded-xl text-sm font-semibold transition-colors',
        collapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full justify-between px-3 py-2.5',
        isActive
          ? 'bg-[#F0DFF6] text-[#7E5896]'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
      )}
    >
      {collapsed ? (
        <>
          <Icon className="w-5 h-5 stroke-[1.5]" />
          {item.badge && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A0DC] ring-2 ring-white" />
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 stroke-[1.5]" />
            {item.label}
          </div>
          {item.badge && (
            <span className="bg-[#C9A0DC] text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center tabular-nums">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(COLLAPSED_KEY) === '1') setCollapsed(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const toggle = () => setCollapsed((c) => !c)
  const expand = () => setCollapsed(false)

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 py-6 transition-[width] duration-200 ease-out',
        collapsed ? 'w-[72px] px-2' : 'w-64 px-4',
      )}
    >
      <div
        className={cn(
          'flex items-center mb-6',
          collapsed ? 'justify-center' : 'justify-between px-3',
        )}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center" aria-label="Home">
            <Logo className="h-7 w-auto" />
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={expand}
          aria-label="Search"
          className="self-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-lg transition-colors mb-4"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <div className="px-1 mb-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-12 py-2 bg-gray-50 border border-gray-100 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all"
            />
            <span className="absolute right-2 text-[10px] text-gray-400 font-medium border border-gray-200 bg-white rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </div>
        </div>
      )}

      <div className={cn('flex-1 overflow-y-auto overflow-x-hidden space-y-4')}>
        <nav className="space-y-1">
          {topItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        {!collapsed && (
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Your business
          </p>
        )}
        <nav className="space-y-1">
          {mainItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        {!collapsed && (
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Grow
          </p>
        )}
        <nav className="space-y-1">
          {growthItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </nav>
      </div>

      <div className={cn('mt-auto border-t border-gray-100 pt-4 space-y-1')}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors',
                collapsed ? 'justify-center w-12 h-12 mx-auto' : 'gap-3 px-3 py-2',
              )}
            >
              <Icon className="w-5 h-5 stroke-[1.5]" />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
