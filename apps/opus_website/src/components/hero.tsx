import { loadHeroContent } from '@/lib/cms/hero'
import HeroClient from './hero-client'

export default async function Hero() {
  const content = await loadHeroContent()
  return <HeroClient content={content} />
}
