import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import {
  defaultCategoryForUser,
  normalizeCategory,
  rowToContributorDraft,
} from '@/lib/contribute/drafts'

export async function GET() {
  try {
    const identity = await requireContributorIdentity()
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('advice_article_submissions')
      .select('*')
      .or(`author_clerk_id.eq.${identity.clerkId},author_email.ilike.${identity.email}`)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ drafts: (data ?? []).map(rowToContributorDraft) })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await requireContributorIdentity()
    const body = (await request.json().catch(() => ({}))) as { category?: string }
    const category = normalizeCategory(body.category ?? (await defaultCategoryForUser(identity)))
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('advice_article_submissions')
      .insert({
        author_email: identity.email,
        author_clerk_id: identity.clerkId,
        author_name: identity.name || identity.email.split('@')[0],
        status: 'draft',
        title: '',
        slug: '',
        summary: '',
        description: '',
        excerpt: '',
        category,
        section_id: category === 'Real Weddings' ? 'real-weddings' : 'planning-guides',
        body: [],
        word_count: 0,
        read_time: 1,
        published: false,
      })
      .select('*')
      .single()

    if (error) throw error
    revalidatePath('/contribute')
    return NextResponse.json({ draft: rowToContributorDraft(data), id: data.id }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

function errorResponse(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Request failed.'
  const status = message.includes('Contributor access') ? 403 : message.includes('Sign in') ? 401 : 400
  return NextResponse.json({ error: message }, { status })
}
