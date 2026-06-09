import { loadInvitationProducts } from '@/lib/cms/invitations-products'
import CartClient from './CartClient'

// Products feed the "you might also like" cross-sell row. ISR safety net keeps
// the catalog in sync with CMS publishes (matches the catalog page).
export const revalidate = 60

export default async function CartPage() {
  const products = await loadInvitationProducts()
  return <CartClient products={products} />
}
