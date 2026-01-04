# Vendors Production Readiness (vs WeddingWire / The Knot / Zola)

## Scope
- `/vendors` main listing page
- `/vendors/category` category/collection pages
- `/vendors/[slug]` vendor detail page

## Executive Summary

This document outlines what's missing to make the vendor pages production-ready and competitive with Wedding Wire, The Knot, and Zola.

**Current Status**: The pages have a solid UI foundation with mock data, but need backend integration, real data flows, and advanced features to match competitors.

---

## 🚨 Blockers (Must Ship Before Production)

### 1) Real Data Instead of Mock Content
- Replace static arrays and local images with Supabase-backed data on listing and collection pages.
- Remove mock fallback on vendor detail or gate it behind dev-only flags.
- **Files**: 
  - `apps/website/src/app/vendors/page.tsx`
  - `apps/website/src/app/vendors/all/page.tsx`
  - `apps/website/src/lib/vendors/collections.ts`
  - `apps/website/src/app/vendors/[slug]/page.tsx`
  - `apps/website/src/lib/vendors/mockVendors.ts`

**Impact**: Critical - Core functionality depends on real data

### 2) Server-Backed Search, Filter, Sort, Pagination
- Current filtering/sorting is in-memory only; needs DB queries with URL params and pagination.
- Add facet filters common to competitors: budget, capacity, availability, location radius, styles, amenities.
- **Files**: 
  - `apps/website/src/app/vendors/all/page.tsx`
  - `apps/website/src/components/vendors/VendorCollectionView.tsx`

**Impact**: Critical - Performance and scalability

**Required API**:
```typescript
GET /api/vendors/search
Query params: q, category, location, priceRange, sort, page, limit
Response: Paginated vendor list with filters applied
```

### 3) Lead Capture and Saving
- "Save", "Request Quote", "Message vendor", and inquiry forms are UI-only or TODOs.
- Implement auth, save state, inquiry submission, and vendor notification pipelines.
- **Files**: 
  - `apps/website/src/components/vendors/VendorHero.tsx`
  - `apps/website/src/components/vendors/VendorContent.tsx`
  - `apps/website/src/components/vendors/VendorInquiryForm.tsx`
  - `apps/website/src/components/vendors/VendorBookingSidebar.tsx`

**Impact**: Critical - Revenue generation

**Required APIs**:
```typescript
POST /api/bookings
Body: { vendorId, eventDate, guestCount, message, ... }
Response: Booking confirmation

POST /api/vendors/:id/save
DELETE /api/vendors/:id/save
GET /api/users/saved-vendors
```

### 4) Reviews Pipeline
- No submission flow, moderation, verification, or helpful voting.
- Competitors use verified reviews and ask follow-up questions; needs DB + UI + moderation tooling.
- **Files**: 
  - `apps/website/src/lib/supabase/vendors.ts`
  - `apps/website/src/app/vendors/[slug]/page.tsx`

**Impact**: High - Trust and conversion

**Required API**:
```typescript
POST /api/reviews (requires booking completion)
GET /api/vendors/:id/reviews
PUT /api/reviews/:id/response (vendor response)
```

---

## 🔥 High-Impact Gaps (Next Priority)

### 1) Category/Collection Pages and SEO
- Collection routes are fixed keys and client-only; no true category pages from DB.
- Add crawlable category + location landing pages with Metadata + structured data.
- **Files**: 
  - `apps/website/src/app/vendors/collection/[slug]/page.tsx`
  - `apps/website/src/components/vendors/VendorCollectionView.tsx`

**Missing Features**:
- Category-specific filters (venue capacity, photographer style, caterer cuisine)
- Category landing page content (guides, tips)
- Curated collections per category
- Rich SEO content for each category

### 2) Listing SEO Metadata
- Vendor detail has metadata; listing/collection pages do not.
- Add canonical URLs, OpenGraph/Twitter metadata, and schema for listings.
- **Files**: 
  - `apps/website/src/app/vendors/page.tsx`
  - `apps/website/src/app/vendors/all/page.tsx`

**Missing**:
- Dynamic Open Graph images
- Category-specific meta descriptions
- Canonical URLs
- Breadcrumb schema
- Review schema markup

