import { ArrowRight } from 'lucide-react'
import { loadCategoryMarqueeContent } from '@/lib/cms/category-marquee'

export default async function CategoryMarquee() {
  const { items } = await loadCategoryMarqueeContent()
  // Treat missing `visible` as true so older rows render unchanged.
  const categories = items.filter((c) => c.visible !== false)
  if (categories.length === 0) return null

  const marqueeItems = [...categories, ...categories, ...categories]

  return (
    <div className="w-full bg-[#FFFFFF] py-7 sm:py-10 border-y border-gray-100">

      {/* Auto-scrolling marquee — same treatment on every screen size, just
          scaled down on mobile (smaller arrow badge + pills). */}
      <div className="flex items-center relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-24 sm:w-44 bg-[var(--accent)] z-10 flex items-center justify-center"
          style={{ clipPath: 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)' }}
        >
          <ArrowRight strokeWidth={2.5} className="h-6 w-6 sm:h-9 sm:w-9 text-[var(--on-accent)] ml-[-8px] sm:ml-[-12px]" />
        </div>

        <div className="flex animate-marquee whitespace-nowrap pl-24 sm:pl-40 items-center">
          {marqueeItems.map((category, i) => (
            <div
              key={`${category.id}-${i}`}
              className="mx-2 sm:mx-4 px-5 sm:px-9 py-3 sm:py-7 rounded-full shadow-sm font-bold text-sm sm:text-lg"
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
