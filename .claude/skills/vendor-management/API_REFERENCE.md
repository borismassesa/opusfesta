# Vendor Management API Reference

## REST API Endpoints

### Vendor CRUD Operations

#### Create Vendor
```http
POST /api/vendors
Content-Type: application/json

{
  "name": "Dream Venues Ltd",
  "email": "contact@dreamvenues.com",
  "phone": "+255712345678",
  "category": "VENUE",
  "description": "Premium wedding venues in Dar es Salaam",
  "location": {
    "city": "Dar es Salaam",
    "region": "Kinondoni",
    "country": "Tanzania"
  },
  "services": [
    {
      "name": "Beach Wedding Package",
      "basePrice": 5000000,
      "currency": "TZS"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vendor_123xyz",
    "status": "pending",
    "profileUrl": "/vendors/vendor_123xyz"
  }
}
```

#### Get Vendor
```http
GET /api/vendors/:id
```

**Response:**
```json
{
  "id": "vendor_123xyz",
  "name": "Dream Venues Ltd",
  "email": "contact@dreamvenues.com",
  "category": "VENUE",
  "rating": 4.8,
  "totalReviews": 45,
  "services": [...],
  "portfolio": [...],
  "status": "active"
}
```

#### Update Vendor
```http
PATCH /api/vendors/:id
Content-Type: application/json

{
  "description": "Updated description",
  "services": [...]
}
```

#### Delete Vendor
```http
DELETE /api/vendors/:id
```

### Search & Filter

#### Search Vendors
```http
GET /api/vendors/search
  ?category=VENUE
  &location=dar-es-salaam
  &minPrice=1000000
  &maxPrice=10000000
  &rating=4
  &availability=2025-06-15
  &page=1
  &limit=20
```

**Response:**
```json
{
  "vendors": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  },
  "filters": {
    "categories": ["VENUE", "CATERING"],
    "priceRanges": [...],
    "locations": [...]
  }
}
```

### Services Management

#### Add Service
```http
POST /api/vendors/:vendorId/services
Content-Type: application/json

{
  "name": "Premium Photography Package",
  "description": "Full-day coverage with album",
  "category": "PHOTOGRAPHY",
  "basePrice": 2000000,
  "pricingType": "package",
  "features": [
    "8 hours coverage",
    "2 photographers",
    "300+ edited photos",
    "Premium album"
  ],
  "addOns": [
    {
      "name": "Engagement shoot",
      "price": 500000
    }
  ]
}
```

#### Update Service
```http
PATCH /api/vendors/:vendorId/services/:serviceId
```

#### Delete Service
```http
DELETE /api/vendors/:vendorId/services/:serviceId
```

### Portfolio Management

#### Upload Portfolio Item
```http
POST /api/vendors/:vendorId/portfolio
Content-Type: multipart/form-data

{
  "file": [binary],
  "type": "image",
  "title": "Beach Wedding Setup",
  "description": "Romantic beach ceremony",
  "tags": ["beach", "outdoor", "sunset"]
}
```

#### Delete Portfolio Item
```http
DELETE /api/vendors/:vendorId/portfolio/:itemId
```

### Availability Management

#### Get Availability
```http
GET /api/vendors/:vendorId/availability
  ?from=2025-06-01
  &to=2025-06-30
```

**Response:**
```json
{
  "available": [
    "2025-06-05",
    "2025-06-12",
    "2025-06-19"
  ],
  "booked": [
    "2025-06-07",
    "2025-06-14"
  ],
  "blocked": [
    "2025-06-21"
  ]
}
```

#### Update Availability
```http
POST /api/vendors/:vendorId/availability
Content-Type: application/json

{
  "date": "2025-06-21",
  "status": "blocked",
  "reason": "Personal event"
}
```

### Reviews & Ratings

#### Get Vendor Reviews
```http
GET /api/vendors/:vendorId/reviews
  ?page=1
  &limit=10
  &sort=recent
```

#### Add Review (Client endpoint)
```http
POST /api/vendors/:vendorId/reviews
Content-Type: application/json

{
  "bookingId": "booking_xyz",
  "rating": 5,
  "comment": "Excellent service!",
  "categories": {
    "communication": 5,
    "quality": 5,
    "value": 4,
    "professionalism": 5
  }
}
```

