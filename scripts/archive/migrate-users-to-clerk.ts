/**
 * Migrate existing users from Supabase Auth to Clerk
 *
 * Steps:
 * 1. Fetch all users from Supabase auth.users via admin API
 * 2. For each user, fetch matching public.users row for role/profile data
 * 3. Create user in Clerk with bcrypt password hash import
 * 4. Update public.users to set clerk_id for the migrated user
 *
 * Usage:
 *   npx tsx scripts/migrate-users-to-clerk.ts
 *   npx tsx scripts/migrate-users-to-clerk.ts --dry-run
 *   npx tsx scripts/migrate-users-to-clerk.ts --resume  # resume from last failure
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   CLERK_SECRET_KEY
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CLERK_SECRET_KEY) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLERK_SECRET_KEY"
  );
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");
const isResume = process.argv.includes("--resume");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface MigrationResult {
  email: string;
  status: "created" | "skipped" | "error";
  clerkId?: string;
  error?: string;
}

async function clerkApiRequest(
  path: string,
  method: string,
  body?: Record<string, unknown>
) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Clerk API error ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

async function migrateUser(
  authUser: {
    id: string;
    email?: string;
    encrypted_password?: string;
    raw_user_meta_data?: Record<string, unknown>;
  },
  publicUser: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    avatar: string | null;
    clerk_id: string | null;
  } | null
): Promise<MigrationResult> {
  const email = authUser.email || publicUser?.email;
  if (!email) {
    return { email: "unknown", status: "error", error: "No email found" };
  }

  // Skip if already migrated
  if (publicUser?.clerk_id) {
    return { email, status: "skipped", clerkId: publicUser.clerk_id };
  }

  if (isDryRun) {
    console.log(`[DRY RUN] Would migrate: ${email} (role: ${publicUser?.role || "user"})`);
    return { email, status: "skipped" };
  }

  try {
    // Parse name
    const fullName = publicUser?.name || "";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || undefined;
    const lastName = nameParts.slice(1).join(" ") || undefined;

    // Create user in Clerk with password hash import
    const clerkUser = await clerkApiRequest("/users", "POST", {
      email_address: [email],
      ...(authUser.encrypted_password
        ? {
            password_digest: authUser.encrypted_password,
            password_hasher: "bcrypt",
          }
        : {}),
      first_name: firstName,
      last_name: lastName,
      public_metadata: {
        role: publicUser?.role || "user",
        supabase_uuid: publicUser?.id || authUser.id,
      },
      skip_password_checks: true,
      skip_password_requirement: !authUser.encrypted_password,
    });

    // Update public.users with clerk_id
    const { error: updateError } = await supabase
      .from("users")
      .update({ clerk_id: clerkUser.id })
      .eq("id", publicUser?.id || authUser.id);

    if (updateError) {
      console.error(`Failed to update clerk_id for ${email}:`, updateError);
    }

    return { email, status: "created", clerkId: clerkUser.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // If user already exists in Clerk, try to link them
    if (errorMsg.includes("already exists") || errorMsg.includes("taken")) {
      console.log(`User ${email} already exists in Clerk, attempting to link...`);
      try {
        // Search for existing Clerk user by email
        const searchResult = await clerkApiRequest(
          `/users?email_address=${encodeURIComponent(email)}`,
          "GET"
        );
        if (searchResult.length > 0) {
          const existingClerkUser = searchResult[0];
          // Update public.users with clerk_id
          const { error: updateError } = await supabase
            .from("users")
            .update({ clerk_id: existingClerkUser.id })
            .eq("id", publicUser?.id || authUser.id);

          if (updateError) {
            console.error(`Failed to update clerk_id for ${email}:`, updateError);
          }

          return { email, status: "created", clerkId: existingClerkUser.id };
        }
      } catch {
        // Ignore search errors
      }
    }

    return { email, status: "error", error: errorMsg };
  }
}

async function main() {
  console.log(`\n🔄 Migrating users from Supabase to Clerk${isDryRun ? " (DRY RUN)" : ""}${isResume ? " (RESUME)" : ""}\n`);

  // Fetch all auth users (paginated)
  const PAGE_SIZE = 1000;
  let page = 1;
  let allAuthUsers: Array<{
    id: string;
    email?: string;
    encrypted_password?: string;
    raw_user_meta_data?: Record<string, unknown>;
  }> = [];

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });

    if (error) {
      console.error("Error fetching auth users:", error);
      break;
    }

    if (!data.users.length) break;
    allAuthUsers = allAuthUsers.concat(data.users);

    if (data.users.length < PAGE_SIZE) break;
    page++;
  }

  console.log(`Found ${allAuthUsers.length} auth users`);

  // Fetch all public users
  const { data: publicUsers, error: pubError } = await supabase
    .from("users")
    .select("id, email, name, role, avatar, clerk_id");

  if (pubError) {
    console.error("Error fetching public users:", pubError);
    process.exit(1);
  }

  const publicUserMap = new Map(
    (publicUsers || []).map((u) => [u.id, u])
  );

  console.log(`Found ${publicUsers?.length || 0} public users`);

  // Migrate each user
  const results: MigrationResult[] = [];
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const authUser of allAuthUsers) {
    const publicUser = publicUserMap.get(authUser.id) || null;

    // Skip if already migrated and we're in resume mode
    if (isResume && publicUser?.clerk_id) {
      skipped++;
      continue;
    }

    const result = await migrateUser(authUser, publicUser);
    results.push(result);

    switch (result.status) {
      case "created":
        created++;
        console.log(`✅ ${result.email} -> ${result.clerkId}`);
        break;
      case "skipped":
        skipped++;
        break;
      case "error":
        errors++;
        console.error(`❌ ${result.email}: ${result.error}`);
        break;
    }

    // Rate limit: 20 requests per second for Clerk API
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors:  ${errors}`);
  console.log(`   Total:   ${allAuthUsers.length}`);

  if (errors > 0) {
    console.log(`\n⚠️  ${errors} users failed to migrate. Re-run with --resume to retry.`);
    process.exit(1);
  }

  console.log(`\n✅ Migration complete!`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
