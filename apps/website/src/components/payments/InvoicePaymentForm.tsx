"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  dueDate: string;
  description?: string;
}

interface InvoicePaymentFormProps {
  invoice: Invoice;
  inquiryId: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

function PaymentForm({ invoice, inquiryId, onPaymentSuccess, onPaymentError }: InvoicePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileProvider, setMobileProvider] = useState<'MPESA' | 'AIRTEL_MONEY' | 'TIGO_PESA' | 'HALO_PESA'>('MPESA');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Stripe is not loaded. Please refresh the page.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (paymentMethod === 'card') {
        // Card payment via Stripe
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card element not found");
        }

        // Create payment intent
        const intentResponse = await fetch("/api/payments/intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            inquiryId: inquiryId,
            amount: Math.round(invoice.remainingAmount * 100), // Convert to cents
            currency: invoice.currency.toLowerCase(),
            method: 'stripe',
            customerEmail: session.user.email,
            customerName: session.user.user_metadata?.name || session.user.email,
          }),
        });

        const intentData = await intentResponse.json();

        if (!intentResponse.ok) {
          throw new Error(intentData.error || "Failed to create payment intent");
        }

        if (!intentData.clientSecret) {
          throw new Error("No client secret returned");
        }

        // Confirm payment with Stripe
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email,
              },
            },
          }
        );

        if (confirmError) {
          throw new Error(confirmError.message || "Payment failed");
        }

        if (paymentIntent?.status === "succeeded") {
          // Payment succeeded - webhook will update the payment status
          // Poll for payment status update
          await pollPaymentStatus(intentData.paymentId);
          onPaymentSuccess?.();
        } else {
          throw new Error(`Payment status: ${paymentIntent?.status}`);
        }
      } else {
        // Mobile money payment (MPESA, Airtel Money, etc.)
        // This would integrate with Africa's Talking or similar service
        // For now, we'll show a placeholder
        setError("Mobile money payments are coming soon. Please use card payment for now.");
        setIsProcessing(false);
        return;
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "An unexpected error occurred during payment";
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/payments/${paymentId}/status`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.payment?.status === "SUCCEEDED") {
          return;
        }
      }
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Payment Method</Label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
              paymentMethod === 'card'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Card</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('mobile')}
            className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
              paymentMethod === 'mobile'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Smartphone className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mobile Money</span>
          </button>
        </div>
      </div>

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="card-element" className="mb-2 block">
              Card Details
            </Label>
            <div className="p-4 border border-border rounded-lg bg-background">
              <CardElement id="card-element" options={cardElementOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Money Form */}
      {paymentMethod === 'mobile' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="mobile-provider" className="mb-2 block">
              Mobile Money Provider
            </Label>
            <select
              id="mobile-provider"
              value={mobileProvider}
              onChange={(e) => setMobileProvider(e.target.value as any)}
              className="w-full p-3 border border-border rounded-lg bg-background"
            >
              <option value="MPESA">M-PESA</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="TIGO_PESA">Tigo Pesa</option>
              <option value="HALO_PESA">Halo Pesa</option>
            </select>
          </div>
          <div>
            <Label htmlFor="mobile-phone" className="mb-2 block">
              Phone Number
            </Label>
            <Input
              id="mobile-phone"
              type="tel"
              value={mobilePhone}
              onChange={(e) => setMobilePhone(e.target.value)}
              placeholder="+255 123 456 789"
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            Pay {invoice.currency} {invoice.remainingAmount.toLocaleString()}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your payment is secure and encrypted
      </p>
    </form>
  );
}

export function InvoicePaymentForm(props: InvoicePaymentFormProps) {
  if (!stripePromise) {
    return (
      <div className="p-6 border border-border rounded-lg bg-background">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <span>Stripe is not configured. Please contact support.</span>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}
