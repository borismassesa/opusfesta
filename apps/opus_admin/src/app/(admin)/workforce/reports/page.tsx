import WorkforceHeading from '../_components/PageHeading'
import { getEmployees, getReports, getReportTemplates } from '../_lib/queries'
import ReportsTrackingClient from './ReportsTrackingClient'

export const dynamic = 'force-dynamic'

// Admin tracking view for submitted reports. Auth handled by the
// (admin)/workforce layout (workforce.read). Filtering by report type,
// employee, and date is URL-driven so links/back-button work.

type SearchParams = { template?: string; employee?: string; date?: string }
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const templateId = sp.template || null
  const employeeId = sp.employee || null
  const date = sp.date && DATE_RE.test(sp.date) ? sp.date : null

  const [reports, templates, employees] = await Promise.all([
    getReports({ templateId, employeeId, date }),
    getReportTemplates(),
    getEmployees(),
  ])

  return (
    <div className="pb-12">
      <WorkforceHeading title="Reports" subtitle="Submitted reports across the team." />
      <div className="pt-2">
        <ReportsTrackingClient
          reports={reports}
          templates={templates.map((t) => ({ id: t.id, name: t.name }))}
          employees={employees.map((e) => ({ id: e.id, name: e.name }))}
          activeTemplateId={templateId}
          activeEmployeeId={employeeId}
          activeDate={date}
        />
      </div>
    </div>
  )
}
