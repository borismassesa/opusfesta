'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Calendar,
  Users,
  Star,
  MessageSquare,
  Eye,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { LineChart, Line, Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

// Mock data for different time periods with previous period for comparison
const WEEKLY_DATA = [
  { name: 'Mon', revenue: 2400, previous: 2100 },
  { name: 'Tue', revenue: 1800, previous: 1900 },
  { name: 'Wed', revenue: 3200, previous: 2800 },
  { name: 'Thu', revenue: 2800, previous: 2600 },
  { name: 'Fri', revenue: 1900, previous: 2200 },
  { name: 'Sat', revenue: 3500, previous: 3200 },
  { name: 'Sun', revenue: 2900, previous: 2700 },
];

const BIWEEKLY_DATA = [
  { name: 'Week 1', revenue: 18500, previous: 16200 },
  { name: 'Week 2', revenue: 21200, previous: 18900 },
];

const MONTHLY_DATA = [
  { name: 'Jan', revenue: 45000, previous: 42000 },
  { name: 'Feb', revenue: 52000, previous: 45000 },
  { name: 'Mar', revenue: 48000, previous: 52000 },
  { name: 'Apr', revenue: 61000, previous: 48000 },
  { name: 'May', revenue: 55000, previous: 61000 },
  { name: 'Jun', revenue: 67000, previous: 55000 },
];

// Mock activity data
const RECENT_ACTIVITY = [
  { user: 'Sarah M.', action: 'Sent inquiry for wedding', time: '2m ago', avatar: 'SM' },
  { user: 'Grace K.', action: 'Booked your service', time: '15m ago', avatar: 'GK' },
  { user: 'Michael D.', action: 'Left a 5-star review', time: '1h ago', avatar: 'MD' },
  { user: 'Lisa P.', action: 'Requested quote', time: '3h ago', avatar: 'LP' },
  { user: 'David W.', action: 'Viewed your storefront', time: '5h ago', avatar: 'DW' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Status color helper - Using accent system
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'text-accent-success';
    case 'pending':
      return 'text-accent-warning';
    case 'completed':
      return 'text-accent-info';
    default:
      return 'text-muted-foreground';
  }
};

// Metric card colors - Accent colors only for indicators (not backgrounds)
const metricColors = {
  revenue: { icon: 'text-muted-foreground group-hover:text-accent-primary', delta: 'text-accent-success', accent: 'hsl(var(--chart-2))' },
  bookings: { icon: 'text-muted-foreground group-hover:text-accent-primary', delta: 'text-accent-success', accent: 'hsl(var(--chart-2))' },
  clients: { icon: 'text-muted-foreground group-hover:text-accent-primary', delta: 'text-accent-success', accent: 'hsl(var(--chart-2))' },
  rating: { icon: 'text-muted-foreground group-hover:text-accent-primary', delta: 'text-accent-success', accent: 'hsl(var(--chart-2))' },
};

type TimePeriod = 'weekly' | 'monthly';

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const currentDay = new Date().getDay() - 1; // 0 = Monday, 6 = Sunday

  // Get data based on selected time period
  const getChartData = () => {
    switch (timePeriod) {
      case 'weekly':
        return WEEKLY_DATA;
      case 'monthly':
        return MONTHLY_DATA;
      default:
        return WEEKLY_DATA;
    }
  };

  const chartData = getChartData();
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const previousTotalRevenue = chartData.reduce((sum, item) => sum + (item.previous || 0), 0);
  const averageRevenue = Math.round(totalRevenue / chartData.length);
  const previousAverageRevenue = Math.round(previousTotalRevenue / chartData.length);
  
  // Calculate growth percentage
  const growthPercentage = previousTotalRevenue > 0 
    ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 
    : 0;
  const isPositiveGrowth = growthPercentage >= 0;
  
  // Get period label for comparison
  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'weekly':
        return 'vs last week';
      case 'monthly':
        return 'vs previous month';
      default:
        return 'vs previous period';
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.01em]">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Overview of your vendor storefront performance.</p>
        </div>
      </div>

      {/* Stats Grid - KPI Cards with Subtle Gradient */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className={`h-4 w-4 transition-colors ${metricColors.revenue.icon}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">{formatCurrency(2450000)}</div>
            <p className={`text-xs mt-1 font-medium ${metricColors.revenue.delta}`}>+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <Calendar className={`h-4 w-4 transition-colors ${metricColors.bookings.icon}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">24</div>
            <p className={`text-xs mt-1 font-medium ${metricColors.bookings.delta}`}>+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <Users className={`h-4 w-4 transition-colors ${metricColors.clients.icon}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">156</div>
            <p className={`text-xs mt-1 font-medium ${metricColors.clients.delta}`}>+5.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="kpi-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className={`h-4 w-4 transition-colors ${metricColors.rating.icon}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-primary">4.8</div>
            <p className={`text-xs mt-1 font-medium ${metricColors.rating.delta}`}>+0.2 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview Chart - Redesigned with Theme Tokens */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground tracking-tight">Revenue Overview</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Track your revenue performance over time
              </CardDescription>
            </div>
            <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-border-subtle">
            {/* Total Revenue */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                {isPositiveGrowth ? (
                  <TrendingUp className="h-3.5 w-3.5 text-accent-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-accent-warning" />
                )}
              </div>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-medium ${isPositiveGrowth ? 'text-accent-success' : 'text-accent-warning'}`}>
                  {isPositiveGrowth ? '+' : ''}{growthPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">{getPeriodLabel()}</span>
              </div>
            </div>

            {/* Average Revenue */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Average</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(averageRevenue)}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-medium ${averageRevenue >= previousAverageRevenue ? 'text-accent-success' : 'text-accent-warning'}`}>
                  {averageRevenue >= previousAverageRevenue ? '+' : ''}
                  {previousAverageRevenue > 0 
                    ? (((averageRevenue - previousAverageRevenue) / previousAverageRevenue) * 100).toFixed(1)
                    : '0.0'}%
                </span>
                <span className="text-xs text-muted-foreground">{getPeriodLabel()}</span>
              </div>
            </div>

            {/* Peak Revenue */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Peak</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(Math.max(...chartData.map(d => d.revenue)))}
              </p>
              <p className="text-xs text-muted-foreground">
                {timePeriod === 'weekly' && 'Highest day'}
                {timePeriod === 'monthly' && 'Best month'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
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
                  cursor={{stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3'}}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const revenue = payload.find(p => p.dataKey === 'revenue')?.value as number || 0;
                      const previous = payload.find(p => p.dataKey === 'previous')?.value as number || 0;
                      const change = previous > 0 ? ((revenue - previous) / previous) * 100 : 0;
                      
                      return (
                        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                          <p className="text-sm font-semibold text-popover-foreground mb-2">{label}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs text-muted-foreground">Revenue</span>
                              <span className="text-sm font-semibold text-popover-foreground">{formatCurrency(revenue)}</span>
                            </div>
                            {previous > 0 && (
                              <>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-xs text-muted-foreground">Previous</span>
                                  <span className="text-sm font-medium text-muted-foreground">{formatCurrency(previous)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                                  <span className="text-xs text-muted-foreground">Change</span>
                                  <span className={`text-sm font-medium ${change >= 0 ? 'text-accent-success' : 'text-accent-warning'}`}>
                                    {change >= 0 ? '+' : ''}{change.toFixed(1)}%
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
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Latest inquiries and client interactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center group/item min-h-[44px]">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground mr-4 border border-border-subtle transition-colors group-hover/item:border-border">
                  {item.avatar}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none text-primary">{item.user}</p>
                  <p className="text-xs text-muted-foreground">{item.action}</p>
                </div>
                <div className="ml-auto font-medium text-xs text-muted-foreground">{item.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Your upcoming and recent events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {[
                { client: 'Sarah & Michael', event: 'Wedding', date: 'Mar 15, 2024', status: 'confirmed', amount: 850000 },
                { client: 'Grace & David', event: 'Kitchen Party', date: 'Mar 22, 2024', status: 'pending', amount: 450000 },
                { client: 'Mary & James', event: 'Sendoff', date: 'Mar 28, 2024', status: 'completed', amount: 650000 },
              ].map((booking, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-3 -mx-3 min-h-[44px] transition-colors hover:bg-muted rounded-lg group/item">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-primary">{booking.client}</p>
                    <p className="text-xs text-muted-foreground">{booking.event} • {booking.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{formatCurrency(booking.amount)}</p>
                    <p className={`text-xs capitalize font-medium ${getStatusColor(booking.status)}`}>{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">Recent Messages</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Latest client communications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {[
                { client: 'Sarah M.', message: 'Hi! I love your portfolio. Are you available for my wedding in March?', time: '2 min ago', unread: true },
                { client: 'Grace K.', message: 'Thank you for the beautiful photos! When will the full gallery be ready?', time: '1 hour ago', unread: false },
                { client: 'Mary L.', message: 'Can we schedule a consultation call for next week?', time: '3 hours ago', unread: true },
              ].map((message, i) => (
                <div key={i} className="flex items-start gap-3 py-3 px-3 -mx-3 min-h-[44px] transition-colors hover:bg-muted rounded-lg group/item">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border border-border-subtle flex-shrink-0 transition-colors group-hover/item:border-border">
                    {message.client.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none text-primary">{message.client}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{message.time}</p>
                        {message.unread && (
                          <div className="h-2 w-2 rounded-full bg-accent-primary" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
