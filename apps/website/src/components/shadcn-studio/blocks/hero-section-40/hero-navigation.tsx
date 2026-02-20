'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useMedia } from 'react-use'
import gsap from 'gsap'
import { ChevronRightIcon, CircleSmallIcon } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import {
  PrimaryOrionButton,
  SecondaryOrionButton
} from '@/components/ui/orion-button'

import { cn } from '@/lib/utils'


type NavigationSection = {
  type: 'section'
  title: string
  items: NavigationItem[]
}

type NavigationItem = {
  title: string
  href: string
  icon?: ReactNode
  badge?: ReactNode
  description?: string
}

type Navigation = {
  title: string
  contentClassName?: string
} & (
  | {
      items: NavigationSection[]
      splitItems: true
      href?: never
    }
  | {
      items: NavigationItem[]
      splitItems?: never | false
      href?: never
    }
  | {
      items?: never
      splitItems?: never
      href: string
    }
)

const ListItem = (props: {
  title: NavigationItem['title']
  href: NavigationItem['href']
  icon?: NavigationItem['icon']
  badge?: NavigationItem['badge']
  description?: NavigationItem['description']
  splitItems?: boolean
}) => {
  const { title, href, icon, badge, description, splitItems } = props

  return (
    <li className={cn('list-none', { 'h-19.5': description && splitItems })}>
      <NavigationMenuLink
        href={href}
        className={cn(
          'group block rounded-xl border border-transparent px-2.5 py-2.5 transition-colors hover:border-border/70 hover:bg-muted/50',
          { 'flex flex-row items-start gap-2': icon }
        )}
      >
        {icon && (
          <span className='bg-background/75 [&>svg]:!text-foreground flex aspect-square size-7.5 shrink-0 items-center justify-center rounded-lg border border-border/50 [&>svg]:!size-4.5'>
            {icon}
          </span>
        )}
        {description ? (
          <div className='space-y-1'>
            <div className={cn('font-medium', { 'flex items-center gap-1.5': badge })}>
              {title}
              {badge}
            </div>
            <p className='text-muted-foreground line-clamp-2 text-sm'>{description}</p>
          </div>
        ) : (
          <div className={cn('font-medium', { 'flex items-center gap-1.5': badge })}>
            {title}
            {badge}
          </div>
        )}
      </NavigationMenuLink>
    </li>
  )
}

