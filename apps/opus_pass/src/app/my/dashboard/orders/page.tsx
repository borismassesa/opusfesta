import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import OrdersManager from './OrdersManager'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Orders',
}

export default async function OrdersPage() {
  const locale = await getLocale()
  const strings = await loadUiStrings('dashboard-orders', locale)
  return <OrdersManager strings={strings} />
}
