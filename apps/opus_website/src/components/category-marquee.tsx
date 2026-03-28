import { ArrowRight } from 'lucide-react'

const categories = [
  { name: 'Venues',        bg: '#1A1A1A', text: '#FFE500' },
  { name: 'Photography',   bg: '#C9A0DC', text: '#1A1A1A' },
  { name: 'Videography',   bg: '#5C00F2', text: '#ffffff' },
  { name: 'Catering',      bg: '#FF3D00', text: '#ffffff' },
  { name: 'Florists',      bg: '#00701A', text: '#FFE500' },
  { name: 'DJs',           bg: '#FFE500', text: '#1A1A1A' },
  { name: 'Bands',         bg: '#E8003D', text: '#ffffff' },
  { name: 'Hair & Makeup', bg: '#7B00D4', text: '#ffffff' },
  { name: 'Planners',      bg: '#0057FF', text: '#ffffff' },
  { name: 'Rentals',       bg: '#FF6B00', text: '#1A1A1A' },
]

export default function CategoryMarquee() {
  const marqueeItems = [...categories, ...categories, ...categories]

  return (
    <div className="w-full bg-[#FFFFFF] py-8 sm:py-10 border-y border-gray-100">

      {/* Mobile: touch-scrollable row */}
      <div className="flex sm:hidden overflow-x-auto hide-scrollbar gap-2 px-4">
        {categories.map((category, i) => (
          <div
            key={i}
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
              key={i}
              className="mx-4 px-8 py-4 rounded-full shadow-sm font-bold text-lg"
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
