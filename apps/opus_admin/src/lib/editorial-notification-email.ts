// Admin/editorial-team email when a contributor submits a draft for review.
// Uses the shared email shell for brand consistency.

import { renderEmail, plaintextLines } from '@/lib/email-shell'

export type EditorialNotificationInput = {
  authorName: string | null
  authorEmail: string
  articleTitle: string
  category: string
  wordCount: number
  reviewLink: string
  submittedAt: string
}

export function buildEditorialNotificationEmail(input: EditorialNotificationInput): {
  subject: string
  text: string
  html: string
} {
  const author = input.authorName?.trim() || input.authorEmail
  const title = input.articleTitle?.trim() || 'Untitled draft'
  const subject = `New submission for review: ${title}`
  const submittedDate = new Date(input.submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const preheader = `${author} sent a ${input.wordCount.toLocaleString()}-word draft for editorial review.`

  const text = plaintextLines([
    `${author} submitted "${title}" for review.`,
    '',
    `Category: ${input.category}`,
    `Word count: ${input.wordCount.toLocaleString()}`,
    `Submitted: ${submittedDate}`,
    `Author: ${author}`,
    '',
    `Review in admin: ${input.reviewLink}`,
  ])

  const html = renderEmail({
    preheader,
    eyebrow: 'Editorial · Submission',
    heading: 'New submission for review',
    sections: [
      {
        kind: 'paragraph',
        text: `<strong>${escapeForHtml(author)}</strong> just submitted a new draft and it's waiting in the queue.`,
      },
      { kind: 'titleCard', title, meta: input.category },
      {
        kind: 'detailRows',
        label: 'Submission details',
        rows: [
          { label: 'Word count', value: input.wordCount.toLocaleString() },
          { label: 'Submitted', value: submittedDate },
          { label: 'Author', value: author },
        ],
      },
      { kind: 'cta', href: input.reviewLink, label: 'Open in admin' },
    ],
  })

  return { subject, text, html }
}

function escapeForHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
