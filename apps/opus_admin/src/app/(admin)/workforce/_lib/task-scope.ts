import 'server-only'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCallerEmail, hasPermission } from '@/lib/admin-auth'
import type { Department } from './types'

// Who may assign tasks, and how widely. Two tiers:
//   - workforce.write holders (owners/admins/People Ops): any target
//   - dept managers (an employee with ≥1 direct report): their own
//     department only
// Shared by the /workforce/tasks page (to scope the form + list) and the
// server actions (to enforce the gate). Both must agree, hence one module.
export type CallerScope =
  | { canAssignAll: true; employeeId: string | null }
  | { canAssignAll: false; department: Department; employeeId: string }

export async function getCallerScope(): Promise<CallerScope | null> {
  const canAssignAll = await hasPermission('workforce.write')
  const email = await getCallerEmail()

  const supabase = createSupabaseAdminClient()
  const employee = email
    ? (
        await supabase
          .from('workforce_employees')
          .select('id, department')
          .ilike('email', email)
          .maybeSingle<{ id: string; department: Department }>()
      ).data
    : null

  if (canAssignAll) return { canAssignAll: true, employeeId: employee?.id ?? null }
  if (!employee) return null

  const { count } = await supabase
    .from('workforce_employees')
    .select('id', { count: 'exact', head: true })
    .eq('manager_id', employee.id)
  if (count && count > 0) {
    return { canAssignAll: false, department: employee.department, employeeId: employee.id }
  }
  return null
}
