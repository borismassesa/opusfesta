import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Star, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import AddToRegistryButton from '@/components/registry/AddToRegistryButton'
import RegistryBagButton from '@/components/registry/RegistryBagButton'
import { getRegistryCategory } from '@/lib/registry-categories'
import { generateProduct, generateAllParams } from '@/lib/registry-products'

type Params = Promise<{ category: string; id: string }>

const REVIEW_SNIPPETS = [
  { author: 'Asha M.', city: 'Dar es Salaam', text: 'Exactly what we needed for our new home. Arrived well packaged and on time.' },
  { author: 'Joseph K.', city: 'Arusha', text: 'Great quality for the price. Would recommend adding this to any registry.' },
  { author: 'Neema T.', city: 'Mwanza', text: 'Our guests loved being able to give us something we actually wanted.' },
]

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, id } = await params
  const product = generateProduct(category, Number(id))
  if (!product) return { title: 'Registry | OpusFesta' }
  return {
    title: `${product.name} | OpusFesta Registry`,
    description: product.description,
  }
}

export function generateStaticParams() {
  return generateAllParams()
}

export default async function RegistryProductPage({ params }: { params: Params }) {
  const { category, id } = await params
  const cat = getRegistryCategory(category)
  const product = generateProduct(category, Number(id))
  if (!cat || !product) notFound()

  return (
    <>
      <Navbar />

      <div className="sticky top-0 z-30 flex items-center justify-end gap-3 bg-black px-4 py-2.5 text-white lg:px-8">
        <RegistryBagButton />
      </div>

      <main className="bg-white font-sans text-gray-900">
        <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/registry" className="hover:text-gray-900 hover:underline">
              Registry
            </Link>
            <ChevronRight size={12} />
            <Link href={`/registry/${cat.slug}`} className="hover:text-gray-900 hover:underline">
              {cat.name}
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-700">{product.name}</span>
          </nav>
        </div>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-8 lg:grid-cols-2 lg:px-8 lg:py-12">
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.gallery.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" className="aspect-square rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{product.brand.name}</p>
            <h1 className="mb-3 text-2xl font-serif font-medium leading-tight text-gray-900 md:text-3xl">
              {product.name}
            </h1>
            <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{product.rating}</span>
              <Star size={14} className="fill-gray-900 text-gray-900" />
              <span className="text-gray-500">({product.reviews.toLocaleString()} reviews)</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">{product.brand.location}</span>
            </div>

            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">{product.price}</span>
              {product.oldPrice && <span className="text-base text-gray-500 line-through">{product.oldPrice}</span>}
            </div>

            <p className="mb-6 text-sm leading-relaxed text-gray-700">{product.description}</p>

            {product.colors && (
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Colour options</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <span
                      key={c.name}
                      title={c.name}
                      className="h-7 w-7 rounded-full border border-gray-300"
                      style={{ backgroundColor: c.swatch }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <AddToRegistryButton
                product={{ id: product.id, name: product.name, img: product.img, price: product.price, category: cat.slug }}
                variant="pdp"
              />
            </div>

            <ul className="mb-6 space-y-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-gray-700">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">What guests are saying</p>
              {REVIEW_SNIPPETS.map((r) => (
                <div key={r.author} className="text-sm">
                  <p className="mb-1 leading-relaxed text-gray-700">“{r.text}”</p>
                  <p className="text-xs text-gray-500">
                    {r.author}, {r.city}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
