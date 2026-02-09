import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';

export type InquiryStatus = 'pending' | 'responded' | 'accepted' | 'declined' | 'closed';
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
export type InvoiceType = 'DEPOSIT' | 'FULL_PAYMENT' | 'BALANCE' | 'ADDITIONAL_SERVICE' | 'REFUND';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface VendorLeadRecord {
  id: string;
  vendor_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  event_type: string;
  event_date: string | null;
  guest_count: number | null;
  budget: string | null;
  location: string | null;
  message: string;
  status: InquiryStatus;
  vendor_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorInvoiceRecord {
  id: string;
  inquiry_id: string;
  vendor_id: string;
  user_id: string | null;
  invoice_number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  total_amount: number | string;
  paid_amount: number | string;
  currency: string;
  issue_date: string;
  due_date: string | null;
  paid_at: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  inquiry?: {
    id: string;
    name: string;
    email: string;
    event_type: string;
    event_date: string | null;
    status: InquiryStatus;
  } | null;
}

export interface VendorPaymentRecord {
  id: string;
  invoice_id: string;
  inquiry_id: string | null;
  user_id: string | null;
  vendor_id: string;
  amount: number | string;
  currency: string;
  method: string;
  status: PaymentStatus;
  provider: string;
  provider_ref: string | null;
  processed_at: string | null;
  failure_reason: string | null;
  platform_fee_amount: number | string | null;
  vendor_amount: number | string | null;
  transfer_status: string | null;
  transferred_at: string | null;
  created_at: string;
  updated_at: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number | string;
    status: InvoiceStatus;
    due_date: string | null;
  } | null;
}

