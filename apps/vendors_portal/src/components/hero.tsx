import { loadHeroContent } from '@/lib/cms/hero'
import { getLocale } from '@/lib/cms/locale'
import HeroClient from './hero-client'

export default async function Hero() {
  const locale = await getLocale()
  const content = await loadHeroContent(locale)
  return <HeroClient content={content} />
}
