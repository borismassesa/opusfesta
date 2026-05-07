'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Newspaper, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Articles', href: '/operations/articles', icon: Newspaper },
  { label: 'Submissions', href: '/operations/articles/submissions', icon: FileText },
  { label: 'Authors & invites', href: '/operations/authors', icon: UserPlus },
] as const

function matches(pathname: string, href: string): boolean {
  // Articles is the broad parent — only exact-match (or its own /[id], /new
  // children that don't collide with /submissions) so the Submissions tab
  // wins on /operations/articles/submissions.
  if (href === '/operations/articles') {
    if (pathname === href) return true
    if (pathname.startsWith('/operations/articles/submissions')) return false
    return pathname.startsWith(href + '/')
  }
  return pathname === href || pathname.startsWith(href + '/')
}

export default function ArticleNavTabs() {
  const pathname = usePathname()
  return (
    <div className="border-b border-gray-100">
      <nav className="mx-auto flex max-w-[1200px] gap-1 px-1" aria-label="Articles sections">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = matches(pathname, tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'border-[#7E5896] text-[#7E5896]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4 stroke-[1.75]" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
