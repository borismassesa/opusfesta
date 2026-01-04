"use client";

import { InquiryVendorActions } from "./InquiryVendorActions";

interface InquiryPageClientProps {
  inquiryId: string;
  status: string;
  vendorUserId: string | null;
}

export function InquiryPageClient({ inquiryId, status, vendorUserId }: InquiryPageClientProps) {
  // Only show vendor actions if status is pending
  if (status !== 'pending') {
    return null;
  }

  return (
    <div className="mb-6">
      <InquiryVendorActions 
        inquiryId={inquiryId} 
        currentStatus={status}
        vendorUserId={vendorUserId}
      />
    </div>
  );
}
