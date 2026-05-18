'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requirePermission } from '@/lib/admin-auth'
import { allocateExpenseReference, type ExpenseStatus, type PaidBy } from './queries'

// Allowed forward transitions. Refused / paid are terminal — to revive them
// the user has to clone the expense into a new draft (out of scope for now).
const NEXT_STATUSES: Record<ExpenseStatus, ExpenseStatus[]> = {
  draft: ['submitted', 'refused'],
  submitted: ['approved', 'refused'],
  approved: ['in_payment', 'refused'],
  in_payment: ['paid', 'refused'],
  paid: ['posted'],
  posted: [],
  refused: [],
}

export type CreateExpenseInput = {
  employeeId: string | null
  description: string
  expenseDate: string
  categoryId: string | null
  paidBy: PaidBy
  totalTzs: number
  notes?: string
  analyticDistribution?: string
}

export async function createExpense(input: CreateExpenseInput): Promise<{ id: string; reference: string }> {
  await requirePermission('finance.read')

  if (!input.description.trim()) throw new Error('Description is required.')
  if (!(input.totalTzs >= 0)) throw new Error('Total must be zero or positive.')
  if (!input.expenseDate) throw new Error('Expense date is required.')

  const reference = await allocateExpenseReference()
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('finance_expenses')
    .insert({
      reference,
      employee_id: input.employeeId,
      description: input.description.trim(),
      expense_date: input.expenseDate,
      category_id: input.categoryId,
      paid_by: input.paidBy,
      total_tzs: Math.round(input.totalTzs),
      currency: 'TZS',
      status: 'draft',
      notes: input.notes?.trim() || null,
      analytic_distribution: input.analyticDistribution?.trim() || null,
    })
    .select('id, reference')
    .single<{ id: string; reference: string }>()
  if (error) throw new Error(error.message)

  revalidatePath('/finance/expenses')
  return data
}

export async function setExpenseStatus(id: string, nextStatus: ExpenseStatus, reason?: string): Promise<void> {
  await requirePermission('finance.write')

  const supabase = createSupabaseAdminClient()
  const { data: existing, error: fetchError } = await supabase
    .from('finance_expenses')
    .select('status')
    .eq('id', id)
    .single<{ status: ExpenseStatus }>()
  if (fetchError) throw new Error(fetchError.message)

  const allowed = NEXT_STATUSES[existing.status]
  if (!allowed.includes(nextStatus)) {
    throw new Error(`Cannot move expense from "${existing.status}" to "${nextStatus}".`)
  }
  if (nextStatus === 'refused' && !reason?.trim()) {
    throw new Error('A reason is required when refusing an expense.')
  }

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { status: nextStatus }
  if (nextStatus === 'submitted') patch.submitted_at = now
  if (nextStatus === 'approved') patch.approved_at = now
  if (nextStatus === 'paid') patch.paid_at = now
  if (nextStatus === 'refused') {
    patch.refused_at = now
    patch.refused_reason = reason?.trim() ?? null
  }

  const { error } = await supabase.from('finance_expenses').update(patch).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/finance/expenses')
}

export async function deleteExpense(id: string): Promise<void> {
  await requirePermission('finance.write')

  const supabase = createSupabaseAdminClient()
  // Only drafts and refused claims can be deleted — anything past that
  // has been seen by approvers/finance and needs an audit trail.
  const { data: existing, error: fetchError } = await supabase
    .from('finance_expenses')
    .select('status')
    .eq('id', id)
    .single<{ status: ExpenseStatus }>()
  if (fetchError) throw new Error(fetchError.message)
  if (existing.status !== 'draft' && existing.status !== 'refused') {
    throw new Error('Only draft or refused expenses can be deleted.')
  }

  const { error } = await supabase.from('finance_expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/finance/expenses')
}
