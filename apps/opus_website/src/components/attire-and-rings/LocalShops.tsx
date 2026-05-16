import { Heart } from 'lucide-react'

const shops = [
  { id: 1, name: 'Boutique Bridal', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Diamond District', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'Savile Row Suits', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80' },
]

export function LocalShops() {
  return (
    <div className="bg-[#f7f7f9] py-16 my-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 flex flex-col items-start justify-center">
            <span className="text-gray-500 font-medium mb-2 text-sm">Local finds? OpusFesta has it.</span>
            <h2 className="text-3xl lg:text-4xl font-serif font-medium text-gray-900 leading-tight mb-8">
              Discover shops in your area
            </h2>
            <button className="bg-white border text-gray-900 border-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition drop-shadow-sm shadow-sm ring-1 ring-gray-900">
              Shop from local makers
            </button>
          </div>

          <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop.id} className="group relative cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img src={shop.img} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-gray-700 hover:text-red-500 transition-colors z-10" aria-label="Favorite">
                    <Heart size={18} />
                  </button>
                </div>

                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
                    <img src={shop.avatar} alt="Maker avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium text-gray-900 flex-1 truncate">{shop.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
