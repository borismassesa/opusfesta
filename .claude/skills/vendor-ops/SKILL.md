---
name: vendor-ops
description: "Vendor portal — onboarding, profiles, availability, analytics, portfolio management, vendor communications."
---

# Vendor Operations Portal

## Route Structure

| Route | Purpose |
|-------|---------|
| `/vendor-portal` | Vendor dashboard — stats, recent inquiries |
| `/vendor-portal/profile` | Business profile and settings |
| `/vendor-portal/services` | Service listings and pricing |
| `/vendor-portal/portfolio` | Photo/video gallery management |
| `/vendor-portal/availability` | Calendar and blocked dates |
| `/vendor-portal/bookings` | Booking requests and active jobs |
| `/vendor-portal/analytics` | Views, inquiries, conversion rates |
| `/vendor-portal/messages` | Client and admin messaging |
| `/vendor-portal/payouts` | Payout history and balance |

## Onboarding Flow

```
1. Vendor signs up (Clerk auth)
2. Complete business profile (name, category, location, description)
3. Add at least one service with pricing (TZS)
4. Upload portfolio images (minimum 3)
5. Submit for admin review
6. Admin approves → vendor goes live on marketplace

Status: pending → under_review → approved → active | rejected
Rejected vendors can resubmit after addressing feedback.
```

## Portfolio Management

- Images uploaded to Supabase Storage: `studio-assets/vendors/{vendor_id}/portfolio/`
- Support for image reordering (drag-and-drop)
- Image metadata: caption, event type, date
- Maximum 50 portfolio images per vendor
- Thumbnail generation for gallery grid

## Analytics Dashboard

| Metric | Description |
|--------|-------------|
| Profile views | How many times listing was viewed |
| Inquiry count | Booking inquiries received |
| Conversion rate | Inquiries that became bookings |
| Revenue (TZS) | Total and monthly revenue |
| Average rating | From client reviews |
| Response time | Average time to respond to inquiries |

## Considerations

- TZS currency throughout all financial displays
- Mobile-first design — vendors often manage on phones
- WhatsApp notification integration for new inquiries
- Multi-service vendors supported (e.g., venue + catering)
- Offline-friendly: key data cached locally for poor connectivity
