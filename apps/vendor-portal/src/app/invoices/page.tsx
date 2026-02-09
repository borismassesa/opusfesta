'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlusCircle } from 'lucide-react';
import { useClerkSupabaseClient } from '@opusfesta/auth';
import { useVendorPortalAccess } from '@/hooks/useVendorPortalAccess';
import {
  createVendorInvoice,
  getEligibleInquiriesForInvoices,
  getVendorInvoices,
  type InvoiceStatus,
  type InvoiceType,
} from '@/lib/supabase/business';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';

const INVOICE_TYPES: InvoiceType[] = ['DEPOSIT', 'FULL_PAYMENT', 'BALANCE', 'ADDITIONAL_SERVICE', 'REFUND'];

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

function invoiceStatusVariant(
  status: InvoiceStatus
): 'default' | 'warning' | 'success' | 'destructive' | 'secondary' | 'info' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'PENDING':
      return 'warning';
    case 'PARTIALLY_PAID':
      return 'info';
    case 'PAID':
      return 'success';
    case 'OVERDUE':
      return 'destructive';
    case 'CANCELLED':
      return 'default';
    default:
      return 'secondary';
  }
}

export default function InvoicesPage() {
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();
  const { vendorId, vendorName } = useVendorPortalAccess();

  const [inquiryId, setInquiryId] = useState('');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('FULL_PAYMENT');
  const [subtotal, setSubtotal] = useState('');
  const [taxAmount, setTaxAmount] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const { data: invoices = [], isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['vendor-invoices', vendorId],
    queryFn: () => getVendorInvoices(vendorId!, supabase),
    enabled: !!vendorId,
  });

  const { data: inquiries = [], isLoading: isInquiriesLoading } = useQuery({
    queryKey: ['vendor-invoice-inquiries', vendorId],
    queryFn: () => getEligibleInquiriesForInvoices(vendorId!, supabase),
    enabled: !!vendorId,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!vendorId) {
        throw new Error('Vendor profile not found');
      }

      const parsedSubtotal = Number(subtotal);
      const parsedTax = Number(taxAmount || '0');
      const parsedDiscount = Number(discountAmount || '0');

      if (!inquiryId) {
        throw new Error('Please select an inquiry.');
      }
      if (!Number.isFinite(parsedSubtotal) || parsedSubtotal <= 0) {
        throw new Error('Subtotal must be greater than zero.');
      }
      if (!Number.isFinite(parsedTax) || parsedTax < 0 || !Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
        throw new Error('Tax and discount must be valid non-negative numbers.');
      }

      return createVendorInvoice(
        {
          vendorId,
          inquiryId,
          type: invoiceType,
          subtotal: parsedSubtotal,
          taxAmount: parsedTax,
          discountAmount: parsedDiscount,
          dueDate: dueDate || null,
          description,
          notes,
        },
        supabase
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vendor-invoices', vendorId] }),
        queryClient.invalidateQueries({ queryKey: ['vendor-invoice-inquiries', vendorId] }),
      ]);
      setInquiryId('');
      setInvoiceType('FULL_PAYMENT');
      setSubtotal('');
      setTaxAmount('0');
      setDiscountAmount('0');
      setDueDate('');
      setDescription('');
      setNotes('');
      toast.success('Invoice created successfully.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to create invoice');
    },
  });

  const metrics = useMemo(() => {
    const totals = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      overdueCount: 0,
    };

    for (const invoice of invoices) {
      const totalAmount = toNumber(invoice.total_amount);
      const paidAmount = toNumber(invoice.paid_amount);
      totals.totalAmount += totalAmount;
      totals.paidAmount += paidAmount;
      totals.outstandingAmount += Math.max(totalAmount - paidAmount, 0);
      if (invoice.status === 'OVERDUE') {
        totals.overdueCount += 1;
      }
    }

    return totals;
  }, [invoices]);

  const isLoading = isInvoicesLoading || isInquiriesLoading;

  const onCreateInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createInvoiceMutation.mutate();
  };

  if (!vendorId) {
    return (
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:px-10 md:pt-10">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Vendor profile not found. Complete onboarding first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:px-10 md:pt-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-[-0.01em]">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and track invoices for {vendorName || 'your storefront'}.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total invoices</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalInvoices}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total billed</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Collected</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.paidAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.outstandingAmount)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <PlusCircle className="h-5 w-5" />
            Create Invoice
          </CardTitle>
          <CardDescription>
            Use responded or accepted leads to issue deposits, balance requests, or full invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No eligible inquiries found. Respond to or accept a lead before issuing an invoice.
            </p>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onCreateInvoice}>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="inquiry">Inquiry</Label>
                <Select value={inquiryId} onValueChange={setInquiryId}>
                  <SelectTrigger id="inquiry">
                    <SelectValue placeholder="Select an inquiry" />
                  </SelectTrigger>
                  <SelectContent>
                    {inquiries.map((inquiry) => (
                      <SelectItem key={inquiry.id} value={inquiry.id}>
                        {inquiry.name} · {inquiry.event_type} · {formatDate(inquiry.event_date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-type">Type</Label>
                <Select value={invoiceType} onValueChange={(value) => setInvoiceType(value as InvoiceType)}>
                  <SelectTrigger id="invoice-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtotal">Subtotal (TZS)</Label>
                <Input
                  id="subtotal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={subtotal}
                  onChange={(event) => setSubtotal(event.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">Tax amount</Label>
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxAmount}
                  onChange={(event) => setTaxAmount(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount amount</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(event) => setDiscountAmount(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={2}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional summary for this invoice"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Internal notes</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional internal notes"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={createInvoiceMutation.isPending}>
                  {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
          <CardDescription>Track invoice status, due dates, and payment progress.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => {
                const total = toNumber(invoice.total_amount);
                const paid = toNumber(invoice.paid_amount);
                const outstanding = Math.max(total - paid, 0);

                return (
                  <div key={invoice.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.inquiry?.name || 'Inquiry'} · {invoice.type.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge variant={invoiceStatusVariant(invoice.status)}>{invoice.status.replace('_', ' ')}</Badge>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-4">
                      <p>Total: {formatCurrency(total, invoice.currency)}</p>
                      <p>Paid: {formatCurrency(paid, invoice.currency)}</p>
                      <p>Outstanding: {formatCurrency(outstanding, invoice.currency)}</p>
                      <p>Due: {formatDate(invoice.due_date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
