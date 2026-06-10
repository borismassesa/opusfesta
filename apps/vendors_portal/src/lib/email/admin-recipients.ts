// Resolves who should receive admin notifications when a vendor submits an
// application. Mirrors the pattern in apps/opus_admin/src/lib/editorial-recipients.ts:
// prefer an explicit env list (useful for shared inboxes), fall back to
// active workforce_employees with owner|admin roles.

import { createSupabaseAdminClient } from '@/lib/supabase'

function parseEnvRecipients(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.includes('@'))
}

async function loadWorkforceAdminRecipients(): Promise<string[]> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('workforce_employees')
      .select('email, workforce_roles!dashboard_role_id(slug)')
      .eq('dashboard_access', true)

    if (error) {
      console.error('[admin-recipients] workforce_employees lookup failed', error)
      return []
    }
    if (!data) return []
    const emails = data
      .filter((row) => {
        const slug = (row.workforce_roles as { slug?: string } | null)?.slug
        return slug === 'owner' || slug === 'admin'
      })
      .map((row) => (row.email as string)?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email && email.includes('@')))
    return Array.from(new Set(emails))
  } catch (err) {
    console.error('[admin-recipients] supabase client error', err)
    return []
  }
}

export async function resolveAdminRecipients(): Promise<{
  recipients: string[]
  source: 'env' | 'workforce' | 'none'
}> {
  const envRecipients = parseEnvRecipients(
    process.env.VENDOR_NOTIFY_ADMIN_EMAIL || process.env.ADMIN_NOTIFY_EMAIL,
  )
  if (envRecipients.length > 0) {
    return { recipients: envRecipients, source: 'env' }
  }
  const workforceRecipients = await loadWorkforceAdminRecipients()
  if (workforceRecipients.length > 0) {
    return { recipients: workforceRecipients, source: 'workforce' }
  }
  return { recipients: [], source: 'none' }
}
