import { ArrowRight } from 'lucide-react'
import { loadCategoryMarqueeContent } from '@/lib/cms/category-marquee'

export default async function CategoryMarquee() {
  const { items } = await loadCategoryMarqueeContent()
  // Treat missing `visible` as true so older rows render unchanged.
  const categories = items.filter((c) => c.visible !== false)
  if (categories.length === 0) return null

  const marqueeItems = [...categories, ...categories, ...categories]

  return (
    <div className="w-full bg-[#FFFFFF] py-8 sm:py-10 border-y border-gray-100">

      {/* Mobile: touch-scrollable row */}
      <div className="flex sm:hidden overflow-x-auto hide-scrollbar gap-2 px-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="shrink-0 px-5 py-2.5 rounded-full font-bold text-sm shadow-sm"
            style={{ background: category.bg, color: category.text }}
          >
            {category.name}
          </div>
        ))}
      </div>

      {/* Desktop: auto-scrolling marquee */}
      <div className="hidden sm:flex items-center relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-44 bg-[var(--accent)] z-10 flex items-center justify-center"
          style={{ clipPath: 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)' }}
        >
          <ArrowRight size={36} strokeWidth={2.5} className="text-[var(--on-accent)] ml-[-12px]" />
        </div>

        <div className="flex animate-marquee whitespace-nowrap pl-40 items-center">
          {marqueeItems.map((category, i) => (
            <div
              key={`${category.id}-${i}`}
              className="mx-4 px-9 py-7 rounded-full shadow-sm font-bold text-lg"
              style={{ background: category.bg, color: category.text }}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
