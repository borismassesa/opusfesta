type Category = { id: number; name: string; img: string }

const springCategories: Category[] = [
  { id: 1, name: 'Diamond Rings', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: "Men's Tuxedos", img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Lace Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Wedding Bands', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Bridal Accessories', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Bridesmaid Gowns', img: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=400&q=80' },
]

type Props = {
  title?: string
  categories?: Category[]
  isCircle?: boolean
}

export function CategoriesGrid({ title, categories = springCategories, isCircle = false }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
      {title && <h2 className="text-2xl font-serif font-medium mb-6 text-gray-900">{title}</h2>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="group cursor-pointer">
            <div className={`overflow-hidden mb-3 ${isCircle ? 'rounded-full aspect-square' : 'rounded-2xl aspect-[4/5]'} bg-violet-50 transition-shadow duration-300 group-hover:shadow-lg`}>
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-800 group-hover:underline text-center">
              {cat.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  )
}

export const lovedCategories: Category[] = [
  { id: 1, name: 'Wedding Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Groom Suits', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Engagement Rings', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Wedding Bands', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Bridal Shoes', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Veils & Headpieces', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80' },
]
