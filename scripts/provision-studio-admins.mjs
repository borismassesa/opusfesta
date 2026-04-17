import { randomUUID } from "node:crypto";
import { createClerkClient } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CLERK_SECRET_KEY) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLERK_SECRET_KEY"
  );
  process.exit(1);
}

const emails = process.argv
  .slice(2)
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

if (emails.length === 0) {
  console.error("Usage: node --env-file=apps/studio/.env.local scripts/provision-studio-admins.mjs <email> [email...]");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function fullNameFromClerkUser(user) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

async function getExistingUsersByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, clerk_id, name, avatar, created_at")
    .ilike("email", email)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed reading users rows for ${email}: ${error.message}`);
  }

  return data ?? [];
}

async function moveKnownReferences(fromUserId, toUserId) {
  const tables = ["vendors", "job_applications"];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .update({ user_id: toUserId })
      .eq("user_id", fromUserId);

    if (error) {
      throw new Error(
        `Failed reassigning ${table}.user_id from ${fromUserId} to ${toUserId}: ${error.message}`
      );
    }
  }
}

async function consolidateDuplicateUsers(email, clerkUser) {
  const matches = await getExistingUsersByEmail(email);

  if (matches.length <= 1) {
    return matches[0] ?? null;
  }

  const keepUser = matches[0];

  for (const duplicate of matches.slice(1)) {
    await moveKnownReferences(duplicate.id, keepUser.id);

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", duplicate.id);

    if (error) {
      throw new Error(`Failed deleting duplicate users row ${duplicate.id}: ${error.message}`);
    }
  }

  const mergedUpdate = {
    email,
    role: "admin",
    clerk_id: keepUser.clerk_id ?? clerkUser?.id ?? null,
    name: keepUser.name ?? fullNameFromClerkUser(clerkUser) ?? null,
    avatar: keepUser.avatar ?? clerkUser?.imageUrl ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("users")
    .update(mergedUpdate)
    .eq("id", keepUser.id);

  if (error) {
    throw new Error(`Failed updating merged users row for ${email}: ${error.message}`);
  }

  return { ...keepUser, ...mergedUpdate };
}

async function ensureSupabaseAdmin(email, clerkUser) {
  const existing = await consolidateDuplicateUsers(email, clerkUser);
  const payload = {
    email,
    role: "admin",
    clerk_id: clerkUser?.id ?? existing?.clerk_id ?? null,
    name: existing?.name ?? fullNameFromClerkUser(clerkUser) ?? null,
    avatar: existing?.avatar ?? clerkUser?.imageUrl ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      throw new Error(`Failed updating users row for ${email}: ${error.message}`);
    }

    return { action: "updated", id: existing.id };
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      id: randomUUID(),
      password: "$clerk_managed",
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed inserting users row for ${email}: ${error.message}`);
  }

  return { action: "inserted", id: data.id };
}

async function findClerkUserByEmail(email) {
  const result = await clerk.users.getUserList({ emailAddress: [email], limit: 10 });
  return result.data.find((user) =>
    user.emailAddresses.some((entry) => entry.emailAddress.toLowerCase() === email)
  ) ?? null;
}

async function findPendingInvitationByEmail(email) {
  const result = await clerk.invitations.getInvitationList({ query: email, limit: 100 });
  return result.data.find((invitation) =>
    invitation.emailAddress.toLowerCase() === email && invitation.status === "pending"
  ) ?? null;
}

async function ensureClerkAdmin(email) {
  const existingUser = await findClerkUserByEmail(email);

  if (existingUser) {
    const updatedUser = await clerk.users.updateUser(existingUser.id, {
      publicMetadata: {
        ...existingUser.publicMetadata,
        role: "admin",
        studio_role: "studio_admin",
      },
    });

    return { type: "user", user: updatedUser, action: "updated" };
  }

  const existingInvite = await findPendingInvitationByEmail(email);
  if (existingInvite) {
    return { type: "invitation", invitation: existingInvite, action: "existing" };
  }

  const invitation = await clerk.invitations.createInvitation({
    emailAddress: email,
    notify: true,
    ignoreExisting: true,
    publicMetadata: {
      role: "admin",
      studio_role: "studio_admin",
    },
  });

  return { type: "invitation", invitation, action: "created" };
}

async function main() {
  for (const email of emails) {
    console.log(`\nProcessing ${email}...`);

    const clerkResult = await ensureClerkAdmin(email);

    if (clerkResult.type === "user") {
      const dbResult = await ensureSupabaseAdmin(email, clerkResult.user);
      console.log(
        `  Clerk: ${clerkResult.action} user ${clerkResult.user.id}`
      );
      console.log(
        `  Supabase: ${dbResult.action} users row ${dbResult.id} with role=admin`
      );
      continue;
    }

    const dbResult = await ensureSupabaseAdmin(email, null);
    console.log(
      `  Clerk: ${clerkResult.action} invitation ${clerkResult.invitation.id}`
    );
    console.log(
      `  Supabase: ${dbResult.action} users row ${dbResult.id} with role=admin`
    );
    console.log("  Note: Clerk account will be created when the invite is accepted.");
  }
}

main().catch((error) => {
  console.error("\nProvisioning failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
