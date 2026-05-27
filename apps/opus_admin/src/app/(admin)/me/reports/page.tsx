import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import WorkforceHeading from '../../workforce/_components/PageHeading'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { escapeLike, hasPermission } from '@/lib/admin-auth'
import { getReportsForEmployee, getReportTemplates } from '../../workforce/_lib/queries'
import MyReportsClient from './MyReportsClient'
import { saveReport } from './actions'

export const dynamic = 'force-dynamic'

// "My reports" — the personal report surface. The employee picks a report
// type from the templates available to their department, fills the dynamic
// form, saves as draft or submits, and browses their own history. Admins
// track everyone's submissions at /workforce/reports.

const TZ = 'Africa/Dar_es_Salaam'

function todayInTz(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export default async function MyReportsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/me/reports')

  const user = await currentUser()
  const email =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ??
    user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ??
    null
  if (!email) redirect('/')

  const supabase = createSupabaseAdminClient()
  const { data: employee } = await supabase
    .from('workforce_employees')
    .select('id, full_name, department, job_title')
    .ilike('email', escapeLike(email))
    .maybeSingle<{ id: string; full_name: string; department: string; job_title: string }>()

  if (!employee) {
    return (
      <div className="pb-12">
        <WorkforceHeading
          title="My reports"
          subtitle="No workforce record yet — ask an admin to add you."
        />
      </div>
    )
  }

  const [allTemplates, reports, canSeeAll] = await Promise.all([
    getReportTemplates({ activeOnly: true }),
    getReportsForEmployee(employee.id),
    hasPermission('workforce.write'),
  ])

  // Admins/owners (workforce.write) oversee everything, so they can write
  // any report type. Regular employees see unrestricted templates plus the
  // ones offered to their department.
  const templates = canSeeAll
    ? allTemplates
    : allTemplates.filter(
        (t) => t.departments.length === 0 || t.departments.includes(employee.department),
      )

  return (
    <div className="pb-12">
      <WorkforceHeading
        title="My reports"
        subtitle="Pick a report type, fill it in, and submit. Your team leads can see these."
      />
      <div className="pt-2">
        <MyReportsClient
          templates={templates}
          reports={reports}
          today={todayInTz()}
          saveReport={saveReport}
        />
      </div>
    </div>
  )
}
