import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ProductCard from '@/components/registry/ProductCard'
import RegistryBagButton from '@/components/registry/RegistryBagButton'
import { REGISTRY_CATEGORIES, getRegistryCategory, type RegistryCategory } from '@/lib/registry-categories'
import { listProducts } from '@/lib/registry-products'

type Params = Promise<{ category: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params
  const cat = getRegistryCategory(category)
  if (!cat) return { title: 'Registry | OpusFesta' }
  return { title: `${cat.title} | OpusFesta Registry`, description: cat.tagline }
}

export function generateStaticParams() {
  return REGISTRY_CATEGORIES.map((c) => ({ category: c.slug }))
}

function FilterPill({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-gray-400 hover:bg-gray-50">
      {children}
    </button>
  )
}

function RelatedRow({ items }: { items: RegistryCategory[] }) {
  if (items.length === 0) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h2 className="mb-5 text-lg font-semibold text-gray-900 md:text-xl">Explore related categories</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/registry/${c.slug}`}
            className="group flex items-stretch gap-4 rounded-lg border border-gray-200 bg-white p-2 transition-colors hover:border-gray-400 hover:shadow-sm"
          >
            <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-md bg-gray-100 md:w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <span className="flex min-w-0 flex-1 items-center text-sm font-semibold leading-snug text-gray-900 group-hover:underline">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function RegistryCategoryPage({ params }: { params: Params }) {
  const { category } = await params
  const cat = getRegistryCategory(category)
  if (!cat) notFound()

  const relatedCats = cat.related
    .map((slug) => getRegistryCategory(slug))
    .filter((c): c is RegistryCategory => Boolean(c))

  const products = listProducts(cat.slug, 24, 0)

  return (
    <>
      <Navbar />

      <div className="sticky top-0 z-30 flex items-center justify-end gap-3 bg-black px-4 py-2.5 text-white lg:px-8">
        <RegistryBagButton />
      </div>

      <main className="bg-white font-sans text-gray-900">
        <section className="border-b border-gray-200 bg-[#f7f4ee] px-4 pb-12 pt-10 md:pb-16 md:pt-14">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="mb-2 text-3xl font-serif font-medium leading-tight text-gray-900 md:text-4xl lg:text-5xl">
              {cat.title}
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">{cat.tagline}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
          <div className="hide-scrollbar -mx-4 flex items-center gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            <FilterPill>
              Price <ChevronDown size={14} />
            </FilterPill>
            <FilterPill>
              Brand <ChevronDown size={14} />
            </FilterPill>
            <FilterPill>
              Sort: Featured <ChevronDown size={14} />
            </FilterPill>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Showing curated <strong className="font-semibold text-gray-900">{cat.name.toLowerCase()}</strong> gifts for
            your registry.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 lg:px-8">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>

        <RelatedRow items={relatedCats} />
      </main>

      <Footer />
    </>
  )
}