### Analytics & Reports

#### Get Vendor Statistics
```http
GET /api/vendors/:vendorId/analytics
  ?from=2025-01-01
  &to=2025-12-31
```

**Response:**
```json
{
  "bookings": {
    "total": 45,
    "completed": 40,
    "cancelled": 5,
    "revenue": 50000000
  },
  "performance": {
    "avgRating": 4.8,
    "totalReviews": 40,
    "responseTime": "2.5 hours",
    "responseRate": "98%"
  },
  "trends": {
    "bookingsByMonth": [...],
    "revenueByMonth": [...],
    "ratingTrend": [...]
  }
}
```

## Database Schema Examples

### Prisma Schema

```prisma
model Vendor {
  id              String         @id @default(cuid())
  email           String         @unique
  passwordHash    String
  name            String
  slug            String         @unique
  category        VendorCategory
  description     String?        @db.Text
  phone           String?
  website         String?

  // Location
  location        Json?
  serviceAreas    String[]

  // Business Info
  businessLicense String?
  taxId           String?
  yearsInBusiness Int?

  // Media
  logo            String?
  coverImage      String?
  portfolio       Media[]

  // Services & Pricing
  services        Service[]
  pricingTier     PricingTier    @default(BASIC)

  // Performance
  rating          Float          @default(0)
  totalReviews    Int            @default(0)
  totalBookings   Int            @default(0)

  // Status
  status          VendorStatus   @default(PENDING)
  verified        Boolean        @default(false)
  featured        Boolean        @default(false)

  // Relations
  bookings        Booking[]
  reviews         Review[]
  inquiries       Inquiry[]

  // Timestamps
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  lastLoginAt     DateTime?

  @@index([category, status])
  @@index([slug])
  @@index([rating])
}

model Service {
  id            String         @id @default(cuid())
  vendorId      String
  vendor        Vendor         @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  name          String
  slug          String
  description   String         @db.Text
  category      String

  // Pricing
  basePrice     Float
  currency      String         @default("TZS")
  pricingType   PricingType    @default(FIXED)

  // Details
  features      String[]
  duration      String?
  maxCapacity   Int?

  // Add-ons
  addOns        Json?

  // Availability
  available     Boolean        @default(true)

  // Relations
  bookings      Booking[]

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@unique([vendorId, slug])
  @@index([vendorId])
  @@index([category])
}

model Media {
  id          String      @id @default(cuid())
  vendorId    String
  vendor      Vendor      @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  type        MediaType   // IMAGE, VIDEO
  url         String
  thumbnailUrl String?

  title       String?
  description String?
  tags        String[]

  order       Int         @default(0)
  featured    Boolean     @default(false)

  createdAt   DateTime    @default(now())

  @@index([vendorId, order])
}

model Review {
  id          String   @id @default(cuid())
  vendorId    String
  vendor      Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id])
  userId      String

  rating      Int      // 1-5
  comment     String?  @db.Text

  // Detailed ratings
  communication Int?
  quality       Int?
  value         Int?
  professionalism Int?

  verified    Boolean  @default(false)

  // Vendor response
  response    String?  @db.Text
  respondedAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([vendorId, rating])
  @@index([createdAt])
}

model Booking {
  id          String        @id @default(cuid())
  vendorId    String
  vendor      Vendor        @relation(fields: [vendorId], references: [id])
  serviceId   String
  service     Service       @relation(fields: [serviceId], references: [id])
  userId      String

  eventDate   DateTime
  eventType   EventType

  // Pricing
  basePrice   Float
  addOnsPrice Float         @default(0)
  totalPrice  Float

  // Status
  status      BookingStatus @default(PENDING)

  // Details
  guestCount  Int?
  location    Json?
  notes       String?       @db.Text

  // Relations
  review      Review?

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([vendorId, eventDate])
  @@index([userId])
  @@index([status])
}

enum VendorCategory {
  VENUE
  CATERING
  PHOTOGRAPHY
  VIDEOGRAPHY
  MUSIC_DJ
  FLORIST
  DECOR
  PLANNING
  BEAUTY
  FASHION
  TRANSPORTATION
  ENTERTAINMENT
  OTHER
}

enum VendorStatus {
  PENDING
  ACTIVE
  SUSPENDED
  INACTIVE
}

enum PricingType {
  FIXED
  HOURLY
  PACKAGE
  CUSTOM
}

enum PricingTier {
  BASIC
  PREMIUM
  ENTERPRISE
}

enum MediaType {
  IMAGE
  VIDEO
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum EventType {
  WEDDING
  ENGAGEMENT
  ANNIVERSARY
  OTHER
}
```