export interface VendorPayoutRecord {
  id: string;
  vendor_id: string;
  amount: number | string;
  currency: string;
  method: string;
  status: PaymentStatus;
  provider: string;
  provider_ref: string | null;
  processed_at: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorRevenueSummary {
  total_revenue: number | string;
  total_platform_fees: number | string;
  total_payments: number | string;
  paid_out: number | string;
  pending_payout: number | string;
  payment_count: number;
}

export interface CreateInvoiceInput {
  vendorId: string;
  inquiryId: string;
  type: InvoiceType;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  dueDate?: string | null;
  description?: string | null;
  notes?: string | null;
}

function getDb(client?: SupabaseClient): SupabaseClient {
  return client || supabase;
}

export async function getVendorLeads(
  vendorId: string,
  client?: SupabaseClient
): Promise<VendorLeadRecord[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('inquiries')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data as VendorLeadRecord[];
}

export async function updateLeadStatus(
  leadId: string,
  status: InquiryStatus,
  vendorResponse: string | null,
  client?: SupabaseClient
): Promise<boolean> {
  const db = getDb(client);
  const updates: {
    status: InquiryStatus;
    vendor_response?: string | null;
    responded_at?: string | null;
  } = {
    status,
  };

  if (vendorResponse !== undefined) {
    const cleanResponse = vendorResponse?.trim();
    updates.vendor_response = cleanResponse ? cleanResponse : null;
  }

  if (status === 'responded' || status === 'accepted' || status === 'declined') {
    updates.responded_at = new Date().toISOString();
  }

  const { error } = await db.from('inquiries').update(updates).eq('id', leadId);
  return !error;
}

export async function getEligibleInquiriesForInvoices(
  vendorId: string,
  client?: SupabaseClient
): Promise<VendorLeadRecord[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('inquiries')
    .select('*')
    .eq('vendor_id', vendorId)
    .in('status', ['responded', 'accepted'])
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data as VendorLeadRecord[];
}

export async function getVendorInvoices(
  vendorId: string,
  client?: SupabaseClient
): Promise<VendorInvoiceRecord[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('invoices')
    .select(`
      *,
      inquiry:inquiries (
        id,
        name,
        email,
        event_type,
        event_date,
        status
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data as unknown as VendorInvoiceRecord[];
}

export async function createVendorInvoice(
  input: CreateInvoiceInput,
  client?: SupabaseClient
): Promise<VendorInvoiceRecord | null> {
  const db = getDb(client);
  const taxAmount = input.taxAmount ?? 0;
  const discountAmount = input.discountAmount ?? 0;
  const totalAmount = input.subtotal + taxAmount - discountAmount;

  if (totalAmount < 0) {
    throw new Error('Invoice total cannot be negative');
  }

  const { data: inquiry, error: inquiryError } = await db
    .from('inquiries')
    .select('id, vendor_id, user_id')
    .eq('id', input.inquiryId)
    .eq('vendor_id', input.vendorId)
    .maybeSingle();

  if (inquiryError || !inquiry) {
    throw new Error('Selected inquiry was not found for this vendor');
  }

  const { data: invoiceNumber, error: invoiceNumberError } = await db.rpc('generate_invoice_number');
  if (invoiceNumberError || !invoiceNumber) {
    throw new Error('Failed to generate an invoice number');
  }

  const issueDate = new Date().toISOString().slice(0, 10);
  const dueDate = input.dueDate || null;

  const { data, error } = await db
    .from('invoices')
    .insert({
      inquiry_id: inquiry.id,
      vendor_id: input.vendorId,
      user_id: inquiry.user_id,
      invoice_number: invoiceNumber,
      type: input.type,
      status: 'DRAFT',
      subtotal: input.subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      paid_amount: 0,
      issue_date: issueDate,
      due_date: dueDate,
      description: input.description?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create invoice');
  }

  return data as VendorInvoiceRecord;
}

export async function getVendorPayments(
  vendorId: string,
  client?: SupabaseClient
): Promise<VendorPaymentRecord[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('payments')
    .select(`
      *,
      invoice:invoices (
        id,
        invoice_number,
        total_amount,
        status,
        due_date
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  return data as unknown as VendorPaymentRecord[];
}

export async function getVendorPayouts(
  vendorId: string,
  client?: SupabaseClient
): Promise<VendorPayoutRecord[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('payouts')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  return data as VendorPayoutRecord[];
}

export async function getVendorRevenueSummary(
  vendorId: string,
  client?: SupabaseClient
): Promise<VendorRevenueSummary> {
  const db = getDb(client);
  const { data, error } = await db.rpc('get_vendor_revenue_summary', {
    vendor_uuid: vendorId,
    start_date: null,
    end_date: null,
  });

  if (error || !Array.isArray(data) || data.length === 0) {
    return {
      total_revenue: 0,
      total_platform_fees: 0,
      total_payments: 0,
      paid_out: 0,
      pending_payout: 0,
      payment_count: 0,
    };
  }

  return data[0] as VendorRevenueSummary;
}

// === Dashboard Query Functions ===

export interface DashboardMetrics {
  totalRevenue: number;
  activeInquiries: number;
  uniqueClients: number;
  averageRating: number;
  reviewCount: number;
}

export async function getVendorDashboardMetrics(
  vendorId: string,
  client?: SupabaseClient
): Promise<DashboardMetrics> {
  const db = getDb(client);

  // Run all queries in parallel
  const [revenueResult, inquiriesResult, vendorResult] = await Promise.all([
    // Total revenue from vendor_revenue
    db
      .from('vendor_revenue')
      .select('amount')
      .eq('vendor_id', vendorId),

    // Active inquiries (pending or responded) + unique client count
    db
      .from('inquiries')
      .select('id, user_id, status')
      .eq('vendor_id', vendorId),

    // Vendor stats for rating
    db
      .from('vendors')
      .select('stats')
      .eq('id', vendorId)
      .single(),
  ]);

  // Calculate total revenue
  const totalRevenue = (revenueResult.data || []).reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  );

  // Count active inquiries and unique clients
  const allInquiries = inquiriesResult.data || [];
  const activeInquiries = allInquiries.filter(
    (inq) => inq.status === 'pending' || inq.status === 'responded'
  ).length;

  const uniqueUserIds = new Set(
    allInquiries
      .map((inq) => inq.user_id)
      .filter((uid): uid is string => uid !== null)
  );
  const uniqueClients = uniqueUserIds.size;

  // Extract rating from vendor stats JSONB
  const stats = vendorResult.data?.stats as
    | { averageRating?: number; reviewCount?: number }
    | null
    | undefined;
  const averageRating = Number(stats?.averageRating) || 0;
  const reviewCount = Number(stats?.reviewCount) || 0;

  return {
    totalRevenue,
    activeInquiries,
    uniqueClients,
    averageRating,
    reviewCount,
  };
}

export interface RevenueChartPoint {
  label: string;
  revenue: number;
  previous: number;
}

export async function getVendorRevenueChart(
  vendorId: string,
  period: 'weekly' | 'monthly',
  client?: SupabaseClient
): Promise<RevenueChartPoint[]> {
  const db = getDb(client);
  const now = new Date();

  if (period === 'weekly') {
    // Current week (Mon-Sun) and previous week
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - diffToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    // Fetch revenue for current and previous week
    const [currentResult, previousResult] = await Promise.all([
      db
        .from('vendor_revenue')
        .select('amount, created_at')
        .eq('vendor_id', vendorId)
        .gte('created_at', currentWeekStart.toISOString())
        .lt('created_at', currentWeekEnd.toISOString()),
      db
        .from('vendor_revenue')
        .select('amount, created_at')
        .eq('vendor_id', vendorId)
        .gte('created_at', previousWeekStart.toISOString())
        .lt('created_at', currentWeekStart.toISOString()),
    ]);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Group by day of week
    const currentByDay: Record<number, number> = {};
    const previousByDay: Record<number, number> = {};

    for (const row of currentResult.data || []) {
      const d = new Date(row.created_at);
      const dow = d.getDay();
      const idx = dow === 0 ? 6 : dow - 1; // Mon=0, Sun=6
      currentByDay[idx] = (currentByDay[idx] || 0) + (Number(row.amount) || 0);
    }

    for (const row of previousResult.data || []) {
      const d = new Date(row.created_at);
      const dow = d.getDay();
      const idx = dow === 0 ? 6 : dow - 1;
      previousByDay[idx] = (previousByDay[idx] || 0) + (Number(row.amount) || 0);
    }

    return dayLabels.map((label, idx) => ({
      label,
      revenue: currentByDay[idx] || 0,
      previous: previousByDay[idx] || 0,
    }));
  } else {
    // Monthly: last 6 months vs the 6 months before that
    const months: RevenueChartPoint[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    // Fetch revenue for the last 12 months in a single query
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const { data: revenueData } = await db
      .from('vendor_revenue')
      .select('amount, created_at')
      .eq('vendor_id', vendorId)
      .gte('created_at', twelveMonthsAgo.toISOString());

    // Group by year-month
    const byMonth: Record<string, number> = {};
    for (const row of revenueData || []) {
      const d = new Date(row.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + (Number(row.amount) || 0);
    }

    // Build the last 6 months with previous 6 months for comparison
    for (let i = 5; i >= 0; i--) {
      const currentMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - i - 6, 1);

      const currentKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()).padStart(2, '0')}`;
      const previousKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth()).padStart(2, '0')}`;

      months.push({
        label: monthNames[currentMonth.getMonth()],
        revenue: byMonth[currentKey] || 0,
        previous: byMonth[previousKey] || 0,
      });
    }

    return months;
  }
}

export interface RecentActivityItem {
  id: string;
  type: 'inquiry' | 'invoice' | 'payment' | 'review';
  title: string;
  description: string;
  timestamp: string;
  userName?: string;
}

export async function getVendorRecentActivity(
  vendorId: string,
  client?: SupabaseClient
): Promise<RecentActivityItem[]> {
  const db = getDb(client);

  // Fetch recent items from each table in parallel
  const [inquiriesResult, invoicesResult, paymentsResult, reviewsResult] =
    await Promise.all([
      db
        .from('inquiries')
        .select('id, name, event_type, status, created_at')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(5),
      db
        .from('invoices')
        .select('id, invoice_number, status, total_amount, created_at, updated_at')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(5),
      db
        .from('payments')
        .select('id, amount, status, created_at')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(5),
      db
        .from('reviews')
        .select('id, rating, title, content, created_at, user:users(name)')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  const items: RecentActivityItem[] = [];

  // Map inquiries
  for (const inq of inquiriesResult.data || []) {
    items.push({
      id: `inquiry-${inq.id}`,
      type: 'inquiry',
      title: 'New inquiry',
      description: `${inq.name} sent an inquiry for ${inq.event_type || 'an event'}`,
      timestamp: inq.created_at,
      userName: inq.name,
    });
  }

  // Map invoices
  for (const inv of invoicesResult.data || []) {
    const statusLabel =
      inv.status === 'PAID'
        ? 'was paid'
        : inv.status === 'PENDING'
          ? 'is pending'
          : inv.status === 'OVERDUE'
            ? 'is overdue'
            : 'was updated';
    items.push({
      id: `invoice-${inv.id}`,
      type: 'invoice',
      title: `Invoice ${inv.invoice_number}`,
      description: `Invoice #${inv.invoice_number} ${statusLabel}`,
      timestamp: inv.updated_at || inv.created_at,
    });
  }

  // Map payments
  for (const pay of paymentsResult.data || []) {
    items.push({
      id: `payment-${pay.id}`,
      type: 'payment',
      title: 'Payment received',
      description: `Payment of ${Number(pay.amount).toLocaleString()} received`,
      timestamp: pay.created_at,
    });
  }

  // Map reviews
  for (const rev of reviewsResult.data || []) {
    const userName =
      (rev.user as unknown as { name?: string } | null)?.name || 'A client';
    items.push({
      id: `review-${rev.id}`,
      type: 'review',
      title: `${rev.rating}-star review`,
      description: `${userName} left a ${rev.rating}-star review${rev.title ? `: "${rev.title}"` : ''}`,
      timestamp: rev.created_at,
      userName,
    });
  }

  // Sort by timestamp descending and take the 10 most recent
  items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return items.slice(0, 10);
}

export interface RecentBooking {
  id: string;
  clientName: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  amount: number;
}

export async function getVendorRecentBookings(
  vendorId: string,
  client?: SupabaseClient
): Promise<RecentBooking[]> {
  const db = getDb(client);

  // Get last 5 accepted/responded inquiries joined with invoice totals
  const { data: inquiries } = await db
    .from('inquiries')
    .select('id, name, event_type, event_date, status')
    .eq('vendor_id', vendorId)
    .in('status', ['accepted', 'responded', 'pending'])
    .order('created_at', { ascending: false })
    .limit(5);

  if (!inquiries || inquiries.length === 0) {
    return [];
  }

  // Get total invoiced amounts per inquiry
  const inquiryIds = inquiries.map((inq) => inq.id);
  const { data: invoices } = await db
    .from('invoices')
    .select('inquiry_id, total_amount')
    .in('inquiry_id', inquiryIds);

  const amountByInquiry: Record<string, number> = {};
  for (const inv of invoices || []) {
    amountByInquiry[inv.inquiry_id] =
      (amountByInquiry[inv.inquiry_id] || 0) + (Number(inv.total_amount) || 0);
  }

  return inquiries.map((inq) => ({
    id: inq.id,
    clientName: inq.name,
    eventType: inq.event_type || 'Event',
    eventDate: inq.event_date,
    status: inq.status,
    amount: amountByInquiry[inq.id] || 0,
  }));
}

export interface RecentMessagePreview {
  threadId: string;
  userName: string;
  userAvatar: string | null;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export async function getVendorRecentMessages(
  vendorId: string,
  client?: SupabaseClient
): Promise<RecentMessagePreview[]> {
  const db = getDb(client);

  // Get vendor's user_id to determine unread status
  const { data: vendor } = await db
    .from('vendors')
    .select('user_id')
    .eq('id', vendorId)
    .single();

  const vendorUserId = vendor?.user_id ?? null;

  // Get last 5 threads with user info
  const { data: threads } = await db
    .from('message_threads')
    .select(`
      id,
      last_message_at,
      user:users (
        id,
        name,
        avatar
      )
    `)
    .eq('vendor_id', vendorId)
    .order('last_message_at', { ascending: false })
    .limit(5);

  if (!threads || threads.length === 0) {
    return [];
  }

  // Fetch last message and unread status per thread
  const previews: RecentMessagePreview[] = [];

  for (const thread of threads) {
    const { data: lastMsg } = await db
      .from('messages')
      .select('content, created_at, sender_id, read_at')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const user = thread.user as unknown as
      | { id: string; name: string | null; avatar: string | null }
      | null;

    // A message is "unread" if it was sent by someone other than the vendor
    // and has no read_at
    const unread =
      !!lastMsg &&
      vendorUserId !== null &&
      lastMsg.sender_id !== vendorUserId &&
      lastMsg.read_at === null;

    previews.push({
      threadId: thread.id,
      userName: user?.name || 'Unknown',
      userAvatar: user?.avatar || null,
      lastMessage: lastMsg?.content || '',
      timestamp: lastMsg?.created_at || thread.last_message_at || '',
      unread,
    });
  }

  return previews;
}

// === Calendar Query Functions ===

export interface VendorBooking {
  id: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  guestCount: number | null;
  status: string;
}

export async function getVendorBookingsForRange(
  vendorId: string,
  startDate: string,
  endDate: string,
  client?: SupabaseClient
): Promise<VendorBooking[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('inquiries')
    .select('id, name, email, event_type, event_date, guest_count, status')
    .eq('vendor_id', vendorId)
    .in('status', ['accepted', 'responded'])
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('event_date', { ascending: true });

  if (error || !data) return [];
  return data.map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    eventType: d.event_type,
    eventDate: d.event_date,
    guestCount: d.guest_count,
    status: d.status,
  }));
}

// === Analytics Query Functions ===

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export async function getVendorViewsOverTime(
  vendorId: string,
  startDate: string,
  endDate: string,
  client?: SupabaseClient
): Promise<TimeSeriesPoint[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('vendor_views')
    .select('viewed_at')
    .eq('vendor_id', vendorId)
    .gte('viewed_at', startDate)
    .lte('viewed_at', endDate);

  if (error || !data) return [];

  // Group by date on the client side
  const countsByDate: Record<string, number> = {};
  for (const row of data) {
    const dateKey = row.viewed_at?.slice(0, 10);
    if (dateKey) {
      countsByDate[dateKey] = (countsByDate[dateKey] || 0) + 1;
    }
  }

  return Object.entries(countsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getVendorInquiriesOverTime(
  vendorId: string,
  startDate: string,
  endDate: string,
  client?: SupabaseClient
): Promise<TimeSeriesPoint[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('inquiries')
    .select('created_at')
    .eq('vendor_id', vendorId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error || !data) return [];

  const countsByDate: Record<string, number> = {};
  for (const row of data) {
    const dateKey = row.created_at?.slice(0, 10);
    if (dateKey) {
      countsByDate[dateKey] = (countsByDate[dateKey] || 0) + 1;
    }
  }

  return Object.entries(countsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getVendorRevenueOverTime(
  vendorId: string,
  startDate: string,
  endDate: string,
  client?: SupabaseClient
): Promise<TimeSeriesPoint[]> {
  const db = getDb(client);
  const { data, error } = await db
    .from('vendor_revenue')
    .select('amount, created_at')
    .eq('vendor_id', vendorId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error || !data) return [];

  const countsByDate: Record<string, number> = {};
  for (const row of data) {
    const dateKey = row.created_at?.slice(0, 10);
    if (dateKey) {
      countsByDate[dateKey] = (countsByDate[dateKey] || 0) + (Number(row.amount) || 0);
    }
  }

  return Object.entries(countsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getVendorResponseTime(
  vendorId: string,
  client?: SupabaseClient
): Promise<number> {
  const db = getDb(client);
  const { data, error } = await db
    .from('inquiries')
    .select('created_at, responded_at')
    .eq('vendor_id', vendorId)
    .not('responded_at', 'is', null)
    .limit(100);

  if (error || !data || data.length === 0) return 0;

  let totalHours = 0;
  let count = 0;

  for (const row of data) {
    if (row.created_at && row.responded_at) {
      const created = new Date(row.created_at).getTime();
      const responded = new Date(row.responded_at).getTime();
      if (responded > created) {
        totalHours += (responded - created) / (1000 * 60 * 60);
        count++;
      }
    }
  }

  return count > 0 ? Math.round(totalHours / count) : 0;
}
