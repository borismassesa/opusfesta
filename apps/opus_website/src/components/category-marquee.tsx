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
  const items = [...categories, ...categories, ...categories]

  return (
    <div className="w-full overflow-hidden bg-[#FFFFFF] py-10 border-y border-gray-100 flex items-center relative">
      <div
        className="absolute left-0 top-0 bottom-0 w-24 md:w-44 bg-[var(--accent)] z-10 flex items-center justify-center"
        style={{ clipPath: 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%)' }}
      >
        <ArrowRight size={24} strokeWidth={2.5} className="text-[var(--on-accent)] ml-[-8px] md:hidden" />
        <ArrowRight size={36} strokeWidth={2.5} className="text-[var(--on-accent)] ml-[-12px] hidden md:block" />
      </div>

      <div className="flex animate-marquee whitespace-nowrap pl-24 md:pl-40 items-center">
        {items.map((category, i) => (
          <div
            key={i}
            className="mx-2 md:mx-4 px-5 py-2.5 md:px-8 md:py-4 rounded-full shadow-sm font-bold text-sm md:text-lg"
            style={{ background: category.bg, color: category.text }}
          >
            {category.name}
          </div>
        ))}
      </div>
    </div>
  )
}
