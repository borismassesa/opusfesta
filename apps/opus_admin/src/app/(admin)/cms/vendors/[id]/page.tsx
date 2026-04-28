import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  emptyVendor,
  type VendorCategory,
  type VendorRecord,
} from '@/lib/cms/vendors'
import VendorEditor from './VendorEditor'

export const dynamic = 'force-dynamic'

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()

  const catsRes = await supabase
    .from('website_vendor_categories')
    .select('*')
    .order('display_order', { ascending: true })
  const categories = (catsRes.data ?? []) as VendorCategory[]

  if (id === 'new') {
    return (
      <VendorEditor
        initial={emptyVendor()}
        categories={categories}
        isNew
      />
    )
  }

  const { data, error } = await supabase
    .from('website_vendors')
    .select('*')
    .eq('id', id)
    .maybeSingle<VendorRecord>()

  if (error) throw error
  if (!data) notFound()

  return (
    <VendorEditor
      initial={data}
      categories={categories}
      isNew={false}
    />
  )
}
