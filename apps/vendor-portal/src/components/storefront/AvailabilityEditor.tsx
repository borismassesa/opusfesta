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
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useClerkSupabaseClient } from '@opusfesta/auth';
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
import {
  getVendorAvailability,
  updateVendorAvailability,
} from '@/lib/supabase/vendor';
import type { AvailabilityDate } from '@/lib/supabase/vendor';
import {
  getVendorBookingsForRange,
  type VendorBooking,
} from '@/lib/supabase/business';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats bar skeleton */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        {/* Calendar skeleton */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-7 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={`h-${i}`} className="h-8" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={`c-${i}`} className="h-[72px] rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side panel skeleton */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Skeleton className="mb-3 h-10 w-10 rounded-md" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface AvailabilityEditorProps {
  vendorId: string;
  onNextSection: () => void;
}

export function AvailabilityEditor({
  vendorId,
  onNextSection,
}: AvailabilityEditorProps) {
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateStr = format(monthStart, 'yyyy-MM-dd');
  const endDateStr = format(monthEnd, 'yyyy-MM-dd');

  // --- Data fetching ---

  const { data: availability = [], isLoading: isAvailabilityLoading } =
    useQuery({
      queryKey: ['vendor-availability', vendorId, startDateStr, endDateStr],
      queryFn: () => getVendorAvailability(vendorId, startDateStr, endDateStr),
      enabled: !!vendorId,
      staleTime: 30_000,
    });

  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['vendor-bookings', vendorId, startDateStr, endDateStr],
    queryFn: () =>
      getVendorBookingsForRange(vendorId, startDateStr, endDateStr, supabase),
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const isLoading = isAvailabilityLoading || isBookingsLoading;

  // --- Mutations ---

  const mutation = useMutation({
    mutationFn: async ({
      date,
      isAvailable,
      availReason,
    }: {
      date: string;
      isAvailable: boolean;
      availReason?: string;
    }) => {
      const success = await updateVendorAvailability(
        vendorId,
        date,
        isAvailable,
        availReason
      );
      if (!success) throw new Error('Failed to update availability');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor-availability', vendorId, startDateStr, endDateStr],
      });
      toast.success('Availability updated.');
      setReason('');
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update availability'
      );
    },
  });

  // --- Computed data ---

  const availabilityMap = useMemo(() => {
    const map: Record<string, AvailabilityDate> = {};
    for (const record of availability) {
      map[record.date] = record;
    }
    return map;
  }, [availability]);

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

  const calendarDays = useMemo(() => {
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [monthStart, monthEnd]);

  const monthStats = useMemo(() => {
    let availableCount = 0;
    let unavailableCount = 0;
    const bookedDates = new Set<string>();

    for (const record of availability) {
      if (record.is_available) availableCount++;
      else unavailableCount++;
    }

    for (const booking of bookings) {
      bookedDates.add(booking.eventDate);
    }

    return {
      available: availableCount,
      unavailable: unavailableCount,
      booked: bookedDates.size,
    };
  }, [availability, bookings]);

  // --- Selected date data ---

  const selectedDateStr = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : null;
  const selectedAvailability = selectedDateStr
    ? availabilityMap[selectedDateStr]
    : undefined;
  const selectedBookings = selectedDateStr
    ? bookingsMap[selectedDateStr] || []
    : [];

  // --- Handlers ---

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

  const handleSelectDate = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = availabilityMap[dateStr];
    setReason(entry?.reason ?? '');
  };

  const handleToggle = (markAvailable: boolean) => {
    if (!selectedDateStr) return;
    mutation.mutate({
      date: selectedDateStr,
      isAvailable: markAvailable,
      availReason: reason.trim() || undefined,
    });
  };

  // --- Render ---

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Month Stats Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {monthStats.available} available
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {monthStats.unavailable} blocked
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {monthStats.booked} booked
        </span>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        {/* Calendar Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            {/* Navigation */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                >
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

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day) => (
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

                // Determine left border color
                let borderClass = 'border-l-2 border-transparent';
                if (inMonth) {
                  if (hasBooking) {
                    borderClass = 'border-l-2 border-blue-500';
                  } else if (isUnavailable) {
                    borderClass = 'border-l-2 border-red-500';
                  } else if (isExplicitlyAvailable) {
                    borderClass = 'border-l-2 border-green-500';
                  }
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleSelectDate(day)}
                    disabled={!inMonth}
                    className={cn(
                      'relative flex flex-col items-start justify-start rounded-md p-1.5 min-h-[72px] text-sm transition-colors text-left',
                      borderClass,
                      !inMonth && 'text-muted-foreground/30 cursor-default',
                      inMonth && !selected && 'hover:bg-muted/50',
                      selected && 'bg-primary/10 ring-2 ring-primary ring-offset-1',
                      today && 'font-bold'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        today && 'text-primary'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {inMonth && hasBooking && (
                      <span className="mt-auto text-[10px] font-medium text-blue-600">
                        {dayBookings.length} booking
                        {dayBookings.length > 1 ? 's' : ''}
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
                Booked
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              {/* Selected date detail */}
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
                  {/* Current status */}
                  <div>
                    <p className="text-sm font-medium mb-2">Availability</p>
                    {selectedAvailability ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            selectedAvailability.is_available
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {selectedAvailability.is_available
                            ? 'Available'
                            : 'Unavailable'}
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

                  {/* Toggle actions */}
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
                        disabled={mutation.isPending}
                        onClick={() => handleToggle(true)}
                      >
                        {mutation.isPending ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                        )}
                        Mark Available
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={mutation.isPending}
                        onClick={() => handleToggle(false)}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5 text-red-500" />
                        Unavailable
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bookings for selected date */}
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
                            <p className="text-sm font-medium">
                              {booking.name}
                            </p>
                            <Badge
                              variant={
                                booking.status === 'accepted'
                                  ? 'default'
                                  : 'secondary'
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

          {/* Quick actions */}
          <Card>
            <CardContent className="py-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="/calendar" className="inline-flex items-center">
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  Full Calendar & Bookings
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onNextSection}>
          Save changes
        </Button>
        <Button onClick={onNextSection}>Save & Continue</Button>
      </div>
    </div>
  );
}
