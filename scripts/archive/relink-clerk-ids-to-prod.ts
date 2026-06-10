/**
 * Re-links workforce_employees.clerk_user_id to prod Clerk IDs.
 * The backfill script skips rows that already have a value — this script
 * updates ALL dashboard_access employees by looking them up by email in prod.
 */

import { createClient } from '@supabase/supabase-js'
import { createClerkClient } from '@clerk/backend'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

async function main() {
  const { data: employees, error } = await sb
    .from('workforce_employees')
    .select('id, email, full_name, clerk_user_id')
    .eq('dashboard_access', true)

  if (error) { console.error('Failed to fetch employees:', error); process.exit(1) }

  let updated = 0, already = 0, missing = 0

  for (const emp of employees!) {
    const { data: users } = await clerk.users.getUserList({ emailAddress: [emp.email], limit: 1 })
    const user = users[0]

    if (!user) {
      console.warn(`  ⚠  not in prod Clerk: ${emp.email}`)
      missing++
      continue
    }

    if (user.id === emp.clerk_user_id) {
      console.log(`  ✓ already correct: ${emp.email}`)
      already++
      continue
    }

    const { error: updateError } = await sb
      .from('workforce_employees')
      .update({ clerk_user_id: user.id })
      .eq('id', emp.id)

    if (updateError) {
      console.error(`  ✗ update failed: ${emp.email}`, updateError)
      continue
    }

    console.log(`  ↻ updated: ${emp.email}  ${emp.clerk_user_id} → ${user.id}`)
    updated++
  }

  console.log(`\nDone. Updated: ${updated} | Already correct: ${already} | Missing from prod: ${missing}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
