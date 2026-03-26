---
name: vendor-management
description: "Manage wedding vendors including registration, profiles, services, and communication. Use when working with vendors, vendor data, vendor services, vendor onboarding, vendor listings, or vendor-related database operations."
---

# Vendor Management

## Vendor Data Model

### Core Tables

| Table | Purpose |
|-------|---------|
| `vendors` | Vendor profiles (name, bio, location, status, contact) |
| `vendor_services` | Service offerings with pricing in TZS |
| `vendor_categories` | Service categories (photography, catering, venue, etc.) |
| `vendor_reviews` | Client reviews with rating |
| `vendor_media` | Portfolio images and videos |
| `vendor_availability` | Calendar availability and blocked dates |

### Vendor Status Lifecycle

```
pending → under_review → approved → active
                       ↘ rejected (can resubmit)
active → suspended (policy violation)
```

## Service Categories

| Category | Description |
|----------|-------------|
| Photography | Wedding photographers and videographers |
| Venue | Reception halls, gardens, beach venues |
| Catering | Food and beverage services |
| Decoration | Flowers, decor, lighting |
| Music & Entertainment | DJs, live bands, ngoma groups |
| Fashion | Bridal wear, suits, kitenge designers |
| Beauty | Hair, makeup, mehndi artists |
| Planning | Full-service wedding planners |
| Transport | Wedding cars, guest transport |
| Cake | Wedding cakes and desserts |

## Database Operations

### Vendor Search & Filtering

```typescript
const { data } = await supabase
  .from('vendors')
  .select('*, vendor_services(name, price_min, price_max), vendor_reviews(rating)')
  .eq('status', 'active')
  .eq('category', 'photography')
  .gte('vendor_services.price_min', minBudget)
  .lte('vendor_services.price_max', maxBudget)
  .order('rating_avg', { ascending: false })
  .range(0, 19)
```

### Vendor CRUD

```typescript
// Create vendor (during onboarding)
await supabase.from('vendors').insert({
  clerk_user_id: userId,
  business_name: name,
  category: 'photography',
  location: 'Dar es Salaam',
  status: 'pending',
})

// Update vendor status (admin moderation)
await supabase.from('vendors')
  .update({ status: 'approved', approved_at: new Date().toISOString() })
  .eq('id', vendorId)
```

## Admin Moderation

- Bulk approve/reject from admin vendor list
- Flag vendors for policy violations
- View vendor analytics and performance metrics
- Export vendor data for reporting
