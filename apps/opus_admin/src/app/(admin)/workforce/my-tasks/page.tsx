import { redirect } from 'next/navigation'
import { getCallerEmail } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import MyTasksHeading from './MyTasksHeading'
import MyTasksList from './MyTasksList'
import { completeTask, reopenTask, startTask } from './actions'

export const dynamic = 'force-dynamic'

// "My tasks" — every workforce member can land here from their
// dashboard lane, but the page is most meaningful for interns
// (their lane links here). Shows the caller's own tasks grouped by
// status; supports marking complete / start / reopen via server
// actions.
//
// Auth: covered by the (admin)/workforce layout which gates on
// workforce.read. The actions enforce write permission of their own.

export type InternTaskRow = {
  id: string
  title: string
  description: string | null
  status: 'Todo' | 'In Progress' | 'Done' | 'Skipped'
  category: 'Onboarding' | 'Reading' | 'Shadowing' | 'Project' | 'Admin'
  due_date: string | null
  completed_at: string | null
  created_at: string
}

export default async function MyTasksPage() {
  const email = await getCallerEmail()
  if (!email) redirect('/')

  const supabase = createSupabaseAdminClient()
  const { data: employee } = await supabase
    .from('workforce_employees')
    .select('id, full_name, department')
    .ilike('email', email)
    .maybeSingle<{ id: string; full_name: string; department: string }>()

  if (!employee) {
    return (
      <div className="pb-12">
        <MyTasksHeading
          title="My tasks"
          subtitle="No workforce record yet — ask an admin to add you."
        />
      </div>
    )
  }

  const { data, error } = await supabase
    .from('intern_tasks')
    .select('id, title, description, status, category, due_date, completed_at, created_at')
    .eq('employee_id', employee.id)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(200)
  if (error) throw error
  const tasks = (data ?? []) as InternTaskRow[]

  const open = tasks.filter((t) => t.status === 'Todo' || t.status === 'In Progress')
  const done = tasks.filter((t) => t.status === 'Done')

  return (
    <div className="pb-12">
      <MyTasksHeading
        title="My tasks"
        subtitle={`${open.length} open · ${done.length} done`}
      />
      <div className="mx-auto max-w-[1000px] px-2 pt-6">
        <MyTasksList
          tasks={tasks}
          actions={{ start: startTask, complete: completeTask, reopen: reopenTask }}
        />
      </div>
    </div>
  )
}
