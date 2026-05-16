const gifts = [
  { id: 1, name: 'Diamond Engagement Rings', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Vintage Wedding Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Designer Tuxedos', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
]

export function GiftSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 flex flex-col items-start justify-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-medium text-gray-900 leading-tight mb-6">
            OpusFesta-special rings &amp; wedding attire
          </h2>
          <button className="bg-white border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition drop-shadow-sm">
            Get inspired
          </button>
        </div>

        <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {gifts.map((gift) => (
            <div key={gift.id} className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer shadow-sm">
              <img src={gift.img} alt={gift.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 z-10 text-white font-medium text-lg leading-tight">
                {gift.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