### 3) Real Availability, Pricing, and Response Metrics
- "Fast responder", response time/rate, and pricing are hardcoded.
- Surface real stats from vendor data and bookings.
- **Files**: 
  - `apps/website/src/components/vendors/VendorHero.tsx`
  - `apps/website/src/components/vendors/VendorProfile.tsx`
  - `apps/website/src/components/vendors/VendorDetailsPage.tsx`

**Required API**:
```typescript
GET /api/vendors/:id/availability
Query params: startDate, endDate
Response: Available dates, booked dates
```

**Missing Metrics**:
- "X couples booked this month"
- "Usually responds in 2 hours"
- "Booked 3 times this week"
- Real response time tracking
- Actual pricing from packages

---

## ⚙️ Platform and Scalability Gaps

### 1) N+1 Queries and Non-Atomic Stats
- Reviews fetch users in a loop and view counts increment by read-then-write.
- Use joins or RPCs, and atomic increments.
- **Files**: `apps/website/src/lib/supabase/vendors.ts`

**Solutions Needed**:
- Replace loops with JOIN queries
- Use atomic increment functions (PostgreSQL)
- Implement proper database indexes

### 2) Mapbox Token and Dependency Handling
- Token is hardcoded; mapbox-gl dependency may be missing with a runtime error.
- Move token to env, add package, and implement a graceful fallback.
- **Files**: `apps/website/src/components/vendors/VendorLocation.tsx`

**Action Items**:
- Move `NEXT_PUBLIC_MAPBOX_TOKEN` to environment variables
- Add `mapbox-gl` to package.json
- Implement fallback UI when map fails to load

### 3) Performance and Core Web Vitals
- Listing pages are heavy client components with raw `<img>` usage.
- Use next/image, server rendering where possible, caching, and skeleton states.
- **Files**: 
  - `apps/website/src/app/vendors/page.tsx`
  - `apps/website/src/app/vendors/all/page.tsx`
  - `apps/website/src/components/vendors/VendorCollectionView.tsx`

**Optimizations Needed**:
- Replace `<img>` with Next.js `<Image>` component
- Implement skeleton loaders
- Add server-side rendering where possible
- Implement caching strategy (vendor listing cache, CDN)
- Code splitting and lazy loading
- WebP format conversion
- Responsive image sizes

---

## 🚀 Important Features (Competitive Necessities)

### Vendor Listing Page (`/vendors`)

1. **Advanced Filtering**
   - ✅ Basic filters exist (category, location, price)
   - ❌ Missing: Response time, verified badge, years in business, service area radius
   - ❌ Missing: Price range slider (not just $, $$, $$$)
   - ❌ Missing: Availability date filter

2. **Map View**
   - ❌ Missing: Toggle between list and map view
   - ❌ Missing: Interactive map with vendor pins
   - **Impact**: Zola and The Knot both have this

3. **Pagination/Infinite Scroll**
   - ❌ Currently shows all vendors at once
   - Need: Handle large datasets efficiently
   - **Impact**: Performance and UX

4. **Vendor Comparison Tool**
   - ❌ Missing: Compare up to 3 vendors side-by-side
   - **Impact**: Wedding Wire has this feature

5. **Save/Favorite Functionality**
   - ✅ UI exists (heart/bookmark buttons)
   - ❌ Missing: Backend persistence
   - **Impact**: User engagement

6. **Social Proof Indicators**
   - ❌ Missing: "X couples booked this month"
   - ❌ Missing: "Usually responds in 2 hours"
   - ❌ Missing: "Booked 3 times this week"
   - **Impact**: Trust and conversion

### Vendor Detail Page (`/vendors/[slug]`)

1. **Portfolio Features**
   - ✅ Basic gallery exists
   - ❌ Missing: Filter by event type, year, venue
   - ❌ Missing: Virtual tours for venues (Zola feature)
   - ❌ Missing: Video testimonials

2. **Pricing Details**
   - ✅ Starting price shown
   - ❌ Missing: Detailed package pricing
   - ❌ Missing: Add-ons pricing
   - ❌ Missing: Custom quote builder

3. **Vendor Information**
   - ✅ Basic info exists
   - ❌ Missing: Team member profiles
   - ❌ Missing: Insurance/licensing info
   - ❌ Missing: Service area map
   - ❌ Missing: FAQ section