const HeroNavigation = ({
  navigationData,
  navigationClassName
}: {
  navigationData: Navigation[]
  navigationClassName?: string
}) => {
  return (
    <NavigationMenu className={cn('hidden lg:block', navigationClassName)}>
      <NavigationMenuList className='flex-wrap gap-1'>
        {navigationData.map(navItem => {
          if (navItem.href) {
            // Root link item
            return (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuLink
                  href={navItem.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'group relative h-9 rounded-full bg-transparent px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground after:absolute after:bottom-0.5 after:left-3.5 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-[calc(100%-1.75rem)]'
                  )}
                >
                  {navItem.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }

          // Section with dropdown
          return (
            <NavigationMenuItem key={navItem.title}>
              <NavigationMenuTrigger className='group relative h-9 rounded-full bg-transparent px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground data-[state=open]:bg-transparent data-[state=open]:text-foreground data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent after:absolute after:bottom-0.5 after:left-3.5 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 data-[state=open]:after:w-[calc(100%-1.75rem)] [&_svg]:ml-1.5 [&_svg]:size-3.5 [&_svg]:text-muted-foreground [&_svg]:transition-transform data-[state=open]:[&_svg]:rotate-180 data-[state=open]:[&_svg]:text-foreground'>
                {navItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className='rounded-2xl bg-background/95 p-4 shadow-[0_26px_60px_-38px_rgba(0,0,0,0.7)] backdrop-blur-xl'>
                {navItem.splitItems ? (
                  <div className={cn('grid grid-cols-1 gap-2', navItem.contentClassName)}>
                    {navItem.items.map(section => (
                      <div key={section.title} className='grid grid-cols-1 gap-3'>
                        <div className='text-muted-foreground px-2 text-xs font-semibold uppercase tracking-[0.12em]'>
                          {section.title}
                        </div>
                        <ul
                          className={cn('grid grid-cols-1 gap-0.5', {
                            'gap-3': section.items.find(item => item.description)
                          })}
                        >
                          {section.items.map((item, index) => (
                            <ListItem
                              key={index}
                              icon={item.icon}
                              title={item.title}
                              description={item.description}
                              href={item.href}
                              badge={item.badge}
                              splitItems={navItem.splitItems}
                            />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul
                    className={cn(
                      'grid grid-cols-1 gap-0.5',
                      { 'gap-2': navItem.items?.find(item => item.description) },
                      navItem.contentClassName
                    )}
                  >
                    {navItem.items?.map((item, index) => (
                      <ListItem
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        href={item.href}
                        badge={item.badge}
                      />
                    ))}
                  </ul>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const HeroNavigationSmallScreen = ({
  navigationData,
  triggerClassName,
  screenSize = 1023,
  isScrolled = false
}: {
  navigationData: Navigation[]
  triggerClassName?: string
  screenSize?: number
  isScrolled?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isMobile = useMedia(`(max-width: ${screenSize}px)`, false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  const handleLinkClick = () => {
    setOpen(false)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setOpen(false)
    }
  }, [isMobile])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) {
      return
    }

    const navItems = linksRef.current?.querySelectorAll('[data-nav-item]')

    if (open) {
      const tl = gsap.timeline()
      tl.to(overlay, {
        clipPath: 'inset(0 0 0 0)',
        duration: 0.55,
        ease: 'power4.inOut',
        pointerEvents: 'all'
      })

      if (navItems?.length) {
        tl.fromTo(
          navItems,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.38,
            stagger: 0.045,
            ease: 'power2.out'
          },
          '-=0.18'
        )
      }
    } else {
      gsap.to(overlay, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.5,
        ease: 'power4.inOut',
        pointerEvents: 'none'
      })
    }
  }, [open])

  const getSubItems = (navItem: Navigation): NavigationItem[] => {
    if (!('items' in navItem) || !navItem.items) {
      return []
    }
    if (navItem.splitItems) {
      return navItem.items.flatMap(section => section.items)
    }
    return navItem.items
  }

  const overlayContent = (
    <div
      ref={overlayRef}
      className='fixed inset-0 z-40 flex flex-col justify-center bg-background/95 px-6 backdrop-blur-xl xl:hidden'
      style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
    >
      <div ref={linksRef} className='mx-auto w-full max-w-xl space-y-2 text-center'>
        {navigationData.map((navItem, index) => {
          if (navItem.href) {
            return (
              <a
                data-nav-item
                key={navItem.title}
                href={navItem.href}
                onClick={handleLinkClick}
                className='text-secondary hover:text-primary block py-1 text-4xl font-bold tracking-tight transition-colors sm:text-5xl'
              >
                {navItem.title}
              </a>
            )
          }

          return (
            <Collapsible key={index} className='w-full' data-nav-item>
              <CollapsibleTrigger className='text-secondary hover:text-primary group mx-auto flex items-center justify-center gap-2 py-1 text-4xl font-bold tracking-tight transition-colors sm:text-5xl'>
                {navItem.title}
                <ChevronRightIcon className='size-7 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-90' />
              </CollapsibleTrigger>
              <CollapsibleContent className='data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down mx-auto mt-3 max-w-lg overflow-hidden'>
                <div className='grid grid-cols-1 gap-1.5 rounded-2xl border border-border/60 bg-background/60 p-3 text-left shadow-sm backdrop-blur'>
                  {getSubItems(navItem).map((subItem, subIndex) => (
                    <a
                      key={`${subItem.title}-${subIndex}`}
                      href={subItem.href}
                      className='hover:bg-accent/70 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium'
                      onClick={handleLinkClick}
                    >
                      {subItem.icon ? subItem.icon : <CircleSmallIcon className='size-4' />}
                      {subItem.title}
                    </a>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}

        <div data-nav-item className='mx-auto my-4 h-px w-20 bg-border' />

        <div
          data-nav-item
          className='mx-auto w-full max-w-sm rounded-2xl border border-border/70 bg-background/65 p-3 shadow-sm backdrop-blur'
        >
          <div className='flex flex-col gap-2'>
            <SecondaryOrionButton
              size='lg'
              className='h-10 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90'
              asChild
            >
              <a href='/signup' onClick={handleLinkClick}>
                Sign up
              </a>
            </SecondaryOrionButton>
            <SecondaryOrionButton
              size='lg'
              className='h-10 w-full rounded-full bg-foreground text-background hover:bg-foreground/90'
              asChild
            >
              <a href='/login' onClick={handleLinkClick}>
                Log in
              </a>
            </SecondaryOrionButton>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'group relative z-50 flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 lg:hidden',
          open
            ? 'rotate-90 border-primary bg-primary'
            : cn(
                'border-border/45 bg-background/40 backdrop-blur-sm hover:bg-primary/5',
                isScrolled && 'border-border/60 bg-background/80 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.55)]'
              ),
          triggerClassName
        )}
        aria-label={open ? 'Close Menu' : 'Open Menu'}
      >
        <div className='relative flex h-3.5 w-5 flex-col items-end justify-between'>
          <span
            className={cn(
              'absolute right-0 top-0 h-[1.5px] rounded-full transition-all duration-500',
              open ? 'top-1/2 w-5 -translate-y-1/2 rotate-45 bg-background' : 'w-full bg-primary group-hover:w-4/5'
            )}
          />
          <span
            className={cn(
              'absolute bottom-0 right-0 h-[1.5px] rounded-full transition-all duration-500',
              open
                ? 'top-1/2 w-5 -translate-y-1/2 -rotate-45 bg-background'
                : 'w-2/3 bg-primary group-hover:w-full'
            )}
          />
        </div>
      </button>

      {mounted ? createPortal(overlayContent, document.body) : null}
    </>
  )
}

export { HeroNavigation, HeroNavigationSmallScreen, type Navigation, type NavigationItem, type NavigationSection }
