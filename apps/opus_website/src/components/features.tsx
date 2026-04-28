import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'
import { loadFeaturesContent, type FeatureBlock, type FeatureMediaItem } from '@/lib/cms/features'

function Media({ item, className }: { item: FeatureMediaItem; className?: string }) {
  if (!item.url) return <div className={className} />
  if (item.type === 'video') {
    return (
      <video
        src={item.url}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className={className}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.url} alt="" className={className} />
  )
}

function FeatureBlockSection({ block }: { block: FeatureBlock }) {
  const reverseClass = block.reverse ? 'md:flex-row-reverse' : 'md:flex-row'

  return (
    <div className={`flex flex-col ${reverseClass} items-center gap-10 sm:gap-14 md:gap-16`}>
      <Reveal
        direction={block.reverse ? 'right' : 'left'}
        className="order-2 md:order-0 flex-1 w-full grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 h-[260px] sm:h-[340px] md:h-[440px]"
      >
        <div className="row-span-2 rounded-xl sm:rounded-2xl overflow-hidden">
          <Media item={block.media_main} className="w-full h-full object-cover object-top scale-105" />
        </div>
        <div className="rounded-xl sm:rounded-2xl overflow-hidden">
          <Media item={block.media_secondary} className="w-full h-full object-cover" />
        </div>
        <div className="rounded-xl sm:rounded-2xl overflow-hidden relative">
          <Media item={block.media_overlay} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <p className="text-white/50 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
              {block.overlay_eyebrow}
            </p>
            <p className="text-white text-xs sm:text-sm font-black leading-tight">
              {block.overlay_caption_line_1}
              <br />
              {block.overlay_caption_line_2}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal direction={block.reverse ? 'left' : 'right'} className="order-1 md:order-0 flex-1 text-center md:text-left" delay={0.1}>
        <h2 className="text-[2.2rem] sm:text-4xl md:text-6xl lg:text-[72px] font-black tracking-tighter uppercase leading-none sm:leading-[0.92] md:leading-[0.88] mb-5 sm:mb-6 text-[#1A1A1A]">
          {block.headline_line_1}
          <br />
          {block.headline_line_2}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
          {block.body}
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8">
          {block.pills.map((p) => (
            <span key={p.id} className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
              {p.label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          <Link
            href={block.primary_cta_href}
            className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-6 py-3 rounded-full font-bold transition-colors text-sm sm:text-base"
          >
            {block.primary_cta_label}
          </Link>
          <Link
            href={block.secondary_cta_href}
            className="text-[#1A1A1A] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors underline text-sm sm:text-base"
          >
            {block.secondary_cta_label}
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

export default async function Features() {
  const content = await loadFeaturesContent()

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-6xl mx-auto">

      <Reveal direction="up" className="hidden sm:block text-center mb-14 sm:mb-20 md:mb-24">
        <span className="text-(--accent) text-xs font-bold uppercase tracking-widest">{content.eyebrow}</span>
        <h2 className="text-[2.8rem] sm:text-6xl md:text-7xl lg:text-[96px] font-black tracking-tighter uppercase leading-[0.95] sm:leading-[0.88] md:leading-[0.85] mt-4 text-[#1A1A1A]">
          {content.headline_line_1}
          <br />
          {content.headline_line_2}
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mt-5 sm:mt-6 max-w-xs sm:max-w-sm mx-auto font-medium leading-relaxed">
          {content.subheadline}
        </p>
      </Reveal>

      <div className="space-y-20 sm:space-y-28 md:space-y-32">
        {content.blocks.map((block) => (
          <FeatureBlockSection key={block.id} block={block} />
        ))}
      </div>

    </section>
  )
}
