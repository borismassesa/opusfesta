'use client'

import { useEffect, useState } from 'react'

import { SecondaryOrionButton } from '@/components/ui/orion-button'

import {
  HeroNavigation,
  HeroNavigationSmallScreen,
  type Navigation
} from '@/components/shadcn-studio/blocks/hero-section-40/hero-navigation'

import { cn } from '@/lib/utils'

type HeaderProps = {
  navigationData: Navigation[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full px-4 transition-[padding] duration-500 sm:px-6 lg:px-8',
        {
          'py-2': isScrolled,
          'py-3': !isScrolled
        },
        className
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full px-4 py-2 transition-all duration-500 sm:gap-4 sm:px-5 sm:py-2.5 lg:px-6',
          {
            'bg-background/90 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.55)] ring-1 ring-border/55 backdrop-blur-xl': isScrolled,
            'bg-transparent ring-1 ring-transparent backdrop-blur-0': !isScrolled
          }
        )}
      >
        {/* Logo */}
        <a href='/' className='shrink-0'>
          <div className='flex items-center gap-2'>
            <span className='font-serif text-[1.7rem] leading-none text-foreground sm:text-[1.85rem]'>OpusFesta</span>
          </div>
        </a>

        {/* Navigation */}
        <HeroNavigation
          navigationData={navigationData}
          navigationClassName={cn('transition-opacity duration-300', isScrolled ? 'opacity-100' : 'opacity-95')}
        />

        {/* Actions */}
        <div className='flex items-center gap-2 sm:gap-2.5'>
          <SecondaryOrionButton
            size='lg'
            className='hidden h-9 rounded-full bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90 sm:inline-flex'
            asChild
          >
            <a href='/signup'>Sign up</a>
          </SecondaryOrionButton>
          <SecondaryOrionButton
            size='lg'
            className='hidden h-9 rounded-full bg-foreground px-4 text-sm text-background hover:bg-foreground/90 sm:inline-flex'
            asChild
          >
            <a href='/login'>Log in</a>
          </SecondaryOrionButton>

          <HeroNavigationSmallScreen navigationData={navigationData} isScrolled={isScrolled} />
        </div>
      </div>
    </header>
  )
}

export default Header
