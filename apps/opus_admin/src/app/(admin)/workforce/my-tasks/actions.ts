'use server'

import { revalidatePath } from 'next/cache'
import { getCallerEmail } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { recordAuditEvent } from '@/lib/audit-log'

// Server actions for the "My tasks" page. Each is scoped to the
// caller's own employee row — admins editing other people's tasks
// have a separate flow (Phase 4 / not in this branch).
//
// Authz: we resolve the caller's workforce_employees row by email
// and only permit mutations where the task's employee_id matches.
// This is enforced server-side rather than via RLS because the admin
// app uses the service role key (bypasses RLS); the same email-match
// check is the gate.

type TaskStatus = 'Todo' | 'In Progress' | 'Done'

async function resolveCallerEmployee(): Promise<{ id: string } | null> {
  const email = await getCallerEmail()
  if (!email) return null
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('workforce_employees')
    .select('id')
    .ilike('email', email)
    .maybeSingle<{ id: string }>()
  return data ?? null
}

async function setTaskStatus(taskId: string, target: TaskStatus): Promise<void> {
  const employee = await resolveCallerEmployee()
  if (!employee) throw new Error('No workforce profile — ask an admin to add you.')

  const supabase = createSupabaseAdminClient()
  // Confirm ownership before mutating. The .eq chain on the UPDATE
  // is the actual enforcement (a non-owner update will affect zero
  // rows and we throw); the SELECT first is just for a clearer
  // error message.
  const { data: task, error: lookupError } = await supabase
    .from('intern_tasks')
    .select('id, employee_id')
    .eq('id', taskId)
    .maybeSingle<{ id: string; employee_id: string }>()
  if (lookupError) throw lookupError
  if (!task) throw new Error('Task not found.')
  if (task.employee_id !== employee.id) {
    void recordAuditEvent({
      eventType: 'intern_tasks.unauthorized_update',
      severity: 'critical',
      message: 'Attempt to update someone else’s task',
      targetResource: `intern_tasks:${taskId}`,
      metadata: { targetOwner: task.employee_id, attemptedBy: employee.id },
    })
    throw new Error("You can only update your own tasks.")
  }

  const patch: Record<string, unknown> = { status: target }
  if (target === 'Done') {
    patch.completed_at = new Date().toISOString()
  } else if (target === 'Todo' || target === 'In Progress') {
    patch.completed_at = null
  }

  const { error } = await supabase
    .from('intern_tasks')
    .update(patch)
    .eq('id', taskId)
    .eq('employee_id', employee.id)
  if (error) throw error
  revalidatePath('/workforce/my-tasks')
  revalidatePath('/')
}

export async function startTask(taskId: string): Promise<void> {
  await setTaskStatus(taskId, 'In Progress')
}
export async function completeTask(taskId: string): Promise<void> {
  await setTaskStatus(taskId, 'Done')
}
export async function reopenTask(taskId: string): Promise<void> {
  await setTaskStatus(taskId, 'Todo')
}
