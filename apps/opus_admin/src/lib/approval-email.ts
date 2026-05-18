// Transactional email templates for the Approvals module:
//   - submitted       → all approvers, notifying them a request awaits decision
//   - approved        → submitter, with the approver's optional note
//   - refused         → submitter, with the approver's optional reason
//   - info_requested  → submitter, with the approver's clarification request
//
// Uses the shared email shell so brand chrome stays consistent with
// every other transactional email the admin app sends.

import { renderEmail, plaintextLines, escapeHtml } from '@/lib/email-shell'

export type ApprovalEmailParty = {
  name: string
  email: string
  role?: string | null
}

export type ApprovalEmailInput = {
  approvalSubject: string
  approvalCategory: string
  approvalLink: string
  submitter: ApprovalEmailParty
  // The approver acting (for decision/info-request emails) or the
  // recipient approver (for the submission email).
  actor: ApprovalEmailParty
  // Optional approver note attached to the decision / info request.
  note?: string | null
}

function fmtParty(p: ApprovalEmailParty): string {
  if (p.role) return `${p.name} (${p.role})`
  return p.name
}

export function buildSubmittedEmail(input: ApprovalEmailInput): {
  subject: string
  text: string
  html: string
} {
  const subject = `Approval needed: ${input.approvalSubject}`
  const preheader = `${input.submitter.name} submitted a ${input.approvalCategory} request and named you as an approver.`

  const text = plaintextLines([
    `Hi ${input.actor.name},`,
    '',
    `${input.submitter.name} just submitted a ${input.approvalCategory} request and named you as an approver.`,
    '',
    `Subject: ${input.approvalSubject}`,
    `Category: ${input.approvalCategory}`,
    '',
    `Review the request: ${input.approvalLink}`,
    '',
    'You can approve, refuse, or request more information from the form.',
    '— OpusFesta Approvals',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Approvals · Action needed',
    heading: 'A request needs your decision',
    sections: [
      { kind: 'paragraph', text: `Hi ${escapeHtml(input.actor.name)},` },
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(input.submitter.name)}</strong> just submitted a <strong>${escapeHtml(input.approvalCategory)}</strong> request and named you as an approver.`,
      },
      {
        kind: 'titleCard',
        title: input.approvalSubject,
        meta: input.approvalCategory,
      },
      { kind: 'cta', href: input.approvalLink, label: 'Review the request' },
      {
        kind: 'paragraph',
        text: 'You can approve, refuse, or request more information from the form.',
      },
    ],
    closing: 'Thanks for keeping the team moving.',
    reviewer: {
      name: 'OpusFesta Approvals',
      email: null,
    },
  })

  return { subject, text, html }
}

export function buildApprovedEmail(input: ApprovalEmailInput): {
  subject: string
  text: string
  html: string
} {
  const subject = `Approved: ${input.approvalSubject}`
  const preheader = `${fmtParty(input.actor)} approved your ${input.approvalCategory} request.`
  const note = input.note?.trim() || ''

  const text = plaintextLines([
    `Hi ${input.submitter.name},`,
    '',
    `${fmtParty(input.actor)} just approved your ${input.approvalCategory} request.`,
    '',
    `Subject: ${input.approvalSubject}`,
    '',
    note ? 'Approver notes:' : null,
    note || null,
    note ? '' : null,
    `Open the request: ${input.approvalLink}`,
    '— OpusFesta Approvals',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Approvals · Approved',
    heading: 'Your request has been approved',
    sections: [
      { kind: 'paragraph', text: `Hi ${escapeHtml(input.submitter.name)},` },
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(fmtParty(input.actor))}</strong> just approved your <strong>${escapeHtml(input.approvalCategory)}</strong> request.`,
      },
      {
        kind: 'titleCard',
        title: input.approvalSubject,
        meta: input.approvalCategory,
      },
      ...(note
        ? [{ kind: 'notesCard' as const, label: 'Approver notes', body: note }]
        : []),
      { kind: 'cta', href: input.approvalLink, label: 'Open the request' },
    ],
    closing: 'Thanks for staying tidy with paperwork — keep going.',
    reviewer: {
      name: input.actor.name,
      email: input.actor.email,
      role: input.actor.role ?? 'Approver',
    },
  })

  return { subject, text, html }
}

