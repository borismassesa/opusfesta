'use server'

import { revalidatePath } from 'next/cache'
import { hasPermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Shared server actions for the Growth Tracker's KpiMonthlyGrid, used by the
// marketing / social / studio pages. Filling in a monthly actual is routine
// reporting (growth.write); editing the target itself requires growth.admin.

export type ActionResult = { ok: true } | { ok: false; error: string }

function revalidateAll() {
  revalidatePath('/growth')
  revalidatePath('/growth/marketing')
  revalidatePath('/growth/social')
  revalidatePath('/growth/studio')
}

export async function updateKpiTarget(input: { kpiTargetId: string; monthlyTarget: number }): Promise<ActionResult> {
  if (!(await hasPermission('growth.admin'))) {
    return { ok: false, error: "You don't have permission to edit Growth Tracker targets." }
  }
  if (!Number.isFinite(input.monthlyTarget) || input.monthlyTarget < 0) {
    return { ok: false, error: 'Target must be a positive number.' }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('growth_kpi_targets')
    .update({ monthly_target: input.monthlyTarget })
    .eq('id', input.kpiTargetId)
  if (error) {
    console.error('[growth] updateKpiTarget failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateAll()
  return { ok: true }
}

const MONTH_RE = /^\d{4}-\d{2}-01$/

export async function saveKpiActual(input: {
  kpiTargetId: string
  month: string
  actual: number | null
}): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to log Growth Tracker data." }
  }
  if (!MONTH_RE.test(input.month)) return { ok: false, error: 'Invalid month.' }
  if (input.actual !== null && !Number.isFinite(input.actual)) {
    return { ok: false, error: 'Not a number.' }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_kpi_actuals').upsert(
    { kpi_target_id: input.kpiTargetId, month: input.month, actual: input.actual },
    { onConflict: 'kpi_target_id,month' },
  )
  if (error) {
    console.error('[growth] saveKpiActual failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateAll()
  return { ok: true }
}
