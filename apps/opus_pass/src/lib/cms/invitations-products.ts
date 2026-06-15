import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Treatment } from '@/components/guests/InvitationVisual'
import type { InvitationPalette } from '@/components/guests/invitation-templates/_types'
import { isProductBadge, type CatalogProduct } from '@/data/invitations-products'

type ProductRow = {
  id: string
  slug: string
  name: string
  designer: string
  category: string
  description: string | null
  price_was: number | null
  price_now: number
  digital_unit_price: number
  free_sample: boolean
  swatches: string[] | null
  palettes: InvitationPalette[] | null
  treatment: string
  image_url: string | null
  back_image_url: string | null
  gallery: string[] | null
  designs: string[] | null
  badge: string | null
  published: boolean
  sort_order: number
  created_at: string | null
}

function rowToProduct(row: ProductRow): CatalogProduct {
  const imageUrl = row.image_url || undefined
  return {
    id:               row.id,
    slug:             row.slug,
    category:         row.category,
    name:             row.name,
    designer:         row.designer,
    description:      row.description?.trim() || undefined,
    priceWas:         row.price_was ?? undefined,
    priceNow:         row.price_now,
    digitalUnitPrice: row.digital_unit_price,
    freeSample:       row.free_sample,
    swatches:         Array.isArray(row.swatches) ? row.swatches : [],
    palettes:         Array.isArray(row.palettes) ? row.palettes : [],
    treatment:        row.treatment as Treatment,
    imageUrl,
    designImage:      imageUrl,
    gallery:          Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [],
    designs:          Array.isArray(row.designs) ? row.designs.filter(Boolean) : [],
    badge:            isProductBadge(row.badge) ? row.badge : undefined,
    createdAt:        row.created_at ?? undefined,
  }
}

/** All published products, ordered for the catalog. */
export async function loadInvitationProducts(): Promise<CatalogProduct[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('website_invitations_products')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data as ProductRow[]).map(rowToProduct)
}

/** A single published product by id. */
export async function loadInvitationProduct(id: string): Promise<CatalogProduct | undefined> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('website_invitations_products')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle<ProductRow>()
  if (error) throw error
  if (!data) return undefined
  return rowToProduct(data)
}
