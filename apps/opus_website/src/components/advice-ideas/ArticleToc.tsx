'use client'

import { useEffect, useRef, useState } from 'react'
import useArticleRailVisibility from '@/components/advice-ideas/useArticleRailVisibility'

type Item = { id: string; label: string }

export default function ArticleToc({ items }: { items: Item[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')
  const reduceMotion = useRef(false)
  const visible = useArticleRailVisibility()

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  }, [])

  // Track the section closest to the top of the viewport.
  useEffect(() => {
    if (items.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [items])

  if (items.length === 0) return null

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({
      behavior: reduceMotion.current ? 'auto' : 'smooth',
      block: 'start',
    })
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav
      aria-label="On this page"
      className={`pointer-events-none fixed top-1/2 z-30 hidden w-[200px] -translate-y-1/2 transition-opacity duration-300 xl:block right-[max(16px,calc(50%-480px-200px-24px))] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ol className="pointer-events-auto relative border-l border-gray-200">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <li key={item.id} className="relative">
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -left-px top-0 h-full w-[2px] bg-[var(--accent-hover)]"
                />
              )}
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`block py-2 pl-5 pr-2 text-[14px] leading-snug transition-colors ${
                  isActive
                    ? 'font-semibold text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
