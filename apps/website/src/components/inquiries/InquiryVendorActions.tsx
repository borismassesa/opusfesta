"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface InquiryVendorActionsProps {
  inquiryId: string;
  currentStatus: string;
  vendorUserId?: string | null;
  onStatusUpdate?: () => void;
}

export function InquiryVendorActions({ 
  inquiryId, 
  currentStatus,
  vendorUserId,
  onStatusUpdate 
}: InquiryVendorActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedAction, setSelectedAction] = useState<'accept' | 'decline' | null>(null);
  const [isVendor, setIsVendor] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if current user is the vendor
  useEffect(() => {
    const checkVendor = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && vendorUserId && session.user.id === vendorUserId) {
          setIsVendor(true);
        }
      } catch (error) {
        console.error("Error checking vendor status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkVendor();
  }, [vendorUserId]);

  // Don't show anything if not vendor or still checking
  if (isChecking || !isVendor) {
    return null;
  }

  const handleStatusUpdate = async (status: 'accepted' | 'responded' | 'declined', message?: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const response = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          status,
          message: message || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update inquiry status");
      }

      setShowResponseForm(false);
      setResponseMessage("");
      setSelectedAction(null);
      onStatusUpdate?.();
      router.refresh();
    } catch (err: any) {
      console.error("Error updating inquiry status:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === 'closed') {
    return null;
  }

  if (currentStatus === 'accepted' || currentStatus === 'responded') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-semibold">Inquiry {currentStatus === 'accepted' ? 'accepted' : 'responded'}</p>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          You can now create an invoice for this inquiry.
        </p>
      </div>
    );
  }

  if (currentStatus === 'declined') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <XCircle className="w-5 h-5" />
          <p className="font-semibold">Inquiry declined</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Respond to Inquiry</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!showResponseForm ? (
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setSelectedAction('accept');
              setShowResponseForm(true);
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={isUpdating}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept Inquiry
          </Button>
          <Button
            onClick={() => {
              setSelectedAction('decline');
              setShowResponseForm(true);
            }}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={isUpdating}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="response-message">
              {selectedAction === 'accept' 
                ? "Message to customer (optional)" 
                : "Reason for declining (optional)"}
            </Label>
            <Textarea
              id="response-message"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder={
                selectedAction === 'accept'
                  ? "Add a personal message to the customer..."
                  : "Let the customer know why you're declining..."
              }
              className="mt-1.5 min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowResponseForm(false);
                setResponseMessage("");
                setSelectedAction(null);
              }}
              variant="outline"
              className="flex-1"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAction === 'accept') {
                  handleStatusUpdate('accepted', responseMessage || undefined);
                } else {
                  handleStatusUpdate('declined', responseMessage || undefined);
                }
              }}
              className={`flex-1 ${
                selectedAction === 'accept'
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {selectedAction === 'accept' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirm Accept
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirm Decline
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
