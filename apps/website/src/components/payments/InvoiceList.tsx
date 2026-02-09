"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Clock, XCircle, CreditCard, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { InvoicePaymentForm } from "./InvoicePaymentForm";
import { MobileMoneyPaymentInstructions } from "./MobileMoneyPaymentInstructions";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  description?: string;
  notes?: string;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    processedAt?: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceListProps {
  inquiryId: string;
  onPaymentSuccess?: () => void;
}

export function InvoiceList({ inquiryId, onPaymentSuccess }: InvoiceListProps) {
  const { getToken, isSignedIn } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInvoices = async () => {
    try {
      if (!isSignedIn) {
        setError("Please log in to view invoices");
        setLoading(false);
        return;
      }

      const token = await getToken();
      const response = await fetch(`/api/inquiries/${inquiryId}/invoices`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to load invoices");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [inquiryId, isSignedIn]);

  const handlePaymentSuccess = () => {
    setIsRefreshing(true);
    fetchInvoices();
    setSelectedInvoice(null);
    onPaymentSuccess?.();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'PENDING':
      case 'PARTIALLY_PAID':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'OVERDUE':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING':
      case 'PARTIALLY_PAID':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No invoices found for this inquiry.</p>
        <p className="text-sm mt-1">The vendor will create an invoice after accepting your inquiry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="border border-border rounded-lg p-6 bg-background"
        >
          {/* Invoice Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {invoice.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusColor(invoice.status)}`}>
              {getStatusIcon(invoice.status)}
              {invoice.status.replace('_', ' ')}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Issue Date</p>
              <p className="text-sm font-medium">
                {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Due Date</p>
              <p className="text-sm font-medium">
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="border-t border-border pt-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{invoice.currency} {invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{invoice.currency} {invoice.taxAmount.toLocaleString()}</span>
                </div>
              )}
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{invoice.currency} {invoice.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{invoice.currency} {invoice.totalAmount.toLocaleString()}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="text-green-600">
                    {invoice.currency} {invoice.paidAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {invoice.remainingAmount > 0 && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-semibold text-primary">
                    {invoice.currency} {invoice.remainingAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="border-t border-border pt-4 mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Payment History</p>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>{payment.method.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                        payment.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Button */}
          {invoice.remainingAmount > 0 && invoice.status !== 'CANCELLED' && (
            <div className="border-t border-border pt-4">
              {selectedInvoice === invoice.id ? (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                        selectedPaymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('mobile')}
                      className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                        selectedPaymentMethod === 'mobile'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Mobile Money</span>
                    </button>
                  </div>

                  {/* Payment Form */}
                  {selectedPaymentMethod === 'card' ? (
                    <InvoicePaymentForm
                      invoice={invoice}
                      inquiryId={inquiryId}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={(err) => {
                        console.error("Payment error:", err);
                      }}
                    />
                  ) : (
                    <MobileMoneyPaymentInstructions
                      invoice={invoice}
                      inquiryId={inquiryId}
                      onPaymentSubmitted={handlePaymentSuccess}
                    />
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedInvoice(null);
                      setSelectedPaymentMethod('card');
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setSelectedInvoice(invoice.id)}
                  className="w-full bg-primary text-primary-foreground"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {invoice.currency} {invoice.remainingAmount.toLocaleString()}
                </Button>
              )}
            </div>
          )}

          {invoice.status === 'PAID' && invoice.paidAt && (
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Paid on {format(new Date(invoice.paidAt), "MMM dd, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
