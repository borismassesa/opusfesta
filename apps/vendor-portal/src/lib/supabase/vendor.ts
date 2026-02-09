import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  VendorRecord,
  VendorPortfolioItem,
  VendorPackageRecord,
  VendorAwardRecord,
  VendorAvailabilityRecord,
  VendorReviewRecord,
} from "@opusfesta/lib";

export type Vendor = VendorRecord;
export type PortfolioItem = VendorPortfolioItem;
export type VendorPackage = VendorPackageRecord;
export type VendorAward = VendorAwardRecord;
export type AvailabilityDate = VendorAvailabilityRecord;
export type VendorReview = VendorReviewRecord;
export type VendorOnboardingStatus = 'invited' | 'in_progress' | 'pending_review' | 'active' | 'suspended';
export type VendorMemberRole = 'owner' | 'manager' | 'staff';

export interface VendorPortalAccess {
  dbUserId: string | null;
  role: 'user' | 'vendor' | 'admin' | null;
  vendor: Pick<Vendor, 'id' | 'slug' | 'business_name'> | null;
  membershipRole: VendorMemberRole | null;
  onboardingStatus: VendorOnboardingStatus | null;
  suspensionReason: string | null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

const VENDOR_ROLE_PRIORITY: Record<VendorMemberRole, number> = {
  owner: 0,
  manager: 1,
  staff: 2,
};

type VendorMembershipLookup = {
  role: VendorMemberRole;
  vendor: {
    id: string;
    slug?: string;
    business_name: string;
    onboarding_status?: VendorOnboardingStatus;
    suspension_reason?: string | null;
  };
};

async function getPrimaryMembershipVendor(
  dbUserId: string,
  client: SupabaseClient
): Promise<VendorMembershipLookup | null> {
  const { data, error } = await client
    .from('vendor_memberships')
    .select(`
      role,
      vendor:vendors (
        id,
        slug,
        business_name,
        onboarding_status,
        suspension_reason
      )
    `)
    .eq('user_id', dbUserId)
    .eq('status', 'active');

  if (error || !data?.length) {
    return null;
  }

  const parsedMemberships = data
    .map((row) => {
      const role = row.role as VendorMemberRole | undefined;
      const rawVendor = (row as { vendor?: unknown }).vendor;
      const vendor =
        rawVendor && Array.isArray(rawVendor)
          ? rawVendor[0]
          : (rawVendor as VendorMembershipLookup['vendor'] | undefined);

      if (!role || !vendor?.id || !vendor.business_name) {
        return null;
      }

      return {
        role,
        vendor,
      } satisfies VendorMembershipLookup;
    })
    .filter((membership): membership is VendorMembershipLookup => membership !== null)
    .sort((a, b) => VENDOR_ROLE_PRIORITY[a.role] - VENDOR_ROLE_PRIORITY[b.role]);

  return parsedMemberships[0] ?? null;
}

export async function resolveDbUserId(
  userIdentifier: string,
  client?: SupabaseClient
): Promise<string | null> {
  const db = client || supabase;
  const normalized = userIdentifier.trim();
  if (!normalized) {
    return null;
  }

  if (isUuid(normalized)) {
    return normalized;
  }

  const { data } = await db
    .from('users')
    .select('id')
    .eq('clerk_id', normalized)
    .maybeSingle();

  return data?.id ?? null;
}

// Fetch vendor by user_id
export async function getVendorByUserId(
  userId: string,
  client?: SupabaseClient
): Promise<Vendor | null> {
  const db = client || supabase;
  const resolvedUserId = await resolveDbUserId(userId, db);

  if (!resolvedUserId) {
    return null;
  }

  const primaryMembershipVendor = await getPrimaryMembershipVendor(resolvedUserId, db);
  if (primaryMembershipVendor?.vendor?.id) {
    const membershipVendorResult = await db
      .from('vendors')
      .select('*')
      .eq('id', primaryMembershipVendor.vendor.id)
      .maybeSingle();

    if (!membershipVendorResult.error && membershipVendorResult.data) {
      return membershipVendorResult.data as Vendor;
    }
  }

  const { data, error } = await db
    .from('vendors')
    .select('*')
    .eq('user_id', resolvedUserId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Vendor;
}

// Create new vendor profile
export async function createVendor(
  userId: string,
  vendorData: {
    business_name: string;
    category: string;
    subcategories?: string[];
    bio?: string | null;
    description?: string | null;
    logo?: string | null;
    cover_image?: string | null;
    location?: {
      city?: string;
      country?: string;
      address?: string;
      coordinates?: {
        lat?: number;
        lng?: number;
      };
    };
    price_range?: string | null;
    contact_info?: {
      email?: string;
      phone?: string;
      website?: string;
    };
    social_links?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      tiktok?: string;
    };
    services_offered?: Array<{ title: string; description: string }>;
    years_in_business?: number | null;
    team_size?: number | null;
  },
  client?: SupabaseClient
): Promise<Vendor | null> {
  const db = client || supabase;
  const resolvedUserId = await resolveDbUserId(userId, db);
  if (!resolvedUserId) {
    return null;
  }

  // Check if vendor already exists for this user
  const { data: existingVendor } = await db
    .from('vendors')
    .select('id')
    .eq('user_id', resolvedUserId)
    .maybeSingle();

  if (existingVendor) {
    return null;
  }

  // Normalize contact_info email to lowercase
  const normalizedContactInfo = vendorData.contact_info ? {
    ...vendorData.contact_info,
    email: vendorData.contact_info.email?.toLowerCase().trim() || vendorData.contact_info.email,
  } : {};

  // Generate unique slug
  let slug = generateSlug(vendorData.business_name);
  let slugCounter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data: existingSlug } = await db
      .from('vendors')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!existingSlug) {
      isUnique = true;
    } else {
      slug = `${generateSlug(vendorData.business_name)}-${slugCounter}`;
      slugCounter++;
    }
  }

  const now = new Date().toISOString();

  const { data, error } = await db
    .from('vendors')
    .insert({
      user_id: resolvedUserId,
      business_name: vendorData.business_name,
      category: vendorData.category,
      subcategories: vendorData.subcategories || [],
      slug,
      bio: vendorData.bio || null,
      description: vendorData.description || null,
      logo: vendorData.logo || null,
      cover_image: vendorData.cover_image || null,
      location: vendorData.location || { country: 'Tanzania' },
      price_range: vendorData.price_range || null,
      verified: false,
      tier: 'free',
      stats: {
        viewCount: 0,
        inquiryCount: 0,
        saveCount: 0,
        averageRating: 0,
        reviewCount: 0,
      },
      contact_info: normalizedContactInfo,
      social_links: vendorData.social_links || {},
      services_offered: vendorData.services_offered || [],
      years_in_business: vendorData.years_in_business || null,
      team_size: vendorData.team_size || null,
      onboarding_status: 'in_progress',
      onboarding_started_at: now,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as Vendor;
}

export async function getVendorPortalAccessByClerkId(
  clerkId: string,
  client?: SupabaseClient
): Promise<VendorPortalAccess> {
  const db = client || supabase;
  const normalized = clerkId.trim();
  if (!normalized) {
    return {
      dbUserId: null,
      role: null,
      vendor: null,
      membershipRole: null,
      onboardingStatus: null,
      suspensionReason: null,
    };
  }

  const { data: user } = await db
    .from('users')
    .select('id, role')
    .eq('clerk_id', normalized)
    .maybeSingle();

  if (!user) {
    return {
      dbUserId: null,
      role: null,
      vendor: null,
      membershipRole: null,
      onboardingStatus: null,
      suspensionReason: null,
    };
  }

  let vendor:
    | {
        id: string;
        slug?: string;
        business_name: string;
        onboarding_status?: VendorOnboardingStatus;
        suspension_reason?: string | null;
      }
    | null = null;
  let membershipRole: VendorMemberRole | null = null;

  const primaryMembershipVendor = await getPrimaryMembershipVendor(user.id, db);
  if (primaryMembershipVendor?.vendor) {
    vendor = primaryMembershipVendor.vendor;
    membershipRole = primaryMembershipVendor.role;
  }

  if (!vendor) {
    const vendorWithStatus = await db
      .from('vendors')
      .select('id, slug, business_name, onboarding_status, suspension_reason')
      .eq('user_id', user.id)
      .maybeSingle();

    if (vendorWithStatus.error && vendorWithStatus.error.message?.includes('onboarding_status')) {
      const legacyVendor = await db
        .from('vendors')
        .select('id, slug, business_name')
        .eq('user_id', user.id)
        .maybeSingle();
      vendor = legacyVendor.data as typeof vendor;
    } else {
      vendor = vendorWithStatus.data as typeof vendor;
    }

    if (vendor) {
      membershipRole = 'owner';
    }
  }

  return {
    dbUserId: user.id,
    role: (user.role as 'user' | 'vendor' | 'admin') ?? 'user',
    vendor: vendor
      ? { id: vendor.id, slug: vendor.slug || '', business_name: vendor.business_name }
      : null,
    membershipRole,
    onboardingStatus: vendor?.onboarding_status ?? (vendor ? 'active' : null),
    suspensionReason: vendor?.suspension_reason ?? null,
  };
}

// Update vendor storefront fields
export async function updateVendor(
  vendorId: string,
  updates: Partial<Vendor>
): Promise<Vendor | null> {
  // Normalize contact_info email to lowercase if being updated
  const cleanedUpdates: any = { ...updates };
  
  if (cleanedUpdates.contact_info && cleanedUpdates.contact_info.email) {
    cleanedUpdates.contact_info = {
      ...cleanedUpdates.contact_info,
      email: cleanedUpdates.contact_info.email.toLowerCase().trim(),
    };
  }

  const { data, error } = await supabase
    .from('vendors')
    .update({
      ...cleanedUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as Vendor;
}

// Generate vendor slug from business name
export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Update vendor slug
export async function updateVendorSlug(
  vendorId: string,
  slug: string
): Promise<boolean> {
  const { error } = await supabase
    .from('vendors')
    .update({ slug, updated_at: new Date().toISOString() })
    .eq('id', vendorId);

  return !error;
}

// Portfolio Management
export async function getVendorPortfolio(
  vendorId: string
): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as PortfolioItem[];
}

export async function createPortfolioItem(
  portfolioItem: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>
): Promise<PortfolioItem | null> {
  const { data, error } = await supabase
    .from('portfolio')
    .insert({
      ...portfolioItem,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as PortfolioItem;
}

export async function updatePortfolioItem(
  itemId: string,
  updates: Partial<PortfolioItem>
): Promise<PortfolioItem | null> {
  const { data, error } = await supabase
    .from('portfolio')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as PortfolioItem;
}

export async function deletePortfolioItem(itemId: string): Promise<boolean> {
  const { error } = await supabase.from('portfolio').delete().eq('id', itemId);
  return !error;
}

// Availability Management
export async function getVendorAvailability(
  vendorId: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityDate[]> {
  const { data, error } = await supabase.rpc('get_vendor_availability', {
    vendor_uuid: vendorId,
    start_date: startDate,
    end_date: endDate,
  });

  if (error || !data) {
    return [];
  }

  return data as AvailabilityDate[];
}

export async function updateVendorAvailability(
  vendorId: string,
  date: string,
  isAvailable: boolean,
  reason?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('vendor_availability')
      .upsert(
        {
          vendor_id: vendorId,
          date,
          is_available: isAvailable,
          reason: reason || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'vendor_id,date',
        }
      )
      .select();

    if (error) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getBookedDates(vendorId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_vendor_booked_dates', {
    vendor_uuid: vendorId,
  });

  if (error || !data) {
    return [];
  }

  return data.map((item: { date: string }) => item.date);
}

// Reviews Management
export async function getVendorReviews(vendorId: string): Promise<VendorReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as VendorReview[];
}

export async function updateReviewResponse(
  reviewId: string,
  response: string
): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .update({
      vendor_response: response,
      vendor_responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  return !error;
}

// Image upload to Supabase Storage
export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting existing files
    });

    if (error) {
      // Provide more specific error messages
      if (error.message?.includes('Bucket not found')) {
        return { url: null, error: 'Storage bucket not found. Please contact support.' };
      }
      if (error.message?.includes('new row violates row-level security')) {
        return { url: null, error: 'Permission denied. Please check your account permissions.' };
      }
      if (error.message?.includes('JWT')) {
        return { url: null, error: 'Authentication error. Please log in again.' };
      }
      
      return { url: null, error: error.message || 'Failed to upload image' };
    }

    if (!data) {
      return { url: null, error: 'Upload failed: No data returned' };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : 'An unexpected error occurred'
    };
  }
}

