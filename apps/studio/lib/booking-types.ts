// ============================================================================
// Booking Lifecycle TypeScript Types
// ============================================================================

export const BOOKING_LIFECYCLE_STATUSES = [
  'draft',
  'slot_held',
  'intake_submitted',
  'qualified',
  'quote_sent',
  'quote_accepted',
  'contract_sent',
  'contract_signed',
  'deposit_pending',
  'confirmed',
  'reschedule_requested',
  'rescheduled',
  'completed',
  'cancelled',
] as const;

export type BookingLifecycleStatus = (typeof BOOKING_LIFECYCLE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Client Profiles
// ---------------------------------------------------------------------------
export interface StudioClientProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------
export type ResourceType = 'staff' | 'room' | 'equipment';

export interface StudioResource {
  id: string;
  name: string;
  type: ResourceType;
  description: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudioResourceSchedule {
  id: string;
  resource_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string; // HH:mm:ss
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudioBlackoutPeriod {
  id: string;
  resource_id: string | null;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Packages & Add-ons
// ---------------------------------------------------------------------------
export interface StudioPackage {
  id: string;
  service_id: string | null;
  name: string;
  description: string | null;
  base_price_tzs: number;
  duration_minutes: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StudioAddOn {
  id: string;
  name: string;
  description: string | null;
  price_tzs: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Slot Holds
// ---------------------------------------------------------------------------
export interface StudioSlotHold {
  id: string;
  booking_id: string | null;
  hold_token: string;
  date: string;
  time_slot: string;
  resource_id: string | null;
  held_by_email: string | null;
  held_by_session: string | null;
  expires_at: string;
  released_at: string | null;
  is_active: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------
export interface StudioQuote {
  id: string;
  booking_id: string;
  quote_number: string;
  subtotal_tzs: number;
  discount_tzs: number;
  discount_reason: string | null;
  tax_tzs: number;
  total_tzs: number;
  deposit_percent: number;
  deposit_amount_tzs: number;
  notes: string | null;
  valid_until: string;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  expired_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  line_items?: StudioQuoteLineItem[];
}

export type QuoteLineItemType = 'package' | 'add_on' | 'custom';

export interface StudioQuoteLineItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price_tzs: number;
  total_tzs: number;
  item_type: QuoteLineItemType;
  package_id: string | null;
  add_on_id: string | null;
  sort_order: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------
export interface StudioContract {
  id: string;
  booking_id: string;
  quote_id: string | null;
  contract_number: string;
  content_html: string;
  sent_at: string | null;
  sign_deadline: string | null;
  signed_at: string | null;
  voided_at: string | null;
  voided_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  signatures?: StudioSignature[];
}

export type SignatureType = 'draw' | 'type';

export interface StudioSignature {
  id: string;
  contract_id: string;
  signer_name: string;
  signer_email: string;
  signature_data: string;
  signature_type: SignatureType;
  ip_address: string | null;
  user_agent: string | null;
  signed_at: string;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export type PaymentType = 'deposit' | 'balance' | 'reschedule_fee' | 'refund';
export type PaymentProvider = 'flutterwave' | 'manual';
export type PaymentIntentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface StudioPaymentIntent {
  id: string;
  booking_id: string;
  payment_type: PaymentType;
  amount_tzs: number;
  currency: string;
  provider: PaymentProvider;
  provider_reference: string | null;
  provider_tx_ref: string | null;
  status: PaymentIntentStatus;
  redirect_url: string | null;
  payment_link: string | null;
  initiated_at: string;
  completed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StudioPayment {
  id: string;
  booking_id: string;
  payment_intent_id: string | null;
  payment_type: PaymentType;
  amount_tzs: number;
  currency: string;
  provider: PaymentProvider;
  provider_reference: string | null;
  provider_transaction_id: string | null;
  receipt_url: string | null;
  paid_at: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Booking Events (Audit Trail)
// ---------------------------------------------------------------------------
export interface StudioBookingEvent {
  id: string;
  booking_id: string;
  event_type: string;
  from_status: BookingLifecycleStatus | null;
  to_status: BookingLifecycleStatus | null;
  actor: string; // 'system', 'client:<email>', 'admin:<clerk_id>'
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Extended Booking (with lifecycle columns)
// ---------------------------------------------------------------------------
export interface StudioBookingLifecycle {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_type: string;
  preferred_date: string | null;
  location: string | null;
  service: string | null;
  message: string | null;
  status: string; // legacy status
  admin_notes: string | null;
  responded_at: string | null;
  // Lifecycle columns
  lifecycle_status: BookingLifecycleStatus;
  client_id: string | null;
  package_id: string | null;
  assigned_resource_id: string | null;
  event_date: string | null;
  event_time_slot: string | null;
  event_end_date: string | null;
  guest_count: number | null;
  total_amount_tzs: number;
  deposit_amount_tzs: number;
  balance_due_tzs: number;
  balance_due_date: string | null;
  currency: string;
  reschedule_count: number;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  admin_override_by: string | null;
  admin_override_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Booking with all relations (for admin detail view)
// ---------------------------------------------------------------------------
export interface BookingWithRelations extends StudioBookingLifecycle {
  client: StudioClientProfile | null;
  package: StudioPackage | null;
  resource: StudioResource | null;
  quotes: StudioQuote[];
  contracts: StudioContract[];
  payments: StudioPayment[];
  events: StudioBookingEvent[];
}

// ---------------------------------------------------------------------------
// Intake submission data
// ---------------------------------------------------------------------------
export interface BookingIntakeData {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  event_type: string;
  preferred_date?: string;
  event_date?: string;
  event_time_slot?: string;
  location?: string;
  service?: string;
  package_id?: string;
  guest_count?: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Quote builder input
// ---------------------------------------------------------------------------
export interface QuoteLineItemInput {
  description: string;
  quantity: number;
  unit_price_tzs: number;
  item_type: QuoteLineItemType;
  package_id?: string;
  add_on_id?: string;
}

export interface CreateQuoteInput {
  line_items: QuoteLineItemInput[];
  discount_tzs?: number;
  discount_reason?: string;
  tax_tzs?: number;
  deposit_percent?: number;
  notes?: string;
  valid_hours?: number; // defaults to 72
}

// ---------------------------------------------------------------------------
// Shared Constants
// ---------------------------------------------------------------------------

export const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Send Off',
  'Kitchen Party',
  'Corporate Event',
  'Portrait Session',
  'Fashion Shoot',
  'Product Photography',
  'Other',
] as const;

export const BOOKING_SOURCES = [
  'Phone Call',
  'Walk-In',
  'WhatsApp',
  'Referral',
  'Other',
] as const;

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------
export function formatTZS(amount: number): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
