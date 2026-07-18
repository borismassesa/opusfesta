import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { getOrdersForDashboard } from '@/lib/dashboard/queries'
import OrdersManager from './OrdersManager'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Orders',
}

export default async function OrdersPage() {
  const locale = await getLocale()
  const [strings, initialOrders] = await Promise.all([
    loadUiStrings('dashboard-orders', locale),
    getOrdersForDashboard(),
  ])
  return <OrdersManager strings={strings} initialOrders={initialOrders} />
}
