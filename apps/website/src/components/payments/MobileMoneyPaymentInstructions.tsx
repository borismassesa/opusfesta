"use client";

import { useState, useEffect } from "react";
import { Smartphone, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface MobileMoneyAccount {
  provider: string;
  lipaNamba: string;
  accountName: string;
  isPrimary: boolean;
}

interface MobileMoneyPaymentInstructionsProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    remainingAmount: number;
    currency: string;
  };
  inquiryId: string;
  onPaymentSubmitted?: () => void;
}

export function MobileMoneyPaymentInstructions({
  invoice,
  inquiryId,
  onPaymentSubmitted,
}: MobileMoneyPaymentInstructionsProps) {
  const router = useRouter();
  const { getToken, isSignedIn, userId } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [thefestaAccounts, setThefestaAccounts] = useState<MobileMoneyAccount[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Fetch OpusFesta's mobile money accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/platform/mobile-money");
        if (response.ok) {
          const data = await response.json();
          setThefestaAccounts(data.accounts || []);
          // Set default provider if available
          if (data.accounts && data.accounts.length > 0) {
            const primaryAccount = data.accounts.find((acc: MobileMoneyAccount) => acc.isPrimary);
            setSelectedProvider(primaryAccount?.provider || data.accounts[0].provider);
          }
        }
      } catch (err) {
        console.error("Error fetching OpusFesta mobile money accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const selectedAccount = thefestaAccounts.find(
    (acc) => acc.provider === selectedProvider
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setReceiptFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!selectedProvider) {
      setError("Please select a mobile money provider");
      setIsSubmitting(false);
      return;
    }

    if (!receiptFile) {
      setError("Please upload a receipt image");
      setIsSubmitting(false);
      return;
    }

    if (!receiptNumber.trim()) {
      setError("Please enter the transaction/receipt number");
      setIsSubmitting(false);
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get user session
      if (!isSignedIn) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const token = await getToken();

      // Upload receipt image to Supabase Storage
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `${userId}/${invoice.id}/${Date.now()}.${fileExt}`;
      const filePath = `payment-receipts/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(filePath, receiptFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload receipt: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("payment-receipts")
        .getPublicUrl(filePath);

      // Create payment record (pending status)
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          inquiryId: inquiryId,
          amount: invoice.remainingAmount,
          currency: invoice.currency,
          method: selectedProvider,
          status: "PENDING",
          provider: "mobile_money",
          description: `Mobile money payment for invoice ${invoice.invoiceNumber}`,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || "Failed to create payment record");
      }

      const paymentData = await paymentResponse.json();

      // Create receipt record
      const receiptResponse = await fetch("/api/payments/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: paymentData.payment.id,
          invoiceId: invoice.id,
          inquiryId: inquiryId,
          receiptImageUrl: urlData.publicUrl,
          receiptNumber: receiptNumber.trim(),
          paymentProvider: selectedProvider,
          phoneNumber: phoneNumber.trim(),
          amount: invoice.remainingAmount,
          currency: invoice.currency,
          paymentDate: paymentDate || new Date().toISOString().split("T")[0],
          notes: notes.trim() || null,
        }),
      });

      if (!receiptResponse.ok) {
        const errorData = await receiptResponse.json();
        throw new Error(errorData.error || "Failed to submit receipt");
      }

      setSuccess(true);
      onPaymentSubmitted?.();
    } catch (err: any) {
      console.error("Payment submission error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h3 className="font-semibold text-green-900 dark:text-green-100">
            Receipt Submitted Successfully
          </h3>
        </div>
        <p className="text-sm text-green-800 dark:text-green-200">
          Your payment receipt has been submitted and is pending verification. 
          The vendor will review and verify your payment. You'll be notified once it's approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Provider Selection */}
      <div>
        <Label htmlFor="provider" className="mb-2 block">
          Mobile Money Provider <span className="text-red-500">*</span>
        </Label>
        {loadingAccounts ? (
          <div className="p-3 border border-border rounded-lg bg-background text-muted-foreground text-sm">
            Loading payment options...
          </div>
        ) : thefestaAccounts.length === 0 ? (
          <div className="p-3 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
            Mobile money payment is currently unavailable. Please use card payment.
          </div>
        ) : (
          <select
            id="provider"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full p-3 border border-border rounded-lg bg-background"
            required
          >
            <option value="">Select provider</option>
            {thefestaAccounts.map((account) => (
              <option key={account.provider} value={account.provider}>
                {account.provider.replace("_", " ")} - {account.lipaNamba}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Payment Instructions */}
      {selectedAccount && (
        <div className="p-6 bg-linear-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-1">
              LIPA KWA SIMU
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Mitandao Yote (All Networks)
            </p>
          </div>

          {/* LIPA NAMBA Display */}
          <div className="mb-4">
            <Label className="text-white dark:text-red-100 font-semibold mb-2 block">
              LIPA NAMBA
            </Label>
            <div className="flex gap-2 justify-center">
              {selectedAccount.lipaNamba.split('').map((digit, index) => (
                <div
                  key={index}
                  className="w-12 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-md"
                >
                  <span className="text-2xl font-bold text-gray-900">{digit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Name */}
          <div className="mb-4">
            <Label className="text-white dark:text-red-100 font-semibold mb-2 block">
              JINA (Name)
            </Label>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-md">
              <span className="text-xl font-bold text-gray-900 uppercase">
                {selectedAccount.accountName}
              </span>
            </div>
          </div>

          {/* Provider Info */}
          <div className="mb-4 p-3 bg-white/90 dark:bg-gray-800/90 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              <strong>Provider:</strong> {selectedAccount.provider.replace("_", " ")}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Amount:</strong> {invoice.currency} {invoice.remainingAmount.toLocaleString()}
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-white/90 dark:bg-gray-800/90 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Payment Steps:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
              <li>Dial the USSD code for {selectedAccount.provider.replace("_", " ")}</li>
              <li>Enter LIPA NAMBA: <strong>{selectedAccount.lipaNamba}</strong></li>
              <li>Enter amount: <strong>{invoice.currency} {invoice.remainingAmount.toLocaleString()}</strong></li>
              <li>Complete the payment</li>
              <li>Take a screenshot of the confirmation</li>
              <li>Upload the receipt below</li>
            </ol>
          </div>

          <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Your payment will be held securely by OpusFesta and released to the vendor after work completion.
          </div>
        </div>
      )}

      {/* Receipt Upload */}
      <div>
        <Label htmlFor="receipt" className="mb-2 block">
          Upload Payment Receipt <span className="text-red-500">*</span>
        </Label>
        <Input
          id="receipt"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
          required
        />
        {receiptPreview && (
          <div className="mt-3">
            <img
              src={receiptPreview}
              alt="Receipt preview"
              className="max-w-full h-auto max-h-64 rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setReceiptFile(null);
                setReceiptPreview(null);
              }}
              className="mt-2"
            >
              Remove
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Upload a clear image of your payment confirmation (max 5MB)
        </p>
      </div>

      {/* Receipt Number */}
      <div>
        <Label htmlFor="receipt-number" className="mb-2 block">
          Transaction/Receipt Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="receipt-number"
          type="text"
          value={receiptNumber}
          onChange={(e) => setReceiptNumber(e.target.value)}
          placeholder="e.g., ABC123XYZ or transaction ID"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter the transaction ID or receipt number from your payment confirmation
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <Label htmlFor="phone" className="mb-2 block">
          Your Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+255 123 456 789"
          required
        />
      </div>

      {/* Payment Date */}
      <div>
        <Label htmlFor="payment-date" className="mb-2 block">
          Payment Date
        </Label>
        <Input
          id="payment-date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Additional Notes */}
      <div>
        <Label htmlFor="notes" className="mb-2 block">
          Additional Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information about the payment..."
          rows={3}
        />
      </div>

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
        disabled={isSubmitting || !selectedProvider || !receiptFile}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting Receipt...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Submit Payment Receipt
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your payment will be verified by the vendor. This usually takes 1-2 business days.
      </p>
    </form>
  );
}
