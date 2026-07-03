// Pure stage/status labeling for the vendor Leads and Bookings pipelines.
// Kept free of RN/Supabase imports so it can be unit-tested under plain Node.

import type { BookingStage, InquiryStatus } from '@/types/vendor';

export interface PipelineFilterOption<T extends string> {
  key: T | 'all';
  label: string;
}

export const LEAD_FILTERS: PipelineFilterOption<InquiryStatus>[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Prospects' },
  { key: 'responded', label: 'Inquiries' },
  { key: 'accepted', label: 'Booked' },
  { key: 'declined', label: 'Declined' },
  { key: 'closed', label: 'Closed' },
];

export const BOOKING_FILTERS: PipelineFilterOption<BookingStage>[] = [
  { key: 'all', label: 'All' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export interface StatusPillStyle {
  bg: string;
  fg: string;
  label: string;
}

const LEAD_STATUS_STYLE: Record<InquiryStatus, StatusPillStyle> = {
  pending: { bg: '#FFF4E0', fg: '#B4740E', label: 'New' },
  responded: { bg: '#E5CFF0', fg: '#5B2D8E', label: 'Responded' },
  accepted: { bg: '#e8f5e9', fg: '#16a34a', label: 'Accepted' },
  declined: { bg: '#FCE8E6', fg: '#B3261E', label: 'Declined' },
  closed: { bg: '#EFEFEF', fg: '#6B5A7A', label: 'Closed' },
};

export function leadStatusStyle(status: InquiryStatus): StatusPillStyle {
  return LEAD_STATUS_STYLE[status];
}

const BOOKING_STAGE_STYLE: Record<BookingStage, StatusPillStyle> = {
  quoted: { bg: '#FFF4E0', fg: '#B4740E', label: 'Quoted' },
  reserved: { bg: '#E5CFF0', fg: '#5B2D8E', label: 'Reserved' },
  confirmed: { bg: '#e8f5e9', fg: '#16a34a', label: 'Confirmed' },
  completed: { bg: '#EFEFEF', fg: '#6B5A7A', label: 'Completed' },
  cancelled: { bg: '#FCE8E6', fg: '#B3261E', label: 'Cancelled' },
};

export function bookingStageStyle(stage: BookingStage): StatusPillStyle {
  return BOOKING_STAGE_STYLE[stage];
}

const BOOKING_STAGE_ORDER: BookingStage[] = ['quoted', 'reserved', 'confirmed', 'completed'];

/** The next forward stage in the pipeline, or null at the end / once cancelled. */
export function nextBookingStage(stage: BookingStage): BookingStage | null {
  const index = BOOKING_STAGE_ORDER.indexOf(stage);
  if (index === -1 || index === BOOKING_STAGE_ORDER.length - 1) return null;
  return BOOKING_STAGE_ORDER[index + 1];
}
