'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Check,
  XCircle,
} from 'lucide-react';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import {
  getVendorAvailability,
  updateVendorAvailability,
} from '@/lib/supabase/vendor';
import {
  getVendorBookingsForRange,
  type VendorBooking,
} from '@/lib/supabase/business';
import type { VendorAvailabilityRecord } from '@opusfesta/lib';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';

function CalendarGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8" />
        ))}
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={`cell-${i}`} className="h-20" />
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();
  const { vendorId, vendorName } = useVendorPortalAccess();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateStr = format(monthStart, 'yyyy-MM-dd');
  const endDateStr = format(monthEnd, 'yyyy-MM-dd');

  const {
    data: availability = [],
    isLoading: isAvailabilityLoading,
  } = useQuery({
    queryKey: ['vendor-availability', vendorId, startDateStr, endDateStr],
    queryFn: () => getVendorAvailability(vendorId!, startDateStr, endDateStr),
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const {
    data: bookings = [],
    isLoading: isBookingsLoading,
  } = useQuery({
    queryKey: ['vendor-bookings', vendorId, startDateStr, endDateStr],
    queryFn: () => getVendorBookingsForRange(vendorId!, startDateStr, endDateStr, supabase),
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const isLoading = isAvailabilityLoading || isBookingsLoading;

  const availabilityMutation = useMutation({
    mutationFn: async ({
      date,
      isAvailable,
      availReason,
    }: {
      date: string;
      isAvailable: boolean;
      availReason?: string;
    }) => {
      const success = await updateVendorAvailability(vendorId!, date, isAvailable, availReason);
      if (!success) {
        throw new Error('Failed to update availability');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-availability', vendorId, startDateStr, endDateStr],
      });
      toast.success('Availability updated.');
      setReason('');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update availability');
    },
  });

  // Build a lookup map for availability by date string
  const availabilityMap = useMemo(() => {
    const map: Record<string, VendorAvailabilityRecord> = {};
    for (const record of availability) {
      map[record.date] = record;
    }
    return map;
  }, [availability]);

  // Build a lookup map for bookings by date string
  const bookingsMap = useMemo(() => {
    const map: Record<string, VendorBooking[]> = {};
    for (const booking of bookings) {
      const dateKey = booking.eventDate;
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(booking);
    }
    return map;
  }, [bookings]);

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [monthStart, monthEnd]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSelectedDate(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);

  const toggleAvailability = (dateStr: string, markAvailable: boolean) => {
    availabilityMutation.mutate({
      date: dateStr,
      isAvailable: markAvailable,
      availReason: reason.trim() || undefined,
    });
  };

  // Data for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedAvailability = selectedDateStr ? availabilityMap[selectedDateStr] : undefined;
  const selectedBookings = selectedDateStr ? bookingsMap[selectedDateStr] || [] : [];

  if (!vendorId) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Vendor profile not found. Complete onboarding first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage availability and view bookings for {vendorName || 'your storefront'}.
        </p>
      </div>

      {isLoading ? (
        <CalendarGridSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
          {/* Calendar grid */}
          <Card>
            <CardContent className="p-4 md:p-6">
              {/* Navigation bar */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                </div>
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayHeaders.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const avail = availabilityMap[dateStr];
                  const dayBookings = bookingsMap[dateStr] || [];
                  const hasBooking = dayBookings.length > 0;
                  const isExplicitlyAvailable = avail?.is_available === true;
                  const isUnavailable = avail?.is_available === false;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative flex flex-col items-center justify-start rounded-md p-1.5 min-h-[72px] text-sm transition-colors
                        ${!inMonth ? 'text-muted-foreground/30' : 'text-foreground'}
                        ${today ? 'ring-2 ring-primary ring-offset-1' : ''}
                        ${selected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                      `}
                    >
                      <span className={`text-sm font-medium ${today ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {/* Dot indicators */}
                      {inMonth && (
                        <div className="mt-1 flex items-center gap-1">
                          {isExplicitlyAvailable && (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" title="Available" />
                          )}
                          {isUnavailable && (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="Unavailable" />
                          )}
                          {hasBooking && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Booking" />
                          )}
                        </div>
                      )}
                      {/* Booking count badge */}
                      {inMonth && dayBookings.length > 0 && (
                        <span className="mt-0.5 text-[10px] text-blue-600 font-medium">
                          {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Available
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Unavailable
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Booking
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day detail panel */}
          <div className="space-y-4">
            {selectedDate ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedDate(null)}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Availability status */}
                    <div>
                      <p className="text-sm font-medium mb-2">Availability</p>
                      {selectedAvailability ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={selectedAvailability.is_available ? 'success' : 'destructive'}
                          >
                            {selectedAvailability.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          {selectedAvailability.reason && (
                            <span className="text-xs text-muted-foreground">
                              {selectedAvailability.reason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No availability set (implicitly available)
                        </p>
                      )}
                    </div>

                    {/* Quick toggle */}
                    <div className="space-y-2">
                      <Input
                        placeholder="Reason (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={availabilityMutation.isPending}
                          onClick={() =>
                            selectedDateStr && toggleAvailability(selectedDateStr, true)
                          }
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                          Mark Available
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={availabilityMutation.isPending}
                          onClick={() =>
                            selectedDateStr && toggleAvailability(selectedDateStr, false)
                          }
                        >
                          <XCircle className="mr-1.5 h-3.5 w-3.5 text-red-500" />
                          Unavailable
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bookings for this date */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Bookings ({selectedBookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedBookings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No bookings for this date.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="rounded-lg border p-3 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{booking.name}</p>
                              <Badge
                                variant={
                                  booking.status === 'accepted' ? 'success' : 'secondary'
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {booking.eventType}
                            </p>
                            {booking.guestCount && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {booking.guestCount} guests
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {booking.email}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Click on a day to view details and manage availability.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
