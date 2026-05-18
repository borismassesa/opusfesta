import {
  loadAttireCategoriesContent,
  loadAttireLovedCategoriesContent,
  type AttireCategoryItem,
} from '@/lib/cms/attire-categories'

type Props = {
  variant: 'trending' | 'loved'
  isCircle?: boolean
}

export async function CategoriesGrid({ variant, isCircle = false }: Props) {
  const content = variant === 'trending'
    ? await loadAttireCategoriesContent()
    : await loadAttireLovedCategoriesContent()

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
      {content.title && (
        <h2 className="text-2xl font-serif font-medium mb-6 text-gray-900">{content.title}</h2>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
        {content.items.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} isCircle={isCircle} />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ cat, isCircle }: { cat: AttireCategoryItem; isCircle: boolean }) {
  return (
    <div className="group cursor-pointer">
      <div
        className={`overflow-hidden mb-3 ${isCircle ? 'rounded-full aspect-square' : 'rounded-2xl aspect-[4/5]'} bg-violet-50 transition-shadow duration-300 group-hover:shadow-lg`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
  )
}
