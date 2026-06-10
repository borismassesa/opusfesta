/**
 * One-time cleanup: expire all temp passwords issued via the now-deleted
 * set-password flow. Pages through Clerk users where
 * publicMetadata.mustResetPassword === true, sets a fresh random password
 * (making the admin-issued temp password invalid), and clears the flag so
 * users recover via Clerk "forgot password" — the only supported path now
 * that the temp-password flow is removed.
 *
 * Usage:
 *   CLERK_SECRET_KEY=... npx tsx scripts/expire-temp-passwords.ts
 */

import { randomBytes } from 'crypto'
import { createClerkClient } from '@clerk/backend'

const clerkSecretKey = process.env.CLERK_SECRET_KEY

if (!clerkSecretKey) {
  console.error('Required env var: CLERK_SECRET_KEY')
  process.exit(1)
}

const clerk = createClerkClient({ secretKey: clerkSecretKey })

function generatePassword(): string {
  // 24 bytes = 192 bits of entropy; base64url keeps it printable.
  return randomBytes(24).toString('base64url')
}

async function main() {
  console.log('Scanning Clerk users for mustResetPassword=true…')

  let offset = 0
  const limit = 100
  let processed = 0
  let skipped = 0
  let failed = 0

  while (true) {
    const { data: users } = await clerk.users.getUserList({ limit, offset })
    if (!users || users.length === 0) break

    for (const user of users) {
      const meta = user.publicMetadata as Record<string, unknown>
      if (meta?.mustResetPassword !== true) {
        skipped++
        continue
      }

      const email = user.emailAddresses[0]?.emailAddress ?? user.id
      try {
        await clerk.users.updateUser(user.id, {
          password: generatePassword(),
          publicMetadata: { ...meta, mustResetPassword: false },
        })
        console.log(`  ✓ Expired temp password for ${email}`)
        processed++
      } catch (err) {
        console.error(`  ✗ Failed for ${email}:`, err)
        failed++
      }
    }

    if (users.length < limit) break
    offset += limit
  }

  console.log(`\nDone. Expired: ${processed}, Skipped (no flag): ${skipped}, Failed: ${failed}`)
  if (failed > 0) {
    console.log('Re-run for the failed users or clear them manually in the Clerk dashboard.')
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
