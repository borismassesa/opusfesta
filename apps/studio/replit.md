# OpusFesta Studio - Photography & Videography Studio

## Overview
Next.js 15 website for OpusFesta Studio, a photography and videography studio specializing in weddings, luxury events, and corporate milestones. Features a brutalist design theme.

## Tech Stack
- **Framework**: Next.js 15.5.7
- **React**: 19.0.0
- **Styling**: Tailwind CSS 3.4.17
- **TypeScript**: 5.x
- **Fonts**: DM Sans (sans), Space Mono (mono)

## Project Structure
```
├── app/               # Next.js App Router pages and layouts
│   ├── globals.css    # Global styles (brutalist utilities, animations)
│   ├── layout.tsx     # Root layout with metadata
│   └── page.tsx       # Home page
├── components/        # React components
│   ├── Header.tsx             # Fixed header with menu + Book Now CTA
│   ├── HeroSection.tsx        # Full-screen hero with headline
│   ├── FeaturedProjects.tsx   # Stats bar + studio intro + marquee
│   ├── ServicesSection.tsx    # Numbered accordion (01-06)
│   ├── ProcessSection.tsx     # 4-step workflow with timeline
│   ├── SignatureWorkSection.tsx # Portfolio showcase
│   ├── VideoLightboxSection.tsx # Studio reel with lightbox
│   ├── TestimonialsCarousel.tsx # Client quotes with side nav
│   ├── FAQSection.tsx         # Expandable FAQ accordion
│   ├── CTASection.tsx         # Final call to action
│   ├── MainFooter.tsx         # Contact + social + legal
│   ├── MenuSidebar.tsx        # Slide-out navigation menu
│   ├── GridOverlay.tsx        # Subtle background grid
│   └── BackToTop.tsx          # Scroll to top button
├── next.config.ts     # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies and scripts
```

## Development
The development server runs on port 5000 with:
```bash
npm run dev
```

## External Services
- **Supabase**: Used for image hosting (hoirqrkdgbmvpwutwuwj.supabase.co)

## Design System
- **Theme**: Brutalist light theme with warm off-white backgrounds
- **Palette**: brand-bg (#FAFAF8), brand-panel (#F0EDE8), brand-accent (#C45A3C terracotta), brand-dark (#0A0A0A)
- **Style**: Bold typography, zero border radius, thick borders (border-4), hard offset shadows (4px 4px 0px), high contrast
- **Shadows**: shadow-brutal-sm (4px 4px), shadow-brutal (8px 8px), shadow-brutal-lg (12px 12px)
- **Interactions**: Hover states remove shadow and translate element (hover:translate-x-1 hover:translate-y-1)
- **Animations**: Scroll-to-reveal via IntersectionObserver on all major sections

## Page Section Order
1. Hero
2. Featured Projects (stats + intro + marquee)
3. Services (accordion)
4. Process (How It Works - interactive timeline)
5. Signature Work (portfolio)
6. Video Reel (lightbox)
7. Testimonials (carousel)
8. FAQ (accordion)
9. CTA (Book Your Date)
10. Main Footer

## Recent Changes
- Removed CartSidebar, JournalSection, NewsletterSection, NavigationFooter (not needed for a studio site)
- Replaced cart icon in header with "Book Now" CTA button
- Updated MenuSidebar links to point to actual page sections
- Rearranged sections: Portfolio now comes before Video Reel for better flow
- Redesigned ProcessSection with dark background, interactive timeline, and step navigator
