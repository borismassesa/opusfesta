'use client';

import { FormEvent, useMemo, useState } from "react";
import {
  BOOKING_DEFAULT_VALUES,
  BookingFormValues,
  BookingLeadApiResponse,
  EVENT_TYPE_OPTIONS,
} from "@/lib/booking/types";
import { toBookingPayload, validateBookingForm } from "@/lib/booking/validation";

type BookingFormProps = {
  source: string;
  presetEventType?: string;
  onSuccess: () => void;
};

type SubmissionState = "idle" | "loading" | "success" | "error";

export default function BookingForm({ source, presetEventType, onSuccess }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormValues>({
    ...BOOKING_DEFAULT_VALUES,
    source,
    eventType: presetEventType ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormValues, string>>>({});
  const [submitState, setSubmitState] = useState<SubmissionState>("idle");
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const updateField = (field: keyof BookingFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateBookingForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitState("error");
      setSubmitMessage("Please fix the highlighted fields.");
      return;
    }

    setSubmitState("loading");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/studio/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...toBookingPayload(values),
          website: values.website,
        }),
      });
      const data = (await response.json()) as BookingLeadApiResponse;

      if (!response.ok || !data.ok) {
        if (!data.ok && data.fieldErrors) {
          setErrors((prev) => ({ ...prev, ...data.fieldErrors }));
        }
        setSubmitState("error");
        setSubmitMessage(data.ok ? "Unable to submit right now." : data.error);
        return;
      }

      setSubmitState("success");
      setSubmitMessage(data.message);
      onSuccess();
      setValues({
        ...BOOKING_DEFAULT_VALUES,
        source,
        eventType: presetEventType ?? "",
      });
    } catch {
      setSubmitState("error");
      setSubmitMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Full Name"
          value={values.fullName}
          error={errors.fullName}
          onChange={(value) => updateField("fullName", value)}
          placeholder="Your full name"
        />
        <FormField
          label="Email"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(value) => updateField("email", value)}
          placeholder="you@example.com"
        />
        <FormField
          label="Phone / WhatsApp"
          value={values.phone}
          error={errors.phone}
          onChange={(value) => updateField("phone", value)}
          placeholder="+255 ..."
        />
        <label className="space-y-2 block">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-brand-dark">
            Event Type
          </span>
          <select
            value={values.eventType}
            onChange={(e) => updateField("eventType", e.target.value)}
            className="w-full px-4 py-3 border-4 border-brand-border bg-brand-bg text-brand-dark text-xs font-bold uppercase tracking-widest focus-visible:outline-2 focus-visible:outline-brand-accent focus-visible:outline-offset-2"
          >
            <option value="">Select Event Type</option>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.eventType ? <p className="text-[11px] text-red-700 font-mono">{errors.eventType}</p> : null}
        </label>
        <FormField
          label="Event Date"
          type="date"
          min={minDate}
          value={values.eventDate}
          error={errors.eventDate}
          onChange={(value) => updateField("eventDate", value)}
        />
        <FormField
          label="Location"
          value={values.location}
          error={errors.location}
          onChange={(value) => updateField("location", value)}
          placeholder="City / Venue"
        />
      </div>

      <FormField
        label="Estimated Budget"
        value={values.estimatedBudget}
        error={errors.estimatedBudget}
        onChange={(value) => updateField("estimatedBudget", value)}
        placeholder="e.g. TZS 5,000,000"
      />

      <label className="space-y-2 block">
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-brand-dark">
          Message
        </span>
        <textarea
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          rows={4}
          placeholder="Tell us about your event, priorities, and timelines..."
          className="w-full px-4 py-3 border-4 border-brand-border bg-brand-bg text-brand-dark text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-brand-accent focus-visible:outline-offset-2"
        />
        {errors.message ? <p className="text-[11px] text-red-700 font-mono">{errors.message}</p> : null}
      </label>

      <input
        tabIndex={-1}
        autoComplete="off"
        type="text"
        value={values.website}
        onChange={(e) => updateField("website", e.target.value)}
        className="hidden"
        aria-hidden
      />

      {submitMessage ? (
        <p
          className={`text-xs font-mono tracking-wide ${
            submitState === "success" ? "text-brand-accent" : "text-red-700"
          }`}
        >
          {submitMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitState === "loading"}
        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-dark shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
      >
        {submitState === "loading" ? "Submitting..." : "Send Booking Enquiry"}
      </button>
    </form>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "date";
  min?: string;
};

function FormField({ label, value, error, onChange, placeholder, type = "text", min }: FormFieldProps) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-brand-dark">{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-4 border-brand-border bg-brand-bg text-brand-dark text-sm focus-visible:outline-2 focus-visible:outline-brand-accent focus-visible:outline-offset-2"
      />
      {error ? <p className="text-[11px] text-red-700 font-mono">{error}</p> : null}
    </label>
  );
}
