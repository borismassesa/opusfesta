# Inquiry Status Update Implementation

## Overview

This document describes the implementation of the inquiry status update system, which allows vendors to accept, decline, or respond to customer inquiries.

## API Endpoint

### PUT /api/inquiries/[id]/status

**Purpose:** Update inquiry status (vendor only)

**Authentication:** Required (vendor must own the inquiry)

**Request Body:**
```json
{
  "status": "accepted" | "responded" | "declined" | "closed",
  "message": "Optional message to customer"
}
```

**Response:**
```json
{
  "success": true,
  "inquiry": {
    "id": "uuid",
    "status": "accepted",
    "vendorResponse": "Message to customer",
    "respondedAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Inquiry accepted successfully"
}
```

**Status Transitions:**
- `pending` → `accepted` (vendor accepts inquiry)
- `pending` → `responded` (vendor responds but doesn't accept yet)
- `pending` → `declined` (vendor declines inquiry)
- `accepted` → `closed` (inquiry completed)
- `declined` → `closed` (inquiry closed)

**Business Logic:**
1. Validates vendor ownership
2. Updates inquiry status
3. Saves vendor response message (if provided)
4. Updates `responded_at` timestamp
5. Updates vendor availability:
   - If `accepted`: Marks event date as unavailable
   - If `declined` or `closed`: Marks event date as available again

## Frontend Components

### InquiryVendorActions

**Location:** `apps/website/src/components/inquiries/InquiryVendorActions.tsx`

**Purpose:** Allows vendors to accept or decline inquiries

**Features:**
- Accept/Decline buttons
- Optional message field
- Status confirmation
- Error handling
- Loading states

**Visibility:**
- Only shown to vendor who owns the inquiry
- Only shown when status is `pending`
- Hidden when status is `accepted`, `declined`, or `closed`

### InquiryPageClient

**Location:** `apps/website/src/components/inquiries/InquiryPageClient.tsx`

**Purpose:** Client-side wrapper for vendor actions

**Features:**
- Client-side authentication check
- Conditional rendering based on status

## Inquiry Page Updates

**Location:** `apps/website/src/app/inquiries/[id]/page.tsx`

**New Features:**
1. **Vendor Response Section**
   - Displays vendor's response message
   - Shows response timestamp
   - Only visible if vendor has responded

2. **Vendor Actions Section**
   - Accept/Decline buttons (for vendors)
   - Only visible when status is `pending`
   - Only visible to vendor who owns the inquiry

3. **Status Display**
   - Enhanced status badge
   - Color-coded status indicators
   - Icons for each status

## Complete Flow

```
1. Customer submits inquiry
   ↓
2. Inquiry created with status 'pending'
   ↓
3. Vendor views inquiry page
   ↓
4. Vendor sees "Accept" or "Decline" buttons
   ↓
5. Vendor clicks "Accept" or "Decline"
   ↓
6. Vendor optionally adds message
   ↓
7. API: PUT /api/inquiries/[id]/status
   ↓
8. Inquiry status updated
   ↓
9. If accepted:
   - Status → 'accepted'
   - Event date marked as unavailable
   - Vendor can now create invoice
   ↓
10. If declined:
    - Status → 'declined'
    - Event date marked as available
    - Inquiry closed
```

## Integration with Payment Flow

### Inquiry → Invoice Flow

1. **Inquiry Status = 'accepted'**
   - Vendor can create invoice
   - API: POST /api/invoices
   - Requires: `inquiry.status = 'accepted' or 'responded'`

2. **Invoice Created**
   - Status: 'DRAFT'
   - Vendor publishes invoice
   - Status: 'PENDING'
   - Customer can view and pay

3. **Payment Processed**
   - Escrow hold created automatically
   - Funds held until work completion

## Security

### Authorization Checks

1. **Vendor Ownership**
   - API verifies vendor owns the inquiry
   - Frontend checks user authentication
   - Only vendor can update their inquiries

2. **Status Validation**
   - Only valid status transitions allowed
   - Cannot update closed inquiries
   - Prevents invalid state changes

3. **RLS Policies**
   - Database-level security
   - Vendors can only update their own inquiries
   - Customers can only view their own inquiries

## Testing

### Test Cases

1. **Vendor Accepts Inquiry**
   - [ ] Status changes to 'accepted'
   - [ ] Vendor response saved
   - [ ] Event date marked unavailable
   - [ ] Invoice can be created

2. **Vendor Declines Inquiry**
   - [ ] Status changes to 'declined'
   - [ ] Vendor response saved
   - [ ] Event date marked available
   - [ ] Invoice cannot be created

3. **Unauthorized Access**
   - [ ] Non-vendor cannot update status
   - [ ] Error message displayed
   - [ ] Status unchanged

4. **Invalid Status Transition**
   - [ ] Cannot update closed inquiry
   - [ ] Error message displayed

## Next Steps

1. **Email Notifications**
   - Notify customer when inquiry accepted
   - Notify customer when inquiry declined
   - Notify vendor when new inquiry received

2. **Vendor Dashboard**
   - List all inquiries
   - Filter by status
   - Bulk actions

3. **Customer Notifications**
   - Real-time status updates
   - Email notifications
   - SMS notifications (optional)
