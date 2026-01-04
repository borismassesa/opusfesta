import { supabase } from './client';

export interface Vendor {
  id: string;
  slug: string;
  user_id: string;
  business_name: string;
  category: string;
  subcategories: string[];
  bio: string | null;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  location: {
    city?: string;
    country?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price_range: string | null;
  verified: boolean;
  tier: string;
  stats: {
    viewCount: number;
    inquiryCount: number;
    saveCount: number;
    averageRating: number;
    reviewCount: number;
  };
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
  };
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  years_in_business: number | null;
  team_size: number | null;
  services_offered: Array<{ title: string; description: string }>;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  vendor_id: string;
  title: string;
  images: string[];
  description: string | null;
  event_type: string | null;
  event_date: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VendorPackage {
  id?: string;
  vendor_id: string;
  name: string;
  starting_price: number;
  duration: string;
  features: string[];
  is_popular: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface VendorAward {
  title: string;
  year: string;
  description: string;
  icon: string;
  image?: string | null;
  display_order?: number;
}

export interface AvailabilityDate {
  date: string;
  is_available: boolean;
  reason?: string;
}

// Fetch vendor by user_id
export async function getVendorByUserId(userId: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', userId)
    .single();

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
  }
): Promise<Vendor | null> {
  const slug = generateSlug(vendorData.business_name);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      user_id: userId,
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
      contact_info: vendorData.contact_info || {},
      social_links: vendorData.social_links || {},
      services_offered: vendorData.services_offered || [],
      years_in_business: vendorData.years_in_business || null,
      team_size: vendorData.team_size || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating vendor:', error);
    return null;
  }

  return data as Vendor;
}

// Update vendor storefront fields
export async function updateVendor(
  vendorId: string,
  updates: Partial<Vendor>
): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from('vendors')
    .update({
      ...updates,
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
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[updateVendorAvailability] No active session');
      return false;
    }

    console.log('[updateVendorAvailability] Attempting upsert:', {
      vendorId,
      date,
      isAvailable,
      reason,
      userId: session.user.id,
    });

    const { data, error } = await supabase
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
      // Log error in multiple ways to capture all information
      const errorInfo: any = {
        hasError: true,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        vendorId,
        date,
        isAvailable,
        reason,
        userId: session.user.id,
      };

      // Try to extract error properties
      if (error && typeof error === 'object') {
        try {
          errorInfo.errorMessage = (error as any)?.message;
          errorInfo.errorDetails = (error as any)?.details;
          errorInfo.errorHint = (error as any)?.hint;
          errorInfo.errorCode = (error as any)?.code;
          errorInfo.errorStatus = (error as any)?.status;
          errorInfo.errorStatusText = (error as any)?.statusText;
          
          // Try to stringify
          try {
            errorInfo.errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
          } catch (e) {
            errorInfo.errorString = String(error);
          }
        } catch (e) {
          errorInfo.stringifyError = String(e);
        }
      } else {
        errorInfo.errorString = String(error);
      }

      console.error('[updateVendorAvailability] Supabase error:', errorInfo);
      return false;
    }

    // Check if data was returned (should be for upsert with select)
    if (!data || data.length === 0) {
      console.warn('[updateVendorAvailability] No data returned from upsert (but no error):', {
        vendorId,
        date,
        isAvailable,
      });
      // Still return true if no error - upsert might have succeeded without returning data
    } else {
      console.log('[updateVendorAvailability] Success:', {
        vendorId,
        date,
        isAvailable,
        returnedRows: data.length,
      });
    }

    return true;
  } catch (err) {
    console.error('[updateVendorAvailability] Unexpected error:', {
      error: err,
      errorType: typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
      vendorId,
      date,
      isAvailable,
      reason,
    });
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
export async function getVendorReviews(vendorId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:users(name, avatar)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
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
      console.error('Supabase storage upload error:', error);
      
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
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
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
    // If column doesn't exist, return empty array instead of error
    if (error.message?.includes('column') && error.message?.includes('does not exist')) {
      console.warn(
        '⚠️  The "packages" column does not exist. ' +
        'Please run migration: supabase/migrations/021_add_vendor_packages_awards.sql'
      );
      return [];
    }
    console.error('Error fetching vendor packages:', error);
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
      // Log error in multiple ways to capture all details
      const errorInfo = {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      };
      
      console.error('Error updating vendor packages:', errorInfo);
      console.error('Full error object:', error);
      console.error('Vendor ID:', vendorId);
      console.error('Packages data:', JSON.stringify(cleanedPackages, null, 2));
      console.error('Response data:', data);
      
      // Create a more helpful error message
      let errorMessage = 'Failed to save packages';
      
      if (error.message?.includes('column') && error.message?.includes('does not exist')) {
        errorMessage = 'Database column missing. Please run migration: supabase/migrations/021_add_vendor_packages_awards.sql';
      } else if (error.message) {
        errorMessage = `Failed to save packages: ${error.message}`;
      } else if (error.code) {
        errorMessage = `Failed to save packages (Error code: ${error.code})`;
      }
      
      throw new Error(errorMessage);
    }

    if (!data || data.length === 0) {
      const errorMsg = 'No data returned from update. Vendor may not exist or you may not have permission to update it.';
      console.error(errorMsg);
      console.error('Vendor ID:', vendorId);
      throw new Error(errorMsg);
    }

    return true;
  } catch (err) {
    // Re-throw if it's already an Error with a message
    if (err instanceof Error) {
      throw err;
    }
    
    // Otherwise, wrap in Error
    console.error('Unexpected error in updateVendorPackages:', err);
    console.error('Vendor ID:', vendorId);
    console.error('Packages data:', JSON.stringify(packages, null, 2));
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
    console.error('Error updating vendor awards:', error);
    console.error('Vendor ID:', vendorId);
    console.error('Awards data:', JSON.stringify(awards, null, 2));
    return false;
  }

  return true;
}
