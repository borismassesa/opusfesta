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

export interface VendorAvailabilityDay {
  date: string;
  is_available: boolean;
  reason: string | null;
}
