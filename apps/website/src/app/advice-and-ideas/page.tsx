'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { MenuOverlay } from '@/components/layout/MenuOverlay'
import { Footer } from '@/components/layout/Footer'
import { AdviceIdeasProvider } from '@/context/AdviceIdeasContext'
import { AdviceIdeasPageContentProvider } from '@/context/AdviceIdeasPageContentContext'
import { AdviceIdeasHeroSection } from '@/components/advice-ideas/AdviceIdeasHeroSection'
import { AdviceIdeasPopularTopics } from '@/components/advice-ideas/AdviceIdeasPopularTopics'
import { AdviceIdeasLatestStories } from '@/components/advice-ideas/AdviceIdeasLatestStories'
import { AdviceIdeasTrendingStories } from '@/components/advice-ideas/AdviceIdeasTrendingStories'
import { AdviceIdeasBrowseGoals } from '@/components/advice-ideas/AdviceIdeasBrowseGoals'
import { AdviceIdeasNewsletterStrip } from '@/components/advice-ideas/AdviceIdeasNewsletterStrip'
import { AdviceIdeasBlog } from '@/components/advice-ideas/AdviceIdeasBlog'
import { AdviceIdeasCTA } from '@/components/advice-ideas/AdviceIdeasCTA'

export default function AdviceAndIdeasPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <AdviceIdeasPageContentProvider>
        <AdviceIdeasProvider>
          <AdviceIdeasHeroSection />
          <AdviceIdeasBrowseGoals />
          <AdviceIdeasTrendingStories />
          <AdviceIdeasLatestStories />
          <AdviceIdeasPopularTopics />
          <AdviceIdeasNewsletterStrip />
          <AdviceIdeasBlog />
          <AdviceIdeasCTA />
        </AdviceIdeasProvider>
      </AdviceIdeasPageContentProvider>

      <Footer />
    </div>
  )
}
