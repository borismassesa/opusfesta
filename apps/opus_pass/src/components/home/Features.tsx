import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'
import { loadHomepageFeaturesContent, type HomepageFeatureBlock } from '@/lib/cms/homepage-features'

function FeatureBlockSection({ block }: { block: HomepageFeatureBlock }) {
  const reverseClass = block.reverse ? 'md:flex-row-reverse' : 'md:flex-row'

  return (
    <div className={`flex flex-col ${reverseClass} items-center gap-10 sm:gap-14 md:gap-16`}>
      <Reveal
        direction={block.reverse ? 'right' : 'left'}
        className="order-2 md:order-0 flex-1 w-full grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 h-[260px] sm:h-[340px] md:h-[440px]"
      >
        <div className="row-span-2 rounded-xl sm:rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.media_main} alt="" className="w-full h-full object-cover object-top scale-105" />
        </div>
        <div className="rounded-xl sm:rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.media_secondary} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="rounded-xl sm:rounded-2xl overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.media_overlay} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <p className="text-white/70 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em]">
              {block.overlay_eyebrow}
            </p>
            <p className="text-white text-sm sm:text-base font-serif font-medium leading-tight mt-0.5">
              {block.overlay_caption_line_1}
              <br />
              {block.overlay_caption_line_2}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal
        direction={block.reverse ? 'left' : 'right'}
        className="order-1 md:order-0 flex-1 text-center md:text-left"
        delay={0.1}
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight mb-4 sm:mb-5 text-gray-900">
          {block.headline_line_1}
          <br />
          {block.headline_line_2}
        </h2>
        <p className="text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
          {block.body}
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8">
          {block.pills.map((label) => (
            <span key={label} className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <Link
            href={block.primary_cta_href}
            className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors text-sm sm:text-base shadow-sm"
          >
            {block.primary_cta_label}
          </Link>
          <Link
            href={block.secondary_cta_href}
            className="inline-flex items-center text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors underline underline-offset-4 text-sm sm:text-base"
          >
            {block.secondary_cta_label}
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

export async function Features() {
  const content = await loadHomepageFeaturesContent()
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <Reveal direction="up" className="text-center mb-10 sm:mb-14 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-gray-900">
          {content.header_title}
        </h2>
        <p className="text-base text-gray-600 mt-4 sm:mt-5 max-w-xl mx-auto leading-relaxed">
          {content.header_description}
        </p>
      </Reveal>

      <div className="space-y-16 sm:space-y-20 md:space-y-24">
        {content.blocks.map((block) => (
          <FeatureBlockSection key={block.id} block={block} />
        ))}
      </div>
    </section>
  )
}
