/**
 * Script to clean up duplicate users based on case-insensitive email matching
 * 
 * This script:
 * 1. Finds all users with duplicate emails (case-insensitive)
 * 2. Keeps the oldest user record (by created_at)
 * 3. Merges data from newer duplicates into the kept record
 * 4. Updates foreign key references (vendors, applications, etc.)
 * 5. Deletes duplicate user records
 * 
 * Usage:
 *   npx tsx scripts/cleanup-duplicate-users.ts [--dry-run]
 * 
 * Options:
 *   --dry-run: Show what would be done without making changes
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as path from 'path';

// Load environment variables from .env files
function loadEnvFile(filePath: string): void {
  try {
    const envContent = readFileSync(filePath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
          }
        }
      }
    }
  } catch (error) {
    // File doesn't exist, that's okay
  }
}

// Try to load env files from multiple locations
const envPaths = [
  path.join(__dirname, '../.env.local'),
  path.join(__dirname, '../env.development'),
  path.join(__dirname, '../apps/website/.env.local'),
  path.join(__dirname, '../apps/admin/.env.local'),
  path.join(__dirname, '../apps/vendor-portal/.env.local'),
];

for (const envPath of envPaths) {
  loadEnvFile(envPath);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  console.error('');
  console.error('Please set these variables in one of the following locations:');
  console.error('  - .env.local (root)');
  console.error('  - apps/website/.env.local');
  console.error('  - apps/admin/.env.local');
  console.error('  - Or export them in your shell:');
  console.error('    export NEXT_PUBLIC_SUPABASE_URL="your-url"');
  console.error('    export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface DuplicateGroup {
  normalizedEmail: string;
  users: User[];
  keepUser: User;
  duplicateUsers: User[];
}

async function findDuplicateUsers(): Promise<DuplicateGroup[]> {
  console.log('🔍 Finding duplicate users...');

  // Get all users
  const { data: allUsers, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  if (!allUsers || allUsers.length === 0) {
    console.log('No users found.');
    return [];
  }

  // Group users by normalized email (lowercase)
  const emailGroups = new Map<string, User[]>();
  
  for (const user of allUsers) {
    const normalizedEmail = user.email.toLowerCase().trim();
    if (!emailGroups.has(normalizedEmail)) {
      emailGroups.set(normalizedEmail, []);
    }
    emailGroups.get(normalizedEmail)!.push(user);
  }

  // Find groups with duplicates
  const duplicateGroups: DuplicateGroup[] = [];
  
  for (const [normalizedEmail, users] of emailGroups.entries()) {
    if (users.length > 1) {
      // Sort by created_at to keep the oldest
      users.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const keepUser = users[0];
      const duplicateUsers = users.slice(1);
      
      duplicateGroups.push({
        normalizedEmail,
        users,
        keepUser,
        duplicateUsers,
      });
    }
  }

  return duplicateGroups;
}

async function mergeUserData(keepUser: User, duplicateUser: User): Promise<void> {
  // Merge data: prefer non-null values from duplicate if keepUser has null
  const updates: Partial<User> = {};
  
  if (!keepUser.name && duplicateUser.name) {
    updates.name = duplicateUser.name;
  }
  
  if (!keepUser.phone && duplicateUser.phone) {
    updates.phone = duplicateUser.phone;
  }
  
  if (!keepUser.avatar && duplicateUser.avatar) {
    updates.avatar = duplicateUser.avatar;
  }
  
  // Use the more permissive role (admin > vendor > user)
  const rolePriority = { admin: 3, vendor: 2, user: 1 };
  if (rolePriority[duplicateUser.role as keyof typeof rolePriority] > 
      rolePriority[keepUser.role as keyof typeof rolePriority]) {
    updates.role = duplicateUser.role;
  }
  
  // Update email to normalized lowercase if different
  const normalizedEmail = duplicateUser.email.toLowerCase().trim();
  if (keepUser.email !== normalizedEmail) {
    updates.email = normalizedEmail;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', keepUser.id);

    if (error) {
      console.error(`  ⚠️  Error updating user ${keepUser.id}:`, error);
    } else {
      console.log(`  ✓ Updated user ${keepUser.id} with merged data`);
    }
  }
}

async function updateForeignKeys(keepUserId: string, duplicateUserId: string): Promise<void> {
  // Update vendors table
  const { error: vendorError } = await supabase
    .from('vendors')
    .update({ user_id: keepUserId })
    .eq('user_id', duplicateUserId);

  if (vendorError) {
    console.error(`  ⚠️  Error updating vendors for user ${duplicateUserId}:`, vendorError);
  } else {
    const { count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', duplicateUserId);
    
    if (count && count > 0) {
      console.log(`  ✓ Updated ${count} vendor record(s)`);
    }
  }

  // Update job_applications table
  const { error: appError } = await supabase
    .from('job_applications')
    .update({ user_id: keepUserId })
    .eq('user_id', duplicateUserId);

  if (appError) {
    console.error(`  ⚠️  Error updating job_applications for user ${duplicateUserId}:`, appError);
  } else {
    const { count } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', duplicateUserId);
    
    if (count && count > 0) {
      console.log(`  ✓ Updated ${count} job application(s)`);
    }
  }

  // Update any other tables that reference users
  // Add more as needed based on your schema
}

async function deleteDuplicateUser(userId: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would delete user ${userId}`);
    return;
  }

  // First, delete from auth.users
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  if (authError) {
    console.error(`  ⚠️  Error deleting auth user ${userId}:`, authError);
  }

  // Then delete from users table
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error(`  ⚠️  Error deleting user ${userId}:`, error);
  } else {
    console.log(`  ✓ Deleted duplicate user ${userId}`);
  }
}

async function cleanupDuplicates(dryRun: boolean = false): Promise<void> {
  console.log(dryRun ? '🔍 DRY RUN MODE - No changes will be made\n' : '🧹 Starting cleanup...\n');

  const duplicateGroups = await findDuplicateUsers();

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicate users found!');
    return;
  }

  console.log(`\n📊 Found ${duplicateGroups.length} duplicate email group(s):\n`);

  let totalDuplicates = 0;
  let totalMerged = 0;
  let totalDeleted = 0;

  for (const group of duplicateGroups) {
    totalDuplicates += group.duplicateUsers.length;
    
    console.log(`📧 Email: ${group.normalizedEmail}`);
    console.log(`   Keeping: ${group.keepUser.id} (created: ${group.keepUser.created_at})`);
    console.log(`   Duplicates: ${group.duplicateUsers.length} user(s)`);
    
    for (const duplicate of group.duplicateUsers) {
      console.log(`     - ${duplicate.id} (created: ${duplicate.created_at})`);
      
      // Merge data
      if (!dryRun) {
        await mergeUserData(group.keepUser, duplicate);
        await updateForeignKeys(group.keepUser.id, duplicate.id);
        totalMerged++;
      } else {
        console.log(`     [DRY RUN] Would merge data from ${duplicate.id} into ${group.keepUser.id}`);
      }
      
      // Delete duplicate
      await deleteDuplicateUser(duplicate.id, dryRun);
      if (!dryRun) {
        totalDeleted++;
      }
    }
    
    console.log('');
  }

  console.log('\n📈 Summary:');
  console.log(`   Duplicate groups: ${duplicateGroups.length}`);
  console.log(`   Total duplicates: ${totalDuplicates}`);
  if (!dryRun) {
    console.log(`   Users merged: ${totalMerged}`);
    console.log(`   Users deleted: ${totalDeleted}`);
  } else {
    console.log(`   [DRY RUN] Would merge: ${totalDuplicates}`);
    console.log(`   [DRY RUN] Would delete: ${totalDuplicates}`);
  }
  console.log('\n✅ Cleanup complete!');
}

// Main execution
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

cleanupDuplicates(dryRun)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  });
