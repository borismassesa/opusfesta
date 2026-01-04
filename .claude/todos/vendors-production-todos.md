# Vendor Pages Production - TODO List

## Phase 1: Critical (Launch Blockers)

### 1.1 Real Data Integration
- [ ] **P1-1.1** Replace mock data in `/vendors` listing page with Supabase queries
  - File: `apps/website/src/app/vendors/page.tsx`
  - Dependencies: Supabase vendor table populated
  - Estimated: 4 hours

- [ ] **P1-1.2** Replace mock data in `/vendors/all` page with Supabase queries
  - File: `apps/website/src/app/vendors/all/page.tsx`
  - Dependencies: Supabase vendor table populated
  - Estimated: 4 hours

- [ ] **P1-1.3** Replace mock data in collection pages with Supabase queries
  - File: `apps/website/src/lib/vendors/collections.ts`
  - Dependencies: Supabase vendor table populated
  - Estimated: 3 hours

- [ ] **P1-1.4** Remove or gate mock fallback in vendor detail page
  - File: `apps/website/src/app/vendors/[slug]/page.tsx`
  - Action: Gate behind dev-only flag or remove entirely
  - Estimated: 2 hours

- [ ] **P1-1.5** Migrate vendor images from local assets to Supabase storage
  - Files: All vendor pages
  - Dependencies: Supabase storage bucket configured
  - Estimated: 6 hours

### 1.2 Server-Backed Search, Filter, Sort, Pagination
- [ ] **P1-2.1** Create Supabase RPC function for vendor search
  - File: `supabase/migrations/XXX_vendor_search.sql`
  - Features: Full-text search, filters, sorting
  - Estimated: 6 hours

- [ ] **P1-2.2** Create Next.js API route for vendor search
  - File: `apps/website/src/app/api/vendors/search/route.ts`
  - Features: Query params parsing, pagination, error handling
  - Estimated: 4 hours

- [ ] **P1-2.3** Update `/vendors/all` page to use search API
  - File: `apps/website/src/app/vendors/all/page.tsx`
  - Features: URL params sync, loading states, error handling
  - Estimated: 5 hours

- [ ] **P1-2.4** Update VendorCollectionView to use search API
  - File: `apps/website/src/components/vendors/VendorCollectionView.tsx`
  - Features: Server-side filtering, pagination
  - Estimated: 4 hours

- [ ] **P1-2.5** Add database indexes for search performance
  - File: `supabase/migrations/XXX_vendor_indexes.sql`
  - Indexes: category, location, price_range, rating, created_at
  - Estimated: 2 hours

### 1.3 Lead Capture and Saving
- [ ] **P1-3.1** Create database migration for user_saved_vendors table
  - File: `supabase/migrations/XXX_user_saved_vendors.sql`
  - Estimated: 1 hour

- [ ] **P1-3.2** Create Supabase functions for save/unsave vendor
  - File: `supabase/migrations/XXX_save_vendor_functions.sql`
  - Estimated: 2 hours

- [ ] **P1-3.3** Create Next.js API routes for save/favorite
  - Files: 
    - `apps/website/src/app/api/vendors/[id]/save/route.ts`
    - `apps/website/src/app/api/users/saved-vendors/route.ts`
  - Estimated: 4 hours

- [ ] **P1-3.4** Implement save functionality in vendor cards
  - Files: All vendor listing components
  - Features: Optimistic updates, error handling
  - Estimated: 3 hours

- [ ] **P1-3.5** Create database migration for bookings/inquiries table
  - File: `supabase/migrations/XXX_bookings.sql`
  - Features: Status workflow, payment tracking
  - Estimated: 4 hours

- [ ] **P1-3.6** Create Next.js API route for booking/inquiry submission
  - File: `apps/website/src/app/api/bookings/route.ts`
  - Features: Validation, notification triggers
  - Estimated: 5 hours

- [ ] **P1-3.7** Connect VendorBookingSidebar to booking API
  - File: `apps/website/src/components/vendors/VendorBookingSidebar.tsx`
  - Features: Form submission, success/error states
  - Estimated: 4 hours

- [ ] **P1-3.8** Implement user authentication check for save/booking actions
  - Files: All vendor components with save/booking
  - Features: Auth redirect, login prompts
  - Estimated: 3 hours

