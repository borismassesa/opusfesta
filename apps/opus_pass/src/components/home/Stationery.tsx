import Link from 'next/link'
import {
  loadHomepageStationeryContent,
  type HomepageStationeryCard,
} from '@/lib/cms/homepage-stationery'

function CardVisual({ card, swatches }: { card: HomepageStationeryCard; swatches: string[] }) {
  if (card.visual === 'palette') {
    return (
      <div className="relative mt-8">
        <div className="flex justify-center gap-2.5">
          {swatches.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (card.visual === 'website') {
    return (
      <div className="relative mt-8 flex justify-center items-end gap-3">
        <div className="relative w-[22%] aspect-[9/16] rounded-xl overflow-hidden shadow-xl ring-1 ring-black/5 -mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative w-[50%] aspect-[16/10] rounded-md overflow-hidden shadow-lg ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative mt-8 mx-auto w-[68%] aspect-[5/4]">
      <div className="absolute top-0 left-[8%] w-[72%] aspect-[16/10] rounded-md bg-white shadow-md ring-1 ring-black/5" />
      <div className="absolute bottom-0 right-0 w-[72%] aspect-[16/10] rounded-md overflow-hidden shadow-lg ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}

export async function Stationery() {
  const content = await loadHomepageStationeryContent()
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 w-full">
      <h2 className="text-center text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight mb-10 md:mb-14">
        {content.heading}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {content.cards.map((card) => (
          <article
            key={card.id}
            className="rounded-2xl bg-[#f7e8df] px-8 md:px-7 lg:px-10 pt-10 md:pt-12 pb-10 md:pb-14 flex flex-col"
          >
            <h3 className="text-center text-xl md:text-2xl font-serif font-bold text-gray-900 mb-4">
              {card.title}
            </h3>
            <p className="text-center text-sm md:text-[15px] text-gray-700 leading-relaxed mb-5">
              {card.description}
            </p>
            <div className="text-center">
              <Link
                href={card.cta_href}
                className="inline-block text-gray-900 font-medium underline underline-offset-4 decoration-1 hover:decoration-2 transition-all"
              >
                {card.cta_label}
              </Link>
            </div>
            <CardVisual card={card} swatches={content.swatches} />
          </article>
        ))}
      </div>
    </section>
  )
}
