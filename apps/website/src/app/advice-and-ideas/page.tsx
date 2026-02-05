'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { MenuOverlay } from '@/components/layout/MenuOverlay'
import { Footer } from '@/components/layout/Footer'
import { AdviceIdeasHeroSection } from '@/components/advice-ideas/AdviceIdeasHeroSection'
import { AdviceIdeasBlog } from '@/components/advice-ideas/AdviceIdeasBlog'
import { AdviceIdeasCTA } from '@/components/advice-ideas/AdviceIdeasCTA'

export default function AdviceAndIdeasPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-background text-primary min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <AdviceIdeasHeroSection />
      <AdviceIdeasBlog />
      <AdviceIdeasCTA />

      <Footer />
    </div>
  )
}
