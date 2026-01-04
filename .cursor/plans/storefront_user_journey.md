# Storefront User Journey - Complete Flow Plan

## Overview
This plan documents the complete user experience flow when a vendor clicks the "Storefront" tab in the sidebar, from initial click through completing their storefront setup.

## User Journey Flow

### 1. Initial Click & Navigation
**Action**: User clicks "Storefront" in sidebar
**Route**: `/storefront`
**Component**: `apps/vendor-portal/src/app/storefront/page.tsx`

**What happens**:
- Next.js router navigates to `/storefront`
- Page component renders with sidebar layout
- `StorefrontBuilder` component is loaded

---

### 2. Authentication Check
**Component**: `StorefrontBuilder.tsx` (lines 34-75)

**Flow**:
1. Component mounts
2. `useEffect` hook triggers authentication check
3. Calls `supabase.auth.getSession()`
4. Sets up auth state change listener

**States**:
- **Loading**: Shows "Checking authentication..." spinner
- **Not Authenticated**: Shows error card with "Go to Login" button → redirects to `/login`
- **Authenticated**: Proceeds to fetch vendor data

**UI States**:
```typescript
// Loading State
<Loader2 /> + "Checking authentication..."

// Error State  
<Card> with AlertCircle icon + "Authentication Required" + Login button
```

---

### 3. Vendor Data Fetching
**Component**: `StorefrontBuilder.tsx` (lines 77-91)

**Flow**:
1. Once authenticated, `userId` is set
2. React Query hook `useQuery` fetches vendor data
3. Calls `getVendorByUserId(userId)`
4. Queries Supabase `vendors` table

**States**:
- **Loading**: Shows "Loading your storefront..." spinner
- **No Vendor Found**: Shows "No Vendor Profile Found" card
- **Vendor Found**: Proceeds to render storefront builder

**UI States**:
```typescript
// Loading
<Loader2 /> + "Loading your storefront..."

// No Vendor
<Card> "No Vendor Profile Found" + description
```

---

### 4. First-Time User Experience (No Vendor Profile)
**Scenario**: User is authenticated but has no vendor record

**Current Behavior**:
- Shows card: "No Vendor Profile Found"
- Message: "You need to create a vendor profile first. Complete the form below to get started."
- **Issue**: Form is not actually shown below

**Proposed Improvement**:
- Show onboarding wizard or initial setup form
- Guide user through creating their first vendor profile
- Auto-create vendor record with minimal required fields
- Or show `StorefrontForm` in "create mode" instead of "edit mode"

---

### 5. Returning User Experience (Vendor Profile Exists)
**Scenario**: User has existing vendor profile

**Page Structure**:
```
┌─────────────────────────────────────────────────┐
│ Header: "Storefront Customization"              │
│ Subtitle: "Customize your storefront..."        │
├─────────────────────────────────────────────────┤
│ Completion Checklist (if vendor exists)         │
├─────────────────────────────────────────────────┤
│ Smart Recommendations (if vendor exists)        │
├─────────────────────────────────────────────────┤
│ Tabs: [Build Your Storefront] [Boost Visibility]│
├─────────────────────────────────────────────────┤
│ Tab Content (see below)                          │
└─────────────────────────────────────────────────┘
```

---

### 6. Main Content Layout

#### Tab 1: "Build Your Storefront"
**Layout**: 2-column grid (desktop), stacked (mobile)

**Left Column (2/3 width)**:
1. **StorefrontForm** - Business Information
   - Business name, category
   - Bio, description
   - Logo, cover image upload
   - Location details
   - Contact info
   - Social links
   - Services offered
   - Years in business, team size

2. **PortfolioManager** - Portfolio Items
   - Add/edit/delete portfolio items
   - Image galleries
   - Event types and dates

3. **PackagesPricingManager** - Service Packages
   - Create/edit packages
   - Pricing, duration, features
   - Mark as popular

4. **AvailabilityManager** - Availability Calendar
   - Set available/unavailable dates
   - Block dates with reasons

5. **AwardsManager** - Awards & Recognition
   - Add awards, certifications

6. **ProfileSettings** - Additional Settings
   - Profile visibility
   - Notification preferences

**Right Column (1/3 width)**:
1. **StorefrontPreview** - Live Preview
   - Shows how storefront looks
   - "View Live" button (if slug exists)

2. **StorefrontAnalytics** - Performance Metrics
   - Views, inquiries, saves
   - Ratings, reviews

**Full Width (Bottom)**:
- **ReviewsManager** - Manage Reviews
  - View and respond to reviews

#### Tab 2: "Boost Your Visibility"
**Content**: `VisibilityBoost` component
- SEO optimization tips
- Promotion options
- Featured listing upgrades

---

### 7. Component Interaction Flow

#### Form Submission Flow
**Example**: User updates Business Information

1. **User Action**: Fills form fields, clicks "Save"
2. **Form Validation**: Zod schema validates data
3. **Mutation Trigger**: `updateMutation.mutate(data)` called
4. **API Call**: `updateVendor()` function called
   - Updates Supabase `vendors` table
   - Generates/updates slug if needed
5. **Success**: 
   - Toast notification shown
   - `onUpdate()` callback triggers `refetch()`
   - Form data refreshes
   - Preview updates (if watching vendor state)
6. **Error**: Error message displayed in form

#### Real-time Updates
- Preview component watches `vendor` prop
- When vendor data changes, preview re-renders
- Analytics component refetches on vendor update

---

### 8. Data Flow Architecture

```
User Input
    ↓
Form Component (react-hook-form)
    ↓
Validation (Zod schema)
    ↓
Mutation (React Query)
    ↓
API Function (vendor.ts)
    ↓
Supabase Client
    ↓
Database (vendors table)
    ↓
Success/Error Response
    ↓
Toast Notification
    ↓
Refetch Query
    ↓
Component Re-render
    ↓
Preview Update
```

