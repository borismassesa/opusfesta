import { redirect } from 'next/navigation'
import { getAdminAccessRole, hasPermission, isAdminDashboardRole } from '@/lib/admin-auth'
import { getExpenseCategories, getExpenseEmployeeOptions, getExpenses } from './queries'
import ExpensesHeading from './ExpensesHeading'
import ExpensesClient from './ExpensesClient'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasPermission('finance.read'))) redirect('/')

  const [expenses, categories, employees] = await Promise.all([
    getExpenses(),
    getExpenseCategories(),
    getExpenseEmployeeOptions(),
  ])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <ExpensesHeading />
      <ExpensesClient expenses={expenses} categories={categories} employees={employees} />
    </div>
  )
}
