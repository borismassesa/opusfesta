'use server'

// Server actions for the Approvals module. State persistence still lives
// in the client for now (no Supabase table yet); these actions exist so
// transitions can trigger transactional emails via Resend without
// shipping the API key to the browser.
//
// Each action returns a small `{ sent, count, errors }` summary so the
// client can surface whether the notification actually went out (or
// degraded gracefully when email isn't configured).

import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCallerEmail, hasAnyPermission } from '@/lib/admin-auth'
import { isEmailConfigured, sendEmail, type EmailResult } from '@/lib/email'
import {
  buildApprovedEmail,
  buildInfoRequestedEmail,
  buildRefusedEmail,
  buildSubmittedEmail,
  type ApprovalEmailInput,
  type ApprovalEmailParty,
} from '@/lib/approval-email'
import { CATEGORIES, findApprover } from './data'
import { getApprovalRequest } from './queries'
import type {
  ApprovalActor,
  ApprovalApprover,
  ApprovalCategoryKey,
  ApprovalRequest,
  ApprovalStatus,
} from './types'

export type EmailDispatchSummary = {
  configured: boolean
  // How many recipients we attempted to email (0 when not configured).
  attempted: number
  // How many were accepted by Resend.
  sent: number
  // Per-recipient error messages, if any.
  errors: { to: string; reason: string }[]
}

type Recipient = ApprovalEmailParty

type SendArgs = {
  recipients: Recipient[]
  buildFor: (recipient: Recipient) => {
    subject: string
    text: string
    html: string
  }
}

async function dispatch({ recipients, buildFor }: SendArgs): Promise<EmailDispatchSummary> {
  if (!isEmailConfigured()) {
    return { configured: false, attempted: 0, sent: 0, errors: [] }
  }
  if (recipients.length === 0) {
    return { configured: true, attempted: 0, sent: 0, errors: [] }
  }

  const results: { to: string; result: EmailResult }[] = await Promise.all(
    recipients.map(async (r) => {
      const tmpl = buildFor(r)
      const result = await sendEmail({
        to: r.email,
        subject: tmpl.subject,
        text: tmpl.text,
        html: tmpl.html,
      })
      return { to: r.email, result }
    }),
  )

  let sent = 0
  const errors: { to: string; reason: string }[] = []
  for (const { to, result } of results) {
    if (result.sent) sent += 1
    else errors.push({ to, reason: result.error ?? result.reason })
  }
  return { configured: true, attempted: recipients.length, sent, errors }
}

// ----- Public action surface -------------------------------------------------

export type SubmitNotifyInput = {
  approvalSubject: string
  approvalCategory: string
  approvalLink: string
  submitter: ApprovalEmailParty
  approvers: ApprovalEmailParty[]
}

export async function notifySubmitted(input: SubmitNotifyInput): Promise<EmailDispatchSummary> {
  return dispatch({
    recipients: input.approvers,
    buildFor: (approver) =>
      buildSubmittedEmail({
        approvalSubject: input.approvalSubject,
        approvalCategory: input.approvalCategory,
        approvalLink: input.approvalLink,
        submitter: input.submitter,
        actor: approver,
      }),
  })
}

export type DecisionNotifyInput = {
  approvalSubject: string
  approvalCategory: string
  approvalLink: string
  submitter: ApprovalEmailParty
  actor: ApprovalEmailParty
  note?: string | null
}

export async function notifyApproved(input: DecisionNotifyInput): Promise<EmailDispatchSummary> {
  const payload: ApprovalEmailInput = {
    approvalSubject: input.approvalSubject,
    approvalCategory: input.approvalCategory,
    approvalLink: input.approvalLink,
    submitter: input.submitter,
    actor: input.actor,
    note: input.note ?? null,
  }
  return dispatch({
    recipients: [input.submitter],
    buildFor: () => buildApprovedEmail(payload),
  })
}

export async function notifyRefused(input: DecisionNotifyInput): Promise<EmailDispatchSummary> {
  const payload: ApprovalEmailInput = {
    approvalSubject: input.approvalSubject,
    approvalCategory: input.approvalCategory,
    approvalLink: input.approvalLink,
    submitter: input.submitter,
    actor: input.actor,
    note: input.note ?? null,
  }
  return dispatch({
    recipients: [input.submitter],
    buildFor: () => buildRefusedEmail(payload),
  })
}

