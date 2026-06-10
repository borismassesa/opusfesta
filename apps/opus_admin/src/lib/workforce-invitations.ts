// Workforce dashboard invitation helpers. Server-only — orchestrates the
// triple of (1) workforce_invitations row, (2) Clerk invitation, and
// (3) outbound email so the rest of the codebase can call a single
// inviteEmployee() / acceptInvitation() / revokeInvitation() entry point.
//
// Two paths can land here:
//   - Admin clicks "Grant dashboard access" on an employee → inviteEmployee
//   - Invited person clicks the email link → acceptInvitation
//
// Clerk is the identity provider. We mirror just enough state into our
// own table to render an admin-side queue (pending invites, expiry, who
// invited whom) without round-tripping to Clerk on every page render.

import 'server-only'

import { createHash, randomBytes } from 'crypto'
import { headers } from 'next/headers'
import { clerkClient } from '@clerk/nextjs/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { buildWorkforceInviteEmail } from '@/lib/workforce-invite-email'
import { auditInviteFailed } from '@/lib/audit-log'
import { legacyRoleBucket } from '@/lib/admin-auth'

export type WorkforceInvitationRow = {
  id: string
  employee_id: string
  email: string
  role_id: string
  clerk_invitation_id: string | null
  token_hash: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  revoked_at: string | null
  expires_at: string
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function generateToken(): string {
  // 32 bytes = 256 bits of entropy. Enough that we don't need to
  // additionally validate via Clerk if the token matches our DB row.
  return randomBytes(32).toString('base64url')
}

async function appUrl(): Promise<string> {
  // Production / staging: NEXT_PUBLIC_APP_URL is the canonical override
  // (https://admin.opusfesta.com or similar). Set this on Vercel so invite
  // links don't get the deployment-preview hostname.
  const override = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (override) return override.replace(/\/$/, '')

  // Dev fallback — derive from the incoming request. Lets `npm run dev`
  // work without anyone having to add NEXT_PUBLIC_APP_URL to .env.local.
  const h = await headers()
  const forwardedHost = h.get('x-forwarded-host')
  const host = forwardedHost ?? h.get('host')
  if (!host) {
    throw new Error(
      'Could not determine the app URL. Set NEXT_PUBLIC_APP_URL in this environment.',
    )
  }
  const forwardedProto = h.get('x-forwarded-proto')
  const proto =
    forwardedProto ??
    (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https')
  return `${proto}://${host}`
}

export type InviteEmployeeInput = {
  employeeId: string
  roleId: string
  invitedById: string | null
}

export type InviteResult = {
  invitationId: string
  inviteLink: string
  emailSent: boolean
  emailReason?: string
  // 'invited'          → invitation email path (self sign-up pending)
  // 'granted_existing' → email already had a Clerk account; access flipped
  mode: 'invited' | 'granted_existing'
}

// Clerk's SDK throws ClerkAPIResponseError carrying a `errors[]` array
// where each entry has { code, message, longMessage }. The default toString
// collapses to "Unprocessable Entity" — useless for diagnosis. Pull the
// useful detail out so the dialog can show why the call failed.
function describeClerkError(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Unknown Clerk error'
  const detailErrors = (err as { errors?: Array<{ longMessage?: string; message?: string; code?: string }> }).errors
  if (Array.isArray(detailErrors) && detailErrors.length > 0) {
    return detailErrors
      .map((e) => e.longMessage || e.message || e.code)
      .filter(Boolean)
      .join('; ')
  }
  if (err instanceof Error) return err.message
  return 'Unknown Clerk error'
}

export async function inviteEmployee(input: InviteEmployeeInput): Promise<InviteResult> {
  const supabase = createSupabaseAdminClient()

  // Pull the employee + role in one round-trip. We need the email
  // (Clerk invite + email recipient) and the role name (email body).
  const { data: employee, error: employeeError } = await supabase
    .from('workforce_employees')
    .select('id, full_name, email, dashboard_access')
    .eq('id', input.employeeId)
    .maybeSingle<{ id: string; full_name: string; email: string; dashboard_access: boolean }>()
  if (employeeError) throw employeeError
  if (!employee) throw new Error('Employee not found.')

  const { data: role, error: roleError } = await supabase
    .from('workforce_roles')
    .select('id, name, slug, permission_keys')
    .eq('id', input.roleId)
    .maybeSingle<{ id: string; name: string; slug: string; permission_keys: string[] }>()
  if (roleError) throw roleError
  if (!role) throw new Error('Role not found.')

  // Revoke any existing pending invitation for this employee — the
  // partial unique index (uq_workforce_invitations_pending_per_employee)
  // would otherwise reject the insert.
  await supabase
    .from('workforce_invitations')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('employee_id', employee.id)
    .eq('status', 'pending')

  const token = generateToken()
  const tokenHash = hashToken(token)
  const inviteLink = `${await appUrl()}/accept-invite?token=${token}`

  const clerk = await clerkClient()

  // Fast path: this email already has a Clerk account. Clerk Invitations
  // refuse to create an invite for an existing user (returns 422
  // "Unprocessable Entity"), so we skip the invitation entirely and just
  // grant access — they already have a password and can sign in. This
  // covers the common "promote an existing employee/founder to dashboard
  // access" case.
  let existingClerkUserId: string | null = null
  try {
    const { data: existingUsers } = await clerk.users.getUserList({
      emailAddress: [employee.email],
      limit: 1,
    })
    existingClerkUserId = existingUsers[0]?.id ?? null
  } catch (err) {
    // Lookup failure is non-fatal — fall through to the invite path,
    // which will surface its own (more informative) error if the email
    // really is registered.
    console.warn('[workforce-invitations] could not check existing Clerk user', err)
  }

  if (existingClerkUserId) {
    // Direct grant — no invitation row needed; flip dashboard access
    // straight on. Pull the Clerk imageUrl too so the workforce UI can
    // show a real photo instead of just initials.
    let existingClerkImageUrl: string | null = null
    try {
      const fresh = await clerk.users.getUser(existingClerkUserId)
      existingClerkImageUrl = fresh.imageUrl ?? null
    } catch (err) {
      console.warn('[workforce-invitations] could not fetch Clerk imageUrl during grant', err)
    }

    const employeeUpdate: Record<string, unknown> = {
      dashboard_access: true,
      dashboard_role_id: role.id,
      clerk_user_id: existingClerkUserId,
      invited_at: new Date().toISOString(),
    }
    if (existingClerkImageUrl) employeeUpdate.avatar_url = existingClerkImageUrl

    const { error: updateEmployeeError } = await supabase
      .from('workforce_employees')
      .update(employeeUpdate)
      .eq('id', employee.id)
    if (updateEmployeeError) throw updateEmployeeError

    // Eagerly write role into Clerk publicMetadata so the resolver in
    // admin-auth.ts has a hint without needing the workforce join.
    try {
      const fresh = await clerk.users.getUser(existingClerkUserId)
      await clerk.users.updateUserMetadata(existingClerkUserId, {
        publicMetadata: {
          ...(fresh.publicMetadata ?? {}),
          role: legacyRoleBucket(role.slug, role.permission_keys),
          workforceRoleId: role.id,
        },
      })
    } catch (err) {
      console.warn('[workforce-invitations] could not sync Clerk metadata after grant', err)
    }

    // Insert a ledger row so the invitations panel reflects the action,
    // pre-marked accepted.
    const { data: ledger, error: ledgerError } = await supabase
      .from('workforce_invitations')
      .insert({
        employee_id: employee.id,
        email: employee.email,
        role_id: role.id,
        clerk_invitation_id: null,
        token_hash: tokenHash,
        status: 'accepted',
        invited_by: input.invitedById,
        accepted_at: new Date().toISOString(),
      })
      .select('id')
      .single<{ id: string }>()
    if (ledgerError) throw ledgerError

    return {
      invitationId: ledger.id,
      inviteLink,
      emailSent: false,
      emailReason: 'no_email_needed_existing_user',
      mode: 'granted_existing',
    }
  }

  // No existing account → create a Clerk invitation. publicMetadata.role
  // is written eagerly so it's available in sessionClaims even before our
  // acceptance flow runs.
  let clerkInvitationId: string | null = null
  try {
    const clerkInvite = await clerk.invitations.createInvitation({
      emailAddress: employee.email,
      redirectUrl: inviteLink,
      publicMetadata: { role: legacyRoleBucket(role.slug, role.permission_keys), workforceRoleId: role.id },
      notify: false, // we send our own branded email below
    })
    clerkInvitationId = clerkInvite.id
  } catch (err) {
    throw new Error(`Could not create the Clerk invitation: ${describeClerkError(err)}`)
  }

  // Persist our row + flip the employee to invited (dashboard_access
  // stays false until they accept).
  const { data: row, error: insertError } = await supabase
    .from('workforce_invitations')
    .insert({
      employee_id: employee.id,
      email: employee.email,
      role_id: role.id,
      clerk_invitation_id: clerkInvitationId,
      token_hash: tokenHash,
      status: 'pending',
      invited_by: input.invitedById,
    })
    .select('id, expires_at')
    .single<{ id: string; expires_at: string }>()
  if (insertError) throw insertError

  await supabase
    .from('workforce_employees')
    .update({ invited_at: new Date().toISOString() })
    .eq('id', employee.id)

  // Send our branded invite email. We send this even when Clerk would
  // also send one (we passed notify: false to suppress Clerk's default).
  const email = buildWorkforceInviteEmail({
    recipientEmail: employee.email,
    recipientName: employee.full_name,
    roleName: role.name,
    inviteLink,
    expiresAt: row.expires_at,
  })

  const result = await sendEmail({
    to: employee.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  })

  if (!result.sent) {
    void auditInviteFailed(employee.email, result.reason ?? 'unknown')
  }

  return {
    invitationId: row.id,
    inviteLink,
    emailSent: result.sent,
    emailReason: result.sent ? undefined : result.reason,
    mode: 'invited',
  }
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  const { data: invite, error: fetchError } = await supabase
    .from('workforce_invitations')
    .select('id, status, clerk_invitation_id')
    .eq('id', invitationId)
    .maybeSingle<{ id: string; status: string; clerk_invitation_id: string | null }>()
  if (fetchError) throw fetchError
  if (!invite) throw new Error('Invitation not found.')
  if (invite.status !== 'pending') {
    throw new Error('Only pending invitations can be revoked.')
  }

  // Best-effort revoke at Clerk first. If it fails we still mark our
  // row revoked — the local state is the source of truth for what the
  // /accept-invite page accepts.
  if (invite.clerk_invitation_id) {
    try {
      const clerk = await clerkClient()
      await clerk.invitations.revokeInvitation(invite.clerk_invitation_id)
    } catch (err) {
      console.warn('[workforce-invitations] could not revoke Clerk invitation', err)
    }
  }

  const { error } = await supabase
    .from('workforce_invitations')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', invitationId)
  if (error) throw error
}

export type AcceptInvitationInput = {
  token: string
  clerkUserId: string
  clerkEmail: string
}

export type AcceptInvitationResult = {
  employeeId: string
  roleId: string
}

export async function acceptInvitation(input: AcceptInvitationInput): Promise<AcceptInvitationResult> {
  const supabase = createSupabaseAdminClient()
  const tokenHash = hashToken(input.token)

  const { data: invite, error: fetchError } = await supabase
    .from('workforce_invitations')
    .select('id, employee_id, email, role_id, status, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle<{
      id: string
      employee_id: string
      email: string
      role_id: string
      status: string
      expires_at: string
    }>()
  if (fetchError) throw fetchError
  if (!invite) throw new Error('This invitation link is invalid.')

  if (invite.status === 'revoked') throw new Error('This invitation has been revoked.')
  if (invite.status === 'accepted') {
    // Idempotent — the user reloaded the landing page after accepting.
    return { employeeId: invite.employee_id, roleId: invite.role_id }
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await supabase
      .from('workforce_invitations')
      .update({ status: 'expired' })
      .eq('id', invite.id)
    throw new Error('This invitation has expired. Ask an owner to send you a new one.')
  }
  if (invite.email.trim().toLowerCase() !== input.clerkEmail.trim().toLowerCase()) {
    throw new Error(
      `This invite is for ${invite.email}. Sign in with that email to accept it.`
    )
  }

  // Pull the role so we can write the correct Clerk metadata.
  const { data: roleRow, error: roleError } = await supabase
    .from('workforce_roles')
    .select('slug, permission_keys')
    .eq('id', invite.role_id)
    .maybeSingle<{ slug: string; permission_keys: string[] }>()
  if (roleError) {
    console.warn('[workforce-invitations] could not fetch role during accept', roleError)
  }
  const legacyRole = legacyRoleBucket(roleRow?.slug ?? '', roleRow?.permission_keys ?? [])

  // Pull the freshly-signed-up Clerk user so we can cache their profile
  // picture URL alongside the access flip. Clerk hands out a default
  // avatar even when the user hasn't uploaded one, so this is safe to
  // store unconditionally. Also write the correct role into publicMetadata
  // so the dashboard auth resolver has it as an eager hint.
  let clerkImageUrl: string | null = null
  try {
    const clerk = await clerkClient()
    const fresh = await clerk.users.getUser(input.clerkUserId)
    clerkImageUrl = fresh.imageUrl ?? null
    await clerk.users.updateUserMetadata(input.clerkUserId, {
      publicMetadata: {
        ...(fresh.publicMetadata ?? {}),
        role: legacyRole,
        workforceRoleId: invite.role_id,
      },
    })
  } catch (err) {
    console.warn('[workforce-invitations] could not sync Clerk metadata during accept', err)
  }

  // Flip the employee row → grants dashboard access and records the Clerk linkage.
  const employeeUpdate: Record<string, unknown> = {
    dashboard_access: true,
    dashboard_role_id: invite.role_id,
    clerk_user_id: input.clerkUserId,
    last_dashboard_login: new Date().toISOString(),
  }
  if (clerkImageUrl) employeeUpdate.avatar_url = clerkImageUrl

  const { error: updateEmployeeError } = await supabase
    .from('workforce_employees')
    .update(employeeUpdate)
    .eq('id', invite.employee_id)
  if (updateEmployeeError) throw updateEmployeeError

  const { error: updateInviteError } = await supabase
    .from('workforce_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invite.id)
  if (updateInviteError) throw updateInviteError

  return { employeeId: invite.employee_id, roleId: invite.role_id }
}
