/**
 * Export all users from a Clerk instance (dev) to a JSON file
 * compatible with clerk/migration-tool's `clerk` transformer.
 *
 * Usage:
 *   CLERK_SECRET_KEY=sk_test_xxx npx tsx scripts/export-clerk-dev-users.ts
 *   CLERK_SECRET_KEY=sk_test_xxx npx tsx scripts/export-clerk-dev-users.ts --out ./my-export.json
 *
 * Output file defaults to: ./clerk-dev-export-<timestamp>.json
 */

import { writeFileSync } from "fs";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error("Missing CLERK_SECRET_KEY env var");
  process.exit(1);
}

const outFlag = process.argv.indexOf("--out");
const outFile =
  outFlag !== -1
    ? process.argv[outFlag + 1]
    : `./clerk-dev-export-${Date.now()}.json`;

const LIMIT = 500;

async function fetchPage(offset: number) {
  const res = await fetch(
    `https://api.clerk.com/v1/users?limit=${LIMIT}&offset=${offset}&order_by=-created_at`,
    {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clerk API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<unknown[]>;
}

async function main() {
  console.log("Exporting users from Clerk dev instance...\n");

  const allUsers: unknown[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchPage(offset);
    allUsers.push(...page);
    process.stdout.write(`  Fetched ${allUsers.length} users...\r`);

    if (page.length < LIMIT) break;
    offset += LIMIT;
  }

  console.log(`\nTotal users exported: ${allUsers.length}`);
  writeFileSync(outFile, JSON.stringify(allUsers, null, 2));
  console.log(`Saved to: ${outFile}`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