### 1.4 Reviews Pipeline
- [ ] **P1-4.1** Create database migration for review submission workflow
  - File: `supabase/migrations/XXX_review_workflow.sql`
  - Features: Verified reviews, moderation status
  - Estimated: 3 hours

- [ ] **P1-4.2** Create Next.js API route for review submission
  - File: `apps/website/src/app/api/reviews/route.ts`
  - Features: Booking verification, moderation queue
  - Estimated: 5 hours

- [ ] **P1-4.3** Create Next.js API route for vendor review responses
  - File: `apps/website/src/app/api/reviews/[id]/response/route.ts`
  - Estimated: 3 hours

- [ ] **P1-4.4** Build review submission UI component
  - File: `apps/website/src/components/vendors/VendorReviewForm.tsx`
  - Features: Rating, comment, image upload, validation
  - Estimated: 6 hours

- [ ] **P1-4.5** Add review moderation admin interface
  - File: `apps/admin/src/app/reviews/page.tsx`
  - Features: Approve/reject, spam detection
  - Estimated: 8 hours

### 1.5 Real Availability Calendar
- [ ] **P1-5.1** Create database migration for vendor_availability table
  - File: `supabase/migrations/XXX_vendor_availability.sql`
  - Estimated: 2 hours

- [ ] **P1-5.2** Create Supabase function to check availability
  - File: `supabase/migrations/XXX_availability_function.sql`
  - Estimated: 3 hours

- [ ] **P1-5.3** Create Next.js API route for availability
  - File: `apps/website/src/app/api/vendors/[id]/availability/route.ts`
  - Estimated: 3 hours

- [ ] **P1-5.4** Integrate availability API into VendorBookingSidebar
  - File: `apps/website/src/components/vendors/VendorBookingSidebar.tsx`
  - Features: Disable booked dates, show availability
  - Estimated: 4 hours

- [ ] **P1-5.5** Create background job to sync bookings with availability
  - File: `services/jobs/src/vendor-availability-sync.ts`
  - Estimated: 4 hours

### 1.6 Payment Processing
- [ ] **P1-6.1** Set up payment gateway integration (Stripe/PayPal)
  - File: `services/payments/src/gateway.ts`
  - Estimated: 8 hours

- [ ] **P1-6.2** Create invoice generation system
  - File: `services/payments/src/invoices.ts`
  - Estimated: 6 hours

- [ ] **P1-6.3** Create payment tracking and status updates
  - File: `services/payments/src/tracking.ts`
  - Estimated: 4 hours

- [ ] **P1-6.4** Integrate payment flow into booking process
  - Files: Booking components and API routes
  - Estimated: 6 hours

---

## Phase 2: High Priority (Competitive Necessities)

### 2.1 Messaging System
- [ ] **P2-1.1** Create database migration for messaging tables
  - File: `supabase/migrations/XXX_messaging.sql`
  - Estimated: 2 hours

- [ ] **P2-1.2** Create Next.js API routes for messaging
  - Files: 
    - `apps/website/src/app/api/messages/route.ts`
    - `apps/website/src/app/api/messages/[threadId]/route.ts`
  - Estimated: 5 hours

- [ ] **P2-1.3** Set up WebSocket/real-time messaging
  - File: `services/api/src/websocket.ts`
  - Estimated: 8 hours

- [ ] **P2-1.4** Build messaging UI component
  - File: `apps/website/src/components/vendors/VendorMessaging.tsx`
  - Estimated: 10 hours

- [ ] **P2-1.5** Add notification system for new messages
  - File: `services/webhooks/src/message-notifications.ts`
  - Estimated: 4 hours

### 2.2 Advanced Filtering
- [ ] **P2-2.1** Add response time filter to search API
  - Files: Search API and Supabase function
  - Estimated: 3 hours

- [ ] **P2-2.2** Add verified badge filter
  - Files: Search API and UI
  - Estimated: 2 hours

- [ ] **P2-2.3** Add price range slider (not just $, $$, $$$)
  - File: `apps/website/src/components/vendors/VendorFilters.tsx`
  - Estimated: 4 hours

- [ ] **P2-2.4** Add availability date filter
  - Files: Search API and UI
  - Estimated: 4 hours

- [ ] **P2-2.5** Add category-specific filters (capacity, style, cuisine)
  - Files: Search API and UI components
  - Estimated: 6 hours

