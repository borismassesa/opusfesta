'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  title: string
  level: number
}

interface DynamicTocProps {
  contentContainerId?: string
  className?: string
  sticky?: boolean
}

export function DynamicToc({ contentContainerId = 'content', className = '', sticky = true }: DynamicTocProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const extractHeadings = () => {
      const container = document.getElementById(contentContainerId)
      if (!container) return []

      const headings = container.querySelectorAll('h2, h3')
      const items: TocItem[] = []

      headings.forEach(heading => {
        const element = heading as HTMLElement
        const title = element.textContent?.trim()
        if (!title) return

        let id = element.id
        if (!id) {
          id = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
          element.id = id
        }

        const level = element.tagName === 'H2' ? 2 : 3
        items.push({ id, title, level })
      })

      return items
    }

    const timer = setTimeout(() => {
      const items = extractHeadings()
      setTocItems(items)
      if (items.length > 0) {
        setActiveId(items[0].id)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [contentContainerId])

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    })

    const container = document.getElementById(contentContainerId)
    if (container) {
      const headings = container.querySelectorAll('h2, h3')
      headings.forEach(heading => observer.observe(heading))
    }

    return () => observer.disconnect()
  }, [contentContainerId, tocItems])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  const groupedItems: Array<{ main: TocItem; subs: TocItem[] }> = []
  let currentGroup: { main: TocItem; subs: TocItem[] } | null = null

  tocItems.forEach(item => {
    if (item.level === 2) {
      if (currentGroup) groupedItems.push(currentGroup)
      currentGroup = { main: item, subs: [] }
      return
    }

    if (item.level === 3) {
      if (currentGroup) {
        currentGroup.subs.push(item)
      } else {
        groupedItems.push({ main: item, subs: [] })
      }
    }
  })
  if (currentGroup) groupedItems.push(currentGroup)

  const rootClassName = `${sticky ? 'sticky top-24' : ''} ${className}`.trim()

  return (
    <div className={rootClassName}>
      <h3 className='text-foreground mb-3.5 font-medium'>On This Page</h3>
      <nav>
        <ul className='space-y-3'>
          {groupedItems.map((group, groupIndex) => (
            <li key={`toc-group-${group.main.id}-${groupIndex}`}>
              <button
                type='button'
                onClick={() => handleClick(group.main.id)}
                className={`flex items-start gap-2 text-left transition-colors ${
                  activeId === group.main.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className={`mt-2.5 inline-block h-0.5 w-3 shrink-0 transition-colors ${
                    activeId === group.main.id ? 'bg-primary' : 'bg-primary/40'
                  }`}
                />
                <span>{group.main.title}</span>
              </button>
              {group.subs.length > 0 && (
                <ul className='mt-3 ml-5 space-y-3'>
                  {group.subs.map((subtitle, subIndex) => (
                    <li key={`toc-sub-${subtitle.id}-${subIndex}`}>
                      <button
                        type='button'
                        onClick={() => handleClick(subtitle.id)}
                        className={`flex items-start gap-2 text-left transition-colors ${
                          activeId === subtitle.id
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span
                          className={`mt-2.5 inline-block h-0.5 w-3 shrink-0 transition-colors ${
                            activeId === subtitle.id ? 'bg-primary' : 'bg-primary/40'
                          }`}
                        />
                        <span>{subtitle.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
