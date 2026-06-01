import Link from 'next/link'
import { loadHomepageHeroContent } from '@/lib/cms/homepage-hero'
import { RotatingWord } from '@/components/home/RotatingWord'

export async function Hero() {
  const content = await loadHomepageHeroContent()

  return (
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-8 text-center sm:pt-20 sm:pb-10 lg:pt-24">
      <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-6xl">
        Your <RotatingWord />
        <br />
        {content.headline_line_2}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#1A1A1A]/65 sm:mt-7 sm:text-lg">
        {content.description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-9">
        <Link
          href={content.primary_cta_href}
          className="inline-flex items-center rounded-full bg-[#1A1A1A] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          {content.primary_cta_label}
        </Link>
        <Link
          href={content.secondary_cta_href}
          className="inline-flex items-center rounded-full border border-[#1A1A1A]/20 bg-white px-7 py-3.5 text-sm font-bold text-[#1A1A1A] transition-colors hover:border-[#1A1A1A]"
        >
          {content.secondary_cta_label}
        </Link>
      </div>
    </section>
  )
}