4. **Reviews System**
   - ✅ Reviews display exists
   - ❌ Missing: Review submission flow (post-booking)
   - ❌ Missing: Review moderation
   - ❌ Missing: Verified booking reviews only
   - ❌ Missing: Review helpfulness voting

5. **Booking Flow**
   - ✅ Booking sidebar UI exists
   - ❌ Missing: Real booking submission
   - ❌ Missing: Booking confirmation
   - ❌ Missing: Booking management dashboard

6. **Contract/Documents**
   - ❌ Missing: Sample contract preview
   - ❌ Missing: Document download
   - **Impact**: Professional trust

7. **Messaging System**
   - ❌ Missing: Direct in-app messaging between couples and vendors
   - **Impact**: High - User experience (The Knot has this)

**Required API**:
```typescript
GET /api/messages/:threadId
POST /api/messages
WebSocket: Real-time message updates
```

### Payment Processing
- ❌ Missing: Payment gateway integration (Stripe/PayPal/mobile money)
- ❌ Missing: Invoice generation and tracking
- ❌ Missing: Payment security (PCI compliance)
- **Impact**: Critical - Revenue generation

---

## 🎯 Competitive Feature Parity (Nice-to-Have)

### Wedding Wire Features We're Missing
- ✅ Vendor comparison tool
- ✅ Detailed vendor analytics dashboard
- ✅ Vendor response to reviews (partially implemented)
- ✅ Verified reviews only
- ✅ Vendor awards/badges

### The Knot Features We're Missing
- ✅ In-app messaging system
- ✅ Vendor availability calendar
- ✅ Package builder
- ✅ Virtual venue tours
- ✅ Vendor team profiles

### Zola Features We're Missing
- ✅ Map view for vendors
- ✅ Virtual tours
- ✅ Vendor collections/curated lists
- ✅ Video testimonials

### Additional Competitive Features
- Lead tracking dashboard for vendors
- Promoted placement with sponsorship rules
- FAQ and editorial content for SEO (category guides)
- Sharing to email/social media
- Shortlists and vendor collections

---

## 🔧 Technical Implementation Details

### Database Schema Gaps

1. **User Saved Vendors Table**
   ```sql
   CREATE TABLE user_saved_vendors (
     user_id UUID REFERENCES users(id),
     vendor_id UUID REFERENCES vendors(id),
     created_at TIMESTAMP DEFAULT NOW(),
     PRIMARY KEY (user_id, vendor_id)
   );
   ```

2. **Vendor Availability/Calendar**
   ```sql
   CREATE TABLE vendor_availability (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     vendor_id UUID REFERENCES vendors(id),
     date DATE NOT NULL,
     is_available BOOLEAN DEFAULT true,
     reason TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(vendor_id, date)
   );
   ```

3. **Booking Status Tracking**
   - Need: Status workflow (inquiry → quoted → accepted → paid → completed)
   - Need: Payment tracking
   - Need: Invoice generation

