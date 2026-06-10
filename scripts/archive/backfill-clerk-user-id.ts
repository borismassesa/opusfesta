/**
 * One-time backfill: populate workforce_employees.clerk_user_id for rows
 * that were provisioned via ad-hoc SQL scripts rather than the invite flow.
 *
 * Run BEFORE the 20260610000001_remove_admin_whitelist migration ships.
 * The migration drops admin_whitelist; any active dashboard user whose
 * clerk_user_id is still null will lose access after the cutover.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... CLERK_SECRET_KEY=... npx tsx scripts/backfill-clerk-user-id.ts
 *
 * Safe to re-run — skips rows that already have a clerk_user_id.
 */

import { createClient } from '@supabase/supabase-js'
import { createClerkClient } from '@clerk/backend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const clerkSecretKey = process.env.CLERK_SECRET_KEY

if (!supabaseUrl || !serviceRoleKey || !clerkSecretKey) {
  console.error('Required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLERK_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const clerk = createClerkClient({ secretKey: clerkSecretKey })

async function main() {
  const { data: employees, error } = await supabase
    .from('workforce_employees')
    .select('id, email, full_name')
    .eq('dashboard_access', true)
    .is('clerk_user_id', null)

  if (error) { console.error('Failed to fetch employees:', error); process.exit(1) }
  if (!employees || employees.length === 0) {
    console.log('✓ All active dashboard employees already have clerk_user_id — nothing to do.')
    return
  }

  console.log(`Found ${employees.length} employee(s) with dashboard_access=true and no clerk_user_id:`)

  for (const emp of employees) {
    console.log(`\nProcessing: ${emp.email} (${emp.full_name ?? 'no name'})`)
    try {
      const { data: users } = await clerk.users.getUserList({
        emailAddress: [emp.email],
        limit: 1,
      })
      const user = users[0]
      if (!user) {
        console.warn(`  ⚠ No Clerk account found for ${emp.email} — they must be re-invited through the new flow.`)
        continue
      }
      const { error: updateError } = await supabase
        .from('workforce_employees')
        .update({ clerk_user_id: user.id })
        .eq('id', emp.id)
      if (updateError) {
        console.error(`  ✗ Failed to update ${emp.email}:`, updateError)
      } else {
        console.log(`  ✓ Backfilled clerk_user_id=${user.id}`)
      }
    } catch (err) {
      console.error(`  ✗ Clerk lookup failed for ${emp.email}:`, err)
    }
  }

  // Final audit
  const { data: remaining } = await supabase
    .from('workforce_employees')
    .select('email')
    .eq('dashboard_access', true)
    .is('clerk_user_id', null)

  if (remaining && remaining.length > 0) {
    console.log('\n⚠ These employees still have no clerk_user_id and will lose access on cutover:')
    for (const r of remaining) console.log(`  - ${r.email}`)
    console.log('\nRe-invite them through Workforce → Employees before running the migration.')
  } else {
    console.log('\n✓ All active dashboard employees now have clerk_user_id — safe to run the migration.')
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
