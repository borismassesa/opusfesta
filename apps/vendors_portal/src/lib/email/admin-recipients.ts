// Resolves who should receive admin notifications when a vendor submits an
// application. Mirrors the pattern in apps/opus_admin/src/lib/editorial-recipients.ts:
// prefer an explicit env list (useful for shared inboxes), fall back to the
// active rows on `admin_whitelist`, so the system works without env config in
// dev/staging.

import { createSupabaseAdminClient } from '@/lib/supabase'

const ADMIN_ROLES = ['owner', 'admin'] as const

function parseEnvRecipients(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.includes('@'))
}

async function loadWhitelistRecipients(): Promise<string[]> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('admin_whitelist')
      .select('email, role, is_active')
      .eq('is_active', true)
      .in('role', ADMIN_ROLES as unknown as string[])

    if (error) {
      console.error('[admin-recipients] whitelist lookup failed', error)
      return []
    }
    if (!data) return []
    const emails = data
      .map((row) => row.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email && email.includes('@')))
    return Array.from(new Set(emails))
  } catch (err) {
    console.error('[admin-recipients] supabase client error', err)
    return []
  }
}

export async function resolveAdminRecipients(): Promise<{
  recipients: string[]
  source: 'env' | 'admin_whitelist' | 'none'
}> {
  const envRecipients = parseEnvRecipients(
    process.env.VENDOR_NOTIFY_ADMIN_EMAIL || process.env.ADMIN_NOTIFY_EMAIL,
  )
  if (envRecipients.length > 0) {
    return { recipients: envRecipients, source: 'env' }
  }
  const whitelistRecipients = await loadWhitelistRecipients()
  if (whitelistRecipients.length > 0) {
    return { recipients: whitelistRecipients, source: 'admin_whitelist' }
  }
  return { recipients: [], source: 'none' }
}