### 2.3 Map View
- [ ] **P2-3.1** Fix Mapbox token environment variable
  - File: `apps/website/src/components/vendors/VendorLocation.tsx`
  - Estimated: 1 hour

- [ ] **P2-3.2** Add mapbox-gl dependency
  - File: `apps/website/package.json`
  - Estimated: 0.5 hours

- [ ] **P2-3.3** Create map view component with vendor pins
  - File: `apps/website/src/components/vendors/VendorMapView.tsx`
  - Estimated: 8 hours

- [ ] **P2-3.4** Add toggle between list and map view
  - File: `apps/website/src/app/vendors/all/page.tsx`
  - Estimated: 3 hours

- [ ] **P2-3.5** Implement map fallback UI
  - File: `apps/website/src/components/vendors/VendorLocation.tsx`
  - Estimated: 2 hours

### 2.4 Vendor Comparison Tool
- [ ] **P2-4.1** Create comparison component
  - File: `apps/website/src/components/vendors/VendorComparison.tsx`
  - Estimated: 10 hours

- [ ] **P2-4.2** Add "Compare" button to vendor cards
  - Files: Vendor listing components
  - Estimated: 2 hours

- [ ] **P2-4.3** Create comparison modal/page
  - File: `apps/website/src/app/vendors/compare/page.tsx`
  - Estimated: 6 hours

---

## Phase 3: Important (User Experience)

### 3.1 SEO & Structured Data
- [ ] **P3-1.1** Add metadata to `/vendors` listing page
  - File: `apps/website/src/app/vendors/page.tsx`
  - Estimated: 2 hours

- [ ] **P3-1.2** Add metadata to `/vendors/all` page
  - File: `apps/website/src/app/vendors/all/page.tsx`
  - Estimated: 2 hours

- [ ] **P3-1.3** Complete structured data for all vendor types
  - File: `apps/website/src/app/vendors/[slug]/page.tsx`
  - Estimated: 4 hours

- [ ] **P3-1.4** Add review schema markup
  - File: `apps/website/src/components/vendors/VendorReviews.tsx`
  - Estimated: 2 hours

- [ ] **P3-1.5** Add breadcrumb schema
  - Files: All vendor pages
  - Estimated: 2 hours

- [ ] **P3-1.6** Add category page schema
  - File: `apps/website/src/app/vendors/collection/[slug]/page.tsx`
  - Estimated: 2 hours

- [ ] **P3-1.7** Generate dynamic sitemap
  - File: `apps/website/src/app/sitemap.ts`
  - Estimated: 4 hours

- [ ] **P3-1.8** Add canonical URLs to all pages
  - Files: All vendor pages
  - Estimated: 2 hours

### 3.2 Performance Optimizations
- [ ] **P3-2.1** Fix N+1 queries in vendor reviews
  - File: `apps/website/src/lib/supabase/vendors.ts`
  - Estimated: 4 hours

- [ ] **P3-2.2** Implement atomic view count increments
  - File: `apps/website/src/lib/supabase/vendors.ts`
  - Estimated: 2 hours

- [ ] **P3-2.3** Replace all `<img>` with Next.js `<Image>`
  - Files: All vendor pages
  - Estimated: 6 hours

- [ ] **P3-2.4** Add skeleton loaders to vendor listings
  - Files: Vendor listing components
  - Estimated: 4 hours

- [ ] **P3-2.5** Implement caching strategy for vendor listings
  - Files: API routes and pages
  - Estimated: 4 hours

- [ ] **P3-2.6** Add code splitting for vendor detail page
  - File: `apps/website/src/app/vendors/[slug]/page.tsx`
  - Estimated: 3 hours

- [ ] **P3-2.7** Optimize database queries with proper indexes
  - File: `supabase/migrations/XXX_performance_indexes.sql`
  - Estimated: 3 hours

### 3.3 Real Metrics & Social Proof
- [ ] **P3-3.1** Track vendor response times
  - File: `services/jobs/src/track-response-times.ts`
  - Estimated: 4 hours

- [ ] **P3-3.2** Calculate booking statistics
  - File: `apps/website/src/lib/supabase/vendors.ts`
  - Estimated: 4 hours

- [ ] **P3-3.3** Display real metrics in VendorHero
  - File: `apps/website/src/components/vendors/VendorHero.tsx`
  - Estimated: 3 hours

