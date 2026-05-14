import WorkforceHeading from '../_components/PageHeading'
import PayrollClient from './PayrollClient'
import { getEmployees, getPayrollRuns } from '../_lib/queries'

export const dynamic = 'force-dynamic'

export default async function PayrollPage() {
  const [runs, employees] = await Promise.all([getPayrollRuns(), getEmployees()])
  const next = runs.find((r) => r.status === 'In review') ?? runs[0]
  const subtitle = next
    ? `Next run: ${next.period} · pay date ${new Date(next.payDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
    : 'No runs scheduled yet — start one from the dashboard.'
  return (
    <>
      <WorkforceHeading title="Payroll" subtitle={subtitle} />
      <PayrollClient runs={runs} employees={employees} />
    </>
  )
}
