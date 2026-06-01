import { loadHomepageHeroContent } from '@/lib/cms/homepage-hero'
import { LandingHero } from '@/components/LandingHero'

export async function Hero() {
  const content = await loadHomepageHeroContent()

  // Same hero treatment as the /websites landing page, fed the homepage's own
  // CMS copy (headline, description, CTAs).
  return <LandingHero content={content} />
}
