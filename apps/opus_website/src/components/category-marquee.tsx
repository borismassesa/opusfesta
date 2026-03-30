import { ArrowRight } from 'lucide-react'

const categories = [
  { name: 'Venues',              bg: '#1A1A1A', text: '#FFE500' },
  { name: 'Photography',         bg: '#C9A0DC', text: '#1A1A1A' },
  { name: 'Videography',         bg: '#5C00F2', text: '#ffffff' },
  { name: 'Catering',            bg: '#FF3D00', text: '#ffffff' },
  { name: 'Florists',            bg: '#00701A', text: '#FFE500' },
  { name: 'DJs',                 bg: '#FFE500', text: '#1A1A1A' },
  { name: 'Live Bands',          bg: '#E8003D', text: '#ffffff' },
  { name: 'Hair & Makeup',       bg: '#7B00D4', text: '#ffffff' },
  { name: 'Wedding Planners',    bg: '#0057FF', text: '#ffffff' },
  { name: 'Rentals',             bg: '#FF6B00', text: '#1A1A1A' },
  { name: 'Wedding Cakes',       bg: '#FF85A1', text: '#1A1A1A' },
  { name: 'Bridal Salons',       bg: '#F5E6FF', text: '#1A1A1A' },
  { name: 'Officiants',          bg: '#003566', text: '#ffffff' },
  { name: 'Transportation',      bg: '#2D6A4F', text: '#ffffff' },
  { name: 'Photo Booths',        bg: '#F77F00', text: '#1A1A1A' },
  { name: 'Bar Services',        bg: '#6A0572', text: '#ffffff' },
  { name: 'Invitations',         bg: '#D62828', text: '#ffffff' },
  { name: 'Décor',               bg: '#023E8A', text: '#ffffff' },
  { name: 'Jewellers',           bg: '#B5838D', text: '#ffffff' },
  { name: 'MC',                  bg: '#264653', text: '#ffffff' },
  { name: 'Soloists & Ensembles',bg: '#606C38', text: '#ffffff' },
  { name: 'Dance Lessons',       bg: '#9B2226', text: '#ffffff' },
  { name: 'Favours & Gifts',     bg: '#E9C46A', text: '#1A1A1A' },
  { name: 'Beauty Services',     bg: '#A8DADC', text: '#1A1A1A' },
  { name: 'Honeymoon',           bg: '#457B9D', text: '#ffffff' },
  { name: 'Hotel Blocks',        bg: '#1D3557', text: '#ffffff' },
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
