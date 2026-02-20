'use client'

import { useState } from 'react'

import { Navbar } from '@/components/layout/Navbar'
import { MenuOverlay } from '@/components/layout/MenuOverlay'
import PlanningToolsSections from '@/components/planning/planning-tools-sections'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-40/hero-section-40'

const PlanningToolsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className='orion-theme bg-background text-foreground flex min-h-screen flex-col'>
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className='flex flex-col'>
        <HeroSection />
        <PlanningToolsSections />
      </main>
    </div>
  )
}

export default PlanningToolsPage