---

### 9. Key User Interactions

#### Creating New Portfolio Item
1. Click "Add Portfolio Item" in PortfolioManager
2. Modal/form opens
3. Fill: title, images, description, event type, date
4. Click "Save"
5. Item added to portfolio
6. Preview updates to show new item

#### Adding Service Package
1. Click "Add Package" in PackagesPricingManager
2. Form opens
3. Fill: name, price, duration, features
4. Optionally mark as "Popular"
5. Save
6. Package appears in list

#### Updating Availability
1. Open AvailabilityManager
2. Click on calendar dates
3. Toggle available/unavailable
4. Add reason for blocked dates
5. Save changes
6. Calendar updates

---

### 10. Completion Checklist Flow

**Component**: `CompletionChecklist.tsx`

**Checks**:
- Business name ✓
- Description (min 50 chars) ✓
- Cover image ✓
- Portfolio photos (min 3) ✓
- At least 1 package ✓
- Contact info ✓
- Location ✓

**Behavior**:
- Shows checkmarks for completed items
- Shows circles for incomplete items
- Displays completion percentage
- **Proposed**: Make items clickable to jump to relevant section

---

### 11. Smart Recommendations

**Component**: `SmartRecommendations.tsx`

**Purpose**: 
- Analyzes vendor profile completeness
- Suggests next actions
- Provides tips for improvement

**Examples**:
- "Add more portfolio photos to increase inquiries"
- "Complete your business description"
- "Add service packages to attract more clients"

---

### 12. Preview Component

**Component**: `StorefrontPreview.tsx`

**Shows**:
- Cover image
- Logo
- Business name
- Category badge
- Price range
- Location
- "View Live Storefront" button (if slug exists)

**Proposed Enhancements**:
- Real-time updates as user types
- Mobile/tablet/desktop view toggle
- Interactive preview (clickable elements)

---

### 13. Error Handling

**Scenarios**:
1. **Network Error**: Show retry button
2. **Validation Error**: Show inline field errors
3. **Auth Expired**: Redirect to login
4. **Permission Denied**: Show error message
5. **Image Upload Failed**: Show error, allow retry

---

### 14. Success States

**After Successful Save**:
- Toast notification: "Storefront updated successfully"
- Form shows saved state
- Preview refreshes
- Analytics may update (if tracking changes)

**After Completing Checklist**:
- Show celebration/confetti (proposed)
- "Congratulations! Your storefront is complete"
- Suggest next steps

---

### 15. Mobile Experience

**Current**: Forms stack vertically
**Layout Changes**:
- Preview moves to bottom or separate view
- Tabs become dropdown or bottom navigation
- Forms use full width
- Touch-optimized buttons and inputs

---

## Proposed Improvements

### Phase 1: Critical Fixes
1. **Fix "No Vendor" State**: Show form to create vendor profile
2. **Add Auto-save**: Save changes automatically after delay
3. **Improve Loading States**: Better skeleton loaders
4. **Error Recovery**: Better error messages and retry options

### Phase 2: UX Enhancements
1. **Section Navigation**: Sticky sidebar with section links
2. **Click-to-Jump**: Checklist items jump to relevant sections
3. **Real-time Preview**: Preview updates as user types
4. **Progress Indicator**: Show overall completion percentage

### Phase 3: Advanced Features
1. **Undo/Redo**: Allow undoing changes
2. **Version History**: See previous versions
3. **Collaboration**: Multiple users editing (if needed)
4. **Templates**: Pre-built storefront templates

---

## Files Involved

**Page Component**:
- `apps/vendor-portal/src/app/storefront/page.tsx`

**Main Builder**:
- `apps/vendor-portal/src/components/storefront/StorefrontBuilder.tsx`

**Form Components**:
- `apps/vendor-portal/src/components/storefront/StorefrontForm.tsx`
- `apps/vendor-portal/src/components/storefront/PortfolioManager.tsx`
- `apps/vendor-portal/src/components/storefront/PackagesPricingManager.tsx`
- `apps/vendor-portal/src/components/storefront/AvailabilityManager.tsx`
- `apps/vendor-portal/src/components/storefront/AwardsManager.tsx`
- `apps/vendor-portal/src/components/storefront/ProfileSettings.tsx`
- `apps/vendor-portal/src/components/storefront/ReviewsManager.tsx`

**Supporting Components**:
- `apps/vendor-portal/src/components/storefront/StorefrontPreview.tsx`
- `apps/vendor-portal/src/components/storefront/StorefrontAnalytics.tsx`
- `apps/vendor-portal/src/components/storefront/CompletionChecklist.tsx`
- `apps/vendor-portal/src/components/storefront/SmartRecommendations.tsx`
- `apps/vendor-portal/src/components/storefront/VisibilityBoost.tsx`
- `apps/vendor-portal/src/components/storefront/ImageUpload.tsx`

**API Functions**:
- `apps/vendor-portal/src/lib/supabase/vendor.ts`
- `apps/vendor-portal/src/lib/supabase/client.ts`

---

## Data Schema

**Vendor Table** (from Supabase):
- id, slug, user_id
- business_name, category, subcategories
- bio, description
- logo, cover_image
- location (JSON)
- price_range
- verified, tier
- stats (JSON)
- contact_info (JSON)
- social_links (JSON)
- years_in_business, team_size
- services_offered (array)
- created_at, updated_at

**Related Tables**:
- portfolio (portfolio items)
- vendor_packages (service packages)
- reviews (customer reviews)

---

## Next Steps

1. Review this plan
2. Identify priority improvements
3. Create implementation tasks
4. Begin with Phase 1 critical fixes
5. Iterate based on user feedback
