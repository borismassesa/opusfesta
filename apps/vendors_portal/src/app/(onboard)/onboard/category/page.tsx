import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { VENDOR_CATEGORIES, OTHER_CATEGORY, FALLBACK_ICON_NAMES } from '@/lib/onboarding/categories'
import type { VendorCategoryRow } from '@/lib/onboarding/categories'
import CategoryPageClient, { type ClientCategory } from './CategoryPageClient'

async function fetchCategories(): Promise<ClientCategory[]> {
  try {
    const supabase = await createClerkSupabaseServerClient()
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('slug, label, profile_label, db_value, icon, sort_order')
      .eq('active', true)
      .neq('slug', 'other')
      .order('sort_order', { ascending: true })
      .returns<VendorCategoryRow[]>()

    if (error || !data?.length) throw new Error('fallback')
    return data.map((row) => ({
      id: row.slug,
      label: row.label,
      iconName: row.icon,
      hint: undefined,
    }))
  } catch {
    return VENDOR_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      iconName: FALLBACK_ICON_NAMES[cat.id] ?? 'Tag',
      hint: cat.hint,
    }))
  }
}

export default async function CategoryPage() {
  const categories = await fetchCategories()
  const otherCategory: ClientCategory = {
    id: OTHER_CATEGORY.id,
    label: OTHER_CATEGORY.label,
    iconName: 'HelpCircle',
  }
  return <CategoryPageClient categories={categories} otherCategory={otherCategory} />
}
