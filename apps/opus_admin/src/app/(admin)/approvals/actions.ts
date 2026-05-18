'use server'

// Server actions for the Approvals module. State persistence still lives
// in the client for now (no Supabase table yet); these actions exist so
// transitions can trigger transactional emails via Resend without
// shipping the API key to the browser.
//
// Each action returns a small `{ sent, count, errors }` summary so the
// client can surface whether the notification actually went out (or
// degraded gracefully when email isn't configured).

import { isEmailConfigured, sendEmail, type EmailResult } from '@/lib/email'
import {
  buildApprovedEmail,
  buildInfoRequestedEmail,
  buildRefusedEmail,
  buildSubmittedEmail,
  type ApprovalEmailInput,
  type ApprovalEmailParty,
} from '@/lib/approval-email'

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
