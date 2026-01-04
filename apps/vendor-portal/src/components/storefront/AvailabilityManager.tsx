'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getVendorAvailability,
  updateVendorAvailability,
  getBookedDates,
  type Vendor,
} from '@/lib/supabase/vendor';
import { supabase } from '@/lib/supabase/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Calendar as CalendarIcon,
  Clock,
  Settings,
  Loader2,
  RotateCcw,
  CalendarDays,
  ChevronDown,
  MoreVertical,
  Zap,
  Filter,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfDay, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  getYear,
  getMonth,
  setMonth,
  setYear,
  isWeekend,
  parseISO,
  isAfter,
  isBefore,
} from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AvailabilityManagerProps {
  vendor: Vendor | null;
  onUpdate: () => void;
}

type AvailabilityStatus = 'available' | 'unavailable' | 'booked' | 'past';

interface RecurringPattern {
  defaultAvailable: boolean;
  autoMarkWeekends?: boolean;
  autoMarkWeekendsValue?: boolean;
  autoMarkWeekdays?: boolean;
  autoMarkWeekdaysValue?: boolean;
}

interface MonthStats {
  available: number;
  unavailable: number;
  booked: number;
  total: number;
}

interface BulkUpdate {
  date: string;
  isAvailable: boolean;
}

export function AvailabilityManager({ vendor, onUpdate }: AvailabilityManagerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<(() => Promise<void>) | null>(null);
  const queryClient = useQueryClient();

  // Recurring pattern settings
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>({
    defaultAvailable: true,
    autoMarkWeekends: false,
    autoMarkWeekendsValue: true,
    autoMarkWeekdays: false,
    autoMarkWeekdaysValue: true,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateStr = format(monthStart, 'yyyy-MM-dd');
  const endDateStr = format(monthEnd, 'yyyy-MM-dd');

  // Get availability
  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', vendor?.id, startDateStr, endDateStr],
    queryFn: async () => {
      if (!vendor) return [];
      return await getVendorAvailability(vendor.id, startDateStr, endDateStr);
    },
    enabled: !!vendor,
  });

  // Get booked dates
  const { data: bookedDates = [], isLoading: isLoadingBooked } = useQuery({
    queryKey: ['bookedDates', vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      return await getBookedDates(vendor.id);
    },
    enabled: !!vendor,
  });

  // Create availability map for quick lookup
  const availabilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    availability.forEach((avail) => {
      map.set(avail.date, avail.is_available);
    });
    return map;
  }, [availability]);

  // Clear pending changes when availability data updates and matches
  useEffect(() => {
    setPendingChanges(prev => {
      const updated = new Map(prev);
      let hasChanges = false;
      
      // Remove pending changes that now match the actual availability data
      prev.forEach((pendingValue, date) => {
        if (availabilityMap.has(date)) {
          const actualValue = availabilityMap.get(date);
          if (actualValue === pendingValue) {
            updated.delete(date);
            hasChanges = true;
          }
        }
      });
      
      return hasChanges ? updated : prev;
    });
  }, [availabilityMap]);

  // Calendar utilities
  const getCalendarDays = useCallback((month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday = 1
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Monday = 1
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, []);

  const isDatePast = useCallback((date: Date): boolean => {
    const today = startOfDay(new Date());
    const dateToCheck = startOfDay(date);
    return isBefore(dateToCheck, today) && !isSameDay(dateToCheck, today);
  }, []);

  const isDateBooked = useCallback((date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedDates.includes(dateStr);
  }, [bookedDates]);

  const getDateStatus = useCallback((date: Date): AvailabilityStatus => {
    if (isDatePast(date)) return 'past';
    if (isDateBooked(date)) return 'booked';
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check pending changes first
    if (pendingChanges.has(dateStr)) {
      return pendingChanges.get(dateStr) ? 'available' : 'unavailable';
    }
    
    // Check explicit availability
    if (availabilityMap.has(dateStr)) {
      return availabilityMap.get(dateStr) ? 'available' : 'unavailable';
    }
    
    // Apply recurring pattern defaults
    if (recurringPattern.autoMarkWeekends && isWeekend(date)) {
      return recurringPattern.autoMarkWeekendsValue ? 'available' : 'unavailable';
    }
    
    if (recurringPattern.autoMarkWeekdays && !isWeekend(date)) {
      return recurringPattern.autoMarkWeekdaysValue ? 'available' : 'unavailable';
    }
    
    // Default availability
    return recurringPattern.defaultAvailable ? 'available' : 'unavailable';
  }, [isDatePast, isDateBooked, pendingChanges, availabilityMap, recurringPattern]);

  // Calculate month statistics
  const getMonthStats = useCallback((month: Date): MonthStats => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let availableCount = 0;
    let unavailableCount = 0;
    let bookedCount = 0;
    
    days.forEach(day => {
      const status = getDateStatus(day);
      if (status === 'available') availableCount++;
      else if (status === 'unavailable') unavailableCount++;
      else if (status === 'booked') bookedCount++;
    });
    
    return {
      available: availableCount,
      unavailable: unavailableCount,
      booked: bookedCount,
      total: days.length,
    };
  }, [getDateStatus]);

  // Core bulk update function - must be defined first
  const applyBulkUpdates = useCallback(async (updates: BulkUpdate[]) => {
    if (!vendor || updates.length === 0) {
      if (updates.length === 0) {
        toast.error('No dates to update');
      }
      return;
    }
    
    try {
      // Optimistically update UI using functional update
      setPendingChanges(prev => {
        const newPending = new Map(prev);
        updates.forEach(({ date, isAvailable }) => {
          newPending.set(date, isAvailable);
        });
        return newPending;
      });
      
      console.log('[AvailabilityManager] Applying bulk updates:', {
        count: updates.length,
        vendorId: vendor.id,
        updates: updates.slice(0, 5).map(u => `${u.date}: ${u.isAvailable ? 'available' : 'unavailable'}`)
      });
      
      // Apply updates to database
      const results = await Promise.allSettled(
        updates.map(({ date, isAvailable }) =>
          updateVendorAvailability(vendor.id, date, isAvailable)
        )
      );
      
      // Check for failures
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.error('[AvailabilityManager] Some updates failed:', failures);
        // Rollback the failed updates
        setPendingChanges(prev => {
          const rolledBack = new Map(prev);
          updates.forEach(({ date }) => {
            rolledBack.delete(date);
          });
          return rolledBack;
        });
        throw new Error(`${failures.length} update(s) failed`);
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['availability', vendor.id] });
      
      // Clear pending changes after successful update using functional update
      setPendingChanges(prev => {
        const cleared = new Map(prev);
        updates.forEach(({ date }) => {
          cleared.delete(date);
        });
        return cleared;
      });
      
      toast.success(`Updated ${updates.length} date${updates.length > 1 ? 's' : ''}`);
      onUpdate();
    } catch (error: any) {
      console.error('[AvailabilityManager] Bulk update error:', error);
      toast.error(`Failed to update availability: ${error?.message || 'Unknown error'}`);
      // Rollback optimistic update - remove all updates from pending
      setPendingChanges(prev => {
        const rolledBack = new Map(prev);
        updates.forEach(({ date }) => {
          rolledBack.delete(date);
        });
        return rolledBack;
      });
    }
  }, [vendor, queryClient, onUpdate]);

  // Bulk operations
  const markMonthAvailable = useCallback(async (month: Date) => {
    if (!vendor) return;
    
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const updates: BulkUpdate[] = days
      .filter(day => !isDatePast(day) && !isDateBooked(day))
      .map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        isAvailable: true,
      }));
    
    await applyBulkUpdates(updates);
  }, [vendor, isDatePast, isDateBooked, applyBulkUpdates]);

  const markMonthUnavailable = useCallback(async (month: Date) => {
    if (!vendor) return;
    
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const updates: BulkUpdate[] = days
      .filter(day => !isDatePast(day) && !isDateBooked(day))
      .map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        isAvailable: false,
      }));
    
    await applyBulkUpdates(updates);
  }, [vendor, isDatePast, isDateBooked, applyBulkUpdates]);

  const markWeekdaysAvailable = useCallback(async (startDate: Date, endDate: Date) => {
    if (!vendor) return;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const updates: BulkUpdate[] = days
      .filter(day => !isWeekend(day) && !isDatePast(day) && !isDateBooked(day))
      .map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        isAvailable: true,
      }));
    
    await applyBulkUpdates(updates);
  }, [vendor, isDatePast, isDateBooked, applyBulkUpdates]);

  const markWeekendsAvailable = useCallback(async (startDate: Date, endDate: Date) => {
    if (!vendor) return;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const updates: BulkUpdate[] = days
      .filter(day => isWeekend(day) && !isDatePast(day) && !isDateBooked(day))
      .map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        isAvailable: true,
      }));
    
    await applyBulkUpdates(updates);
  }, [vendor, isDatePast, isDateBooked, applyBulkUpdates]);

  const markWeekdaysUnavailable = useCallback(async (startDate: Date, endDate: Date) => {
    if (!vendor) return;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const updates: BulkUpdate[] = days
      .filter(day => !isWeekend(day) && !isDatePast(day) && !isDateBooked(day))
      .map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        isAvailable: false,
      }));
    
    await applyBulkUpdates(updates);
  }, [vendor, isDatePast, isDateBooked, applyBulkUpdates]);

  const markWeekendsUnavailable = useCallback(async (startDate: Date, endDate: Date) => {
    if (!vendor) return;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const updates: BulkUpdate[] = days
      .filter(day => isWeekend(day) && !isDatePast(day) && !isDateBooked(day))
      .map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        isAvailable: false,
      }));
    
    await applyBulkUpdates(updates);
  }, [vendor, isDatePast, isDateBooked, applyBulkUpdates]);

  const markDateRange = useCallback(async (startDate: Date, endDate: Date, isAvailable: boolean) => {
    if (!vendor) {
      toast.error('Vendor not found');
      return;
    }
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const updates: BulkUpdate[] = days
      .filter(day => !isDatePast(day) && !isDateBooked(day))
      .map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        isAvailable,
      }));
    
    if (updates.length === 0) {
      toast.error('No valid dates to update in the selected range');
      return;
    }
    
    console.log('[AvailabilityManager] markDateRange called:', {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      isAvailable,
      updateCount: updates.length
    });
    
    await applyBulkUpdates(updates);
  }, [vendor, isDatePast, isDateBooked, applyBulkUpdates]);

  const clearMonthOverrides = useCallback(async (month: Date) => {
    if (!vendor) return;
    
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const updates: BulkUpdate[] = days.map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      isAvailable: recurringPattern.defaultAvailable,
    }));
    
    await applyBulkUpdates(updates);
    toast.success('Month overrides cleared');
  }, [vendor, recurringPattern, applyBulkUpdates]);

  // Single date toggle
  const toggleDateAvailability = useCallback(async (date: Date) => {
    if (!vendor) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentStatus = getDateStatus(date);
    
    if (currentStatus === 'past' || currentStatus === 'booked') {
      return;
    }
    
    const newAvailability = currentStatus !== 'available';
    
    try {
      // Optimistic update using functional update
      setPendingChanges(prev => {
        const newPending = new Map(prev);
        newPending.set(dateStr, newAvailability);
        return newPending;
      });
      
      console.log('[AvailabilityManager] Toggling date:', {
        date: dateStr,
        currentStatus,
        newAvailability
      });
      
      const updateSuccess = await updateVendorAvailability(vendor.id, dateStr, newAvailability);
      
      if (!updateSuccess) {
        console.error('[AvailabilityManager] Failed to update availability:', {
          vendorId: vendor.id,
          date: dateStr,
          isAvailable: newAvailability,
          vendorUserId: vendor.user_id
        });
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to update availability. Please refresh the page.');
        }
        throw new Error('Failed to update availability. This may be a permissions issue. Please refresh the page and try again.');
      }
      
      // Invalidate and refetch queries to get updated data
      await queryClient.invalidateQueries({ queryKey: ['availability', vendor.id] });
      await queryClient.refetchQueries({ 
        queryKey: ['availability', vendor.id, startDateStr, endDateStr] 
      });
      
      // Keep the pending change - the useEffect will clear it when the data matches
      // This ensures the UI shows the correct state immediately and stays correct
      
      toast.success(`Date marked as ${newAvailability ? 'available' : 'unavailable'}`);
      onUpdate();
    } catch (error: any) {
      console.error('[AvailabilityManager] Toggle error:', error);
      toast.error('Failed to update availability');
      // Rollback using functional update
      setPendingChanges(prev => {
        const rolledBack = new Map(prev);
        rolledBack.delete(dateStr);
        return rolledBack;
      });
    }
  }, [vendor, getDateStatus, queryClient, onUpdate]);

  // Handle bulk action with confirmation
  const handleBulkAction = useCallback((action: () => Promise<void>, description: string) => {
    setPendingBulkAction(() => action);
    setShowBulkConfirm(true);
  }, []);

  const confirmBulkAction = useCallback(async () => {
    if (pendingBulkAction) {
      await pendingBulkAction();
      setPendingBulkAction(null);
      setShowBulkConfirm(false);
    }
  }, [pendingBulkAction]);

  // Handle date range update
  const handleDateRangeUpdate = useCallback(async (isAvailable: boolean) => {
    if (!dateRangeStart || !dateRangeEnd) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (!vendor) {
      toast.error('Vendor not found');
      return;
    }
    
    try {
      const start = parseISO(dateRangeStart);
      const end = parseISO(dateRangeEnd);
      
      if (isAfter(start, end)) {
        toast.error('Start date must be before end date');
        return;
      }
      
      console.log('[AvailabilityManager] Updating date range:', {
        start: dateRangeStart,
        end: dateRangeEnd,
        isAvailable,
        vendorId: vendor.id
      });
      
      await markDateRange(start, end, isAvailable);
      setDateRangeStart('');
      setDateRangeEnd('');
    } catch (error: any) {
      console.error('[AvailabilityManager] Date range update error:', error);
      toast.error(`Failed to update date range: ${error?.message || 'Unknown error'}`);
    }
  }, [dateRangeStart, dateRangeEnd, markDateRange, vendor]);

  // Calculate stats
  const stats = useMemo(() => getMonthStats(currentMonth), [currentMonth, getMonthStats]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth, getCalendarDays]);
  const isLoading = isLoadingAvailability || isLoadingBooked;

  // Generate month/year options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return { value: i, label: format(date, 'MMMM') };
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  }, [currentMonth]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCurrentMonth(subMonths(currentMonth, 1));
      } else if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCurrentMonth(addMonths(currentMonth, 1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentMonth]);

  return (
    <Card id="section-availability" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>
          Manage your calendar and availability below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!vendor && (
          <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please complete your vendor profile in the "About" section first.
            </p>
          </div>
        )}
        {isLoading && vendor ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : vendor ? (
          <>
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900/50 shadow-sm">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                  <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.available}</div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-500">Available Days</div>
                  <div className="text-xs text-green-600/70 dark:text-green-500/70 mt-1">
                    {Math.round((stats.available / stats.total) * 100)}% of month
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 shadow-sm">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                  <XCircle className="h-6 w-6 text-red-700 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.unavailable}</div>
                  <div className="text-sm font-medium text-red-600 dark:text-red-500">Unavailable Days</div>
                  <div className="text-xs text-red-600/70 dark:text-red-500/70 mt-1">
                    {Math.round((stats.unavailable / stats.total) * 100)}% of month
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/50 shadow-sm">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <Clock className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.booked}</div>
                  <div className="text-sm font-medium text-amber-600 dark:text-amber-500">Booked Days</div>
                  <div className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-1">
                    {Math.round((stats.booked / stats.total) * 100)}% of month
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Toolbar */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
              {/* Month Navigation */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="h-10 w-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <Select
                    value={getMonth(currentMonth).toString()}
                    onValueChange={(value) => {
                      setCurrentMonth(setMonth(currentMonth, parseInt(value)));
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-10 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={getYear(currentMonth).toString()}
                    onValueChange={(value) => {
                      setCurrentMonth(setYear(currentMonth, parseInt(value)));
                    }}
                  >
                    <SelectTrigger className="w-[110px] h-10 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="h-10 w-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                    className="h-10 gap-2 ml-2"
                  >
                    Today
                  </Button>
                </div>

                {/* Bulk Operations Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-10">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction(
                        () => markMonthAvailable(currentMonth),
                        'mark entire month as available'
                      )}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Month Available
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction(
                        () => markMonthUnavailable(currentMonth),
                        'mark entire month as unavailable'
                      )}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Mark Month Unavailable
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction(
                        () => markWeekdaysAvailable(monthStart, monthEnd),
                        'mark all weekdays as available'
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Weekdays Available
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction(
                        () => markWeekendsAvailable(monthStart, monthEnd),
                        'mark all weekends as available'
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Weekends Available
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction(
                        () => clearMonthOverrides(currentMonth),
                        'clear all overrides for this month'
                      )}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Month
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Date Range Picker */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Range:</span>
                </div>
                <Input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="w-[160px] h-9"
                  placeholder="Start date"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="w-[160px] h-9"
                  placeholder="End date"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeUpdate(true)}
                  disabled={!dateRangeStart || !dateRangeEnd}
                  className="h-9 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Available
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeUpdate(false)}
                  disabled={!dateRangeStart || !dateRangeEnd}
                  className="h-9 gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Mark Unavailable
                </Button>
              </div>
            </div>

            {/* Enhanced Calendar Grid */}
            <div className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-sm w-full min-w-0">
              {/* Day Headers */}
              <div className="flex bg-muted/70 border-b-2 border-border">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div 
                    key={day} 
                    className={cn(
                      "flex-1 text-center text-sm font-bold text-muted-foreground py-4 whitespace-nowrap",
                      index < 6 && "border-r border-border"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {calendarDays.map((day, index) => {
                  const status = getDateStatus(day);
                  const isCurrentMonthDay = isCurrentMonth(day);
                  const isTodayDate = isToday(day);
                  const dayNumber = format(day, 'd');
                  const dateStr = format(day, 'yyyy-MM-dd');

                  return (
                    <div
                      key={day.toISOString()}
                      className="relative"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleDateAvailability(day)}
                              disabled={status === 'past' || status === 'booked' || !isCurrentMonthDay}
                              className={cn(
                                "relative min-h-[100px] w-full flex flex-col items-start justify-start p-4 text-sm",
                                "transition-all duration-150 ease-out",
                                "focus:outline-none",
                                // Base state - subtle surface treatment
                                !isCurrentMonthDay && "bg-muted/5 text-muted-foreground/30 cursor-not-allowed",
                                // Available: green tint background + visual feedback
                                status === 'available' && isCurrentMonthDay && [
                                  "bg-green-50/60 dark:bg-green-950/20 cursor-pointer",
                                  "shadow-sm hover:shadow-md",
                                  "hover:-translate-y-0.5",
                                  "hover:bg-green-50/80 dark:hover:bg-green-950/30"
                                ],
                                // Booked: warm neutral tint (2-4% amber)
                                status === 'booked' && isCurrentMonthDay && [
                                  "bg-amber-50/30 dark:bg-amber-950/10 cursor-not-allowed",
                                  "text-muted-foreground/70"
                                ],
                                // Unavailable: red/gray tint + clear visual distinction
                                status === 'unavailable' && isCurrentMonthDay && [
                                  "bg-red-50/40 dark:bg-red-950/15 cursor-pointer",
                                  "text-muted-foreground/70",
                                  "hover:bg-red-50/60 dark:hover:bg-red-950/25",
                                  "hover:shadow-sm hover:-translate-y-0.5"
                                ],
                                // Past dates
                                status === 'past' && "bg-muted/5 text-muted-foreground/30 cursor-not-allowed"
                              )}
                            >
                              <div className="w-full flex items-start justify-between">
                                <span className={cn(
                                  "text-lg font-medium",
                                  !isCurrentMonthDay && "text-muted-foreground/30",
                                  status === 'available' && isCurrentMonthDay && "text-foreground",
                                  status === 'unavailable' && isCurrentMonthDay && "text-muted-foreground/70",
                                  status === 'booked' && isCurrentMonthDay && "text-muted-foreground/70"
                                )}>
                                  {dayNumber}
                                </span>
                                {isCurrentMonthDay && status !== 'past' && (
                                  <div className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5",
                                    status === 'available' && "bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
                                    status === 'unavailable' && "bg-red-100/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
                                    status === 'booked' && "bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700"
                                  )}>
                                    {status === 'available' && <CheckCircle2 className="h-2.5 w-2.5" />}
                                    {status === 'unavailable' && <XCircle className="h-2.5 w-2.5" />}
                                    {status === 'booked' && <Clock className="h-2.5 w-2.5" />}
                                    <span>
                                      {status === 'available' && 'Available'}
                                      {status === 'unavailable' && 'Unavailable'}
                                      {status === 'booked' && 'Booked'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {isTodayDate && isCurrentMonthDay && (
                                <span className="text-xs text-muted-foreground mt-auto px-2 py-0.5 rounded-full bg-muted/40 dark:bg-muted/60 font-normal">
                                  Today
                                </span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="animate-in fade-in-0 duration-150">
                            <p className="font-semibold">{format(day, 'EEEE, MMMM d, yyyy')}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {status === 'available' && 'Available'}
                              {status === 'unavailable' && 'Unavailable'}
                              {status === 'booked' && 'Booked'}
                              {status === 'past' && 'Past date'}
                            </p>
                            {status === 'available' && isCurrentMonthDay && (
                              <p className="text-xs text-muted-foreground mt-1 font-medium">
                                Click to mark as unavailable
                              </p>
                            )}
                            {status === 'unavailable' && isCurrentMonthDay && (
                              <p className="text-xs text-muted-foreground mt-1 font-medium">
                                Click to mark as available
                              </p>
                            )}
                            {status === 'booked' && isCurrentMonthDay && (
                              <p className="text-xs text-muted-foreground mt-1">
                                This date is booked and cannot be changed
                              </p>
                            )}
                            {status === 'past' && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Past dates cannot be modified
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Minimal Legend - Modern Approach */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground pt-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-50/60 dark:bg-green-950/20 border-l-2 border-l-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-50/40 dark:bg-red-950/15 border-l-2 border-l-red-500" />
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-50/30 dark:bg-amber-950/10 border-l-2 border-l-amber-500" />
                <span>Booked</span>
              </div>
              <div className="text-muted-foreground/70">
                <span className="font-medium">Tip:</span> Click any date to toggle availability
              </div>
              <div className="ml-auto text-muted-foreground/60">
                <kbd className="px-1.5 py-0.5 text-xs font-medium text-muted-foreground bg-muted/50 border border-border/50 rounded">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-xs font-medium text-muted-foreground bg-muted/50 border border-border/50 rounded ml-1">←</kbd>
                <kbd className="px-1.5 py-0.5 text-xs font-medium text-muted-foreground bg-muted/50 border border-border/50 rounded ml-1">→</kbd>
                <span className="ml-2">Navigate</span>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>

      {/* Settings Panel - Slide-out Drawer */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Availability Settings</SheetTitle>
            <SheetDescription>
              Configure default availability patterns and recurring rules
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Default Availability */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Default Availability</Label>
              <Select
                value={recurringPattern.defaultAvailable ? 'available' : 'unavailable'}
                onValueChange={(value) => {
                  setRecurringPattern({
                    ...recurringPattern,
                    defaultAvailable: value === 'available',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available by default</SelectItem>
                  <SelectItem value="unavailable">Unavailable by default</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Dates without explicit settings will use this default state
              </p>
            </div>

            {/* Recurring Patterns */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Recurring Patterns</Label>
              
              {/* Auto-mark Weekends */}
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto-mark Weekends</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically set weekend availability
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={recurringPattern.autoMarkWeekends || false}
                    onChange={(e) => {
                      setRecurringPattern({
                        ...recurringPattern,
                        autoMarkWeekends: e.target.checked,
                      });
                    }}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                </div>
                {recurringPattern.autoMarkWeekends && (
                  <Select
                    value={recurringPattern.autoMarkWeekendsValue ? 'available' : 'unavailable'}
                    onValueChange={(value) => {
                      setRecurringPattern({
                        ...recurringPattern,
                        autoMarkWeekendsValue: value === 'available',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Weekends Available</SelectItem>
                      <SelectItem value="unavailable">Weekends Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Auto-mark Weekdays */}
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto-mark Weekdays</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically set weekday availability
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={recurringPattern.autoMarkWeekdays || false}
                    onChange={(e) => {
                      setRecurringPattern({
                        ...recurringPattern,
                        autoMarkWeekdays: e.target.checked,
                      });
                    }}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                </div>
                {recurringPattern.autoMarkWeekdays && (
                  <Select
                    value={recurringPattern.autoMarkWeekdaysValue ? 'available' : 'unavailable'}
                    onValueChange={(value) => {
                      setRecurringPattern({
                        ...recurringPattern,
                        autoMarkWeekdaysValue: value === 'available',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Weekdays Available</SelectItem>
                      <SelectItem value="unavailable">Weekdays Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bulk Action Confirmation */}
      <Sheet open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Confirm Bulk Action</SheetTitle>
            <SheetDescription>
              Are you sure you want to perform this bulk operation? This action will update multiple dates at once.
            </SheetDescription>
          </SheetHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkConfirm(false);
                setPendingBulkAction(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkAction}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