## TypeScript Types

```typescript
// Vendor types
export interface Vendor {
  id: string;
  email: string;
  name: string;
  slug: string;
  category: VendorCategory;
  description?: string;
  phone?: string;
  website?: string;
  location?: Location;
  logo?: string;
  coverImage?: string;
  rating: number;
  totalReviews: number;
  status: VendorStatus;
  verified: boolean;
  featured: boolean;
  services: Service[];
  portfolio: Media[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  currency: string;
  pricingType: PricingType;
  features: string[];
  addOns?: AddOn[];
  duration?: string;
  maxCapacity?: number;
}

export interface AddOn {
  name: string;
  description?: string;
  price: number;
}

export interface Location {
  address?: string;
  city: string;
  region: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface VendorFilters {
  category?: VendorCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: Date;
  verified?: boolean;
  featured?: boolean;
}

// API Response types
export interface VendorListResponse {
  vendors: Vendor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters?: {
    categories: string[];
    locations: string[];
    priceRanges: PriceRange[];
  };
}

export interface VendorAnalytics {
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  performance: {
    avgRating: number;
    totalReviews: number;
    responseTime: string;
    responseRate: string;
  };
  trends: {
    bookingsByMonth: MonthlyData[];
    revenueByMonth: MonthlyData[];
  };
}
```

## Query Examples

### Next.js Server Actions

```typescript
// app/actions/vendors.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getVendors(filters: VendorFilters) {
  const where = {
    status: 'ACTIVE',
    ...(filters.category && { category: filters.category }),
    ...(filters.rating && { rating: { gte: filters.rating } }),
    ...(filters.verified && { verified: true }),
  };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        services: true,
        portfolio: {
          take: 5,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
      ],
      take: filters.limit || 20,
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    vendors,
    pagination: {
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
      pages: Math.ceil(total / (filters.limit || 20)),
    },
  };
}

export async function createVendor(data: CreateVendorInput) {
  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      slug: generateSlug(data.name),
    },
  });

  revalidatePath('/vendors');
  return vendor;
}

export async function updateVendorProfile(
  vendorId: string,
  data: UpdateVendorInput
) {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data,
  });

  revalidatePath(`/vendors/${vendor.slug}`);
  return vendor;
}
```

### React Query Hooks

```typescript
// hooks/useVendors.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export function useVendors(filters: VendorFilters) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: () => getVendors(filters),
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => getVendor(vendorId),
  });
}

export function useCreateVendor() {
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
```

## Validation Schemas

```typescript
import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  category: z.enum([
    'VENUE',
    'CATERING',
    'PHOTOGRAPHY',
    'VIDEOGRAPHY',
    'MUSIC_DJ',
    'FLORIST',
    'DECOR',
    'PLANNING',
    'BEAUTY',
    'FASHION',
    'TRANSPORTATION',
    'ENTERTAINMENT',
    'OTHER',
  ]),
  description: z.string().min(50).max(2000).optional(),
  location: z.object({
    city: z.string(),
    region: z.string(),
    country: z.string().default('Tanzania'),
  }),
});

export const createServiceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(20).max(1000),
  category: z.string(),
  basePrice: z.number().positive(),
  pricingType: z.enum(['FIXED', 'HOURLY', 'PACKAGE', 'CUSTOM']),
  features: z.array(z.string()).min(1),
  addOns: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
  })).optional(),
});
```

This API reference provides all the endpoints, schemas, and code examples needed for vendor management in OpusFesta Events platform.
