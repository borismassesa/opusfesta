/**
 * Script to clean up duplicate vendors
 * 
 * This script:
 * 1. Finds vendors with duplicate user_id (one user having multiple vendors)
 * 2. Keeps the oldest vendor record (by created_at)
 * 3. Merges data from newer duplicates into the kept record
 * 4. Updates foreign key references (reviews, portfolio, etc.)
 * 5. Deletes duplicate vendor records
 * 
 * Usage:
 *   npx tsx scripts/cleanup-duplicate-vendors.ts [--dry-run]
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

interface Vendor {
  id: string;
  user_id: string;
  slug: string;
  business_name: string;
  category: string;
  contact_info: any;
  created_at: string;
  updated_at: string;
}

interface DuplicateGroup {
  userId: string;
  vendors: Vendor[];
  keepVendor: Vendor;
  duplicateVendors: Vendor[];
}

async function findDuplicateVendors(): Promise<DuplicateGroup[]> {
  console.log('🔍 Finding duplicate vendors...');

  // Get all vendors grouped by user_id
  const { data: allVendors, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }

  if (!allVendors || allVendors.length === 0) {
    console.log('No vendors found.');
    return [];
  }

  // Group vendors by user_id
  const userGroups = new Map<string, Vendor[]>();
  
  for (const vendor of allVendors) {
    if (!userGroups.has(vendor.user_id)) {
      userGroups.set(vendor.user_id, []);
    }
    userGroups.get(vendor.user_id)!.push(vendor);
  }

  // Find groups with duplicates
  const duplicateGroups: DuplicateGroup[] = [];
  
  for (const [userId, vendors] of userGroups.entries()) {
    if (vendors.length > 1) {
      // Sort by created_at to keep the oldest
      vendors.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      const keepVendor = vendors[0];
      const duplicateVendors = vendors.slice(1);
      
      duplicateGroups.push({
        userId,
        vendors,
        keepVendor,
        duplicateVendors,
      });
    }
  }

  return duplicateGroups;
}

async function mergeVendorData(keepVendor: Vendor, duplicateVendor: Vendor): Promise<void> {
  // Merge data: prefer non-null values from duplicate if keepVendor has null
  const updates: any = {};
  
  if (!keepVendor.business_name && duplicateVendor.business_name) {
    updates.business_name = duplicateVendor.business_name;
  }
  
  // Merge contact_info
  if (duplicateVendor.contact_info) {
    const keepContactInfo = keepVendor.contact_info || {};
    const duplicateContactInfo = duplicateVendor.contact_info || {};
    
    const mergedContactInfo: any = { ...keepContactInfo };
    
    // Merge email (normalize to lowercase)
    if (duplicateContactInfo.email && !keepContactInfo.email) {
      mergedContactInfo.email = duplicateContactInfo.email.toLowerCase().trim();
    }
    
    // Merge phone
    if (duplicateContactInfo.phone && !keepContactInfo.phone) {
      mergedContactInfo.phone = duplicateContactInfo.phone;
    }
    
    // Merge website
    if (duplicateContactInfo.website && !keepContactInfo.website) {
      mergedContactInfo.website = duplicateContactInfo.website;
    }
    
    if (Object.keys(mergedContactInfo).length > 0) {
      updates.contact_info = mergedContactInfo;
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', keepVendor.id);

    if (error) {
      console.error(`  ⚠️  Error updating vendor ${keepVendor.id}:`, error);
    } else {
      console.log(`  ✓ Updated vendor ${keepVendor.id} with merged data`);
    }
  }
}

async function updateForeignKeys(keepVendorId: string, duplicateVendorId: string): Promise<void> {
  // Update reviews table
  const { error: reviewError } = await supabase
    .from('reviews')
    .update({ vendor_id: keepVendorId })
    .eq('vendor_id', duplicateVendorId);

  if (reviewError) {
    console.error(`  ⚠️  Error updating reviews for vendor ${duplicateVendorId}:`, reviewError);
  } else {
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', duplicateVendorId);
    
    if (count && count > 0) {
      console.log(`  ✓ Updated ${count} review(s)`);
    }
  }

  // Update portfolio table
  const { error: portfolioError } = await supabase
    .from('portfolio')
    .update({ vendor_id: keepVendorId })
    .eq('vendor_id', duplicateVendorId);

  if (portfolioError) {
    console.error(`  ⚠️  Error updating portfolio for vendor ${duplicateVendorId}:`, portfolioError);
  } else {
    const { count } = await supabase
      .from('portfolio')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', duplicateVendorId);
    
    if (count && count > 0) {
      console.log(`  ✓ Updated ${count} portfolio item(s)`);
    }
  }

  // Update bookings/inquiries table if it exists
  try {
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ vendor_id: keepVendorId })
      .eq('vendor_id', duplicateVendorId);

    if (!bookingError) {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', duplicateVendorId);
      
      if (count && count > 0) {
        console.log(`  ✓ Updated ${count} booking(s)`);
      }
    }
  } catch (e) {
    // Table might not exist, ignore
  }

  // Update saved_vendors table
  const { error: savedError } = await supabase
    .from('saved_vendors')
    .update({ vendor_id: keepVendorId })
    .eq('vendor_id', duplicateVendorId);

  if (savedError) {
    console.error(`  ⚠️  Error updating saved_vendors for vendor ${duplicateVendorId}:`, savedError);
  } else {
    const { count } = await supabase
      .from('saved_vendors')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', duplicateVendorId);
    
    if (count && count > 0) {
      console.log(`  ✓ Updated ${count} saved vendor record(s)`);
    }
  }
}

async function deleteDuplicateVendor(vendorId: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`  [DRY RUN] Would delete vendor ${vendorId}`);
    return;
  }

  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', vendorId);

  if (error) {
    console.error(`  ⚠️  Error deleting vendor ${vendorId}:`, error);
  } else {
    console.log(`  ✓ Deleted duplicate vendor ${vendorId}`);
  }
}

async function cleanupDuplicates(dryRun: boolean = false): Promise<void> {
  console.log(dryRun ? '🔍 DRY RUN MODE - No changes will be made\n' : '🧹 Starting cleanup...\n');

  const duplicateGroups = await findDuplicateVendors();

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicate vendors found!');
    return;
  }

  console.log(`\n📊 Found ${duplicateGroups.length} user(s) with duplicate vendors:\n`);

  let totalDuplicates = 0;
  let totalMerged = 0;
  let totalDeleted = 0;

  for (const group of duplicateGroups) {
    totalDuplicates += group.duplicateVendors.length;
    
    console.log(`👤 User ID: ${group.userId}`);
    console.log(`   Keeping: ${group.keepVendor.id} - "${group.keepVendor.business_name}" (created: ${group.keepVendor.created_at})`);
    console.log(`   Duplicates: ${group.duplicateVendors.length} vendor(s)`);
    
    for (const duplicate of group.duplicateVendors) {
      console.log(`     - ${duplicate.id} - "${duplicate.business_name}" (created: ${duplicate.created_at})`);
      
      // Merge data
      if (!dryRun) {
        await mergeVendorData(group.keepVendor, duplicate);
        await updateForeignKeys(group.keepVendor.id, duplicate.id);
        totalMerged++;
      } else {
        console.log(`     [DRY RUN] Would merge data from ${duplicate.id} into ${group.keepVendor.id}`);
      }
      
      // Delete duplicate
      await deleteDuplicateVendor(duplicate.id, dryRun);
      if (!dryRun) {
        totalDeleted++;
      }
    }
    
    console.log('');
  }

  console.log('\n📈 Summary:');
  console.log(`   Users with duplicates: ${duplicateGroups.length}`);
  console.log(`   Total duplicate vendors: ${totalDuplicates}`);
  if (!dryRun) {
    console.log(`   Vendors merged: ${totalMerged}`);
    console.log(`   Vendors deleted: ${totalDeleted}`);
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
