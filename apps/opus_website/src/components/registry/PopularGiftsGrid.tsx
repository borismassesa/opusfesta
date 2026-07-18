import ProductCard from './ProductCard'
import { mostPopularProducts } from '@/lib/registry-products'

export function PopularGiftsGrid() {
  const products = mostPopularProducts(9)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-serif font-medium text-gray-900 lg:text-3xl">
          Check out our most popular registry gifts
        </h2>
        <p className="text-sm text-gray-600">Handpicked by couples who registered before you.</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={`${p.category.slug}-${p.id}`} p={p} />
        ))}
      </div>
    </div>
  )
}
