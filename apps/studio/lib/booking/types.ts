export const EVENT_TYPE_OPTIONS = [
  "Wedding",
  "Engagement",
  "Corporate Event",
  "Birthday",
  "Commercial Shoot",
  "Music Video",
  "Other",
] as const;

export type EventTypeOption = (typeof EVENT_TYPE_OPTIONS)[number];

export interface BookingFormValues {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  estimatedBudget: string;
  message: string;
  website: string;
  source: string;
}

export interface BookingLeadPayload {
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  estimatedBudget: string;
  message: string;
  source: string;
}

export interface BookingLeadRecord extends BookingLeadPayload {
  id: string;
  createdAt: string;
  ipHash: string;
  userAgent: string;
}

export interface BookingLeadSuccessResponse {
  ok: true;
  leadId: string;
  message: string;
}

export interface BookingLeadErrorResponse {
  ok: false;
  error: string;
  fieldErrors?: Partial<Record<keyof BookingLeadPayload, string>>;
}

export type BookingLeadApiResponse =
  | BookingLeadSuccessResponse
  | BookingLeadErrorResponse;

export const BOOKING_DEFAULT_VALUES: BookingFormValues = {
  fullName: "",
  email: "",
  phone: "",
  eventType: "",
  eventDate: "",
  location: "",
  estimatedBudget: "",
  message: "",
  website: "",
  source: "studio-homepage",
};
