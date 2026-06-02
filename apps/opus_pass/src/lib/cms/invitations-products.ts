import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Treatment } from '@/components/guests/InvitationVisual'
import type { InvitationPalette } from '@/components/guests/invitation-templates/_types'
import type { CatalogProduct } from '@/data/invitations-products'

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
  palettes: InvitationPalette[] | null
  treatment: string
  image_url: string | null
  back_image_url: string | null
  gallery: string[] | null
  published: boolean
  sort_order: number
}

function rowToProduct(row: ProductRow): CatalogProduct {
  const imageUrl = row.image_url || undefined
  return {
    id:               row.id,
    slug:             row.slug,
    category:         row.category,
    name:             row.name,
    designer:         row.designer,
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

export type MockupCarouselScene = { id: string; label: string | null; url: string }

export async function loadMockupCarouselScenes(): Promise<MockupCarouselScene[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('website_cms_mockup_carousel')
    .select('scene, label, url')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.scene as string,
    label: (row.label as string | null) ?? null,
    url: (row.url as string) || '',
  }))
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
