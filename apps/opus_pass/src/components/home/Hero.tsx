import { loadHomepageHeroContent } from '@/lib/cms/homepage-hero'
import { getLocale } from '@/lib/cms/locale'
import { LandingHero } from '@/components/LandingHero'

export async function Hero() {
  const locale = await getLocale()
  const content = await loadHomepageHeroContent(locale)

  // Same hero treatment as the /websites landing page, fed the homepage's own
  // CMS copy (headline, description, CTAs).
  return <LandingHero content={content} />
}
