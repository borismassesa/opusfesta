import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Treatment } from '@/components/guests/InvitationVisual'
import { PRODUCTS, findProductById, type CatalogProduct } from '@/data/invitations-products'

// Shape of a row in the website_invitations_products table.
type ProductRow = {
  id: string
  slug: string
  name: string
  designer: string
  category: string
  price_was: number | null
  price_now: number
  digital_unit_price: number
  free_sample: boolean
  swatches: string[] | null
  treatment: string
  image_url: string | null
  gallery: string[] | null
  published: boolean
  sort_order: number
}

function rowToProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    name: row.name,
    designer: row.designer,
    priceWas: row.price_was ?? undefined,
    priceNow: row.price_now,
    digitalUnitPrice: row.digital_unit_price,
    freeSample: row.free_sample,
    swatches: Array.isArray(row.swatches) ? row.swatches : [],
    treatment: row.treatment as Treatment,
    imageUrl: row.image_url || undefined,
    gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [],
  }
}

function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/** All published products, ordered for the catalog. Falls back to bundled data. */
export async function loadInvitationProducts(): Promise<CatalogProduct[]> {
  if (!hasSupabase()) return PRODUCTS
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('website_invitations_products')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    if (!data || data.length === 0) return PRODUCTS
    return (data as ProductRow[]).map(rowToProduct)
  } catch (err) {
    console.error('[opus-pass cms] invitations products load failed', err)
    return PRODUCTS
  }
}

/** A single published product by id. Falls back to bundled data. */
export async function loadInvitationProduct(id: string): Promise<CatalogProduct | undefined> {
  if (!hasSupabase()) return findProductById(id)
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('website_invitations_products')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .maybeSingle<ProductRow>()
    if (error) throw error
    if (!data) return findProductById(id)
    return rowToProduct(data)
  } catch (err) {
    console.error('[opus-pass cms] invitations product load failed', err)
    return findProductById(id)
  }
}
