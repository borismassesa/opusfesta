'use server'

import { revalidatePath } from 'next/cache'
import { escapeLike, getCallerEmail, hasPermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  cleanContent,
  parseSections,
  validateContent,
  type ReportContent,
  type ReportStatus,
} from '../../workforce/_lib/report-schema'

// Server action for the personal "My reports" page. Scoped to the caller's
// own employee row by email — you can only write your own reports. Upserts
// on (template_id, employee_id, report_date) so re-saving the same day's
// report edits it rather than duplicating.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

async function resolveCallerEmployee(): Promise<{
  id: string
  full_name: string
  job_title: string
  department: string
} | null> {
  const email = await getCallerEmail()
  if (!email) return null
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('workforce_employees')
    .select('id, full_name, job_title, department')
    .ilike('email', escapeLike(email))
    .maybeSingle<{ id: string; full_name: string; job_title: string; department: string }>()
  return data ?? null
}

export type SaveReportInput = {
  templateId: string
  reportDate: string
  periodEnd?: string | null
  content: ReportContent
  status: ReportStatus
}

export type SaveReportResult = { ok: true } | { ok: false; error: string }

export async function saveReport(input: SaveReportInput): Promise<SaveReportResult> {
  const employee = await resolveCallerEmployee()
  if (!employee) return { ok: false, error: 'No workforce profile — ask an admin to add you.' }

  if (!DATE_RE.test(input.reportDate)) return { ok: false, error: 'Pick a valid date.' }
  if (input.periodEnd && !DATE_RE.test(input.periodEnd)) {
    return { ok: false, error: 'Period end date is invalid.' }
  }
  if (input.periodEnd && input.periodEnd < input.reportDate) {
    return { ok: false, error: 'Period end must be on or after the report date.' }
  }

  const supabase = createSupabaseAdminClient()
  const { data: template, error: templateError } = await supabase
    .from('report_templates')
    .select('id, slug, name, sections, is_active, departments')
    .eq('id', input.templateId)
    .maybeSingle<{
      id: string
      slug: string
      name: string
      sections: unknown
      is_active: boolean
      departments: string[] | null
    }>()
  if (templateError) return { ok: false, error: templateError.message }
  if (!template || !template.is_active) {
    return { ok: false, error: 'That report type is no longer available.' }
  }

  // Department scoping: the picker on the page only offers templates for the
  // caller's department (or unrestricted ones), but the action is the real
  // gate — re-check here so a caller can't submit against another
  // department's template by passing its id directly. Admins (workforce.write)
  // can write any report type.
  const canWriteAny = await hasPermission('workforce.write')
  const departments = template.departments ?? []
  const inScope = departments.length === 0 || departments.includes(employee.department)
  if (!canWriteAny && !inScope) {
    return { ok: false, error: 'That report type is not available for your department.' }
  }

  const sections = parseSections(template.sections)
  const cleaned = cleanContent(sections, input.content)

  // Required-field check only blocks submit — drafts can be partial.
  if (input.status === 'submitted') {
    const valid = validateContent(sections, cleaned)
    if (!valid.ok) return valid
  }

  const snapshot = { slug: template.slug, name: template.name, sections }
  const nowIso = new Date().toISOString()

  const { error } = await supabase.from('workforce_reports').upsert(
    {
      template_id: template.id,
      template_snapshot: snapshot,
      employee_id: employee.id,
      report_date: input.reportDate,
      period_end: input.periodEnd || null,
      status: input.status,
      content: cleaned,
      prepared_by_name: employee.full_name,
      prepared_by_role: employee.job_title,
      submitted_at: input.status === 'submitted' ? nowIso : null,
    },
    { onConflict: 'template_id,employee_id,report_date' },
  )
  if (error) {
    console.error('[reports] saveReport upsert failed', error)
    return { ok: false, error: error.message || 'Could not save your report.' }
  }

  revalidatePath('/me/reports')
  revalidatePath('/workforce/reports')
  return { ok: true }
}
