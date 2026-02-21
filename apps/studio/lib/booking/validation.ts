import { BookingFormValues, BookingLeadPayload } from "@/lib/booking/types";

type BookingErrors = Partial<Record<keyof BookingLeadPayload | "website", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d+\-()\s]{7,20}$/;

function isValidFutureDate(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export function validateBookingForm(values: BookingFormValues): BookingErrors {
  const errors: BookingErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";

  if (!values.phone.trim()) errors.phone = "Phone or WhatsApp is required.";
  else if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = "Enter a valid phone number.";

  if (!values.eventType.trim()) errors.eventType = "Please select an event type.";
  if (!values.eventDate.trim()) errors.eventDate = "Event date is required.";
  else if (!isValidFutureDate(values.eventDate)) errors.eventDate = "Event date must be today or later.";

  if (!values.location.trim()) errors.location = "Event location is required.";
  if (!values.estimatedBudget.trim()) errors.estimatedBudget = "Estimated budget is required.";
  if (!values.message.trim()) errors.message = "Please tell us a bit more about your event.";
  if (values.message.trim().length < 20) errors.message = "Please provide at least 20 characters.";

  if (values.website.trim()) errors.website = "Spam check failed.";

  return errors;
}

export function toBookingPayload(values: BookingFormValues): BookingLeadPayload {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    eventType: values.eventType.trim(),
    eventDate: values.eventDate,
    location: values.location.trim(),
    estimatedBudget: values.estimatedBudget.trim(),
    message: values.message.trim(),
    source: values.source.trim() || "studio-homepage",
  };
}
