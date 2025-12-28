"use client";

import { useState } from "react";
import { Calendar, Users, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VendorCalendar } from "./VendorCalendar";
import type { Vendor } from "@/lib/supabase/vendors";

interface VendorInquiryFormProps {
  vendor: Vendor;
  onClose?: () => void;
}

export function VendorInquiryForm({ vendor, onClose }: VendorInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    guestCount: "",
    budget: "",
    message: "",
  });
  const [selectedDates, setSelectedDates] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>({ checkIn: null, checkOut: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement inquiry submission to Supabase
    try {
      // await submitInquiry({ ...formData, vendorId: vendor.id, dates: selectedDates });
      console.log("Inquiry submitted:", { ...formData, dates: selectedDates });
      // Show success message
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="border-border mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="border-border mt-1"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="border-border mt-1"
        />
      </div>

      <div>
        <Label>Event Dates</Label>
        <div className="mt-2">
          <VendorCalendar
            selectedDates={selectedDates}
            onDateSelect={setSelectedDates}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="eventType">Event Type</Label>
        <Select
          value={formData.eventType}
          onValueChange={(value) => setFormData({ ...formData, eventType: value })}
        >
          <SelectTrigger id="eventType" className="border-border mt-1">
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wedding">Wedding</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="anniversary">Anniversary</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="guestCount">Guest Count</Label>
        <Input
          id="guestCount"
          type="number"
          min="1"
          value={formData.guestCount}
          onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
          className="border-border mt-1"
        />
      </div>

      <div>
        <Label htmlFor="budget">Budget Range</Label>
        <Select
          value={formData.budget}
          onValueChange={(value) => setFormData({ ...formData, budget: value })}
        >
          <SelectTrigger id="budget" className="border-border mt-1">
            <SelectValue placeholder="Select budget range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="$">$ - Budget-friendly</SelectItem>
            <SelectItem value="$$">$$ - Moderate</SelectItem>
            <SelectItem value="$$$">$$$ - Premium</SelectItem>
            <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={5}
          className="border-border mt-1"
          placeholder="Tell the vendor about your event..."
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-background"
      >
        {isSubmitting ? "Sending..." : "Send Inquiry"}
        <Send className="w-4 h-4 ml-2" />
      </Button>

      <p className="text-xs text-secondary text-center">
        You won't be charged yet. This is just an inquiry.
      </p>
    </form>
  );
}

