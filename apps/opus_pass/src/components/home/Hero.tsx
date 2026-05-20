import Link from 'next/link'
import { loadHomepageHeroContent } from '@/lib/cms/homepage-hero'

export async function Hero() {
  const content = await loadHomepageHeroContent()

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 rounded-2xl md:rounded-3xl overflow-hidden bg-[#f4ecf8] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] h-full">
            <div className="flex flex-col justify-center items-start px-8 md:px-10 lg:px-14 py-12 md:py-16">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight mb-5">
                {content.headline_line_1}
                <br />
                {content.headline_line_2}
              </h1>
              <p className="text-base lg:text-lg text-gray-700 mb-7 leading-relaxed">
                {content.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={content.primary_cta_href}
                  className="inline-flex items-center bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition shadow-sm"
                >
                  {content.primary_cta_label}
                </Link>
                <Link
                  href={content.secondary_cta_href}
                  className="inline-flex items-center bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full font-medium hover:border-gray-900 transition"
                >
                  {content.secondary_cta_label}
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-auto md:min-h-[360px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.main_image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <Link
          href={content.card_href}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[360px] group cursor-pointer shadow-sm block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.card_image_url}
            alt={content.card_heading}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
            <h3 className="text-xl md:text-2xl font-serif font-medium leading-tight mb-1">
              {content.card_heading}
            </h3>
            <span className="text-sm font-medium underline underline-offset-4">{content.card_link_label}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
