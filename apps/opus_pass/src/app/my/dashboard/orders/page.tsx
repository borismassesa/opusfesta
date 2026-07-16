import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { getOrdersForDashboard } from '@/lib/dashboard/queries'
import OrdersManager from './OrdersManager'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Orders',
}

export default async function OrdersPage() {
  const [locale, orders] = await Promise.all([getLocale(), getOrdersForDashboard()])
  const strings = await loadUiStrings('dashboard-orders', locale)
  return <OrdersManager strings={strings} orders={orders} />
}
