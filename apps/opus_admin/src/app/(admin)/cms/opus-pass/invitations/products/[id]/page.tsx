import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  emptyInvitationProduct,
  type InvitationProductRecord,
} from '@/lib/cms/opus-pass-invitations-products'
import ProductEditor from './ProductEditor'

export const dynamic = 'force-dynamic'

export default async function InvitationProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === 'new') {
    return <ProductEditor initial={emptyInvitationProduct()} isNew />
  }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('website_invitations_products')
    .select('*')
    .eq('id', id)
    .maybeSingle<InvitationProductRecord>()

  if (error) throw error
  if (!data) notFound()

  return <ProductEditor initial={data} isNew={false} />
}
