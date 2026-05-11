import { createHash } from 'crypto'
import { clerkClient } from '@clerk/nextjs/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/cms/advice-ideas'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceArticleInvitationRow } from '@/lib/advice-submissions'

export type ContributorInviteIdentity = {
  clerkId: string
  email: string
  name: string | null
}

const ADMIN_TIER_ROLES = new Set(['owner', 'admin', 'editor', 'viewer'])

export function hashContributorInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function normalizeContributorEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function hasContributorGrant(
  identity: Pick<ContributorInviteIdentity, 'clerkId' | 'email'>
): Promise<boolean> {
  const supabase = createSupabaseAdminClient()
  const now = new Date().toISOString()
  const [submissionResult, invitationResult] = await Promise.all([
    supabase
      .from('advice_article_submissions')
      .select('id')
      .or(`author_clerk_id.eq.${identity.clerkId},author_email.ilike.${identity.email}`)
      .limit(1),
    supabase
      .from('advice_article_invitations')
      .select('id')
      .eq('status', 'pending')
      .ilike('email', identity.email)
      .gt('expires_at', now)
      .limit(1),
  ])

  if (submissionResult.error) throw submissionResult.error
  if (invitationResult.error) throw invitationResult.error
  return Boolean(submissionResult.data?.length || invitationResult.data?.length)
}

export async function acceptContributorInvitationByToken(
  token: string,
  identity: ContributorInviteIdentity
): Promise<{ id: string }> {
  const supabase = createSupabaseAdminClient()
  const { data: invite, error } = await supabase
    .from('advice_article_invitations')
    .select('*')
    .eq('token_hash', hashContributorInviteToken(token))
    .maybeSingle<AdviceArticleInvitationRow>()

  if (error) throw error
  if (!invite) throw new Error('This contributor invitation is invalid.')
  if (normalizeContributorEmail(invite.email) !== identity.email) {
    throw new Error(`This invite is for ${invite.email}. Sign in with that email to accept it.`)
  }

  return acceptInvitationForIdentity(supabase, invite, identity)
}

export async function acceptLatestPendingInvitationForIdentity(
  identity: ContributorInviteIdentity
): Promise<{ id: string } | null> {
  const supabase = createSupabaseAdminClient()
  const { data: invite, error } = await supabase
    .from('advice_article_invitations')
    .select('*')
    .eq('status', 'pending')
    .ilike('email', identity.email)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<AdviceArticleInvitationRow>()

  if (error) throw error
  if (!invite) return null
  return acceptInvitationForIdentity(supabase, invite, identity)
}

async function acceptInvitationForIdentity(
  supabase: SupabaseClient,
  invite: AdviceArticleInvitationRow,
  identity: ContributorInviteIdentity
): Promise<{ id: string }> {
  if (invite.status === 'revoked') throw new Error('This invite has been revoked.')
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await supabase
      .from('advice_article_invitations')
      .update({ status: 'expired' })
      .eq('id', invite.id)
    throw new Error('This invite has expired.')
  }

  if (invite.accepted_submission_id) {
    await promoteToContributorRole(identity.clerkId)
    return { id: invite.accepted_submission_id }
  }

  const title = invite.article_title ?? ''
  const { data: profile, error: profileError } = await supabase
    .from('advice_ideas_authors')
    .select('name, role, avatar_url')
    .ilike('email', identity.email)
    .maybeSingle<{ name: string | null; role: string | null; avatar_url: string | null }>()
  if (profileError) throw profileError
  const { data: submission, error: insertError } = await supabase
    .from('advice_article_submissions')
    .insert({
      invitation_id: invite.id,
      author_email: identity.email,
      author_clerk_id: identity.clerkId,
      status: 'draft',
      title,
      slug: title ? slugify(title) : '',
      author_name: profile?.name || invite.full_name || identity.name || identity.email.split('@')[0],
      author_role: profile?.role || null,
      author_avatar_url: profile?.avatar_url || null,
      published: false,
    })
    .select('id')
    .single<{ id: string }>()

  if (insertError) throw insertError

  const { error: updateError } = await supabase
    .from('advice_article_invitations')
    .update({
      status: 'accepted',
      accepted_clerk_id: identity.clerkId,
      accepted_submission_id: submission.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invite.id)

  if (updateError) throw updateError

  await promoteToContributorRole(identity.clerkId)

  // Cache invalidation belongs in the server-action callers (see
  // acceptContributorInvitation in advice-submission-actions.ts). This
  // function is also invoked during page render (the invite letter page
  // auto-accepts when the signed-in email matches), where revalidatePath
  // throws. Page-render callers immediately redirect, and the affected
  // routes are force-dynamic, so skipping revalidation here is safe.
  return { id: submission.id }
}

async function promoteToContributorRole(clerkId: string): Promise<void> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(clerkId)
    const currentRole =
      typeof user.publicMetadata?.role === 'string'
        ? user.publicMetadata.role.trim().toLowerCase()
        : ''
    if (ADMIN_TIER_ROLES.has(currentRole)) return
    if (currentRole === 'contributor' || currentRole === 'author') return
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: { ...user.publicMetadata, role: 'contributor' },
    })
  } catch {
    // DB acceptance is the source of truth; Clerk metadata is a convenience.
  }
}
