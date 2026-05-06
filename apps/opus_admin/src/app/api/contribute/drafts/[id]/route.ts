import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import {
  contributorPatchPayload,
  findOwnedContributorDraft,
  rowToContributorDraft,
} from '@/lib/contribute/drafts'
import { isEditableContributorStatus, type ContributorDraft } from '@/lib/contribute/types'
import { countBodyWords } from '@/lib/contribute/bodyMetrics'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const identity = await requireContributorIdentity()
    const current = await findOwnedContributorDraft(id, identity)
    if (!current) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    if (!isEditableContributorStatus(current.status)) {
      return NextResponse.json({ error: 'This draft is locked.' }, { status: 423 })
    }

    const input = (await request.json()) as Partial<ContributorDraft>
    const body = input.body ?? current.body
    const payload = contributorPatchPayload({
      ...input,
      word_count: input.word_count ?? countBodyWords(body),
    })
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ draft: current })
    }

    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('advice_article_submissions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    revalidatePath('/contribute')
    revalidatePath(`/contribute/drafts/${id}`)
    return NextResponse.json({ draft: rowToContributorDraft(data) })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const identity = await requireContributorIdentity()
    const current = await findOwnedContributorDraft(id, identity)
    if (!current) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    if (!isEditableContributorStatus(current.status)) {
      return NextResponse.json({ error: 'Submitted drafts cannot be discarded.' }, { status: 423 })
    }

    const supabase = createSupabaseAdminClient()
    const { error } = await supabase.from('advice_article_submissions').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/contribute')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}

function errorResponse(error: unknown): NextResponse {
  console.error('[contribute draft PATCH/DELETE]', error)
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Request failed.'
  const status = message.includes('Contributor access') ? 403 : message.includes('Sign in') ? 401 : 400
  return NextResponse.json({ error: message }, { status })
}
