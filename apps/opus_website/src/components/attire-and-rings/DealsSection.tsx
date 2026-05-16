import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const deals = [
  { id: 1, name: 'Vintage Gold Wedding Band...', rating: '5.0', price: 'CA$499.98', oldPrice: 'CA$760.89', discount: '35% off', text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: "Custom Engraved Men's...", rating: '4.8', price: 'CA$156.64', oldPrice: 'CA$208.86', discount: '25% off', text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Bohemian Lace Wedding Dress...', rating: '4.8', price: 'CA$495.58', oldPrice: 'CA$661.11', discount: '25% off', text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Classic Navy Blue Suit...', rating: '4.9', price: 'CA$265.50', oldPrice: 'CA$410.83', discount: '40% off', text: 'Biggest sale in 60+ days', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
]

export function DealsSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full bg-[#faeddf]/40 my-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-serif font-medium text-gray-900">Today&apos;s big deals</h2>
          <div className="flex items-center gap-1 text-gray-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Fresh deals in 18:22:54
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white bg-gray-50 transition cursor-not-allowed text-gray-400" aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white bg-gray-50 transition drop-shadow-sm text-gray-700" aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex -mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto gap-4 snap-x hide-scrollbar">
        {deals.map((deal) => (
          <div key={deal.id} className="flex-none w-64 md:w-72 snap-start group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              <img src={deal.img} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 line-clamp-1">{deal.name}</h3>
                <span className="flex items-center text-sm font-medium text-gray-700 whitespace-nowrap ml-2">
                  {deal.rating} <Star size={14} className="ml-1 fill-gray-900 border-none text-gray-900" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-lg text-gray-900">{deal.price}</span>
                <span className="text-sm text-gray-500 line-through">{deal.oldPrice}</span>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-1.5 py-0.5 rounded ml-auto">
                  {deal.discount}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-auto">{deal.text}</p>
            </div>
          </div>
        ))}

        <div className="flex-none w-32 snap-start cursor-pointer flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-violet-600 hover:bg-violet-50 transition text-gray-500">
            <ChevronRight size={24} />
          </div>
          <span className="mt-3 text-sm font-medium text-gray-700">View more</span>
        </div>
      </div>
    </div>
  )
}
