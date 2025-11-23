# The Festa

Tanzania's go-to wedding & events marketplace, empowering couples, families, and vendors with modern digital tools while honoring Swahili traditions.

## Vision

To be Tanzania's go-to wedding & events marketplace, empowering couples, families, and vendors with modern digital tools while honoring Swahili traditions.

## Mission

The Festa connects couples and families with trusted vendors, streamlines event planning, and enables secure mobile money transactions — all in Swahili and English.

## Tech Stack

### Frontend
- **Mobile App**: React Native + Expo (EAS Build/OTA)
- **Vendor Portal**: Next.js 15 (App Router, Server Actions)
- **Admin Panel**: Next.js 15
- **Event Websites**: Next.js (static/export to S3)

### Backend
- **API**: AWS AppSync (GraphQL)
- **Compute**: AWS Lambda (Node.js 20)
- **Database**: Aurora PostgreSQL Serverless v2 + Prisma ORM
- **Realtime**: DynamoDB + OneTable
- **Storage**: S3 + CloudFront CDN
- **Search**: Algolia (Phase 1), OpenSearch (Phase 2)

### Infrastructure
- **Cloud**: AWS (multi-AZ architecture)
- **Auth**: Amazon Cognito (phone/OTP)
- **Payments**: Africa's Talking (M-Pesa, Airtel Money, Tigo Pesa)
- **Messaging**: Africa's Talking (SMS), WhatsApp Business API
- **Monitoring**: Sentry, PostHog, CloudWatch

## Project Structure

```
/thefesta
├── apps/
│   ├── mobile/          # React Native + Expo
│   ├── vendor-portal/   # Next.js vendor dashboard
│   ├── admin/           # Next.js admin console
│   └── website/         # Next.js marketing/event sites (static export ready)
├── docs/
│   └── history/         # Design logs, status reports, and feature notes
├── services/
│   ├── api/             # AppSync schema, resolvers
│   ├── auth/            # Cognito integrations
│   ├── payments/        # Mobile money flows
│   ├── webhooks/        # Express handlers
│   └── jobs/            # Lambda functions for webhooks, indexing
├── packages/
│   ├── ui/              # Shared UI components
│   ├── lib/             # Shared utilities, types
│   └── db/              # Prisma schema + migrations
└── infra/
    └── cdk/             # AWS CDK infrastructure
```

### Documentation

- Central docs and historical notes live in `docs/history/` (all previous root markdown files are grouped there).

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- AWS CLI configured
- Expo CLI

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Start development servers (entire monorepo)
pnpm dev
```

### Development Commands

```bash
# Install and link workspaces
npm install

# Run dev servers per app
npx turbo dev --filter=@thefesta/mobile        # Expo app
npx turbo dev --filter=@thefesta/vendor-portal # Vendor portal
npx turbo dev --filter=@thefesta/admin         # Admin console
npx turbo dev --filter=@thefesta/website       # Marketing/event site

# Build static website export (deployable to S3/CloudFront)
npm run build --workspace @thefesta/website    # outputs to apps/website/out

# Build all packages
pnpm build

# Run linting
pnpm lint

# Run tests
pnpm test

# Type checking
pnpm type-check

# Database operations
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations
```

### Pre-push checklist

Run the monorepo checks (nested git warning + lint/test/type-check on changed workspaces):

```bash
npm run check:prepush  # optional BASE_REF=origin/main or HEAD~1 fallback
```

## Features

### V0 (Private Pilot - 4-6 Weeks)
- ✅ Event creation (date, type, countdown)
- ✅ Checklist & budget tracker
- ✅ Vendor directory (read-only + WhatsApp/Call)
- ✅ Guest list & RSVPs (QR codes, SMS)
- ✅ Push + SMS reminders

### V1 (Public Beta)
- Vendor profiles & search (tags, reviews, ratings)
- In-app chat with file attachments
- Bookings: quotes, deposits, invoices
- Mobile money integration with receipts
- Event website builder (map, schedule, gift info)
- Gift registry/wishlist
- Vendor analytics dashboard

## Key Features

- **TZ-native payments** with M-Pesa, Airtel Money, and Tigo Pesa integration
- **Robust marketplace accounting** with reliable transaction processing
- **Realtime experience** for chat, RSVPs, and notifications
- **Scalable media delivery** through S3 and CloudFront
- **Localization support** for Swahili and English

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software created by Boris Massesa for The Festa marketplace.
