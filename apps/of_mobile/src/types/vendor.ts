export type VendorOnboardingStatus =
  | 'application_in_progress'
  | 'verification_pending'
  | 'admin_review'
  | 'needs_corrections'
  | 'active'
  | 'suspended'
  // Legacy aliases that still linger on old rows.
  | 'invited'
  | 'in_progress'
  | 'pending_review';

export interface VendorLocation {
  city?: string;
  address?: string;
  street?: string;
  ward?: string;
  district?: string;
  region?: string;
}

export interface VendorPriceRange {
  min?: number;
  max?: number;
}

export interface VendorStats {
  viewCount?: number;
  inquiryCount?: number;
  saveCount?: number;
  averageRating?: number;
  reviewCount?: number;
}

export interface VendorContactInfo {
  whatsapp?: string;
  phone?: string;
  email?: string;
  instagram?: string;
}

export interface VendorTeamMember {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  avatar?: string;
}

/**
 * A vendor as returned by the public listing/detail queries (VENDOR_COLUMNS in
 * src/lib/api/vendors.ts). JSON columns (location, price_range, stats, …) are
 * loosely shaped in the DB, so their fields are optional here.
 */
export interface VendorListing {
  id: string;
  slug: string;
  user_id: string;
  business_name: string;
  category: string;
  subcategories: string[] | null;
  bio: string | null;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  gallery_urls: string[] | null;
  location: VendorLocation | null;
  price_range: VendorPriceRange | null;
  verified: boolean | null;
  tier: string | null;
  stats: VendorStats | null;
  contact_info: VendorContactInfo | null;
  social_links: Record<string, string> | null;
  years_in_business: number | null;
  team_size: number | null;
  services_offered: string[] | null;
  team: VendorTeamMember[] | null;
  created_at: string;
  updated_at: string;
}

export type SavedVendorStatus = 'saved' | 'contacted' | 'booked' | 'archived';

/** A `saved_vendors` row joined with the summary columns of its vendor. */
export interface SavedVendorRow {
  id: string;
  user_id: string;
  vendor_id: string;
  status: SavedVendorStatus | null;
  created_at: string;
  vendors: {
    id: string;
    business_name: string;
    logo: string | null;
    category: string;
    cover_image: string | null;
    location: VendorLocation | null;
    price_range: VendorPriceRange | null;
    stats: VendorStats | null;
  } | null;
}

/** A package/tier as stored in the vendors.packages JSON column. */
export interface VendorPackageDetail {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  is_featured?: boolean;
  features?: string[];
}

export interface VendorPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  includes: string[];
}

export interface VendorRow {
  id: string;
  user_id: string;
  slug: string;
  business_name: string;
  category: string;
  bio: string | null;
  description: string | null;
  logo: string | null;
  cover_image: string | null;
  gallery_urls: string[] | null;
  location: { city?: string; address?: string } | null;
  price_range: string | null;
  stats: {
    viewCount?: number;
    inquiryCount?: number;
    saveCount?: number;
    averageRating?: number;
    reviewCount?: number;
  } | null;
  contact_info: {
    whatsapp?: string;
    phone?: string;
    email?: string;
    instagram?: string;
  } | null;
  social_links: Record<string, string> | null;
  packages: VendorPackage[] | null;
  onboarding_status: VendorOnboardingStatus;
  created_at: string;
  updated_at: string;
}

export type InquiryStatus = 'pending' | 'responded' | 'accepted' | 'declined' | 'closed';

export type ProposalStatus = 'sent' | 'countered' | 'accepted' | 'declined';

export interface InquiryRow {
  id: string;
  vendor_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  event_type: string;
  event_date: string | null;
  guest_count: number | null;
  budget: string | null;
  location: string | null;
  message: string;
  status: InquiryStatus;
  vendor_response: string | null;
  responded_at: string | null;
  created_at: string;
  // Proposal lifecycle (20260506000002_inquiry_proposal_state.sql). The
  // couple counters via opus_website/opus_pass; the vendor sends and accepts
  // counters — the same columns vendors_portal's proposal route writes.
  proposal_status: ProposalStatus | null;
  proposal_event_date: string | null;
  proposal_venue: string | null;
  proposal_guest_count: number | null;
  proposal_package: string | null;
  proposal_invoice_amount: number | null;
  proposal_invoice_details: string | null;
  proposal_sent_at: string | null;
  proposal_counter_amount: number | null;
  proposal_counter_message: string | null;
  proposal_countered_at: string | null;
  proposal_accepted_at: string | null;
}

export type BookingStage = 'quoted' | 'reserved' | 'confirmed' | 'completed' | 'cancelled';

export interface VendorBookingTimelineEntry {
  at: string;
  kind: string;
  label: string;
}

export interface VendorBookingRow {
  id: string;
  vendor_id: string;
  inquiry_id: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  partner_a: string;
  partner_b: string;
  phone: string | null;
  whatsapp: string | null;
  email: string;
  package_name: string;
  location: string;
  stage: BookingStage;
  internal_status: string;
  total_value: number;
  deposit_percent: number;
  deposit_paid: boolean;
  contract_sent_at: string | null;
  contract_signed: boolean;
  invoice_issued: boolean;
  brief_submitted: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
  review_requested: boolean;
  review_received: boolean;
  timeline: VendorBookingTimelineEntry[];
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface VendorReview {
  id: string;
  vendor_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  event_type: string | null;
  created_at: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

export interface VendorAvailabilityDay {
  date: string;
  is_available: boolean;
  reason: string | null;
}
