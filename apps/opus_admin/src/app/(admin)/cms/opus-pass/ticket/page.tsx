import { createSupabaseAdminClient } from '@/lib/supabase'
import { emptyInvitationProduct, type InvitationProductRecord } from '@/lib/cms/opus-pass-invitations-products'
import TicketEditor from './TicketEditor'

export const dynamic = 'force-dynamic'

async function loadTicketProduct(id: string): Promise<InvitationProductRecord> {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('website_invitations_products')
    .select('*')
    .eq('id', id)
    .maybeSingle<InvitationProductRecord>()
  return (
    data ??
    emptyInvitationProduct({
      id,
      slug: id,
      category: 'Event Tickets',
      treatment: id === 'p24' ? 'ticket-barcode' : 'ticket',
    })
  )
}

export default async function TicketCmsPage() {
  const [qr, barcode] = await Promise.all([loadTicketProduct('p23'), loadTicketProduct('p24')])
  return <TicketEditor qr={qr} barcode={barcode} />
}
