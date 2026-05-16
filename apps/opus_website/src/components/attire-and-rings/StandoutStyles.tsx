const standoutStyles = [
  { id: 1, name: 'Diamond Rings', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Wedding Dresses', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Groom Suits', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Bridal Shoes', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Wedding Bands', discount: 'up to 20% off', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80' },
]

export function StandoutStyles() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
      <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">Save now on standout styles</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {standoutStyles.map((style) => (
          <div key={style.id} className="group cursor-pointer flex flex-col">
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-2xl mb-3 shadow-sm border border-gray-100">
              <img src={style.img} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="font-medium text-gray-900 group-hover:underline">{style.name}</h3>
            <p className="text-sm text-gray-600">{style.discount}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
