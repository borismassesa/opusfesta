import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase'
import type {
  ApprovalActivity,
  ApprovalActivityKind,
  ApprovalApprover,
  ApprovalCategoryKey,
  ApprovalRequest,
  ApprovalStatus,
} from './types'

// Data access for the Approvals module. Reads/writes go through the service
// role key; callers gate on approvals access before invoking these. Rows are
// mapped here into the camelCase ApprovalRequest shape the UI already speaks.

type RequestRow = {
  id: string
  category: string
  subject: string
  owner_name: string
  owner_email: string
  owner_initials: string
  owner_clerk_id: string | null
  fields: unknown
  approvers: unknown
  status: string
  submitted_at: string | null
  created_at: string
  updated_at: string
}

type ActivityRow = {
  id: string
  request_id: string
  kind: string
  author: string
  author_initials: string
  author_color: string
  body: string
  created_at: string
}

function asApprovers(value: unknown): ApprovalApprover[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === 'object')
    .map((a) => ({
      id: String(a.id ?? ''),
      name: String(a.name ?? ''),
      role: typeof a.role === 'string' ? a.role : undefined,
      email: String(a.email ?? ''),
    }))
}

function asFields(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v == null) continue
    out[k] = typeof v === 'string' ? v : String(v)
  }
  return out
}

function mapActivity(row: ActivityRow): ApprovalActivity {
  return {
    id: row.id,
    kind: row.kind as ApprovalActivityKind,
    at: row.created_at,
    author: row.author,
    authorInitials: row.author_initials,
    authorColor: row.author_color,
    body: row.body,
  }
}

function mapRequest(row: RequestRow, activity: ApprovalActivity[]): ApprovalRequest {
  // `updatedAt` drives sort order: submission date once submitted, else the
  // last touch. submitted_at is the cleaner signal for "Submitted" rows.
  const updatedAt = row.status === 'Submitted' && row.submitted_at ? row.submitted_at : row.updated_at
  return {
    id: row.id,
    category: row.category as ApprovalCategoryKey,
    subject: row.subject,
    owner: row.owner_name,
    ownerEmail: row.owner_email,
    ownerInitials: row.owner_initials,
    fields: asFields(row.fields),
    approvers: asApprovers(row.approvers),
    status: row.status as ApprovalStatus,
    updatedAt,
    createdAt: row.created_at,
    activity,
  }
}

export async function listApprovalRequests(): Promise<ApprovalRequest[]> {
  const supabase = createSupabaseAdminClient()
  const { data: requests, error } = await supabase
    .from('approval_requests')
    .select('*')
    .order('updated_at', { ascending: false })
    .returns<RequestRow[]>()
  if (error) {
    console.error('[approvals] listApprovalRequests failed', error)
    return []
  }
  if (!requests || requests.length === 0) return []

  const { data: activity, error: activityError } = await supabase
    .from('approval_request_activity')
    .select('*')
    .in('request_id', requests.map((r) => r.id))
    .order('created_at', { ascending: true })
    .returns<ActivityRow[]>()
  if (activityError) {
    console.error('[approvals] activity fetch failed', activityError)
  }

  const byRequest = new Map<string, ApprovalActivity[]>()
  for (const row of activity ?? []) {
    const list = byRequest.get(row.request_id) ?? []
    list.push(mapActivity(row))
    byRequest.set(row.request_id, list)
  }

  return requests.map((r) => mapRequest(r, byRequest.get(r.id) ?? []))
}

export async function getApprovalRequest(id: string): Promise<ApprovalRequest | null> {
  const supabase = createSupabaseAdminClient()
  const { data: row, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle<RequestRow>()
  if (error) {
    console.error('[approvals] getApprovalRequest failed', error)
    return null
  }
  if (!row) return null

  const { data: activity } = await supabase
    .from('approval_request_activity')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true })
    .returns<ActivityRow[]>()

  return mapRequest(row, (activity ?? []).map(mapActivity))
}
