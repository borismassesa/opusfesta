"use client";

import { useState, useMemo } from "react";
import { Flag, Sparkles, Calendar as CalendarIcon, Tag, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfDay, isBefore, differenceInDays, isSameMonth } from "date-fns";
import Image from "next/image";
import type { Vendor } from "@/lib/supabase/vendors";

interface VendorBookingSidebarProps {
  vendor: Vendor;
  isSticky?: boolean;
  // Future: bookedDates will come from vendor's calendar/bookings
  bookedDates?: Date[];
}

export function VendorBookingSidebar({ vendor, isSticky = true, bookedDates = [] }: VendorBookingSidebarProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'payment' | 'method' | 'message' | 'review' | 'confirmation'>('payment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('full');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    postalCode: '',
    country: 'Tanzania'
  });
  const [mobilePhone, setMobilePhone] = useState('');
  const [message, setMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    budget: ''
  });
  const [isReviewCalendarOpen, setIsReviewCalendarOpen] = useState(false);
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  
  const totalGuests = adults + children;
  
  // Calculate nights if range is selected
  const nights = dateRange.from && dateRange.to
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Get today's date at start of day for comparison
  const today = useMemo(() => startOfDay(new Date()), []);

  // Convert booked dates to start of day for comparison
  const bookedDatesSet = useMemo(() => {
    return new Set(
      bookedDates.map(date => startOfDay(date).getTime())
    );
  }, [bookedDates]);

  // Check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    const dateStart = startOfDay(date);
    const dateTime = dateStart.getTime();
    
    // Disable past dates
    if (isBefore(dateStart, today)) {
      return true;
    }
    
    // Disable booked dates
    if (bookedDatesSet.has(dateTime)) {
      return true;
    }
    
    // If we have a start date selected, disable dates before it
    if (dateRange.from && isBefore(dateStart, dateRange.from)) {
      return true;
    }
    
    return false;
  };

  const priceRange = vendor.price_range || "$$";
  
  // Determine rare find tier based on stats
  const saveCount = vendor.stats.saveCount || 0;
  const rating = vendor.stats.averageRating || 0;
  const reviewCount = vendor.stats.reviewCount || 0;
  
  let rareFindTier: 'diamond' | 'gold' | 'silver' | 'bronze' | null = null;
  let rareFindMessage = '';
  
  if (saveCount > 100 || (rating >= 4.9 && reviewCount >= 50)) {
    rareFindTier = 'diamond';
    rareFindMessage = 'Rare find! This vendor is highly sought after';
  } else if (saveCount > 50 || (rating >= 4.8 && reviewCount >= 30)) {
    rareFindTier = 'gold';
    rareFindMessage = 'Rare find! This vendor is usually booked';
  } else if (saveCount > 25 || (rating >= 4.7 && reviewCount >= 20)) {
    rareFindTier = 'silver';
    rareFindMessage = 'Popular choice! This vendor is in high demand';
  } else if (saveCount > 10 || rating >= 4.6) {
    rareFindTier = 'bronze';
    rareFindMessage = 'Great find! This vendor is well-regarded';
  }
  
  const isRareFind = rareFindTier !== null;

  const getStartingPrice = () => {
    if (priceRange === "$") return "500,000";
    if (priceRange === "$$") return "1,500,000";
    if (priceRange === "$$$") return "3,000,000";
    if (priceRange === "$$$$") return "5,000,000";
    return "1,500,000";
  };

  // Calculate dynamic price based on selected dates
  const getCalculatedPrice = () => {
    const basePrice = parseFloat(getStartingPrice().replace(/,/g, ''));
    
    // If dates are selected, calculate price based on duration
    if (dateRange.from && dateRange.to && nights > 0) {
      // For multi-day events, you might want to apply different pricing logic
      // For now, we'll use a simple calculation: base price + (nights * daily rate)
      // You can adjust this logic based on your pricing model
      const dailyRate = basePrice * 0.3; // 30% of base price per additional day
      const totalPrice = basePrice + (dailyRate * (nights - 1));
      return Math.round(totalPrice).toLocaleString();
    }
    
    // If only start date is selected, show base price
    if (dateRange.from) {
      return getStartingPrice();
    }
    
    // No dates selected, show starting price
    return getStartingPrice();
  };

  // Calculate pricing information based on selected dates
  const getCurrentPrice = () => {
    if (dateRange.from && dateRange.to && nights > 0) {
      return parseFloat(getCalculatedPrice().replace(/,/g, ''));
    }
    return parseFloat(getStartingPrice().replace(/,/g, ''));
  };

  const currentPrice = getCurrentPrice();
  const basePrice = parseFloat(getStartingPrice().replace(/[^0-9.]/g, ''));
  const averagePrice = currentPrice * 1.15; // 15% higher average
  const savings = averagePrice - currentPrice;
  const savingsPercent = Math.round((savings / averagePrice) * 100);
  
  // Determine if there's a good deal (show if savings >= 5%)
  const hasGoodDeal = savingsPercent >= 5;

  // Validation logic for event planning
  const isEventDateValid = dateRange.from !== undefined;
  const isGuestCountValid = adults >= 1 && totalGuests > 0;
  const canRequestQuote = isEventDateValid && isGuestCountValid;
  
  const getValidationMessage = () => {
    if (!isEventDateValid && !isGuestCountValid) {
      return "Please select an event date and add guests to request a quote";
    }
    if (!isEventDateValid) {
      return "Please select an event date to request a quote";
    }
    if (!isGuestCountValid) {
      return "Please add at least 1 guest to request a quote";
    }
    return null;
  };

  const handleRequestQuote = () => {
    if (!canRequestQuote) {
      return; // Don't open form if validation fails
    }
    setIsFormOpen(true);
  };

  return (
    <>
      <div className={`${isSticky ? 'sticky' : 'relative'} top-36 space-y-4 relative overflow-visible`}>
        {/* Dynamic Information Card - Changes based on user experience */}
        {(hasGoodDeal || isRareFind) && (
          <div className="bg-background border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
            {/* Icon - Shows pricing tag if dates selected and good deal, otherwise shows rare find icon */}
            <div className="flex-shrink-0">
              {dateRange.from && dateRange.to && hasGoodDeal ? (
                <Tag className="w-5 h-5 text-green-600" />
              ) : isRareFind && rareFindTier ? (
                <>
                  {rareFindTier === 'diamond' && (
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.5 9L22 12L14.5 15L12 22L9.5 15L2 12L9.5 9L12 2Z" fill="url(#diamondGradient)" stroke="url(#diamondStroke)" strokeWidth="0.5"/>
                <path d="M12 2L9.5 9L2 12L9.5 15L12 22" fill="url(#diamondShine)" opacity="0.3"/>
                <defs>
                  <linearGradient id="diamondGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="diamondStroke" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#93C5FD" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                  <linearGradient id="diamondShine" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                    </svg>
                  )}
                  {rareFindTier === 'gold' && (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="url(#goldGradient)" stroke="url(#goldStroke)" strokeWidth="0.5"/>
                <path d="M12 2L9 8L2 9L7 14L6 21L12 18" fill="url(#goldShine)" opacity="0.4"/>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="goldStroke" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                  <linearGradient id="goldShine" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                    </svg>
                  )}
                  {rareFindTier === 'silver' && (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="url(#silverGradient)" stroke="url(#silverStroke)" strokeWidth="0.5"/>
                <path d="M12 2L9 8L2 9L7 14L6 21L12 18" fill="url(#silverShine)" opacity="0.5"/>
                <defs>
                  <linearGradient id="silverGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="50%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#6B7280" />
                  </linearGradient>
                  <linearGradient id="silverStroke" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#F3F4F6" />
                    <stop offset="100%" stopColor="#4B5563" />
                  </linearGradient>
                  <linearGradient id="silverShine" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                    </svg>
                  )}
                  {rareFindTier === 'bronze' && (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="url(#bronzeGradient)" stroke="url(#bronzeStroke)" strokeWidth="0.5"/>
                <path d="M12 2L9 8L2 9L7 14L6 21L12 18" fill="url(#bronzeShine)" opacity="0.3"/>
                <defs>
                  <linearGradient id="bronzeGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="50%" stopColor="#B45309" />
                    <stop offset="100%" stopColor="#92400E" />
                  </linearGradient>
                  <linearGradient id="bronzeStroke" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                  <linearGradient id="bronzeShine" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                    </svg>
                  )}
                </>
              ) : null}
            </div>
            
            {/* Content - Dynamic based on state */}
            <div className="flex-1">
              {/* Show pricing info if dates are selected and has good deal */}
              {dateRange.from && dateRange.to && hasGoodDeal ? (
                <>
                  <div className="text-sm font-semibold text-primary mb-1">
                    Great value! This vendor's pricing is {savingsPercent}% below the market average
                  </div>
                  {nights > 0 && (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm text-secondary line-through">
                        {Math.round(averagePrice).toLocaleString()} TZS
                      </span>
                      <span className="text-xl font-bold text-primary underline">
                        {Math.round(currentPrice).toLocaleString()} TZS
                      </span>
                      <span className="text-sm text-secondary">
                        for {nights} {nights === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  )}
                </>
              ) : isRareFind && rareFindTier ? (
                /* Show rare find message if no dates selected or not a good deal */
                <div className="text-sm font-semibold text-primary">
                  {rareFindMessage}
                </div>
              ) : hasGoodDeal ? (
                /* Show pricing prompt if good deal but no dates selected */
                <>
                  <div className="text-sm font-semibold text-primary mb-1">
                    Great value! This vendor's pricing is {savingsPercent}% below the market average
                  </div>
                  <div className="text-xs text-secondary">
                    Select your event dates to see exact pricing
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        <div className="bg-background border border-border rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-2xl font-bold underline">{getCalculatedPrice()} TZS</span>
              <span className="text-secondary">
                {dateRange.from && dateRange.to && nights > 0
                  ? ` for ${nights} ${nights === 1 ? 'day' : 'days'}`
                  : ' per event'}
              </span>
            </div>
          </div>

          <div className="border border-border rounded-lg relative" style={{ marginBottom: isCalendarOpen ? '400px' : '0' }}>
            {/* Check-in and Checkout Row */}
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-4 relative">
                <div className="text-[10px] font-bold uppercase tracking-tight text-secondary mb-2">
                  CHECK-IN
                </div>
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full text-left flex items-center justify-between hover:opacity-80 transition-opacity group"
                >
                  <span className={`text-base font-medium ${dateRange.from ? "text-primary" : "text-secondary"}`}>
                    {dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "Add date"}
                  </span>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${isCalendarOpen ? 'rotate-180' : ''} text-secondary group-hover:text-primary`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="p-4 relative">
                <div className="text-[10px] font-bold uppercase tracking-tight text-secondary mb-2">
                  CHECKOUT
                </div>
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full text-left flex items-center justify-between hover:opacity-80 transition-opacity group"
                >
                  <span className={`text-base font-medium ${dateRange.to ? "text-primary" : "text-secondary"}`}>
                    {dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "Add date"}
                  </span>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${isCalendarOpen ? 'rotate-180' : ''} text-secondary group-hover:text-primary`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Guests Row - Full Width */}
            <div className="p-4 border-t border-border">
              <div className="text-[10px] font-bold uppercase tracking-tight text-secondary mb-2">
                GUESTS
              </div>
              <button
                onClick={() => setIsGuestSelectorOpen(!isGuestSelectorOpen)}
                className="w-full text-left flex items-center justify-between hover:opacity-80 transition-opacity group"
              >
                <span className={`text-base font-medium ${totalGuests > 0 ? "text-primary" : "text-secondary"}`}>
                  {totalGuests > 0 
                    ? `${totalGuests} ${totalGuests === 1 ? "guest" : "guests"}`
                    : "Add guests"}
                </span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${isGuestSelectorOpen ? 'rotate-180' : ''} text-secondary group-hover:text-primary`}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Calendar Dropdown - Overlay that extends beyond card */}
            {isCalendarOpen && (
              <>
                {/* Backdrop - Only blocks clicks, allows page scroll */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCalendarOpen(false)}
                  style={{ 
                    pointerEvents: 'auto',
                  }}
                  onWheel={(e) => {
                    // Don't prevent default - allow page to scroll
                  }}
                />
                <div 
                  className="absolute -top-16 right-0 bg-background border border-border rounded-2xl shadow-xl z-50 w-[700px] flex flex-col" 
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                >
                  {/* Header Section - Simple Title */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-primary">Select Dates</h3>
                    </div>
                  </div>

                  <div 
                    className="p-6 overflow-y-auto flex-1" 
                    style={{ maxHeight: 'calc(100vh - 350px)' }}
                    onWheel={(e) => {
                      // Allow scrolling within calendar
                      e.stopPropagation();
                    }}
                  >
                    {/* Calendar with multiple months */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          // Handle range selection - ensure we only use the actual selected dates
                          if (!range) {
                            setDateRange({
                              from: undefined,
                              to: undefined,
                            });
                            return;
                          }

                          // Only process if we have a from date
                          if (range.from) {
                            const fromDate = startOfDay(range.from);
                            
                            // If we have both from and to, validate the range
                            if (range.to) {
                              const toDate = startOfDay(range.to);
                              const daysDiff = differenceInDays(toDate, fromDate);
                              
                              // Check if this is likely an accidental selection (same day number in different months)
                              // If the dates are in different months and have the same day number, treat as single date
                              const isSameDayNumber = fromDate.getDate() === toDate.getDate();
                              const isDifferentMonth = !isSameMonth(fromDate, toDate);
                              
                              // If it's the same day number in different months and exactly 28-31 days apart,
                              // it's likely an accidental auto-selection - treat as single date
                              if (isSameDayNumber && isDifferentMonth && daysDiff >= 28 && daysDiff <= 31) {
                                setDateRange({
                                  from: fromDate,
                                  to: undefined,
                                });
                                return;
                              }
                              
                              // Only set range if to date is after from date and not the same date
                              if (!isBefore(toDate, fromDate) && toDate.getTime() !== fromDate.getTime()) {
                                setDateRange({
                                  from: fromDate,
                                  to: toDate,
                                });
                              } else {
                                // If same date or invalid, set only from date
                                setDateRange({
                                  from: fromDate,
                                  to: undefined,
                                });
                              }
                            } else {
                              // Only from date selected - allow single date selection
                              setDateRange({
                                from: fromDate,
                                to: undefined,
                              });
                            }
                          } else {
                            // No from date - clear selection
                            setDateRange({
                              from: undefined,
                              to: undefined,
                            });
                          }
                        }}
                        disabled={isDateDisabled}
                        numberOfMonths={2}
                        className="w-full"
                        modifiers={{
                          booked: bookedDates,
                        }}
                        modifiersClassNames={{
                          booked: "bg-red-100 text-red-600 opacity-50 cursor-not-allowed",
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <button
                        onClick={() => {
                          setDateRange({ from: undefined, to: undefined });
                        }}
                        className="text-sm underline font-semibold hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!dateRange.from && !dateRange.to}
                      >
                        Clear dates
                      </button>
                      <button
                        onClick={() => setIsCalendarOpen(false)}
                        className="bg-primary text-background px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Guest Selector Dropdown */}
            {isGuestSelectorOpen && (
              <div className="p-4 space-y-4 border-t border-border">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Adults</div>
                    <div className="text-xs text-secondary">Age 13+</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className={`w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors ${
                        adults <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={adults}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setAdults(Math.max(1, value));
                      }}
                      className="w-12 text-center font-semibold border-none outline-none bg-transparent focus:ring-0 p-0"
                    />
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Children</div>
                    <div className="text-xs text-secondary">Ages 2–12</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className={`w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors ${
                        children <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={children}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setChildren(Math.max(0, value));
                      }}
                      className="w-12 text-center font-semibold border-none outline-none bg-transparent focus:ring-0 p-0"
                    />
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Infants</div>
                    <div className="text-xs text-secondary">Under 2</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      disabled={infants <= 0}
                      className={`w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors ${
                        infants <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={infants}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setInfants(Math.max(0, value));
                      }}
                      className="w-12 text-center font-semibold border-none outline-none bg-transparent focus:ring-0 p-0"
                    />
                    <button
                      onClick={() => setInfants(infants + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                        <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-secondary">
                    This vendor can accommodate up to 200 guests. Infants don't count toward the guest limit.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsGuestSelectorOpen(false)}
                    className="text-sm underline font-semibold hover:text-primary transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleRequestQuote}
            disabled={!canRequestQuote}
            className={`w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm ${
              canRequestQuote
                ? 'bg-primary hover:bg-primary/90 text-background'
                : 'bg-gray-100 hover:bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            {canRequestQuote ? 'Request Quote' : 'Select Date & Guests'}
          </Button>

          {canRequestQuote && (
          <p className="text-center text-sm text-secondary">
            You won't be charged yet
          </p>
          )}

          <div className="border-t border-border pt-4 mt-2 space-y-3">
            {isEventDateValid ? (
              <>
            <div className="flex justify-between text-secondary text-sm">
              <span className="underline">Starting price</span>
                  <span>{getCalculatedPrice()} TZS</span>
            </div>
            <div className="flex justify-between text-secondary text-sm">
              <span className="underline">Service fee</span>
              <span>Included</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-bold text-primary">
              <span>Total estimate</span>
                  <span>{getCalculatedPrice()} TZS</span>
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-secondary py-2">
                Select event date to see pricing
            </div>
            )}
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 text-secondary py-4 cursor-pointer hover:text-primary">
          <Flag className="w-4 h-4" />
          <span className="text-sm underline font-semibold">Report this listing</span>
        </div>
      </div>

      {/* Booking Confirmation Page */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 lg:pt-8 pb-2 sm:pb-4 lg:pb-6">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setBookingStep('payment');
                  setSelectedPayment('full');
                  setSelectedPaymentMethod('card');
                  setCardDetails({
                    number: '',
                    expiry: '',
                    cvv: '',
                    postalCode: '',
                    country: 'Tanzania'
                  });
                  setMobilePhone('');
                  setMessage('');
                  setReviewForm({
                    name: '',
                    email: '',
                    phone: '',
                    eventType: '',
                    budget: ''
                  });
                }}
                className="p-2 hover:bg-surface rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold">Request to book</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column - Booking Steps - Scrollable */}
              <div className="space-y-3 sm:space-y-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Step 1: Choose when to pay */}
                <div className={`rounded-xl sm:rounded-2xl transition-all ${
                  bookingStep === 'payment' 
                    ? 'bg-background shadow-sm p-4 sm:p-5 lg:p-6' 
                    : 'bg-surface p-4 sm:p-5 lg:p-6'
                }`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">1. Choose when to pay</h2>
                    {bookingStep !== 'payment' && (
                      <button
                        onClick={() => setBookingStep('payment')}
                        className="text-xs sm:text-sm font-medium text-secondary hover:text-foreground px-2 sm:px-3 py-1.5 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {bookingStep === 'payment' && (
                    <div className="space-y-2 sm:space-y-3">
                      <label 
                        onClick={() => setSelectedPayment('full')}
                        className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                          selectedPayment === 'full' 
                            ? 'bg-surface border border-primary' 
                            : 'bg-background border border-border hover:border-primary'
                        }`}
                      >
                        <div className="relative mt-0.5 flex-shrink-0">
                          <input
                            type="radio"
                            name="payment"
                            value="full"
                            checked={selectedPayment === 'full'}
                            onChange={() => setSelectedPayment('full')}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border-2 rounded-full bg-background flex items-center justify-center ${
                            selectedPayment === 'full' ? 'border-primary' : 'border-border'
                          }`}>
                            {selectedPayment === 'full' && (
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base text-foreground">Pay {getCalculatedPrice()} TZS now</div>
                        </div>
                      </label>
                      <label 
                        onClick={() => setSelectedPayment('partial')}
                        className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                          selectedPayment === 'partial' 
                            ? 'bg-surface border border-primary' 
                            : 'bg-background border border-border hover:border-primary'
                        }`}
                      >
                        <div className="relative mt-0.5 flex-shrink-0">
                          <input
                            type="radio"
                            name="payment"
                            value="partial"
                            checked={selectedPayment === 'partial'}
                            onChange={() => setSelectedPayment('partial')}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border-2 rounded-full bg-background flex items-center justify-center ${
                            selectedPayment === 'partial' ? 'border-primary' : 'border-border'
                          }`}>
                            {selectedPayment === 'partial' && (
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-1 text-foreground">Pay part now, part later</div>
                          <div className="text-sm text-secondary">
                            {Math.round(currentPrice * 0.5).toLocaleString()} TZS now, {Math.round(currentPrice * 0.5).toLocaleString()} TZS charged on {dateRange.from ? format(new Date(dateRange.from.getTime() - 7 * 24 * 60 * 60 * 1000), "MMM d, yyyy") : "event date"}. No extra fees.
                          </div>
                          <button className="text-sm underline mt-1 text-primary hover:text-primary/80">More info</button>
                        </div>
                      </label>
                      <label 
                        onClick={() => setSelectedPayment('installments')}
                        className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                          selectedPayment === 'installments' 
                            ? 'bg-surface border border-primary' 
                            : 'bg-background border border-border hover:border-primary'
                        }`}
                      >
                        <div className="relative mt-0.5 flex-shrink-0">
                          <input
                            type="radio"
                            name="payment"
                            value="installments"
                            checked={selectedPayment === 'installments'}
                            onChange={() => setSelectedPayment('installments')}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 border-2 rounded-full bg-background flex items-center justify-center ${
                            selectedPayment === 'installments' ? 'border-primary' : 'border-border'
                          }`}>
                            {selectedPayment === 'installments' && (
                              <div className="w-3 h-3 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base mb-1 text-foreground">Pay in installments</div>
                          <div className="text-sm text-secondary">
                            4 payments of {Math.round(currentPrice / 4).toLocaleString()} TZS every 2 weeks. Interest-free.
                          </div>
                          <button className="text-sm underline mt-1 text-primary hover:text-primary/80">More info</button>
                        </div>
                      </label>
                      <div className="flex justify-end mt-4 sm:mt-6">
                      <button
                        onClick={() => setBookingStep('method')}
                          className="bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors w-full sm:w-auto"
                      >
                        Next
                      </button>
                      </div>
                    </div>
                  )}
                  {bookingStep !== 'payment' && (
                    <div className="text-base font-medium text-foreground">
                      Pay {getCalculatedPrice()} TZS now
                    </div>
                  )}
                </div>

                {/* Step 2: Add payment method */}
                <div className={`rounded-xl sm:rounded-2xl transition-all ${
                  bookingStep === 'method'
                    ? 'bg-background shadow-sm border-2 border-primary p-4 sm:p-5 lg:p-6'
                    : 'bg-surface p-4 sm:p-5 lg:p-6'
                }`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">2. Add a payment method</h2>
                    {bookingStep !== 'method' && bookingStep !== 'payment' && (
                      <button
                        onClick={() => setBookingStep('method')}
                        className="text-xs sm:text-sm font-medium text-secondary hover:text-foreground px-2 sm:px-3 py-1.5 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                      >
                        Change
                      </button>
                    )}
                      </div>
                  {bookingStep === 'method' && (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Payment Method Options */}
                      <div className="space-y-2 sm:space-y-3">
                        <label 
                          onClick={() => setSelectedPaymentMethod('card')}
                          className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                            selectedPaymentMethod === 'card' 
                              ? 'bg-surface' 
                              : 'bg-background border border-border hover:border-primary'
                          }`}
                        >
                          <div className="relative mt-0.5 flex-shrink-0">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={selectedPaymentMethod === 'card'}
                              onChange={() => setSelectedPaymentMethod('card')}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded-full bg-background flex items-center justify-center ${
                              selectedPaymentMethod === 'card' ? 'border-primary' : 'border-border'
                            }`}>
                              {selectedPaymentMethod === 'card' && (
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                            <div className="flex-1">
                            <div className="font-semibold text-base mb-1 text-foreground">Credit or debit card</div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-surface text-foreground text-xs font-medium rounded-full">VISA</span>
                              <span className="px-2 py-0.5 bg-surface text-foreground text-xs font-medium rounded-full">Mastercard</span>
                              <span className="px-2 py-0.5 bg-surface text-foreground text-xs font-medium rounded-full">AMEX</span>
                            </div>
                          </div>
                        </label>

                        <label 
                          onClick={() => setSelectedPaymentMethod('mpesa')}
                          className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                            selectedPaymentMethod === 'mpesa' 
                              ? 'bg-surface' 
                              : 'bg-background border border-border hover:border-primary'
                          }`}
                        >
                          <div className="relative mt-0.5 flex-shrink-0">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="mpesa"
                              checked={selectedPaymentMethod === 'mpesa'}
                              onChange={() => setSelectedPaymentMethod('mpesa')}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded-full bg-background flex items-center justify-center ${
                              selectedPaymentMethod === 'mpesa' ? 'border-primary' : 'border-border'
                            }`}>
                              {selectedPaymentMethod === 'mpesa' && (
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <div className="text-base font-semibold text-green-600">M-Pesa</div>
                          </div>
                        </label>

                        <label 
                          onClick={() => setSelectedPaymentMethod('tigopesa')}
                          className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                            selectedPaymentMethod === 'tigopesa' 
                              ? 'bg-surface' 
                              : 'bg-background border border-border hover:border-primary'
                          }`}
                        >
                          <div className="relative mt-0.5 flex-shrink-0">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="tigopesa"
                              checked={selectedPaymentMethod === 'tigopesa'}
                              onChange={() => setSelectedPaymentMethod('tigopesa')}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded-full bg-background flex items-center justify-center ${
                              selectedPaymentMethod === 'tigopesa' ? 'border-primary' : 'border-border'
                            }`}>
                              {selectedPaymentMethod === 'tigopesa' && (
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <div className="text-base font-semibold text-blue-600">Tigo Pesa</div>
                          </div>
                        </label>

                        <label 
                          onClick={() => setSelectedPaymentMethod('airtelmoney')}
                          className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                            selectedPaymentMethod === 'airtelmoney' 
                              ? 'bg-surface' 
                              : 'bg-background border border-border hover:border-primary'
                          }`}
                        >
                          <div className="relative mt-0.5 flex-shrink-0">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="airtelmoney"
                              checked={selectedPaymentMethod === 'airtelmoney'}
                              onChange={() => setSelectedPaymentMethod('airtelmoney')}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded-full bg-background flex items-center justify-center ${
                              selectedPaymentMethod === 'airtelmoney' ? 'border-primary' : 'border-border'
                            }`}>
                              {selectedPaymentMethod === 'airtelmoney' && (
                                <div className="w-3 h-3 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <div className="text-base font-semibold text-red-600">Airtel Money</div>
                          </div>
                        </label>
                      </div>

                      {/* Card Details Form */}
                      {selectedPaymentMethod === 'card' && (
                        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Card number</label>
                            <div className="relative">
                            <Input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              value={cardDetails.number}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                                const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                setCardDetails({ ...cardDetails, number: formatted });
                              }}
                              maxLength={19}
                                className="w-full border-border bg-background focus:border-primary focus:ring-primary pl-9 sm:pl-10 text-sm sm:text-base"
                            />
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                          </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">Expiration</label>
                              <Input
                                type="text"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '');
                                  let formatted = value;
                                  if (value.length >= 2) {
                                    formatted = value.slice(0, 2) + '/' + value.slice(2, 4);
                                  }
                                  setCardDetails({ ...cardDetails, expiry: formatted });
                                }}
                                maxLength={5}
                                className="w-full border-border bg-background focus:border-primary focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                              <Input
                                type="text"
                                placeholder="123"
                                value={cardDetails.cvv}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                  setCardDetails({ ...cardDetails, cvv: value });
                                }}
                                maxLength={3}
                                className="w-full border-border bg-background focus:border-primary focus:ring-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Postal code</label>
                            <Input
                              type="text"
                              placeholder="Enter postal code"
                              value={cardDetails.postalCode}
                              onChange={(e) => setCardDetails({ ...cardDetails, postalCode: e.target.value })}
                              className="w-full border-border bg-background focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Country/region</label>
                            <select
                              value={cardDetails.country}
                              onChange={(e) => setCardDetails({ ...cardDetails, country: e.target.value })}
                              className="w-full border border-border bg-background rounded-md px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-primary focus:outline-none"
                            >
                              <option value="Tanzania">Tanzania</option>
                              <option value="Kenya">Kenya</option>
                              <option value="Uganda">Uganda</option>
                              <option value="Rwanda">Rwanda</option>
                              <option value="South Africa">South Africa</option>
                              <option value="Nigeria">Nigeria</option>
                              <option value="Ghana">Ghana</option>
                              <option value="Egypt">Egypt</option>
                              <option value="Morocco">Morocco</option>
                              <option value="United States">United States</option>
                              <option value="Canada">Canada</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Germany">Germany</option>
                              <option value="France">France</option>
                              <option value="Italy">Italy</option>
                              <option value="Spain">Spain</option>
                              <option value="Netherlands">Netherlands</option>
                              <option value="Belgium">Belgium</option>
                              <option value="Switzerland">Switzerland</option>
                              <option value="Austria">Austria</option>
                              <option value="Sweden">Sweden</option>
                              <option value="Norway">Norway</option>
                              <option value="Denmark">Denmark</option>
                              <option value="Finland">Finland</option>
                              <option value="Poland">Poland</option>
                              <option value="Portugal">Portugal</option>
                              <option value="Ireland">Ireland</option>
                              <option value="Australia">Australia</option>
                              <option value="New Zealand">New Zealand</option>
                              <option value="Japan">Japan</option>
                              <option value="South Korea">South Korea</option>
                              <option value="China">China</option>
                              <option value="India">India</option>
                              <option value="Singapore">Singapore</option>
                              <option value="Malaysia">Malaysia</option>
                              <option value="Thailand">Thailand</option>
                              <option value="Indonesia">Indonesia</option>
                              <option value="Philippines">Philippines</option>
                              <option value="United Arab Emirates">United Arab Emirates</option>
                              <option value="Saudi Arabia">Saudi Arabia</option>
                              <option value="Israel">Israel</option>
                              <option value="Turkey">Turkey</option>
                              <option value="Brazil">Brazil</option>
                              <option value="Mexico">Mexico</option>
                              <option value="Argentina">Argentina</option>
                              <option value="Chile">Chile</option>
                              <option value="Colombia">Colombia</option>
                              <option value="Peru">Peru</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Mobile Money Phone Number Input */}
                      {(selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'tigopesa' || selectedPaymentMethod === 'airtelmoney') && (
                        <div className="mt-4 sm:mt-6">
                          <label className="block text-sm font-medium text-foreground mb-2">
                            {selectedPaymentMethod === 'mpesa' && 'M-Pesa'}
                            {selectedPaymentMethod === 'tigopesa' && 'Tigo Pesa'}
                            {selectedPaymentMethod === 'airtelmoney' && 'Airtel Money'}
                            {' '}Phone Number
                          </label>
                          <Input
                            type="tel"
                            placeholder="0712 345 678"
                            value={mobilePhone}
                            onChange={(e) => {
                              // Remove all non-digits
                              let digits = e.target.value.replace(/\D/g, '');
                              // Limit to 10 digits
                              if (digits.length > 10) {
                                digits = digits.slice(0, 10);
                              }
                              // Format: 0XXX XXX XXX
                              let formatted = '';
                              if (digits.length > 0) {
                                formatted = digits[0]; // First digit (0)
                                if (digits.length > 1) {
                                  formatted += ' ' + digits.slice(1, 4); // Next 3 digits
                                  if (digits.length > 4) {
                                    formatted += ' ' + digits.slice(4, 7); // Next 3 digits
                                    if (digits.length > 7) {
                                      formatted += ' ' + digits.slice(7, 10); // Last 3 digits
                                    }
                                  }
                                }
                              }
                              setMobilePhone(formatted);
                            }}
                            maxLength={13}
                            className="w-full border-border bg-background focus:border-primary focus:ring-primary"
                          />
                          <p className="text-xs text-secondary mt-2">
                            You'll receive a payment prompt on your phone
                          </p>
                    </div>
                  )}

                      <div className="flex justify-end mt-4 sm:mt-6">
                        <button
                          onClick={() => {
                            if (selectedPaymentMethod === 'card') {
                              if (cardDetails.number && cardDetails.expiry && cardDetails.cvv) {
                                setBookingStep('message');
                              }
                            } else if (selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'tigopesa' || selectedPaymentMethod === 'airtelmoney') {
                              const phoneDigits = mobilePhone.replace(/\D/g, '');
                              if (phoneDigits.length === 10) {
                                setBookingStep('message');
                              }
                            } else {
                              setBookingStep('message');
                            }
                          }}
                          disabled={
                            (selectedPaymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) ||
                            ((selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'tigopesa' || selectedPaymentMethod === 'airtelmoney') && mobilePhone.replace(/\D/g, '').length !== 10)
                          }
                          className="bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                  {bookingStep !== 'method' && bookingStep !== 'payment' && (
                    <div className="text-base font-medium text-foreground">
                      {selectedPaymentMethod === 'card' && 'Credit or debit card'}
                      {selectedPaymentMethod === 'mpesa' && 'M-Pesa'}
                      {selectedPaymentMethod === 'tigopesa' && 'Tigo Pesa'}
                      {selectedPaymentMethod === 'airtelmoney' && 'Airtel Money'}
                    </div>
                  )}
                </div>

                {/* Step 3: Write a message to the host */}
                <div className={`rounded-xl sm:rounded-2xl transition-all ${
                  bookingStep === 'message'
                    ? 'bg-background shadow-sm p-4 sm:p-5 lg:p-6'
                    : 'bg-surface p-4 sm:p-5 lg:p-6'
                }`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">3. Write a message to the host</h2>
                    {bookingStep !== 'message' && bookingStep !== 'payment' && bookingStep !== 'method' && (
                        <button
                        onClick={() => setBookingStep('message')}
                        className="text-xs sm:text-sm font-medium text-secondary hover:text-foreground px-2 sm:px-3 py-1.5 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                        >
                        Change
                        </button>
                    )}
                        </div>
                  {bookingStep === 'message' && (
                    <div className="space-y-3 sm:space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell the host about your event and any special requests..."
                        className="w-full min-h-[100px] sm:min-h-[120px] border border-border bg-background rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground focus:border-primary focus:ring-primary focus:outline-none resize-none placeholder:text-secondary"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => setBookingStep('review')}
                          className="bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors w-full sm:w-auto"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: Review your request */}
                <div className={`rounded-xl sm:rounded-2xl transition-all ${
                  bookingStep === 'review'
                    ? 'bg-background shadow-sm p-4 sm:p-5 lg:p-6'
                    : 'bg-surface p-4 sm:p-5 lg:p-6'
                }`}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">4. Review your request</h2>
                    {bookingStep === 'confirmation' && (
                      <button
                        onClick={() => setBookingStep('review')}
                        className="text-xs sm:text-sm font-medium text-secondary hover:text-foreground px-2 sm:px-3 py-1.5 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {bookingStep === 'review' && (
                    <form className="space-y-4 sm:space-y-5" onSubmit={(e) => {
                      e.preventDefault();
                      // Validate required fields
                      if (reviewForm.name && reviewForm.email) {
                        setBookingStep('confirmation');
                      }
                    }}>
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                        <Input
                          type="text"
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          required
                          className="w-full border-border bg-background rounded-lg focus:border-primary focus:ring-primary text-sm sm:text-base"
                          placeholder="Enter your name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                        <Input
                          type="email"
                          value={reviewForm.email}
                          onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                          required
                          className="w-full border-border bg-background rounded-lg focus:border-primary focus:ring-primary text-sm sm:text-base"
                          placeholder="Enter your email"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                        <Input
                          type="tel"
                          value={reviewForm.phone}
                          onChange={(e) => setReviewForm({ ...reviewForm, phone: e.target.value })}
                          className="w-full border-border bg-background rounded-lg focus:border-primary focus:ring-primary text-sm sm:text-base"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      {/* Event Dates */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Event Dates</label>
                        <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsReviewCalendarOpen(!isReviewCalendarOpen)}
                            className="w-full border border-border rounded-lg px-4 py-3 text-left bg-background flex items-center justify-between hover:border-primary transition-colors"
                          >
                            <span className={dateRange.from && dateRange.to 
                              ? "text-foreground" 
                              : "text-secondary"}>
                              {dateRange.from && dateRange.to
                                ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
                                : dateRange.from
                                ? format(dateRange.from, "MMM d, yyyy")
                                : "Select dates"}
                            </span>
                            <CalendarIcon className="w-5 h-5 text-secondary" />
                        </button>
                          {isReviewCalendarOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setIsReviewCalendarOpen(false)}
                              />
                              <div 
                                className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-background border border-border rounded-lg shadow-xl z-50 p-3 sm:p-4 w-full sm:w-[600px] lg:w-[700px] max-w-[calc(100vw-2rem)]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Select Dates</h3>
                      </div>
                                <div className="hidden sm:block">
                                  <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) => {
                                      if (range?.from) {
                                        setDateRange({
                                          from: startOfDay(range.from),
                                          to: range.to ? startOfDay(range.to) : undefined
                                        });
                                      }
                                    }}
                                    disabled={isDateDisabled}
                                    numberOfMonths={2}
                                    className="w-full"
                                  />
                    </div>
                                <div className="block sm:hidden">
                                  <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) => {
                                      if (range?.from) {
                                        setDateRange({
                                          from: startOfDay(range.from),
                                          to: range.to ? startOfDay(range.to) : undefined
                                        });
                                      }
                                    }}
                                    disabled={isDateDisabled}
                                    numberOfMonths={1}
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex justify-end mt-3 sm:mt-4">
                                  <button
                                    type="button"
                                    onClick={() => setIsReviewCalendarOpen(false)}
                                    className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors w-full sm:w-auto"
                                  >
                                    Done
                        </button>
                      </div>
                    </div>
                            </>
                  )}
                </div>
              </div>

                      {/* Event Type */}
              <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Event Type</label>
                        <Select
                          value={reviewForm.eventType}
                          onValueChange={(value) => setReviewForm({ ...reviewForm, eventType: value })}
                        >
                          <SelectTrigger className="w-full border-border rounded-lg bg-background focus:border-primary focus:ring-primary">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wedding">Wedding</SelectItem>
                            <SelectItem value="engagement">Engagement</SelectItem>
                            <SelectItem value="anniversary">Anniversary</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="birthday">Birthday</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>

                      {/* Guest Count */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Guest Count</label>
                        <Input
                          type="number"
                          min="1"
                          value={totalGuests}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            setAdults(Math.max(1, value));
                            setChildren(0);
                          }}
                          className="w-full border-border rounded-lg bg-background focus:border-primary focus:ring-primary"
                          placeholder="Enter number of guests"
                        />
                      </div>

                      {/* Budget Range */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Budget Range</label>
                        <Select
                          value={reviewForm.budget}
                          onValueChange={(value) => setReviewForm({ ...reviewForm, budget: value })}
                        >
                          <SelectTrigger className="w-full border-border rounded-lg bg-background focus:border-primary focus:ring-primary">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="$">500,000 TZS - Budget-friendly</SelectItem>
                            <SelectItem value="$$">1,500,000 TZS - Moderate</SelectItem>
                            <SelectItem value="$$$">3,000,000 TZS - Premium</SelectItem>
                            <SelectItem value="$$$$">5,000,000 TZS - Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell the vendor about your event..."
                          className="w-full min-h-[100px] sm:min-h-[120px] border border-border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-background text-foreground focus:border-primary focus:ring-primary focus:outline-none resize-y placeholder:text-secondary"
                        />
                      </div>

                      {/* Send Inquiry Button */}
                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        Send Inquiry
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>

                      {/* Disclaimer */}
                      <p className="text-xs text-secondary text-center">
                        You won't be charged yet. This is just an inquiry.
                      </p>
                    </form>
                  )}
                </div>

                {/* Confirmation/Receipt Screen */}
                {bookingStep === 'confirmation' && (
                  <div className="rounded-xl sm:rounded-2xl bg-background shadow-sm p-4 sm:p-5 lg:p-6 mt-3 sm:mt-4">
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">Confirm Your Inquiry</h2>
                      <p className="text-xs sm:text-sm text-secondary">Please review your information before sending</p>
                    </div>

                    <div className="space-y-4 sm:space-y-6 border-b border-border pb-4 sm:pb-6 mb-4 sm:mb-6">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Personal Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-secondary">Name:</span>
                            <span className="font-medium text-foreground">{reviewForm.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Email:</span>
                            <span className="font-medium text-foreground">{reviewForm.email}</span>
                          </div>
                          {reviewForm.phone && (
                            <div className="flex justify-between">
                              <span className="text-secondary">Phone:</span>
                              <span className="font-medium text-foreground">{reviewForm.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Event Details</h3>
                        <div className="space-y-2 text-sm">
                          {reviewForm.eventType && (
                            <div className="flex justify-between">
                              <span className="text-secondary">Event Type:</span>
                              <span className="font-medium text-foreground">
                                {reviewForm.eventType === 'wedding' && 'Wedding'}
                                {reviewForm.eventType === 'engagement' && 'Engagement'}
                                {reviewForm.eventType === 'anniversary' && 'Anniversary'}
                                {reviewForm.eventType === 'corporate' && 'Corporate'}
                                {reviewForm.eventType === 'birthday' && 'Birthday'}
                                {reviewForm.eventType === 'other' && 'Other'}
                              </span>
                            </div>
                          )}
                          {reviewForm.budget && (
                            <div className="flex justify-between">
                              <span className="text-secondary">Budget Range:</span>
                              <span className="font-medium text-foreground">
                                {reviewForm.budget === '$' && '500,000 TZS - Budget-friendly'}
                                {reviewForm.budget === '$$' && '1,500,000 TZS - Moderate'}
                                {reviewForm.budget === '$$$' && '3,000,000 TZS - Premium'}
                                {reviewForm.budget === '$$$$' && '5,000,000 TZS - Luxury'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Payment Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-secondary">Payment Plan:</span>
                            <span className="font-medium text-foreground">
                              {selectedPayment === 'full' && `Pay ${getCalculatedPrice()} TZS now`}
                              {selectedPayment === 'partial' && 'Pay part now, part later'}
                              {selectedPayment === 'installments' && 'Pay in installments'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary">Payment Method:</span>
                            <span className="font-medium text-foreground">
                              {selectedPaymentMethod === 'card' && 'Credit or debit card'}
                              {selectedPaymentMethod === 'mpesa' && 'M-Pesa'}
                              {selectedPaymentMethod === 'tigopesa' && 'Tigo Pesa'}
                              {selectedPaymentMethod === 'airtelmoney' && 'Airtel Money'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {message && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">Your Message</h3>
                          <p className="text-sm text-foreground bg-surface rounded-lg p-4 border border-border">
                            {message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setBookingStep('review')}
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg font-semibold text-sm sm:text-base text-foreground hover:bg-surface transition-colors"
                      >
                        Back to Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsSubmitting(true);
                          try {
                            // TODO: Implement actual API call to submit inquiry
                            console.log('Submitting inquiry:', {
                              ...reviewForm,
                              message,
                              dates: dateRange,
                              guests: totalGuests,
                              payment: {
                                plan: selectedPayment,
                                method: selectedPaymentMethod,
                                cardDetails: selectedPaymentMethod === 'card' ? cardDetails : null,
                                mobilePhone: (selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'tigopesa' || selectedPaymentMethod === 'airtelmoney') ? mobilePhone : null
                              }
                            });
                            
                            // Simulate API call
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            
                            // Show success and close
                            setIsFormOpen(false);
                            setBookingStep('payment');
                            // Reset form
                            setReviewForm({
                              name: '',
                              email: '',
                              phone: '',
                              eventType: '',
                              budget: ''
                            });
                            setMessage('');
                          } catch (error) {
                            console.error('Error submitting inquiry:', error);
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        disabled={isSubmitting}
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Confirm & Send Inquiry
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-secondary text-center mt-4">
                      You won't be charged yet. This is just an inquiry.
                    </p>
                    </div>
                  )}
              </div>

              {/* Right Column - Booking Details */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <div className="space-y-4 sm:space-y-6">
                  {/* Vendor Card */}
                  <div className="border border-border rounded-xl sm:rounded-2xl overflow-hidden">
                    <div className="relative h-40 sm:h-48 bg-surface">
                      {vendor.cover_image ? (
                        <Image
                          src={vendor.cover_image}
                          alt={vendor.business_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface" />
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-base sm:text-lg mb-1">{vendor.business_name}</h3>
                      <div className="text-xs sm:text-sm text-secondary mb-2">
                        {vendor.category}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="border-b border-border pb-3 sm:pb-4">
                    <div className="font-semibold text-sm sm:text-base mb-1">Free cancellation</div>
                    <div className="text-xs sm:text-sm text-secondary">
                      Cancel before {dateRange.from ? format(dateRange.from, "MMM d") : "event date"} for a full refund.
                    </div>
                    <button className="text-xs sm:text-sm underline mt-2">Full policy</button>
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between items-center border-b border-border pb-3 sm:pb-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm text-secondary mb-1">Dates</div>
                      <div className="font-semibold text-sm sm:text-base truncate">
                        {dateRange.from && dateRange.to
                          ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
                          : dateRange.from
                          ? format(dateRange.from, "MMM d, yyyy")
                          : "Not selected"}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsFormOpen(false);
                        setIsCalendarOpen(true);
                      }}
                      className="text-xs sm:text-sm underline font-semibold ml-2 flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* Guests */}
                  <div className="flex justify-between items-center border-b border-border pb-3 sm:pb-4">
                    <div>
                      <div className="text-xs sm:text-sm text-secondary mb-1">Guests</div>
                      <div className="font-semibold text-sm sm:text-base">
                        {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsFormOpen(false);
                        setIsGuestSelectorOpen(true);
                      }}
                      className="text-xs sm:text-sm underline font-semibold ml-2 flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* Price Details */}
                  <div className="space-y-2 border-b border-border pb-3 sm:pb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="break-words pr-2">
                        {nights > 0 ? `${nights} ${nights === 1 ? "day" : "days"}` : "1 day"} × {getCalculatedPrice()} TZS
                      </span>
                      <span className="flex-shrink-0">{getCalculatedPrice()} TZS</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-secondary">
                      <span>Service fee</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between font-bold text-base sm:text-lg pt-2">
                      <span>Total</span>
                      <span>{getCalculatedPrice()} TZS</span>
                    </div>
                    <button className="text-xs sm:text-sm underline">Price breakdown</button>
                  </div>

                  {/* Rare Find Banner */}
                  {isRareFind && rareFindTier && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4 flex items-center justify-center gap-2 sm:gap-3">
                      {rareFindTier === 'diamond' && (
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L14.5 9L22 12L14.5 15L12 22L9.5 15L2 12L9.5 9L12 2Z" fill="url(#diamondGradient)" stroke="url(#diamondStroke)" strokeWidth="0.5"/>
                          <defs>
                            <linearGradient id="diamondGradient" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#60A5FA" />
                              <stop offset="50%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#6366F1" />
                            </linearGradient>
                            <linearGradient id="diamondStroke" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#93C5FD" />
                              <stop offset="100%" stopColor="#1E40AF" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                      {rareFindTier === 'gold' && (
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="url(#goldGradient)" stroke="url(#goldStroke)" strokeWidth="0.5"/>
                          <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#FCD34D" />
                              <stop offset="50%" stopColor="#F59E0B" />
                              <stop offset="100%" stopColor="#D97706" />
                            </linearGradient>
                            <linearGradient id="goldStroke" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#FDE047" />
                              <stop offset="100%" stopColor="#B45309" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                      {rareFindTier === 'silver' && (
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="url(#silverGradient)" stroke="url(#silverStroke)" strokeWidth="0.5"/>
                          <defs>
                            <linearGradient id="silverGradient" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#E5E7EB" />
                              <stop offset="50%" stopColor="#9CA3AF" />
                              <stop offset="100%" stopColor="#6B7280" />
                            </linearGradient>
                            <linearGradient id="silverStroke" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#F3F4F6" />
                              <stop offset="100%" stopColor="#4B5563" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                      {rareFindTier === 'bronze' && (
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="url(#bronzeGradient)" stroke="url(#bronzeStroke)" strokeWidth="0.5"/>
                          <defs>
                            <linearGradient id="bronzeGradient" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#D97706" />
                              <stop offset="50%" stopColor="#B45309" />
                              <stop offset="100%" stopColor="#92400E" />
                            </linearGradient>
                            <linearGradient id="bronzeStroke" x1="0" y1="0" x2="24" y2="24">
                              <stop offset="0%" stopColor="#F59E0B" />
                              <stop offset="100%" stopColor="#78350F" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-pink-900">
                        Rare find! This vendor is usually booked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
