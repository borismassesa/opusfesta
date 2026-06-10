// Resolves who should receive editorial review notifications when a contributor
// submits a draft. Prefers an explicit EDITORIAL_NOTIFY_EMAIL list (env-driven,
// useful for shared inboxes), and falls back to active workforce_employees with
// review-capable permission keys so the system works without env configuration.

import { createSupabaseAdminClient, hasSupabaseAdminConfig } from '@/lib/supabase'

// Permission keys that indicate a user can review editorial content.
const REVIEWER_PERMISSIONS = ['cms.write', 'cms.publish'] as const

function parseEnvRecipients(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.includes('@'))
}

type EmployeeResult =
  | { kind: 'ok'; recipients: string[] }
  | { kind: 'error'; error: unknown }
  | { kind: 'unconfigured' }

async function loadEmployeeRecipients(): Promise<EmployeeResult> {
  if (!hasSupabaseAdminConfig()) return { kind: 'unconfigured' }
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employees')
    .select('email, workforce_roles!dashboard_role_id(permission_keys)')
    .eq('dashboard_access', true)

  if (error) return { kind: 'error', error }
  if (!data) return { kind: 'ok', recipients: [] }
  const emails = data
    .filter((row) => {
      const keys: string[] = (row.workforce_roles as { permission_keys?: string[] } | null)?.permission_keys ?? []
      return REVIEWER_PERMISSIONS.some((p) => keys.includes(p))
    })
    .map((row) => (row.email as string)?.trim().toLowerCase())
    .filter((email): email is string => Boolean(email && email.includes('@')))
  return { kind: 'ok', recipients: Array.from(new Set(emails)) }
}

// Distinguishes the three "no recipients" cases so the caller can log
// accurately: a transient DB error must not look like "no admins configured."
export type EditorialRecipientResolution =
  | { recipients: string[]; source: 'env' }
  | { recipients: string[]; source: 'workforce_employees' }
  | { recipients: []; source: 'whitelist_error'; error: unknown }
  | { recipients: []; source: 'none' }

export async function resolveEditorialRecipients(): Promise<EditorialRecipientResolution> {
  const envRecipients = parseEnvRecipients(process.env.EDITORIAL_NOTIFY_EMAIL)
  if (envRecipients.length > 0) {
    return { recipients: envRecipients, source: 'env' }
  }
  const result = await loadEmployeeRecipients()
  if (result.kind === 'error') {
    return { recipients: [], source: 'whitelist_error', error: result.error }
  }
  if (result.kind === 'ok' && result.recipients.length > 0) {
    return { recipients: result.recipients, source: 'workforce_employees' }
  }
  return { recipients: [], source: 'none' }
}