4. **Messaging System**
   ```sql
   CREATE TABLE message_threads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     vendor_id UUID REFERENCES vendors(id),
     last_message_at TIMESTAMP DEFAULT NOW(),
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, vendor_id)
   );
   
   CREATE TABLE messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     thread_id UUID REFERENCES message_threads(id),
     sender_id UUID REFERENCES users(id),
     content TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### Backend APIs Required

1. **Vendor Search API** (Critical)
   ```typescript
   GET /api/vendors/search
   Query params: 
     - q: string (search query)
     - category: string
     - location: string
     - priceRange: string ($, $$, $$$, $$$$)
     - sort: 'recommended' | 'rating' | 'reviews' | 'priceAsc' | 'priceDesc'
     - page: number
     - limit: number
   Response: {
     vendors: Vendor[],
     total: number,
     page: number,
     limit: number
   }
   ```

2. **Vendor Availability API** (Critical)
   ```typescript
   GET /api/vendors/:id/availability
   Query params: 
     - startDate: string (ISO date)
     - endDate: string (ISO date)
   Response: {
     availableDates: Date[],
     bookedDates: Date[]
   }
   ```

3. **Booking/Inquiry API** (Critical)
   ```typescript
   POST /api/bookings
   Body: {
     vendorId: string,
     eventDate: string,
     guestCount: number,
     message?: string,
     contactInfo: {
       name: string,
       email: string,
       phone: string
     }
   }
   Response: {
     bookingId: string,
     status: 'pending' | 'confirmed',
     message: string
   }
   ```

4. **Messaging API** (High Priority)
   ```typescript
   GET /api/messages/:threadId
   Response: Message[]
   
   POST /api/messages
   Body: {
     threadId: string,
     content: string
   }
   Response: Message
   
   WebSocket: Real-time message updates
   ```

5. **Save/Favorite API** (High Priority)
   ```typescript
   POST /api/vendors/:id/save
   DELETE /api/vendors/:id/save
   GET /api/users/saved-vendors
   Response: Vendor[]
   ```

6. **Review API** (High Priority)
   ```typescript
   POST /api/reviews
   Body: {
     bookingId: string,
     rating: number,
     comment: string,
     images?: string[]
   }
   Response: Review
   
   PUT /api/reviews/:id/response
   Body: {
     response: string
   }
   Response: Review
   ```

---

## 📊 Analytics & Tracking

### Missing Analytics

1. **Vendor Performance Metrics**
   - View counts
   - Save counts
   - Inquiry counts
   - Conversion rates
   - Response times

2. **User Behavior Tracking**
   - Search queries
   - Filter usage
   - Click-through rates
   - Time on page
   - Bounce rates

3. **Business Intelligence**
   - Popular categories
   - Peak booking times
   - Average booking value
   - Vendor performance rankings

**Required API**:
```typescript
GET /api/vendors/:id/analytics
Response: {
  views: number,
  saves: number,
  inquiries: number,
  conversionRate: number,
  avgResponseTime: number
}
```

---

## 🎨 UX/UI Improvements

### Missing UX Features

1. **Loading States**
   - Skeleton loaders for vendor cards
   - Progressive image loading
   - Smooth transitions

2. **Error Handling**
   - Graceful error messages
   - Retry mechanisms
   - Offline support

3. **Empty States**
   - Better "no results" messaging
   - Suggestions when filters too narrow
   - Category-specific empty states

4. **Mobile Optimizations**
   - Bottom sheets for filters
   - Swipe gestures
   - Mobile-specific layouts
   - Touch-optimized interactions

5. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management

---

## 🔍 SEO & Performance

### SEO Improvements

1. **Structured Data**
   - ✅ Started (LocalBusiness schema on vendor detail)
   - ❌ Need: Complete for all vendor types
   - ❌ Need: Review schema markup
   - ❌ Need: Breadcrumb schema
   - ❌ Need: Category page schema

2. **Meta Tags**
   - ✅ Basic meta tags exist on vendor detail
   - ❌ Need: Dynamic Open Graph images
   - ❌ Need: Category-specific meta descriptions
   - ❌ Need: Canonical URLs
   - ❌ Need: Listing page metadata

3. **Content**
   - ❌ Missing: Category landing page content
   - ❌ Missing: Vendor-specific SEO content
   - ❌ Missing: Blog/content marketing integration

4. **Sitemap**
   - ❌ Missing: Dynamic sitemap generation
   - ❌ Missing: Vendor URL sitemap
   - ❌ Missing: Category sitemap

### Performance Optimizations

1. **Image Optimization**
   - ✅ Using Next.js Image component (partially)
   - ❌ Need: Replace all `<img>` with `<Image>`
   - ❌ Need: WebP format conversion
   - ❌ Need: Responsive image sizes
   - ❌ Need: Lazy loading for below-fold images

2. **Caching**
   - ❌ Missing: Vendor listing cache
   - ❌ Missing: CDN for static assets
   - ❌ Missing: API response caching

3. **Code Splitting**
   - ❌ Need: Lazy load vendor detail components
   - ❌ Need: Route-based code splitting
   - ❌ Need: Dynamic imports for heavy components

4. **Database Optimization**
   - ❌ Need: Proper indexes on search fields
   - ❌ Need: Query optimization (fix N+1 queries)
   - ❌ Need: Connection pooling

---

## 🛡️ Security & Trust

### Missing Security Features

1. **Vendor Verification**
   - ❌ Missing: KYC process
   - ❌ Missing: Background checks
   - ❌ Missing: License verification
   - ❌ Missing: Insurance verification

2. **Review Moderation**
   - ❌ Missing: Review approval workflow
   - ❌ Missing: Spam detection
   - ❌ Missing: Verified booking reviews only
   - ❌ Missing: Review reporting system

3. **Payment Security**
   - ❌ Missing: PCI compliance
   - ❌ Missing: Secure payment processing
   - ❌ Missing: Refund policy enforcement

4. **Data Protection**
   - ❌ Missing: GDPR compliance
   - ❌ Missing: Data encryption
   - ❌ Missing: Privacy policy enforcement

---

## 📱 Mobile App Considerations

### Mobile-Specific Features

1. **Push Notifications**
   - Booking confirmations
   - Message notifications
   - Review reminders

2. **Mobile Payments**
   - Mobile money integration (M-Pesa, Airtel Money)
   - Mobile-optimized checkout

3. **Offline Support**
   - Cache saved vendors
   - Offline viewing
   - Sync when online

---

## 📋 Suggested Implementation Order

### Phase 1: Critical (Launch Blockers)
1. **Data layer + search/filter/pagination** (Supabase queries + URL params)
   - Replace mock data with Supabase queries
   - Implement server-side search with filters
   - Add pagination
   - **Files**: `apps/website/src/app/vendors/page.tsx`, `apps/website/src/app/vendors/all/page.tsx`

2. **Lead capture + save/like + inquiry submission**
   - Implement user authentication
   - Build save/favorite API
   - Create booking/inquiry submission flow
   - **Files**: `apps/website/src/components/vendors/VendorBookingSidebar.tsx`, `apps/website/src/components/vendors/VendorContent.tsx`

3. **Real availability calendar**
   - Build availability API
   - Integrate with booking system
   - Show real booked dates
   - **Files**: `apps/website/src/components/vendors/VendorBookingSidebar.tsx`

4. **Payment processing**
   - Integrate payment gateway
   - Build invoice system
   - Implement payment tracking

### Phase 2: High Priority (Competitive Necessities)
1. **Reviews system** (submit, verify, moderate, surface)
   - Build review submission flow
   - Add review moderation
   - Implement verified reviews
   - **Files**: `apps/website/src/lib/supabase/vendors.ts`, `apps/website/src/app/vendors/[slug]/page.tsx`

2. **Messaging system**
   - Build messaging API
   - Create messaging UI
   - Add real-time updates

3. **Advanced filtering**
   - Add response time filter
   - Add verified badge filter
   - Add price range slider
   - Add availability date filter

4. **Map view**
   - Integrate map component
   - Add vendor pins
   - Toggle list/map view

### Phase 3: Important (User Experience)
1. **SEO + structured data** for listings and category pages
   - Add metadata to listing pages
   - Complete structured data
   - Build category landing pages
   - **Files**: `apps/website/src/app/vendors/page.tsx`, `apps/website/src/app/vendors/collection/[slug]/page.tsx`

2. **Performance + analytics instrumentation**
   - Fix N+1 queries
   - Add caching
   - Implement analytics
   - Optimize images
   - **Files**: `apps/website/src/lib/supabase/vendors.ts`, all vendor pages

3. **Real metrics** (response time, booking counts)
   - Track response times
   - Calculate booking statistics
   - Surface real metrics
   - **Files**: `apps/website/src/components/vendors/VendorHero.tsx`, `apps/website/src/components/vendors/VendorProfile.tsx`

### Phase 4: Nice to Have (Enhancements)
1. Vendor comparison tool
2. Virtual tours
3. Video testimonials
4. Team member profiles
5. FAQ sections
6. Advanced analytics dashboard

---

## 🎬 Next Steps

1. **Review this document** with the team
2. **Prioritize features** based on business goals
3. **Create detailed technical specs** for Phase 1 items
4. **Set up backend infrastructure** (APIs, database migrations)
5. **Implement Phase 1 features** before launch
6. **Test thoroughly** with real data
7. **Iterate** based on user feedback

---

## 📝 Notes

- Current implementation has excellent UI/UX foundation
- Mock data structure is well-designed and can guide database schema
- Need to bridge UI with backend services
- Focus on core booking flow first, then enhance
- Consider MVP launch with core features, then iterate
- Mapbox integration needs environment variable setup
- Performance optimizations should be done incrementally

---

*Last Updated: [Current Date]*  
*Status: Pre-Production*
