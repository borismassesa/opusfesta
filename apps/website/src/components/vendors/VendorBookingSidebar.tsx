"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Flag, Sparkles, Calendar as CalendarIcon, Tag, Send, CheckCircle2, XCircle, Star, MapPin } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfDay, isBefore, differenceInDays, isSameMonth } from "date-fns";
import Image from "next/image";
import type { Vendor } from "@/lib/supabase/vendors";
import { supabase } from "@/lib/supabaseClient";

interface VendorBookingSidebarProps {
  vendor: Vendor;
  isSticky?: boolean;
  // Future: bookedDates will come from vendor's calendar/bookings
  bookedDates?: Date[];
}

export function VendorBookingSidebar({ vendor, isSticky = true, bookedDates = [] }: VendorBookingSidebarProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'customer' | 'payment' | 'method' | 'review' | 'success' | 'error'>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('full');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    postalCode: '',
    country: 'Tanzania'
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [thefestaAccounts, setThefestaAccounts] = useState<any[]>([]);
  const [selectedLipaNamba, setSelectedLipaNamba] = useState<string | null>(null);
  const [mobileMoneyStep, setMobileMoneyStep] = useState<'lipa-namba' | 'receipt'>('lipa-namba');
  const [loadingMobileMoneyAccounts, setLoadingMobileMoneyAccounts] = useState(false);
  const [message, setMessage] = useState('');
  const [createdInquiryId, setCreatedInquiryId] = useState<string | null>(null);
  const confettiTriggered = useRef(false);
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
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
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

  // Fetch availability from API
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        // Get next 12 months of availability
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        const response = await fetch(
          `/api/vendors/${vendor.id}/availability?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // Convert unavailable date strings to Date objects
          const unavailable = (data.unavailableDates || []).map((dateStr: string) => new Date(dateStr));
          setUnavailableDates(unavailable);
        } else {
          console.error("Failed to fetch availability");
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [vendor.id]);

  // Fetch TheFesta's mobile money accounts when mobile money is selected
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingMobileMoneyAccounts(true);
      // Always set step to lipa-namba when mobile payment is selected
      setMobileMoneyStep('lipa-namba');
      try {
        const response = await fetch("/api/platform/mobile-money");
        if (response.ok) {
          const data = await response.json();
          setThefestaAccounts(data.accounts || []);
          // Set default LIPA NAMBA based on selected payment method
          if (data.accounts && data.accounts.length > 0) {
            const providerMap: Record<string, string> = {
              'mpesa': 'MPESA',
              'tigopesa': 'TIGO_PESA',
              'airtelmoney': 'AIRTEL_MONEY',
              'halopesa': 'HALO_PESA'
            };
            const account = data.accounts.find((acc: any) => 
              acc.provider === providerMap[selectedPaymentMethod || '']
            );
            if (account) {
              setSelectedLipaNamba(account.lipaNamba);
            } else {
              // If no account found for this provider, try to use primary account
              const primaryAccount = data.accounts.find((acc: any) => acc.isPrimary);
              if (primaryAccount) {
                setSelectedLipaNamba(primaryAccount.lipaNamba);
              }
            }
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          console.error("Failed to fetch mobile money accounts:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          // Still show the UI, but with error message
          setSelectedLipaNamba(null);
        }
      } catch (err) {
        console.error("Error fetching TheFesta mobile money accounts:", err);
      } finally {
        setLoadingMobileMoneyAccounts(false);
      }
    };

    if (selectedPaymentMethod && (selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'tigopesa' || selectedPaymentMethod === 'airtelmoney')) {
      fetchAccounts();
    } else {
      // Reset when switching away from mobile money
      setSelectedLipaNamba(null);
      setMobileMoneyStep('lipa-namba');
      setLoadingMobileMoneyAccounts(false);
    }
  }, [selectedPaymentMethod]);

  // Convert booked dates and unavailable dates to start of day for comparison
  const bookedDatesSet = useMemo(() => {
    const allUnavailable = [
      ...bookedDates,
      ...unavailableDates,
    ];
    return new Set(
      allUnavailable.map(date => startOfDay(date).getTime())
    );
  }, [bookedDates, unavailableDates]);

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

  // Calculate dynamic price based on selected dates, guest count, and budget
  const getCalculatedPrice = () => {
    // Get base price from vendor's price range or selected budget
    let basePriceStr = getStartingPrice();
    
    // If budget is selected in the form, use that instead of vendor's price range
    if (reviewForm.budget) {
      if (reviewForm.budget === "$") basePriceStr = "500,000";
      if (reviewForm.budget === "$$") basePriceStr = "1,500,000";
      if (reviewForm.budget === "$$$") basePriceStr = "3,000,000";
      if (reviewForm.budget === "$$$$") basePriceStr = "5,000,000";
    }
    
    const basePrice = parseFloat(basePriceStr.replace(/,/g, ''));
    
    // Apply guest count multiplier (if more than 10 guests, add 10% per 5 additional guests)
    let guestMultiplier = 1;
    if (totalGuests > 10) {
      const additionalGuests = totalGuests - 10;
      const extraGroups = Math.floor(additionalGuests / 5);
      guestMultiplier = 1 + (extraGroups * 0.1); // 10% per 5 additional guests
    }
    
    // Calculate base price with guest multiplier
    let adjustedPrice = basePrice * guestMultiplier;
    
    // If dates are selected, calculate price based on duration
    if (dateRange.from && dateRange.to && nights > 0) {
      // For multi-day events: base price + (nights * daily rate)
      const dailyRate = adjustedPrice * 0.3; // 30% of adjusted price per additional day
      const totalPrice = adjustedPrice + (dailyRate * (nights - 1));
      return Math.round(totalPrice).toLocaleString();
    }
    
    // If only start date is selected, show adjusted price
    if (dateRange.from) {
      return Math.round(adjustedPrice).toLocaleString();
    }
    
    // No dates selected, show starting price (with guest multiplier if guests > 10)
    return Math.round(adjustedPrice).toLocaleString();
  };

  // Calculate pricing information based on selected dates, guests, and budget
  const getCurrentPrice = () => {
    // Use the calculated price which already accounts for dates, guests, and budget
      return parseFloat(getCalculatedPrice().replace(/,/g, ''));
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
            <div className="shrink-0">
              {dateRange.from && dateRange.to && hasGoodDeal ? (
                <Tag className="w-5 h-5 text-green-600" />
              ) : isRareFind && rareFindTier ? (
                <>
                  {rareFindTier === 'diamond' && (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          {/* Start the Conversation Section */}
          <div className="border-b border-border pb-4 mb-2">
            <div className="mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Start the conversation
              </h3>
            </div>
            
            {/* Starting Price */}
            <div className="flex items-end justify-between">
              <div className="text-sm text-secondary">Starting price</div>
              <div className="text-2xl font-bold text-foreground">
                {getStartingPrice()} TZS
              </div>
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
                    className={`w-4 h-4 shrink-0 transition-transform ${isCalendarOpen ? 'rotate-180' : ''} text-secondary group-hover:text-primary`}
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
                    className={`w-4 h-4 shrink-0 transition-transform ${isCalendarOpen ? 'rotate-180' : ''} text-secondary group-hover:text-primary`}
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
                  className={`w-4 h-4 shrink-0 transition-transform ${isGuestSelectorOpen ? 'rotate-180' : ''} text-secondary group-hover:text-primary`}
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
                    className="px-6 pt-6 pb-4 overflow-y-auto flex-1" 
                    style={{ maxHeight: 'calc(100vh - 350px)' }}
                    onWheel={(e) => {
                      // Allow scrolling within calendar
                      e.stopPropagation();
                    }}
                  >
                    {/* Calendar with multiple months */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
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
                    
                    <div className="flex justify-between items-center pt-6 pb-2 border-t border-border mt-4">
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
                        className="bg-primary text-background px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
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

          <div className="border-t border-border pt-2 mt-1 space-y-1.5">
            {isEventDateValid ? (
              <>
            <div className="flex justify-between text-secondary text-xs">
              <span className="underline">Starting price</span>
                  <span>{getCalculatedPrice()} TZS</span>
            </div>
            <div className="flex justify-between text-secondary text-xs">
              <span className="underline">Service fee</span>
              <span>Included</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold text-primary text-sm">
              <span>Total estimate</span>
                  <span>{getCalculatedPrice()} TZS</span>
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-secondary py-1">
                Select event date to see pricing
            </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="flex justify-center items-center gap-2 text-secondary py-2 cursor-pointer hover:text-primary transition-colors w-full"
        >
          <Flag className="w-3 h-3" />
          <span className="text-xs underline font-semibold">Report this listing</span>
        </button>
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
                  setBookingStep('customer');
                  setMessage('');
                  setReviewForm({
                    name: '',
                    email: '',
                    phone: '',
                    eventType: '',
                    budget: ''
                  });
                }}
                className="p-2 hover:bg-surface rounded-lg transition-colors shrink-0"
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
                {/* Step 1: Customer Personal Information and choices and message to vendor */}
                <div className={`rounded-xl sm:rounded-2xl transition-all ${
                  bookingStep === 'customer' 
                    ? 'bg-background shadow-sm p-4 sm:p-5 lg:p-6' 
                    : 'bg-surface p-4 sm:p-5 lg:p-6'
                }`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">1. Your information</h2>
                    {bookingStep !== 'customer' && (
                      <button
                        onClick={() => setBookingStep('customer')}
                        className="text-xs sm:text-sm font-medium text-secondary hover:text-foreground px-2 sm:px-3 py-1.5 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {bookingStep === 'customer' && (
                    <form className="space-y-4 sm:space-y-5" onSubmit={(e) => {
                      e.preventDefault();
                      if (reviewForm.name && reviewForm.email) {
                        setBookingStep('review');
                      }
                    }}>
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Name <span className="text-red-500">*</span></label>
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
                        <label className="block text-sm font-semibold text-foreground mb-2">Email <span className="text-red-500">*</span></label>
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
                        <label className="block text-sm font-semibold text-foreground mb-2">Message to vendor</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell the vendor about your event and any special requests..."
                          className="w-full min-h-[100px] sm:min-h-[120px] border border-border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-background text-foreground focus:border-primary focus:ring-primary focus:outline-none resize-y placeholder:text-secondary"
                        />
                      </div>

                      {/* Next Button */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!reviewForm.name || !reviewForm.email}
                          className="bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          Review Inquiry
                        </button>
                      </div>
                    </form>
                  )}
                  {bookingStep !== 'customer' && (
                    <div className="text-sm text-secondary">
                      {reviewForm.name && reviewForm.email ? `${reviewForm.name} (${reviewForm.email})` : 'Not completed'}
                    </div>
                  )}
                </div>

                {/* Payment steps removed - payment will happen after vendor confirms inquiry */}

                {/* Step 2: Review and Confirm */}
                <div className={`rounded-xl sm:rounded-2xl transition-all ${
                  bookingStep === 'review' || bookingStep === 'confirmation'
                    ? 'bg-background shadow-sm p-4 sm:p-5 lg:p-6'
                    : 'bg-surface p-4 sm:p-5 lg:p-6'
                }`}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">2. Review your inquiry</h2>
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
                    <div className="space-y-4 sm:space-y-5">
                      {/* Review Summary */}
                      <div className="space-y-4 sm:space-y-5 border-b border-border pb-4 sm:pb-5">
                        {/* Personal Information */}
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">Personal Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-secondary">Name:</span>
                              <span className="font-medium text-foreground">{reviewForm.name || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-secondary">Email:</span>
                              <span className="font-medium text-foreground">{reviewForm.email || 'Not provided'}</span>
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
                            {dateRange.from && (
                              <div className="flex justify-between">
                                <span className="text-secondary">Event Date:</span>
                                <span className="font-medium text-foreground">
                                  {dateRange.from.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                  {dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() && 
                                    ` - ${dateRange.to.toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}`
                                  }
                                </span>
                              </div>
                            )}
                            {totalGuests && (
                              <div className="flex justify-between">
                                <span className="text-secondary">Guest Count:</span>
                                <span className="font-medium text-foreground">{totalGuests} guests</span>
                              </div>
                            )}
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

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => setBookingStep('confirmation')}
                        className="w-full bg-primary text-primary-foreground py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        Review & Confirm
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}

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
                          setSubmitError(null);
                          
                          try {
                            // Get authentication token
                            const { data: { session } } = await supabase.auth.getSession();
                            const headers: HeadersInit = {
                              "Content-Type": "application/json",
                            };
                            
                            if (session) {
                              headers["Authorization"] = `Bearer ${session.access_token}`;
                            }

                            // Prepare inquiry data
                            const inquiryData = {
                              vendorId: vendor.id,
                              name: reviewForm.name,
                              email: reviewForm.email,
                              phone: reviewForm.phone || undefined,
                              eventType: reviewForm.eventType,
                              eventDate: dateRange.from ? dateRange.from.toISOString() : undefined,
                              guestCount: totalGuests || undefined,
                              budget: reviewForm.budget || undefined,
                              location: vendor.location?.city ? `${vendor.location.city}, ${vendor.location.country || "Tanzania"}` : undefined,
                              message: message || `I'm interested in booking ${vendor.business_name} for my ${reviewForm.eventType} event.`,
                              // Payment information removed - payment will happen after vendor confirms inquiry
                            };

                            // Submit inquiry
                            const response = await fetch("/api/bookings", {
                              method: "POST",
                              headers,
                              body: JSON.stringify(inquiryData),
                            });

                            let data;
                            try {
                              data = await response.json();
                            } catch (jsonError) {
                              // If response is not JSON, get text
                              const text = await response.text();
                              throw new Error(`Server error: ${text || response.statusText}`);
                            }

                            if (!response.ok) {
                              // Handle authentication error
                              if (response.status === 401) {
                                router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
                                return;
                              }
                              
                              const errorMessage = data?.error || data?.details || `Failed to submit inquiry (${response.status})`;
                              console.error('Inquiry submission error:', {
                                status: response.status,
                                statusText: response.statusText,
                                error: data
                              });
                              throw new Error(errorMessage);
                            }

                            // Success - show success state
                            if (data?.inquiry?.id) {
                              setCreatedInquiryId(data.inquiry.id);
                            }
                            setBookingStep('success');
                            
                            // Reset form after a delay
                            setTimeout(() => {
                              setIsFormOpen(false);
                              setBookingStep('customer');
                              setReviewForm({
                                name: '',
                                email: '',
                                phone: '',
                                eventType: '',
                                budget: ''
                              });
                              setMessage('');
                              setDateRange({ from: undefined, to: undefined });
                              setSubmitError(null);
                              setCreatedInquiryId(null);
                              confettiTriggered.current = false;
                              // Reset payment-related state (not used in inquiry but kept for cleanup)
                              setSelectedPayment('full');
                              setSelectedPaymentMethod(null);
                              setCardDetails({
                                number: '',
                                expiry: '',
                                cvv: '',
                                postalCode: '',
                                country: 'Tanzania'
                              });
                              setReceiptFile(null);
                              setReceiptPreview(null);
                              setReceiptNumber('');
                              setSelectedLipaNamba(null);
                            }, 10000); // Increased delay to allow user to see success state
                            
                          } catch (error) {
                            console.error('Error submitting inquiry:', error);
                            setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred");
                            setBookingStep('error');
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
                            Send Inquiry
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

                {/* Success State */}
                {bookingStep === 'success' && (() => {
                  // Trigger confetti once when success state is shown
                  if (!confettiTriggered.current) {
                    confettiTriggered.current = true;
                    // Trigger confetti animation
                    confetti({
                      particleCount: 100,
                      spread: 70,
                      origin: { y: 0.6 },
                      colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
                    });
                    // Additional burst after a short delay
                    setTimeout(() => {
                      confetti({
                        particleCount: 50,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#667eea', '#764ba2'],
                      });
                      confetti({
                        particleCount: 50,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#f093fb', '#4facfe'],
                      });
                    }, 250);
                  }
                  
                  return (
                    <div className="rounded-xl sm:rounded-2xl bg-background shadow-sm p-4 sm:p-5 lg:p-6 mt-3 sm:mt-4">
                      <div className="text-center py-6 sm:py-8">
                        <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">Inquiry Sent Successfully! 🎉</h2>
                        <p className="text-sm sm:text-base text-secondary mb-4">
                          Your inquiry has been sent to <strong>{vendor.business_name}</strong>. They will respond to you soon.
                        </p>
                        {createdInquiryId && (
                          <p className="text-xs text-muted-foreground mb-6">
                            Inquiry ID: <span className="font-mono">{createdInquiryId.substring(0, 8)}...</span>
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            onClick={() => {
                              router.push('/my-inquiries');
                            }}
                            className="bg-primary text-primary-foreground"
                          >
                            View My Inquiries
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsFormOpen(false);
                              setBookingStep('customer');
                              setReviewForm({
                                name: '',
                                email: '',
                                phone: '',
                                eventType: '',
                                budget: ''
                              });
                              setMessage('');
                              setDateRange({ from: undefined, to: undefined });
                              setCreatedInquiryId(null);
                              confettiTriggered.current = false;
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                </div>

                {/* Error State */}
                {bookingStep === 'error' && (
                  <div className="rounded-xl sm:rounded-2xl bg-background shadow-sm p-4 sm:p-5 lg:p-6 mt-3 sm:mt-4">
                    <div className="text-center py-6 sm:py-8">
                      <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto mb-4" />
                      <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">Failed to Send Inquiry</h2>
                      <p className="text-sm sm:text-base text-secondary mb-6">
                        {submitError || "An error occurred while submitting your inquiry. Please try again."}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBookingStep('confirmation');
                            setSubmitError(null);
                          }}
                        >
                          Try Again
                        </Button>
                        <Button
                          onClick={() => {
                            setIsFormOpen(false);
                            setBookingStep('customer');
                            setSubmitError(null);
                          }}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
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
                      <h3 className="font-bold text-xl sm:text-2xl mb-3">{vendor.business_name}</h3>
                      <div className="text-sm sm:text-base text-secondary mb-3">
                        {vendor.category}
                      </div>
                      
                      {/* Rating, Reviews, and Location - Single Line */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(rating)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-secondary/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-base font-semibold text-foreground">
                          {rating.toFixed(1)}
                        </span>
                        <span className="text-base text-foreground underline">
                          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                        </span>
                        {vendor.location?.city && (
                          <span className="text-base text-foreground underline">
                            {vendor.location.city}
                            {vendor.location.country && `, ${vendor.location.country}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="border-b border-border pb-3 sm:pb-4">
                    <div className="font-semibold text-sm sm:text-base mb-2">Cancellation Policy</div>
                    <div className="text-xs sm:text-sm text-secondary space-y-2">
                      <div>
                        <strong>Before vendor confirmation:</strong> 100% refund
                    </div>
                      <div>
                        <strong>After vendor confirmation (before work starts):</strong> 85% refund (15% platform fee retained)
                      </div>
                      <div>
                        <strong>After work starts:</strong> Partial refund based on work completed (vendor keeps 42.5% work initiation fee)
                      </div>
                      <div>
                        <strong>Vendor cancellation:</strong> 100% refund to customer
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPolicyModalOpen(true)}
                      className="text-xs sm:text-sm underline mt-2 text-primary hover:text-primary/80"
                    >
                      View full policy
                    </button>
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
                      className="text-xs sm:text-sm underline font-semibold ml-2 shrink-0"
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
                      className="text-xs sm:text-sm underline font-semibold ml-2 shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* Price Details */}
                  <div className="space-y-2 border-b border-border pb-3 sm:pb-4">
                    {dateRange.from ? (
                      <>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="wrap-break-word pr-2">
                            {nights > 0 ? `${nights} ${nights === 1 ? "day" : "days"}` : "1 day"}
                            {totalGuests > 10 && ` • ${totalGuests} guests`}
                            {reviewForm.budget && ` • ${reviewForm.budget === '$' ? 'Budget' : reviewForm.budget === '$$' ? 'Moderate' : reviewForm.budget === '$$$' ? 'Premium' : 'Luxury'} tier`}
                      </span>
                      <span className="shrink-0">{getCalculatedPrice()} TZS</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-secondary">
                          <span>Service fee (15%)</span>
                          <span>Included in total</span>
                    </div>
                    <div className="flex justify-between font-bold text-base sm:text-lg pt-2">
                          <span>Estimated Total</span>
                      <span>{getCalculatedPrice()} TZS</span>
                    </div>
                        <div className="text-xs text-secondary pt-1">
                          Final price will be confirmed after vendor accepts your inquiry
                        </div>
                      </>
                    ) : (
                      <div className="text-xs sm:text-sm text-secondary text-center py-2">
                        Select dates to see pricing
                      </div>
                    )}
                  </div>

                  {/* Rare Find Banner */}
                  {isRareFind && rareFindTier && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4 flex items-center justify-center gap-2 sm:gap-3">
                      {rareFindTier === 'diamond' && (
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      {/* Cancellation Policy Modal */}
      {isPolicyModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsPolicyModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-background border border-border rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Cancellation & Refund Policy</h2>
                  <button
                    onClick={() => setIsPolicyModalOpen(false)}
                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-secondary" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Cancellation & Refund Rules</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">1. Customer Cancels Before Vendor Confirmation</h4>
                      <ul className="text-sm text-secondary space-y-1 ml-4 list-disc">
                        <li>100% refund to the customer</li>
                        <li>No charges applied</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">2. Customer Cancels After Vendor Confirmation (Before Work Starts)</h4>
                      <ul className="text-sm text-secondary space-y-1 ml-4 list-disc">
                        <li>Vendor advance not released yet</li>
                        <li>Customer receives: 85% refund</li>
                        <li>15% retained by TheFesta (platform & processing fee)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">3. Customer Cancels After Work Has Started</h4>
                      <ul className="text-sm text-secondary space-y-1 ml-4 list-disc">
                        <li>Vendor has received 50% of their share</li>
                        <li>Vendor keeps 42.5% (work initiation fee)</li>
                        <li>Remaining balance is refunded to the customer, excluding TheFesta's 15%</li>
                        <li>TheFesta mediates and determines fairness based on work completed</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">4. Vendor Cancels the Booking</h4>
                      <ul className="text-sm text-secondary space-y-1 ml-4 list-disc">
                        <li>100% refund to the customer</li>
                        <li>Vendor may be penalized or restricted based on cancellation reason</li>
                        <li>TheFesta resolves payment reversals</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">5. Vendor Fails to Complete the Job</h4>
                      <ul className="text-sm text-secondary space-y-1 ml-4 list-disc">
                        <li>TheFesta investigates the issue</li>
                        <li>Possible outcomes: Partial or full refund to the customer</li>
                        <li>Vendor may forfeit the remaining payout</li>
                        <li>TheFesta may issue compensation or arrange a replacement vendor</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">6. Customer Dissatisfied After Completion</h4>
                      <ul className="text-sm text-secondary space-y-1 ml-4 list-disc">
                        <li>Customer raises an issue within a defined review period</li>
                        <li>TheFesta reviews: Service quality, Contracted scope, Evidence from both parties</li>
                        <li>Refund or partial refund may be issued at TheFesta's discretion</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-2">Key Principles</h3>
                  <ul className="text-sm text-secondary space-y-1 ml-4 list-disc">
                    <li>All payments are handled by TheFesta</li>
                    <li>TheFesta acts as escrow and mediator</li>
                    <li>Final refund decisions rest with TheFesta</li>
                    <li>Goal: Fairness to vendors + protection for customers</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end">
                <button
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Report Listing Modal */}
      {isReportModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsReportModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-background border border-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Report This Listing</h2>
                  <button
                    onClick={() => {
                      setIsReportModalOpen(false);
                      setReportReason('');
                      setReportDetails('');
                    }}
                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-secondary" />
                  </button>
                </div>
                <p className="text-sm text-secondary mt-2">
                  Help us understand what's wrong with this listing. Your report will be reviewed by our team.
                </p>
              </div>
              
              <form 
                className="p-6 space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reportReason) {
                    alert('Please select a reason for reporting');
                    return;
                  }
                  
                  setIsSubmittingReport(true);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const headers: HeadersInit = {
                      "Content-Type": "application/json",
                    };
                    
                    if (session) {
                      headers["Authorization"] = `Bearer ${session.access_token}`;
                    }

                    const response = await fetch("/api/reports/vendors", {
                      method: "POST",
                      headers,
                      body: JSON.stringify({
                        vendorId: vendor.id,
                        reason: reportReason,
                        details: reportDetails,
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.error || "Failed to submit report");
                    }

                    // Show confirmation modal
                    setIsReportModalOpen(false);
                    setShowReportConfirmation(true);
                    setReportReason('');
                    setReportDetails('');
                  } catch (error) {
                    console.error("Error submitting report:", error);
                    alert(error instanceof Error ? error.message : "Failed to submit report. Please try again.");
                  } finally {
                    setIsSubmittingReport(false);
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Reason for reporting <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'spam', label: 'Spam or misleading content' },
                      { value: 'inappropriate', label: 'Inappropriate content' },
                      { value: 'fraud', label: 'Fraudulent or scam' },
                      { value: 'duplicate', label: 'Duplicate listing' },
                      { value: 'wrong_info', label: 'Incorrect information' },
                      { value: 'other', label: 'Other' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={option.value}
                          checked={reportReason === option.value}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="mt-1"
                        />
                        <span className="text-sm text-foreground flex-1">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Please provide any additional information that might help us understand the issue..."
                    className="w-full min-h-[120px] border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:border-primary focus:ring-primary focus:outline-none resize-y placeholder:text-secondary"
                    maxLength={1000}
                  />
                  <div className="text-xs text-secondary mt-1">
                    {reportDetails.length}/1000 characters
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReportModalOpen(false);
                      setReportReason('');
                      setReportDetails('');
                    }}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg font-semibold text-sm text-foreground hover:bg-surface transition-colors"
                    disabled={isSubmittingReport}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason || isSubmittingReport}
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Report Confirmation Modal */}
      {showReportConfirmation && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowReportConfirmation(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-background border border-border rounded-2xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  We got your report
                </h2>
                <p className="text-base text-secondary mb-6 leading-relaxed">
                  Thanks for taking the time to let us know what's going on. Reports like yours are helping us learn how to make it easier to find what you're looking for.
                </p>
                <div className="border-t border-border pt-6">
                  <button
                    onClick={() => setShowReportConfirmation(false)}
                    className="w-full bg-foreground text-background px-6 py-3 rounded-lg font-semibold text-sm hover:bg-foreground/90 transition-colors uppercase"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
