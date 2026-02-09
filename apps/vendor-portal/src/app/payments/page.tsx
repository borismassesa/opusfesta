'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import {
  getVendorPayments,
  getVendorPayouts,
  getVendorRevenueSummary,
} from '@/lib/supabase/business';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  if (!value) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(amount: string | number, currency = 'TZS'): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(toNumber(amount));
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function paymentStatusVariant(status: string): 'default' | 'warning' | 'success' | 'destructive' | 'secondary' {
  switch (status) {
    case 'SUCCEEDED':
      return 'success';
    case 'PENDING':
    case 'PROCESSING':
      return 'warning';
    case 'FAILED':
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function PaymentsPage() {
  const supabase = useClerkSupabaseClient();
  const { vendorId, vendorName } = useVendorPortalAccess();

  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['vendor-payments', vendorId],
    queryFn: () => getVendorPayments(vendorId!, supabase),
    enabled: !!vendorId,
  });

  const { data: payouts = [], isLoading: isPayoutsLoading } = useQuery({
    queryKey: ['vendor-payouts', vendorId],
    queryFn: () => getVendorPayouts(vendorId!, supabase),
    enabled: !!vendorId,
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['vendor-revenue-summary', vendorId],
    queryFn: () => getVendorRevenueSummary(vendorId!, supabase),
    enabled: !!vendorId,
  });

  const metrics = useMemo(() => {
    const successfulPayments = payments.filter((payment) => payment.status === 'SUCCEEDED');
    const pendingPayments = payments.filter(
      (payment) => payment.status === 'PENDING' || payment.status === 'PROCESSING'
    );

    return {
      paymentCount: payments.length,
      successfulAmount: successfulPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0),
      pendingAmount: pendingPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0),
      payoutCount: payouts.length,
      paidOutAmount: summary ? toNumber(summary.paid_out) : 0,
      pendingPayoutAmount: summary ? toNumber(summary.pending_payout) : 0,
      revenueAmount: summary ? toNumber(summary.total_revenue) : 0,
      platformFeeAmount: summary ? toNumber(summary.total_platform_fees) : 0,
    };
  }, [payments, payouts, summary]);

  if (!vendorId) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:px-10 md:pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Vendor profile not found. Complete onboarding first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isPaymentsLoading || isPayoutsLoading || isSummaryLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:px-10 md:pt-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track payments, fees, and payouts for {vendorName || 'your storefront'}.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total successful payments</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.successfulAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending payments</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.pendingAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total vendor revenue</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.revenueAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending payout balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.pendingPayoutAmount)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue split</CardTitle>
            <CardDescription>Current split between vendor revenue and platform fees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Vendor revenue: {formatCurrency(metrics.revenueAmount)}</p>
            <p>Platform fees: {formatCurrency(metrics.platformFeeAmount)}</p>
            <p>Paid out: {formatCurrency(metrics.paidOutAmount)}</p>
            <p>Pending payout: {formatCurrency(metrics.pendingPayoutAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity totals</CardTitle>
            <CardDescription>Operational counts for financial activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Payments tracked: {metrics.paymentCount}</p>
            <p>Payouts tracked: {metrics.payoutCount}</p>
            <p>Revenue entries: {summary?.payment_count || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>Latest invoice payments and processing status.</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments found yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 20).map((payment) => (
                  <div key={payment.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {payment.invoice?.invoice_number || payment.provider_ref || payment.id.slice(0, 8)}
                      </p>
                      <Badge variant={paymentStatusVariant(payment.status)}>{payment.status}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Amount: {formatCurrency(payment.amount, payment.currency)}</p>
                      <p>Method: {payment.method}</p>
                      <p>Created: {formatDate(payment.created_at)}</p>
                      <p>Processed: {formatDate(payment.processed_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent payouts</CardTitle>
            <CardDescription>Payout transfers issued to this vendor account.</CardDescription>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payouts recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {payouts.slice(0, 20).map((payout) => (
                  <div key={payout.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{formatCurrency(payout.amount, payout.currency)}</p>
                      <Badge variant={paymentStatusVariant(payout.status)}>{payout.status}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Method: {payout.method}</p>
                      <p>Provider: {payout.provider}</p>
                      <p>Created: {formatDate(payout.created_at)}</p>
                      <p>Processed: {formatDate(payout.processed_at)}</p>
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
