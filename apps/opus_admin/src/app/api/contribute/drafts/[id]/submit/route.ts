import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import {
  contributorPatchPayload,
  findOwnedContributorDraft,
  rowToContributorDraft,
} from '@/lib/contribute/drafts'
import { validateReadiness } from '@/lib/contribute/validateReadiness'
import { countBodyWords } from '@/lib/contribute/bodyMetrics'
import { isEditableContributorStatus, type ContributorDraft } from '@/lib/contribute/types'
import { isEmailConfigured, sendEmail } from '@/lib/email'
import { buildEditorialNotificationEmail } from '@/lib/editorial-notification-email'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const identity = await requireContributorIdentity()
    const current = await findOwnedContributorDraft(id, identity)
    if (!current) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    if (!isEditableContributorStatus(current.status)) {
      return NextResponse.json({ error: 'This draft is already locked.' }, { status: 423 })
    }

    const input = (await request.json().catch(() => ({}))) as Partial<ContributorDraft>
    const merged: ContributorDraft = {
      ...current,
      ...input,
      body: input.body ?? current.body,
    }
    merged.word_count = input.word_count ?? countBodyWords(merged.body)

    const readiness = validateReadiness(merged)
    if (!readiness.passed) {
      return NextResponse.json({ error: 'Draft is not ready to submit.', readiness }, { status: 422 })
    }
    if (merged.cover_image_url && !merged.cover_image_alt.trim()) {
      return NextResponse.json({ error: 'Cover image alt text is required.' }, { status: 422 })
    }

    const submittedAt = new Date().toISOString()
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('advice_article_submissions')
      .update({
        ...contributorPatchPayload(merged),
        status: 'pending',
        submitted_at: submittedAt,
        locked_until: null,
        correction_notes: null,
        review_notes: null,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    void notifyEditorialTeam({
      authorName: identity.name,
      authorEmail: identity.email,
      articleTitle: merged.title,
      category: merged.category,
      wordCount: merged.word_count,
      submissionId: id,
      submittedAt,
    })

    revalidatePath('/contribute')
    revalidatePath(`/contribute/drafts/${id}`)
    revalidatePath('/operations/articles/submissions')
    return NextResponse.json({ draft: rowToContributorDraft(data) })
  } catch (error) {
    console.error('[contribute draft submit POST]', error)
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Submit failed.'
    const status = message.includes('Contributor access') ? 403 : message.includes('Sign in') ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

// Best-effort fire-and-forget. We never want a Resend hiccup to block a
// contributor from completing their submission — the row is already saved by
// the time this runs.
async function notifyEditorialTeam(args: {
  authorName: string | null
  authorEmail: string
  articleTitle: string
  category: string
  wordCount: number
  submissionId: string
  submittedAt: string
}): Promise<void> {
  try {
    const recipients = parseEditorialRecipients(process.env.EDITORIAL_NOTIFY_EMAIL)
    if (recipients.length === 0 || !isEmailConfigured()) return

    const reviewLink = `${await getAdminOrigin()}/operations/articles/submissions/${args.submissionId}`
    const template = buildEditorialNotificationEmail({
      authorName: args.authorName,
      authorEmail: args.authorEmail,
      articleTitle: args.articleTitle,
      category: args.category,
      wordCount: args.wordCount,
      reviewLink,
      submittedAt: args.submittedAt,
    })
    await sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: args.authorEmail,
    })
  } catch (notifyError) {
    console.error('[contribute draft submit] notify failed', notifyError)
  }
}

function parseEditorialRecipients(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.includes('@'))
}

async function getAdminOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_ADMIN_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  const h = await headers()
  const origin = h.get('origin')
  if (origin) return origin
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') || 'http'
  if (host) return `${proto}://${host}`
  return 'http://localhost:3010'
}
