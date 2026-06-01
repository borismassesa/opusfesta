import Link from 'next/link'
import { loadHomepageFeaturesContent, type HomepageFeatureBlock } from '@/lib/cms/homepage-features'

function FeatureBlockSection({ block }: { block: HomepageFeatureBlock }) {
  const reverseClass = block.reverse ? 'md:flex-row-reverse' : 'md:flex-row'

  return (
    <div className={`flex flex-col ${reverseClass} items-center gap-10 sm:gap-14 md:gap-16`}>
      <div className="order-2 md:order-0 flex-1 w-full">
        <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-black/[0.04] sm:h-[340px] sm:rounded-3xl md:h-[440px]">
          {block.media_video ? (
            <video
              src={block.media_video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.media_main} alt="" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  {block.overlay_eyebrow}
                </p>
                <p className="mt-1 font-serif text-lg font-medium leading-tight text-white sm:text-xl">
                  {block.overlay_caption_line_1}
                  <br />
                  {block.overlay_caption_line_2}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="order-1 md:order-0 flex-1 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight mb-4 sm:mb-5 text-[#1A1A1A]">
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
            className="inline-flex items-center bg-[#1A1A1A] hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors text-sm sm:text-base shadow-sm"
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
      </div>
    </div>
  )
}

export async function Features() {
  const content = await loadHomepageFeaturesContent()
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10 sm:mb-14 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-[#1A1A1A]">
          {content.header_title}
        </h2>
        <p className="text-base text-gray-600 mt-4 sm:mt-5 max-w-xl mx-auto leading-relaxed">
          {content.header_description}
        </p>
      </div>

      <div className="space-y-16 sm:space-y-20 md:space-y-24">
        {content.blocks.map((block) => (
          <FeatureBlockSection key={block.id} block={block} />
        ))}
      </div>
    </section>
  )
}