export async function notifyInfoRequested(input: DecisionNotifyInput): Promise<EmailDispatchSummary> {
  const payload: ApprovalEmailInput = {
    approvalSubject: input.approvalSubject,
    approvalCategory: input.approvalCategory,
    approvalLink: input.approvalLink,
    submitter: input.submitter,
    actor: input.actor,
    note: input.note ?? null,
  }
  return dispatch({
    recipients: [input.submitter],
    buildFor: () => buildInfoRequestedEmail(payload),
  })
}

// ----- Persistence (Supabase) -----------------------------------------------
//
// Requests live in `approval_requests` + `approval_request_activity`. Every
// mutation goes through the service role key, so each action first checks the
// caller has approvals access (finance.read OR workforce.read — same gate as
// the /approvals layout). Owner identity and activity authorship are resolved
// from the Clerk session server-side, never trusted from the client.

export type ApprovalActionResult =
  | { ok: true; request: ApprovalRequest }
  | { ok: false; error: string }

export type CreateApprovalInput = {
  category: ApprovalCategoryKey
  subject: string
  fields: Record<string, string>
  approvers: ApprovalApprover[]
}

export type SaveApprovalInput = {
  subject: string
  fields: Record<string, string>
  approvers: ApprovalApprover[]
}

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.key))
const VALID_STATUSES: ReadonlySet<ApprovalStatus> = new Set<ApprovalStatus>([
  'To Submit', 'Submitted', 'Approved', 'Refused',
])

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'YOU'
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')
}

async function requireApprovalsAccess(): Promise<void> {
  const allowed = await hasAnyPermission(['finance.read', 'workforce.read'])
  if (!allowed) {
    throw new Error("You don't have permission to manage approvals.")
  }
}

// The acting user, resolved from the Clerk session. Used for request
// ownership and for authoring activity entries.
async function resolveActor(): Promise<ApprovalActor & { clerkId: string | null }> {
  const { userId } = await auth()
  const user = await currentUser()
  const email = (await getCallerEmail()) ?? ''
  const name = user?.fullName?.trim() || user?.firstName?.trim() || email || 'You'
  return {
    name,
    email,
    initials: initialsFromName(name),
    color: '#10B981',
    clerkId: userId ?? null,
  }
}

// Only accept approvers that exist in the canonical roster, and store the
// roster's name/email/role rather than whatever the client sent — this keeps
// the email notification pipeline pointed at real, vetted inboxes.
function resolveApprovers(input: ApprovalApprover[]): ApprovalApprover[] {
  const seen = new Set<string>()
  const out: ApprovalApprover[] = []
  for (const a of input ?? []) {
    const match = findApprover(a?.id)
    if (!match || seen.has(match.id)) continue
    seen.add(match.id)
    out.push(match)
  }
  return out
}

function sanitizeFields(fields: Record<string, string>): Record<string, string> {
  if (!fields || typeof fields !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string' && v.trim().length > 0) out[k] = v
  }
  return out
}

async function insertActivity(
  requestId: string,
  kind: 'system' | 'note',
  body: string,
  actor: ApprovalActor,
): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('approval_request_activity').insert({
    request_id: requestId,
    kind,
    author: kind === 'system' ? 'System' : actor.name,
    author_initials: kind === 'system' ? 'SY' : actor.initials,
    author_color: kind === 'system' ? '#94A3B8' : actor.color,
    body,
  })
  if (error) console.error('[approvals] insertActivity failed', error)
}

function transitionMessage(
  next: ApprovalStatus,
  actorName: string,
  decisionKind?: 'approve' | 'refuse' | 'info',
): string {
  if (next === 'To Submit' && decisionKind === 'info') {
    return `${actorName} requested more information.`
  }
  switch (next) {
    case 'Submitted':
      return `${actorName} submitted this for approval.`
    case 'Approved':
      return `${actorName} approved this request.`
    case 'Refused':
      return `${actorName} refused this request.`
    case 'To Submit':
      return `${actorName} reopened this as a draft.`
  }
}

