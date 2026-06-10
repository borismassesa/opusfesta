/**
 * Import users exported from a Clerk dev instance into Clerk prod.
 *
 * Reads a JSON file produced by export-clerk-dev-users.ts and creates
 * each user in the target Clerk instance via the Backend API.
 *
 * Passwords are NOT transferred (Clerk doesn't expose hashes cross-instance).
 * Affected users will need to reset their password on first login.
 * OAuth-only users (no password) are imported without a password requirement.
 *
 * Usage:
 *   CLERK_SECRET_KEY=sk_live_xxx npx tsx scripts/import-clerk-users-to-prod.ts --file ./clerk-dev-export-xxx.json
 *   CLERK_SECRET_KEY=sk_live_xxx npx tsx scripts/import-clerk-users-to-prod.ts --file ./clerk-dev-export-xxx.json --dry-run
 */

import { readFileSync, writeFileSync } from "fs";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error("Missing CLERK_SECRET_KEY env var");
  process.exit(1);
}

if (!CLERK_SECRET_KEY.startsWith("sk_live_")) {
  console.error("CLERK_SECRET_KEY must be a live key (sk_live_...) for prod import");
  process.exit(1);
}

const fileFlag = process.argv.indexOf("--file");
if (fileFlag === -1 || !process.argv[fileFlag + 1]) {
  console.error("Usage: --file <path-to-export.json>");
  process.exit(1);
}

const inputFile = process.argv[fileFlag + 1];
const isDryRun = process.argv.includes("--dry-run");

interface ClerkEmailAddress {
  email_address: string;
  verification?: { status: string };
}

interface ClerkExternalAccount {
  provider: string;
}

interface ClerkUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: Array<{ phone_number: string }>;
  external_accounts: ClerkExternalAccount[];
  public_metadata: Record<string, unknown>;
  private_metadata: Record<string, unknown>;
  unsafe_metadata: Record<string, unknown>;
  external_id: string | null;
  password_enabled: boolean;
  banned: boolean;
}

async function clerkRequest(path: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Clerk API ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function findExistingUser(email: string): Promise<string | null> {
  try {
    const results = await clerkRequest(
      `/users?email_address=${encodeURIComponent(email)}&limit=1`,
      "GET"
    );
    return results[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function importUser(user: ClerkUser): Promise<{ status: "created" | "skipped" | "error"; id?: string; error?: string }> {
  const primaryEmail = user.email_addresses[0]?.email_address;
  if (!primaryEmail) return { status: "error", error: "No email address" };

  if (isDryRun) {
    const isOAuth = user.external_accounts.length > 0 && !user.password_enabled;
    console.log(
      `  [DRY RUN] ${primaryEmail} — ${isOAuth ? "OAuth only, no password" : "has password (will need reset)"}`
    );
    return { status: "skipped" };
  }

  // Check if already exists in prod
  const existingId = await findExistingUser(primaryEmail);
  if (existingId) return { status: "skipped", id: existingId };

  const isOAuthOnly = user.external_accounts.length > 0 && !user.password_enabled;

  try {
    const created = await clerkRequest("/users", "POST", {
      ...(user.first_name ? { first_name: user.first_name } : {}),
      ...(user.last_name ? { last_name: user.last_name } : {}),
      ...(user.username ? { username: user.username } : {}),
      email_address: user.email_addresses.map((e) => e.email_address),
      ...(user.phone_numbers.length > 0
        ? { phone_number: user.phone_numbers.map((p) => p.phone_number) }
        : {}),
      public_metadata: {
        ...user.public_metadata,
        // store dev id so backfill-clerk-user-id can correlate if needed
        clerk_dev_id: user.id,
      },
      private_metadata: user.private_metadata,
      unsafe_metadata: user.unsafe_metadata,
      ...(user.external_id ? { external_id: user.external_id } : {}),
      skip_password_requirement: isOAuthOnly,
      // Password-enabled users get no hash — they must reset on first login
      ...(user.password_enabled && !isOAuthOnly ? { skip_password_checks: true } : {}),
    });

    return { status: "created", id: created.id };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const users: ClerkUser[] = JSON.parse(readFileSync(inputFile, "utf-8"));
  console.log(`\nImporting ${users.length} users to Clerk prod${isDryRun ? " (DRY RUN)" : ""}...\n`);

  let created = 0, skipped = 0, errors = 0;
  const errorLog: Array<{ email: string; error: string }> = [];

  for (const user of users) {
    const email = user.email_addresses[0]?.email_address ?? user.id;
    const result = await importUser(user);

    switch (result.status) {
      case "created":
        created++;
        console.log(`  ✓ ${email} → ${result.id}`);
        break;
      case "skipped":
        skipped++;
        console.log(`  - ${email} (already exists)`);
        break;
      case "error":
        errors++;
        console.error(`  ✗ ${email}: ${result.error}`);
        errorLog.push({ email, error: result.error! });
        break;
    }

    // Stay under Clerk prod rate limit (~100 req/s, be conservative)
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(`\nSummary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped} (already in prod)`);
  console.log(`  Errors:  ${errors}`);

  if (errorLog.length > 0) {
    const logFile = `./clerk-import-errors-${Date.now()}.json`;
    writeFileSync(logFile, JSON.stringify(errorLog, null, 2));
    console.log(`\nError details saved to: ${logFile}`);
    process.exit(1);
  }

  console.log(`\n✓ Import complete. Run backfill-clerk-user-id.ts with sk_live to re-link Supabase.`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