// Packages Management (assuming JSONB field for now, can be migrated to table later)
export async function getVendorPackages(vendorId: string): Promise<VendorPackage[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('packages')
    .eq('id', vendorId)
    .single();

  if (error) {
    return [];
  }

  if (!data || !data.packages) {
    return [];
  }

  return data.packages as VendorPackage[];
}

export async function updateVendorPackages(
  vendorId: string,
  packages: VendorPackage[]
): Promise<boolean> {
  try {
    // Clean up packages data - remove temporary IDs and ensure proper structure
    const cleanedPackages = packages.map((pkg) => {
      const cleaned: VendorPackage = {
        vendor_id: pkg.vendor_id || vendorId,
        name: pkg.name,
        starting_price: pkg.starting_price,
        duration: pkg.duration,
        features: Array.isArray(pkg.features) ? pkg.features : [],
        is_popular: pkg.is_popular || false,
        display_order: pkg.display_order ?? 0,
      };
      // Only include id if it's not a temporary ID
      if (pkg.id && !pkg.id.startsWith('temp-')) {
        cleaned.id = pkg.id;
      }
      return cleaned;
    });

    const { data, error } = await supabase
      .from('vendors')
      .update({
        packages: cleanedPackages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select();

    if (error) {
      let errorMessage = 'Failed to save packages';

      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        errorMessage = 'Database column missing. Please run the packages migration.';
      } else if (error.message) {
        errorMessage = `Failed to save packages: ${error.message}`;
      } else if (error.code) {
        errorMessage = `Failed to save packages (Error code: ${error.code})`;
      }

      throw new Error(errorMessage);
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from update. Vendor may not exist or you may not have permission to update it.');
    }

    return true;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An unexpected error occurred while saving packages');
  }
}

// Awards Management (assuming JSONB field for now)
export async function getVendorAwards(vendorId: string): Promise<VendorAward[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('awards')
    .eq('id', vendorId)
    .single();

  if (error || !data || !data.awards) {
    return [];
  }

  return data.awards as VendorAward[];
}

export async function updateVendorAwards(
  vendorId: string,
  awards: VendorAward[]
): Promise<boolean> {
  const { error } = await supabase
    .from('vendors')
    .update({
      awards,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId);

  if (error) {
    return false;
  }

  return true;
}
