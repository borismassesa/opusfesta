---
name: shared-frontend
description: "UI/UX engineering — design system, shared components, animations, accessibility, responsive design, performance optimization."
---

# Shared Frontend

## Tech Stack

- Next.js App Router with React Server Components
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI / shadcn/ui for accessible primitives
- TypeScript strict mode

## OpusFesta Brutalist Design System

### Core Tokens

| Token | Usage |
|-------|-------|
| `border-3` | Thick 3px borders on cards, buttons, inputs |
| `shadow-brutal` | Offset box shadows (`4px 4px 0px`) |
| `font-mono` | Monospace headings and accent text |
| `brand-primary` | Primary brand color (CSS var `--brand-primary`) |
| `brand-secondary` | Secondary brand color |
| `brand-accent` | Accent/highlight color |

### Component Pattern

```tsx
// Brutalist card example
<div className="border-3 border-black shadow-brutal bg-white p-6">
  <h3 className="font-mono text-lg font-bold uppercase tracking-wide">
    Section Title
  </h3>
  <p className="mt-2 text-gray-700">Content here</p>
</div>

// Brutalist button
<button className="border-3 border-black shadow-brutal bg-brand-primary px-6 py-3 font-mono font-bold uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
  Book Now
</button>
```

## Core Web Vitals Targets

| Metric | Target | Measure |
|--------|--------|---------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| INP | < 200ms | Interaction to Next Paint |
| TTI | < 3.5s | Time to Interactive |

### Performance Rules

- Images: use `next/image` with `width`/`height` to prevent CLS
- Fonts: preload with `next/font`, use `font-display: swap`
- Bundle: dynamic imports for below-fold components
- Server Components by default; `'use client'` only when needed

## WCAG 2.1 AA Compliance

- Color contrast ratio >= 4.5:1 for text, >= 3:1 for large text
- All interactive elements keyboard accessible (visible focus ring)
- ARIA labels on icon-only buttons
- Form inputs have associated labels
- Error messages linked to inputs with `aria-describedby`
- Skip-to-content link on every page

## Responsive Breakpoints

| Breakpoint | Tailwind | Target |
|------------|----------|--------|
| < 640px | Default (mobile-first) | Phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Mobile-first Rules

- Design mobile layout first, enhance with `sm:`, `md:`, `lg:`
- Touch targets minimum 44x44px
- Portal sidebar collapses to bottom nav on mobile
- Test with throttled network (Slow 3G) for Tanzania mobile users

## Animation Guidelines

- Use Framer Motion for page transitions and micro-interactions
- Target 60fps — avoid animating `width`, `height`, `top`, `left`
- Prefer `transform` and `opacity` for GPU-accelerated animations
- Respect `prefers-reduced-motion` media query
- Brutalist hover: `translate-x-[2px] translate-y-[2px] shadow-none` transition
