// Resolves who should receive editorial review notifications when a contributor
// submits a draft. Prefers an explicit EDITORIAL_NOTIFY_EMAIL list (env-driven,
// useful for shared inboxes), and falls back to active admin_whitelist rows
// with review-capable roles so the system works without env configuration.

import { createSupabaseAdminClient, hasSupabaseAdminConfig } from '@/lib/supabase'

const REVIEWER_ROLES = ['owner', 'admin', 'editor'] as const

function parseEnvRecipients(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.includes('@'))
}

type WhitelistResult =
  | { kind: 'ok'; recipients: string[] }
  | { kind: 'error'; error: unknown }
  | { kind: 'unconfigured' }

async function loadWhitelistRecipients(): Promise<WhitelistResult> {
  if (!hasSupabaseAdminConfig()) return { kind: 'unconfigured' }
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('admin_whitelist')
    .select('email, role, is_active')
    .eq('is_active', true)
    .in('role', REVIEWER_ROLES as unknown as string[])

  if (error) return { kind: 'error', error }
  if (!data) return { kind: 'ok', recipients: [] }
  const emails = data
    .map((row) => row.email?.trim().toLowerCase())
    .filter((email): email is string => Boolean(email && email.includes('@')))
  return { kind: 'ok', recipients: Array.from(new Set(emails)) }
}

// Distinguishes the three "no recipients" cases so the caller can log
// accurately: a transient DB error must not look like "no admins configured."
export type EditorialRecipientResolution =
  | { recipients: string[]; source: 'env' }
  | { recipients: string[]; source: 'admin_whitelist' }
  | { recipients: []; source: 'whitelist_error'; error: unknown }
  | { recipients: []; source: 'none' }

export async function resolveEditorialRecipients(): Promise<EditorialRecipientResolution> {
  const envRecipients = parseEnvRecipients(process.env.EDITORIAL_NOTIFY_EMAIL)
  if (envRecipients.length > 0) {
    return { recipients: envRecipients, source: 'env' }
  }
  const result = await loadWhitelistRecipients()
  if (result.kind === 'error') {
    return { recipients: [], source: 'whitelist_error', error: result.error }
  }
  if (result.kind === 'ok' && result.recipients.length > 0) {
    return { recipients: result.recipients, source: 'admin_whitelist' }
  }
  return { recipients: [], source: 'none' }
}