export function buildRefusedEmail(input: ApprovalEmailInput): {
  subject: string
  text: string
  html: string
} {
  const subject = `Refused: ${input.approvalSubject}`
  const preheader = `${fmtParty(input.actor)} refused your ${input.approvalCategory} request — see reasoning inside.`
  const note = input.note?.trim() || ''

  const text = plaintextLines([
    `Hi ${input.submitter.name},`,
    '',
    `${fmtParty(input.actor)} refused your ${input.approvalCategory} request.`,
    '',
    `Subject: ${input.approvalSubject}`,
    '',
    note ? 'Approver reasoning:' : null,
    note || null,
    note ? '' : null,
    `Open the request: ${input.approvalLink}`,
    '',
    'You can reopen it as a draft, address the feedback, and resubmit.',
    '— OpusFesta Approvals',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Approvals · Refused',
    heading: 'Your request was not approved',
    sections: [
      { kind: 'paragraph', text: `Hi ${escapeHtml(input.submitter.name)},` },
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(fmtParty(input.actor))}</strong> refused your <strong>${escapeHtml(input.approvalCategory)}</strong> request.`,
      },
      {
        kind: 'titleCard',
        title: input.approvalSubject,
        meta: input.approvalCategory,
      },
      ...(note
        ? [{ kind: 'notesCard' as const, label: 'Approver reasoning', body: note }]
        : []),
      { kind: 'cta', href: input.approvalLink, label: 'Open the request' },
      {
        kind: 'paragraph',
        text: 'You can reopen it as a draft, address the feedback, and resubmit.',
      },
    ],
    closing: 'Thanks for the patience — happy to look again once it&rsquo;s updated.',
    reviewer: {
      name: input.actor.name,
      email: input.actor.email,
      role: input.actor.role ?? 'Approver',
    },
  })

  return { subject, text, html }
}

export function buildInfoRequestedEmail(input: ApprovalEmailInput): {
  subject: string
  text: string
  html: string
} {
  const subject = `More info needed: ${input.approvalSubject}`
  const preheader = `${fmtParty(input.actor)} needs more information before deciding.`
  const note = input.note?.trim() || ''

  const text = plaintextLines([
    `Hi ${input.submitter.name},`,
    '',
    `${fmtParty(input.actor)} needs more information before deciding on your ${input.approvalCategory} request.`,
    '',
    `Subject: ${input.approvalSubject}`,
    '',
    note ? 'What they need:' : null,
    note || null,
    note ? '' : null,
    `Open the request: ${input.approvalLink}`,
    '',
    'The request is back in your queue — update the details and resubmit when ready.',
    '— OpusFesta Approvals',
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Approvals · Info requested',
    heading: 'An approver needs more information',
    sections: [
      { kind: 'paragraph', text: `Hi ${escapeHtml(input.submitter.name)},` },
      {
        kind: 'paragraph',
        text: `<strong>${escapeHtml(fmtParty(input.actor))}</strong> needs more information before deciding on your <strong>${escapeHtml(input.approvalCategory)}</strong> request.`,
      },
      {
        kind: 'titleCard',
        title: input.approvalSubject,
        meta: input.approvalCategory,
      },
      ...(note
        ? [{ kind: 'notesCard' as const, label: 'What they need', body: note }]
        : []),
      { kind: 'cta', href: input.approvalLink, label: 'Open the request' },
      {
        kind: 'paragraph',
        text: 'The request is back in your queue — update the details and resubmit when ready.',
      },
    ],
    closing: 'Thanks — looking forward to the next pass.',
    reviewer: {
      name: input.actor.name,
      email: input.actor.email,
      role: input.actor.role ?? 'Approver',
    },
  })

  return { subject, text, html }
}
