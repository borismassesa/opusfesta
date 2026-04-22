'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navSections } from '@/content/nav'

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const nav = (
    <nav className="py-8 px-5 space-y-8 text-sm">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="micro text-gray-400 mb-3">{section.label}</p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${
                      active
                        ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-100 sticky top-0 h-screen overflow-y-auto">
        <div className="pt-8 px-5">
          <Link href="/" className="block">
            <div className="flex items-baseline gap-0.5">
              <span className="display text-2xl leading-none">Opus</span>
              <span className="display text-2xl leading-none text-[var(--accent)]">
                Festa
              </span>
            </div>
            <p className="mono text-[10px] text-gray-400 mt-1">design system · v2026.04</p>
          </Link>
        </div>
        {nav}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-40 border-r border-gray-100 overflow-y-auto transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-16 px-5">
          <Link href="/" onClick={() => setOpen(false)} className="block">
            <div className="flex items-baseline gap-0.5">
              <span className="display text-2xl leading-none">Opus</span>
              <span className="display text-2xl leading-none text-[var(--accent)]">
                Festa
              </span>
            </div>
            <p className="mono text-[10px] text-gray-400 mt-1">design system · v2026.04</p>
          </Link>
        </div>
        {nav}
      </aside>
    </>
  )
}
