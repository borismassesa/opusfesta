const specialGifts = [
  { id: 1, name: 'Bridal Veils', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=200&q=80' },
  { id: 2, name: 'Wedding Shoes', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=80' },
  { id: 3, name: 'Groom Watches', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80' },
  { id: 4, name: 'Bridesmaid Dresses', img: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=200&q=80' },
  { id: 5, name: 'Groomsmen Ties', img: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=200&q=80' },
]

export function PillCategories() {
  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full pt-0 md:pt-2">
      <h2 className="text-xl font-medium mb-6 text-gray-900">Accessories to complete the look</h2>
      <div className="flex flex-nowrap gap-3 lg:gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        {specialGifts.map((gift) => (
          <div key={gift.id} className="flex flex-none items-center gap-3 bg-white p-2 pr-4 lg:pr-6 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 group whitespace-nowrap">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-violet-50">
              <img src={gift.img} alt={gift.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:underline">{gift.name}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}
