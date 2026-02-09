'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Calendar,
  Users,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  FileText,
  Activity,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getVendorDashboardMetrics,
  getVendorRevenueChart,
  getVendorRecentActivity,
  getVendorRecentBookings,
  getVendorRecentMessages,
} from '@/lib/supabase/business';
import type {
  DashboardMetrics,
  RevenueChartPoint,
  RecentActivityItem,
  RecentBooking,
  RecentMessagePreview,
} from '@/lib/supabase/business';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'info' | 'secondary' => {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'pending':
      return 'warning';
    case 'responded':
      return 'info';
    default:
      return 'secondary';
  }
};

// Activity type icon mapping
const activityIcon = (type: RecentActivityItem['type']) => {
  switch (type) {
    case 'inquiry':
      return <MessageSquare className="h-4 w-4 text-accent-info" />;
    case 'invoice':
      return <FileText className="h-4 w-4 text-accent-warning" />;
    case 'payment':
      return <DollarSign className="h-4 w-4 text-accent-success" />;
    case 'review':
      return <Star className="h-4 w-4 text-yellow-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

// Metric card colors - Accent colors only for indicators (not backgrounds)
const metricColors = {
  revenue: {
    icon: 'text-muted-foreground group-hover:text-accent-primary',
  },
  bookings: {
    icon: 'text-muted-foreground group-hover:text-accent-primary',
  },
  clients: {
    icon: 'text-muted-foreground group-hover:text-accent-primary',
  },
  rating: {
    icon: 'text-muted-foreground group-hover:text-accent-primary',
  },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-TZ', { month: 'short', day: 'numeric' });
}

type TimePeriod = 'weekly' | 'monthly';

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const { vendorId } = useVendorPortalAccess();
  const supabase = useClerkSupabaseClient();

  // --- Data queries ---

  const {
    data: metrics,
    isLoading: isMetricsLoading,
  } = useQuery<DashboardMetrics>({
    queryKey: ['vendor-dashboard-metrics', vendorId],
    queryFn: () => getVendorDashboardMetrics(vendorId!, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  const {
    data: chartData,
    isLoading: isChartLoading,
  } = useQuery<RevenueChartPoint[]>({
    queryKey: ['vendor-revenue-chart', vendorId, timePeriod],
    queryFn: () => getVendorRevenueChart(vendorId!, timePeriod, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  const {
    data: recentActivity,
    isLoading: isActivityLoading,
  } = useQuery<RecentActivityItem[]>({
    queryKey: ['vendor-recent-activity', vendorId],
    queryFn: () => getVendorRecentActivity(vendorId!, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  const {
    data: recentBookings,
    isLoading: isBookingsLoading,
  } = useQuery<RecentBooking[]>({
    queryKey: ['vendor-recent-bookings', vendorId],
    queryFn: () => getVendorRecentBookings(vendorId!, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  const {
    data: recentMessages,
    isLoading: isMessagesLoading,
  } = useQuery<RecentMessagePreview[]>({
    queryKey: ['vendor-recent-messages', vendorId],
    queryFn: () => getVendorRecentMessages(vendorId!, supabase),
    enabled: !!vendorId,
    staleTime: 60_000,
  });

  // --- Derived chart calculations ---

  const totalRevenue = (chartData || []).reduce((sum, pt) => sum + pt.revenue, 0);
  const previousTotalRevenue = (chartData || []).reduce((sum, pt) => sum + pt.previous, 0);
  const averageRevenue =
    chartData && chartData.length > 0 ? Math.round(totalRevenue / chartData.length) : 0;
  const previousAverageRevenue =
    chartData && chartData.length > 0
      ? Math.round(previousTotalRevenue / chartData.length)
      : 0;

  const growthPercentage =
    previousTotalRevenue > 0
      ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
      : 0;
  const isPositiveGrowth = growthPercentage >= 0;

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'weekly':
        return 'vs last week';
      case 'monthly':
        return 'vs previous period';
      default:
        return 'vs previous period';
    }
  };

  const hasChartData = (chartData || []).some((pt) => pt.revenue > 0 || pt.previous > 0);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.01em]">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Overview of your vendor storefront performance.
          </p>
        </div>
      </div>

      {/* Stats Grid - KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign
              className={`h-4 w-4 transition-colors ${metricColors.revenue.icon}`}
            />
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">
                  {formatCurrency(metrics?.totalRevenue ?? 0)}
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  {metrics?.totalRevenue === 0
                    ? 'No revenue yet'
                    : 'Lifetime earnings'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Inquiries */}
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Inquiries
            </CardTitle>
            <Calendar
              className={`h-4 w-4 transition-colors ${metricColors.bookings.icon}`}
            />
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">
                  {metrics?.activeInquiries ?? 0}
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  {(metrics?.activeInquiries ?? 0) === 0
                    ? 'No active inquiries'
                    : 'Pending & responded'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Unique Clients */}
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Clients
            </CardTitle>
            <Users
              className={`h-4 w-4 transition-colors ${metricColors.clients.icon}`}
            />
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">
                  {metrics?.uniqueClients ?? 0}
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  {(metrics?.uniqueClients ?? 0) === 0
                    ? 'No clients yet'
                    : 'From all inquiries'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <Star
              className={`h-4 w-4 transition-colors ${metricColors.rating.icon}`}
            />
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold text-primary">
                  {(metrics?.averageRating ?? 0) > 0
                    ? (metrics!.averageRating).toFixed(1)
                    : '--'}
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  {(metrics?.reviewCount ?? 0) > 0
                    ? `${metrics!.reviewCount} review${metrics!.reviewCount === 1 ? '' : 's'}`
                    : 'No reviews yet'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview Chart */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground tracking-tight">
                Revenue Overview
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Track your revenue performance over time
              </CardDescription>
            </div>
            <Tabs
              value={timePeriod}
              onValueChange={(value) => setTimePeriod(value as TimePeriod)}
            >
              <TabsList className="bg-muted border border-border h-9 gap-1 p-1">
                <TabsTrigger
                  value="weekly"
                  className="text-xs px-3 py-1 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all duration-160"
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="text-xs px-3 py-1 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all duration-160"
                >
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Key Metrics with Growth Indicators */}
          {isChartLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-border-subtle">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-border-subtle">
              {/* Total Revenue */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Revenue
                  </p>
                  {hasChartData &&
                    (isPositiveGrowth ? (
                      <TrendingUp className="h-3.5 w-3.5 text-accent-success" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-accent-warning" />
                    ))}
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(totalRevenue)}
                </p>
                {hasChartData ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-medium ${
                        isPositiveGrowth ? 'text-accent-success' : 'text-accent-warning'
                      }`}
                    >
                      {isPositiveGrowth ? '+' : ''}
                      {growthPercentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getPeriodLabel()}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No data yet</p>
                )}
              </div>

              {/* Average Revenue */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Average
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(averageRevenue)}
                </p>
                {hasChartData ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-medium ${
                        averageRevenue >= previousAverageRevenue
                          ? 'text-accent-success'
                          : 'text-accent-warning'
                      }`}
                    >
                      {averageRevenue >= previousAverageRevenue ? '+' : ''}
                      {previousAverageRevenue > 0
                        ? (
                            ((averageRevenue - previousAverageRevenue) /
                              previousAverageRevenue) *
                            100
                          ).toFixed(1)
                        : '0.0'}
                      %
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getPeriodLabel()}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No data yet</p>
                )}
              </div>

              {/* Peak Revenue */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Peak
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {hasChartData
                    ? formatCurrency(Math.max(...(chartData || []).map((d) => d.revenue)))
                    : formatCurrency(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {timePeriod === 'weekly' && 'Highest day'}
                  {timePeriod === 'monthly' && 'Best month'}
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {isChartLoading ? (
            <Skeleton className="h-[340px] w-full rounded-lg" />
          ) : !hasChartData ? (
            <div className="h-[340px] w-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <DollarSign className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Your revenue will appear here once you start receiving payments
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(chartData || []).map((pt) => ({
                    name: pt.label,
                    revenue: pt.revenue,
                    previous: pt.previous,
                  }))}
                  margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--muted-foreground))"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--muted-foreground))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickMargin={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => {
                      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                      return value.toString();
                    }}
                    width={60}
                  />
                  <Tooltip
                    cursor={{
                      stroke: 'hsl(var(--border))',
                      strokeWidth: 1,
                      strokeDasharray: '3 3',
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const revenue =
                          (payload.find((p) => p.dataKey === 'revenue')
                            ?.value as number) || 0;
                        const previous =
                          (payload.find((p) => p.dataKey === 'previous')
                            ?.value as number) || 0;
                        const change =
                          previous > 0
                            ? ((revenue - previous) / previous) * 100
                            : 0;

                        return (
                          <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-semibold text-popover-foreground mb-2">
                              {label}
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">
                                  Revenue
                                </span>
                                <span className="text-sm font-semibold text-popover-foreground">
                                  {formatCurrency(revenue)}
                                </span>
                              </div>
                              {previous > 0 && (
                                <>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-muted-foreground">
                                      Previous
                                    </span>
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {formatCurrency(previous)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                                    <span className="text-xs text-muted-foreground">
                                      Change
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${
                                        change >= 0
                                          ? 'text-accent-success'
                                          : 'text-accent-warning'
                                      }`}
                                    >
                                      {change >= 0 ? '+' : ''}
                                      {change.toFixed(1)}%
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    fill="url(#colorPrevious)"
                    fillOpacity={0.3}
                    name="Previous"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Latest inquiries and client interactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isActivityLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center min-h-[44px]">
                  <Skeleton className="h-9 w-9 rounded-full mr-4 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              ))}
            </div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Your recent activity will show up here as clients interact with your
                storefront
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center group/item min-h-[44px]"
                >
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mr-4 border border-border-subtle transition-colors group-hover/item:border-border">
                    {activityIcon(item.type)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none text-primary">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Bookings + Recent Messages */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your upcoming and recent events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isBookingsLoading ? (
              <div className="space-y-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 min-h-[44px]"
                  >
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                    <div className="text-right space-y-1.5">
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !recentBookings || recentBookings.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Bookings will appear here once clients send inquiries
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-3 px-3 -mx-3 min-h-[44px] transition-colors hover:bg-muted rounded-lg group/item"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-primary">
                        {booking.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.eventType}
                        {booking.eventDate &&
                          ` \u2022 ${new Date(booking.eventDate).toLocaleDateString('en-TZ', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      {booking.amount > 0 && (
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency(booking.amount)}
                        </p>
                      )}
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">Recent Messages</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Latest client communications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMessagesLoading ? (
              <div className="space-y-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 min-h-[44px]">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !recentMessages || recentMessages.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Messages from clients will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {recentMessages.map((message) => (
                  <div
                    key={message.threadId}
                    className="flex items-start gap-3 py-3 px-3 -mx-3 min-h-[44px] transition-colors hover:bg-muted rounded-lg group/item"
                  >
                    {message.userAvatar ? (
                      <img
                        src={message.userAvatar}
                        alt={message.userName}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border border-border-subtle flex-shrink-0 transition-colors group-hover/item:border-border">
                        {message.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none text-primary">
                          {message.userName}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(message.timestamp)}
                          </p>
                          {message.unread && (
                            <div className="h-2 w-2 rounded-full bg-accent-primary" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {message.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
