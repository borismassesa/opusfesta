import { Play, Heart } from 'lucide-react'

type Pick = { id: number; img: string; video?: boolean; heart?: boolean; price?: string }

const row1: Pick[] = [
  { id: 1, img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', video: true },
  { id: 2, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
  { id: 3, img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80' },
]

const row2: Pick[] = [
  { id: 4, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', video: true },
  { id: 5, img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', heart: true, price: 'CA$2,298.59' },
  { id: 6, img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80', video: true },
]

function PickCard({ pick }: { pick: Pick }) {
  return (
    <div className="relative overflow-hidden group cursor-pointer aspect-square">
      <img src={pick.img} alt="Editor pick" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      {pick.heart && (
        <button className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors z-10" aria-label="Favorite">
          <Heart size={16} />
        </button>
      )}
      {pick.price && (
        <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm z-10">
          {pick.price}
        </span>
      )}
      {pick.video && (
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-gray-900 w-8 h-8 rounded-full shadow-md flex items-center justify-center">
          <Play size={14} className="ml-0.5" />
        </div>
      )}
    </div>
  )
}

export function EditorsPicks() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="col-span-2 lg:col-span-1 flex flex-col justify-start lg:pr-4">
          <span className="text-gray-500 font-medium mb-2 uppercase text-xs tracking-wider">Editors&apos; Picks</span>
          <h2 className="text-3xl lg:text-4xl font-serif font-medium text-gray-900 mb-6 leading-tight">
            Bridal &amp; Accessories Favourites
          </h2>
          <a href="#" className="font-medium text-gray-900 hover:text-gray-600 underline underline-offset-4 decoration-2 decoration-gray-900 flex items-center gap-1 group transition-colors w-fit">
            Shop these unique finds
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {row1.map((pick) => (
          <PickCard key={pick.id} pick={pick} />
        ))}

        {row2.map((pick) => (
          <PickCard key={pick.id} pick={pick} />
        ))}

        <div className="col-span-2 lg:col-span-1 flex items-center text-gray-700 text-base lg:text-lg leading-relaxed lg:pl-2">
          Your one-stop shop for wedding attire, rings, and accessories
        </div>
      </div>
    </div>
  )
}
