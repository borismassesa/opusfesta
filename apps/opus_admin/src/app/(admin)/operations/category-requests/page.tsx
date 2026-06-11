import { createSupabaseAdminClient } from '@/lib/supabase'
import CategoryRequestsClient from './CategoryRequestsClient'

export const dynamic = 'force-dynamic'

export type CategoryRequestRow = {
  id: string
  vendor_id: string
  requested_label: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  vendors: {
    id: string
    vendor_code: string | null
    business_name: string
  } | null
}

export default async function CategoryRequestsPage() {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('vendor_category_requests')
    .select('id, vendor_id, requested_label, status, created_at, reviewed_at, vendors(id, vendor_code, business_name)')
    .order('created_at', { ascending: false })
    .limit(200)
    .returns<CategoryRequestRow[]>()

  if (error) {
    throw new Error(`[admin] vendor_category_requests query failed: ${error.code} ${error.message}`)
  }

  return <CategoryRequestsClient requests={data ?? []} />
}
