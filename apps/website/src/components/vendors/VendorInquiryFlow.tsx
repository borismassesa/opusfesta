"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfDay, isBefore, addDays } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import type { Vendor } from "@/lib/supabase/vendors";
import { cn } from "@/lib/utils";

interface VendorInquiryFlowProps {
  vendor: Vendor;
  onSuccess?: (inquiryId: string) => void;
}

type InquiryStep = 'date' | 'details' | 'review' | 'success';

export function VendorInquiryFlow({ vendor, onSuccess }: VendorInquiryFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<InquiryStep>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  
  // Guest count
  const [guestCount, setGuestCount] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    budget: '',
    message: '',
  });

  const today = useMemo(() => startOfDay(new Date()), []);

  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        const response = await fetch(
          `/api/vendors/${vendor.id}/availability?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const unavailable = (data.unavailableDates || []).map((dateStr: string) => new Date(dateStr));
          setUnavailableDates(unavailable);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [vendor.id]);

  const isDateDisabled = (date: Date): boolean => {
    return isBefore(startOfDay(date), today) || 
           unavailableDates.some(unavailable => 
             format(startOfDay(unavailable), 'yyyy-MM-dd') === format(startOfDay(date), 'yyyy-MM-dd')
           );
  };

  const canProceedToDetails = selectedDate !== undefined;
  const canProceedToReview = canProceedToDetails && 
    formData.name.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.eventType !== '';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (session) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const inquiryData = {
        vendorId: vendor.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        eventType: formData.eventType,
        eventDate: selectedDate ? selectedDate.toISOString() : undefined,
        guestCount: guestCount || undefined,
        budget: formData.budget || undefined,
        location: vendor.location?.city ? `${vendor.location.city}, ${vendor.location.country || "Tanzania"}` : undefined,
        message: formData.message || `I'm interested in booking ${vendor.business_name} for my ${formData.eventType} event.`,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers,
        body: JSON.stringify(inquiryData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setCurrentStep('success');
      onSuccess?.(data.inquiry.id);
    } catch (err: any) {
      console.error("Error submitting inquiry:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Date Selection
  const renderDateStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Select your event date</h3>
        <p className="text-sm text-muted-foreground">
          Choose a date for your {formData.eventType || 'event'}
        </p>
      </div>

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-auto py-4 px-4",
            !selectedDate && "text-muted-foreground"
          )}
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            <span className="font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          ) : (
            <span>Select a date</span>
          )}
        </Button>
        
        {isCalendarOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-lg shadow-xl p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setIsCalendarOpen(false);
              }}
              disabled={isDateDisabled}
              initialFocus
            />
          </div>
        )}
      </div>

      {isLoadingAvailability && (
        <p className="text-sm text-muted-foreground">Loading availability...</p>
      )}

      {unavailableDates.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <Clock className="w-3 h-3 inline mr-1" />
          Some dates may be unavailable
        </div>
      )}

      <div className="pt-4 border-t">
        <Button
          onClick={() => setCurrentStep('details')}
          disabled={!canProceedToDetails}
          className="w-full"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Step 2: Details
  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Tell us about your event</h3>
        <p className="text-sm text-muted-foreground">
          Help us understand your needs better
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-sm font-semibold">
            Your name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
            className="mt-1.5"
            required
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm font-semibold">
            Email address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            className="mt-1.5"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm font-semibold">
            Phone number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+255 XXX XXX XXX"
            className="mt-1.5"
          />
        </div>

        {/* Event Type */}
        <div>
          <Label htmlFor="eventType" className="text-sm font-semibold">
            Event type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.eventType}
            onValueChange={(value) => setFormData({ ...formData, eventType: value })}
          >
            <SelectTrigger id="eventType" className="mt-1.5">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Guest Count */}
        <div>
          <Label htmlFor="guests" className="text-sm font-semibold">
            Number of guests
          </Label>
          <div className="mt-1.5 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              disabled={guestCount <= 1}
            >
              -
            </Button>
            <Input
              id="guests"
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center w-20"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setGuestCount(guestCount + 1)}
            >
              +
            </Button>
          </div>
        </div>

        {/* Budget */}
        <div>
          <Label htmlFor="budget" className="text-sm font-semibold">
            Budget range
          </Label>
          <Select
            value={formData.budget}
            onValueChange={(value) => setFormData({ ...formData, budget: value })}
          >
            <SelectTrigger id="budget" className="mt-1.5">
              <SelectValue placeholder="Select budget range (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500000">Under 500,000 TZS</SelectItem>
              <SelectItem value="1000000">500,000 - 1,000,000 TZS</SelectItem>
              <SelectItem value="2000000">1,000,000 - 2,000,000 TZS</SelectItem>
              <SelectItem value="3000000">2,000,000 - 3,000,000 TZS</SelectItem>
              <SelectItem value="5000000">3,000,000 - 5,000,000 TZS</SelectItem>
              <SelectItem value="5000000+">5,000,000+ TZS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message" className="text-sm font-semibold">
            Additional details (optional)
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell the vendor about your event, special requirements, or questions..."
            className="mt-1.5 min-h-[100px]"
            rows={4}
          />
        </div>
      </div>

      <div className="pt-4 border-t flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep('date')}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep('review')}
          disabled={!canProceedToReview}
          className="flex-1"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Step 3: Review
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Review your inquiry</h3>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-4">
        {/* Event Date */}
        {selectedDate && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Event Date</span>
            </div>
            <p className="text-sm">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
          </div>
        )}

        {/* Personal Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Your Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{formData.email}</span>
            </div>
            {formData.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{formData.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3">Event Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event Type:</span>
              <span className="font-medium capitalize">{formData.eventType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests:</span>
              <span className="font-medium">{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</span>
            </div>
            {formData.budget && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-medium">
                  {formData.budget === '500000+' ? '5,000,000+ TZS' : `${parseInt(formData.budget).toLocaleString()} TZS`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {formData.message && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Your Message</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.message}</p>
          </div>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              You won't be charged yet
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              This is just an inquiry. The vendor will respond with a quote, and you can decide whether to proceed.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">Error</p>
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep('details')}
          disabled={isSubmitting}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Sending...
            </>
          ) : (
            <>
              Send Inquiry
              <Sparkles className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Step 4: Success
  const renderSuccessStep = () => (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-2">Inquiry sent successfully!</h3>
        <p className="text-sm text-muted-foreground">
          {vendor.business_name} will review your inquiry and get back to you soon.
        </p>
      </div>
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          You'll receive a confirmation email at <strong>{formData.email}</strong>
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "flex-1 h-1 rounded-full transition-colors",
            currentStep === 'date' ? "bg-primary" : "bg-primary/30"
          )} />
          <div className={cn(
            "flex-1 h-1 rounded-full transition-colors mx-2",
            currentStep === 'details' || currentStep === 'review' || currentStep === 'success' ? "bg-primary" : "bg-primary/30"
          )} />
          <div className={cn(
            "flex-1 h-1 rounded-full transition-colors",
            currentStep === 'review' || currentStep === 'success' ? "bg-primary" : "bg-primary/30"
          )} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={currentStep === 'date' ? "font-semibold text-foreground" : ""}>Date</span>
          <span className={currentStep === 'details' ? "font-semibold text-foreground" : ""}>Details</span>
          <span className={currentStep === 'review' || currentStep === 'success' ? "font-semibold text-foreground" : ""}>Review</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'date' && renderDateStep()}
      {currentStep === 'details' && renderDetailsStep()}
      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'success' && renderSuccessStep()}
    </div>
  );
}