export async function createApprovalRequest(
  input: CreateApprovalInput,
): Promise<ApprovalActionResult> {
  await requireApprovalsAccess()
  if (!VALID_CATEGORIES.has(input.category)) {
    return { ok: false, error: 'Unknown approval category.' }
  }
  const subject = input.subject?.trim()
  if (!subject) return { ok: false, error: 'Approval subject is required.' }

  const actor = await resolveActor()
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      category: input.category,
      subject,
      owner_name: actor.name,
      owner_email: actor.email,
      owner_initials: actor.initials,
      owner_clerk_id: actor.clerkId,
      fields: sanitizeFields(input.fields),
      approvers: resolveApprovers(input.approvers),
      status: 'To Submit',
    })
    .select('id')
    .single<{ id: string }>()
  if (error || !data) {
    console.error('[approvals] createApprovalRequest failed', error)
    return { ok: false, error: error?.message || 'Could not create the request.' }
  }

  await insertActivity(data.id, 'system', `${actor.name} created this request.`, actor)

  const request = await getApprovalRequest(data.id)
  if (!request) return { ok: false, error: 'Created, but could not reload the request.' }
  revalidatePath('/approvals')
  return { ok: true, request }
}

export async function saveApprovalRequest(
  id: string,
  input: SaveApprovalInput,
): Promise<ApprovalActionResult> {
  await requireApprovalsAccess()
  const subject = input.subject?.trim()
  if (!subject) return { ok: false, error: 'Approval subject is required.' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('approval_requests')
    .update({
      subject,
      fields: sanitizeFields(input.fields),
      approvers: resolveApprovers(input.approvers),
    })
    .eq('id', id)
  if (error) {
    console.error('[approvals] saveApprovalRequest failed', error)
    return { ok: false, error: error.message || 'Could not save the request.' }
  }

  const request = await getApprovalRequest(id)
  if (!request) return { ok: false, error: 'Request not found.' }
  revalidatePath('/approvals')
  return { ok: true, request }
}

export async function transitionApprovalRequest(
  id: string,
  next: ApprovalStatus,
  decision?: { kind: 'approve' | 'refuse' | 'info'; note?: string },
): Promise<ApprovalActionResult> {
  await requireApprovalsAccess()
  if (!VALID_STATUSES.has(next)) return { ok: false, error: 'Invalid status.' }

  const actor = await resolveActor()
  const supabase = createSupabaseAdminClient()

  const patch: Record<string, unknown> = { status: next }
  // Stamp submitted_at the first time it goes to Submitted; keep it once set
  // so reopen → resubmit doesn't lose the original submission time unless a
  // fresh submission overwrites it.
  if (next === 'Submitted') patch.submitted_at = new Date().toISOString()

  const { error } = await supabase.from('approval_requests').update(patch).eq('id', id)
  if (error) {
    console.error('[approvals] transitionApprovalRequest failed', error)
    return { ok: false, error: error.message || 'Could not update the request.' }
  }

  await insertActivity(id, 'system', transitionMessage(next, actor.name, decision?.kind), actor)
  if (decision?.note?.trim()) {
    await insertActivity(id, 'note', decision.note.trim(), actor)
  }

  const request = await getApprovalRequest(id)
  if (!request) return { ok: false, error: 'Request not found.' }
  revalidatePath('/approvals')
  return { ok: true, request }
}

export async function addApprovalNote(
  id: string,
  body: string,
): Promise<ApprovalActionResult> {
  await requireApprovalsAccess()
  const trimmed = body?.trim()
  if (!trimmed) return { ok: false, error: 'Note is empty.' }

  const actor = await resolveActor()
  await insertActivity(id, 'note', trimmed, actor)
  // Touch updated_at so a noted request resurfaces at the top of the feed.
  const supabase = createSupabaseAdminClient()
  await supabase
    .from('approval_requests')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)

  const request = await getApprovalRequest(id)
  if (!request) return { ok: false, error: 'Request not found.' }
  revalidatePath('/approvals')
  return { ok: true, request }
}
