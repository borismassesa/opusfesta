"use client";

import { useState } from "react";
import { Calendar, Users, Sparkles, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VendorInquiryForm } from "./VendorInquiryForm";
import type { Vendor } from "@/lib/supabase/vendors";

interface VendorBookingWidgetProps {
  vendor: Vendor;
}

export function VendorBookingWidget({ vendor }: VendorBookingWidgetProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const priceRange = vendor.price_range || "$$";
  const isRareFind = (vendor.stats.saveCount || 0) > 50; // Highly saved = rare find

  const handleRequestQuote = () => {
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="border border-border rounded-2xl bg-background shadow-sm p-6">
        {/* Rare Find Banner */}
        {isRareFind && (
          <div className="flex items-center gap-2 mb-4 p-2.5 bg-surface rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-xs font-semibold text-secondary">
              Rare find! This vendor is usually booked
            </span>
          </div>
        )}

        {/* Price Display */}
        <div className="mb-4">
          <div className="text-2xl font-semibold mb-0.5">
            {priceRange === "$" && "Starting at $200"}
            {priceRange === "$$" && "Starting at $500"}
            {priceRange === "$$$" && "Starting at $1,000"}
            {priceRange === "$$$$" && "Starting at $2,500"}
          </div>
          <div className="text-sm text-secondary">per event</div>
        </div>

        {/* Date Selection */}
        <div className="space-y-3 mb-4">
          <div>
            <Label htmlFor="checkin" className="text-[10px] font-semibold uppercase text-secondary mb-1 block">
              CHECK-IN
            </Label>
            <Input
              id="checkin"
              type="text"
              value={checkIn || ""}
              onChange={(e) => setCheckIn(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              className="border-border text-sm"
              placeholder="yyyy-mm-dd"
            />
          </div>

          <div>
            <Label htmlFor="checkout" className="text-[10px] font-semibold uppercase text-secondary mb-1 block">
              CHECKOUT
            </Label>
            <Input
              id="checkout"
              type="text"
              value={checkOut || ""}
              onChange={(e) => setCheckOut(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              className="border-border text-sm"
              placeholder="yyyy-mm-dd"
              min={checkIn || undefined}
            />
          </div>

          <div>
            <Label htmlFor="guests" className="text-[10px] font-semibold uppercase text-secondary mb-1 block">
              GUESTS
            </Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger id="guests" className="border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "guest" : "guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Request Quote Button */}
        <Button
          onClick={handleRequestQuote}
          className="w-full bg-primary text-background font-semibold py-3 text-base hover:bg-primary/90"
        >
          Request Quote
        </Button>

        {/* Trust Message */}
        <p className="text-xs text-secondary text-center mt-3">
          You won't be charged yet
        </p>

        {/* Report Link */}
        <button className="w-full mt-3 text-xs text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1">
          <Flag className="w-3 h-3" />
          Report this listing
        </button>
      </div>

      {/* Inquiry Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a Quote from {vendor.business_name}</DialogTitle>
          </DialogHeader>
          <VendorInquiryForm vendor={vendor} onClose={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