- [ ] **P3-3.4** Display real metrics in VendorProfile
  - File: `apps/website/src/components/vendors/VendorProfile.tsx`
  - Estimated: 3 hours

- [ ] **P3-3.5** Add social proof indicators to vendor cards
  - Files: Vendor listing components
  - Estimated: 4 hours

### 3.4 Category Pages & SEO Content
- [ ] **P3-4.1** Build dynamic category landing pages
  - File: `apps/website/src/app/vendors/collection/[slug]/page.tsx`
  - Estimated: 6 hours

- [ ] **P3-4.2** Add category-specific content and guides
  - Files: Category page components
  - Estimated: 8 hours

- [ ] **P3-4.3** Add category-specific filters
  - Files: Category pages and search API
  - Estimated: 6 hours

---

## Phase 4: Nice to Have (Enhancements)

### 4.1 Portfolio Enhancements
- [ ] **P4-1.1** Add portfolio filtering by event type, year, venue
  - File: `apps/website/src/components/vendors/VendorImageGallery.tsx`
  - Estimated: 6 hours

- [ ] **P4-1.2** Implement virtual tours for venues
  - File: `apps/website/src/components/vendors/VendorVirtualTour.tsx`
  - Estimated: 12 hours

- [ ] **P4-1.3** Add video testimonials support
  - Files: Review components and database
  - Estimated: 8 hours

### 4.2 Vendor Information
- [ ] **P4-2.1** Add team member profiles
  - Files: Database, API, UI components
  - Estimated: 10 hours

- [ ] **P4-2.2** Add insurance/licensing information display
  - File: `apps/website/src/components/vendors/VendorProfile.tsx`
  - Estimated: 4 hours

- [ ] **P4-2.3** Add FAQ section
  - File: `apps/website/src/components/vendors/VendorFAQ.tsx`
  - Estimated: 6 hours

- [ ] **P4-2.4** Add detailed package pricing display
  - File: `apps/website/src/components/vendors/VendorPricing.tsx`
  - Estimated: 8 hours

### 4.3 Analytics & Tracking
- [ ] **P4-3.1** Create vendor analytics API
  - File: `apps/website/src/app/api/vendors/[id]/analytics/route.ts`
  - Estimated: 6 hours

- [ ] **P4-3.2** Implement user behavior tracking
  - Files: Analytics service and components
  - Estimated: 8 hours

- [ ] **P4-3.3** Build analytics dashboard for vendors
  - File: `apps/vendor-portal/src/app/analytics/page.tsx`
  - Estimated: 12 hours

---

## Technical Debt & Fixes

### Database & Performance
- [ ] **TD-1** Fix N+1 queries in all vendor data fetching
  - File: `apps/website/src/lib/supabase/vendors.ts`
  - Estimated: 6 hours

- [ ] **TD-2** Add database connection pooling
  - File: Supabase configuration
  - Estimated: 2 hours

- [ ] **TD-3** Optimize all database queries with EXPLAIN ANALYZE
  - Files: All Supabase query files
  - Estimated: 4 hours

### Code Quality
- [ ] **TD-4** Add TypeScript strict mode compliance
  - Files: All vendor-related files
  - Estimated: 8 hours

- [ ] **TD-5** Add unit tests for vendor API routes
  - Files: Test files for API routes
  - Estimated: 10 hours

- [ ] **TD-6** Add integration tests for vendor flows
  - Files: Test files for E2E flows
  - Estimated: 12 hours

### UX Improvements
- [ ] **TD-7** Add error boundaries to vendor pages
  - Files: All vendor pages
  - Estimated: 4 hours

- [ ] **TD-8** Improve empty states across vendor pages
  - Files: All vendor listing components
  - Estimated: 4 hours

- [ ] **TD-9** Add accessibility improvements (ARIA, keyboard nav)
  - Files: All vendor components
  - Estimated: 8 hours

- [ ] **TD-10** Optimize mobile experience
  - Files: All vendor pages
  - Estimated: 6 hours

---

## Summary

**Total Estimated Hours**: ~450 hours

**Phase 1 (Critical)**: ~120 hours  
**Phase 2 (High Priority)**: ~80 hours  
**Phase 3 (Important)**: ~100 hours  
**Phase 4 (Nice to Have)**: ~80 hours  
**Technical Debt**: ~70 hours

---

*Last Updated: [Current Date]*
