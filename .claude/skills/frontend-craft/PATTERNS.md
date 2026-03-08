# Frontend Craft — Component & Layout Patterns

Reference file for production-ready OpusFesta code patterns.

**Brand reminder:** Clean, modern, premium, spacious. Soft lavender surfaces (`bg-accent/10`), deep purple CTAs (`bg-primary`), off-white cards (`bg-surface`), muted gray text (`text-secondary`). Celebratory and elegant, but reliable and practical. **Both light and dark themes** — always use semantic tokens (`bg-background`, `text-foreground`, `border-border`) so components auto-switch. Dark mode uses purple-tinted darks (`#0C0A10`, `#151219`), not neutral grays.

---

## Component Patterns

### 1. CVA Button with Variants
```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
```

### 2. Section with Eyebrow + Content Grid
```tsx
export function FeatureSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Eyebrow */}
        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
          <span className="w-12 h-px bg-accent" />
          <span className="font-mono text-accent text-xs tracking-widest uppercase">
            Features
          </span>
          <span className="md:hidden w-12 h-px bg-accent" />
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
          Everything you need <br />
          <span className="font-serif italic font-normal text-secondary">
            beautifully crafted.
          </span>
        </h2>

        {/* Subtext */}
        <p className="text-secondary text-base sm:text-lg max-w-2xl mb-16">
          Description text goes here with enough context.
        </p>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <FeatureCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 3. Card Pattern with Hover
```tsx
export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <div className={cn(
      "group relative rounded-2xl border border-border bg-surface p-8",
      "transition-all duration-300",
      "hover:border-accent/40 hover:shadow-lg hover:shadow-primary/5",
      "hover:-translate-y-1"
    )}>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}
```

### 4. CMS Content Integration
```tsx
"use client";

import { useContent } from "@/context/ContentContext";

export function DynamicSection() {
  const { content } = useContent();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {content?.sectionTitle || "Default Title"}
        </h2>
        <p className="text-secondary mt-4">
          {content?.sectionDescription || "Default description text."}
        </p>
      </div>
    </section>
  );
}
```

### 5. Dialog/Modal Pattern (Radix)
```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FeatureDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Content */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Layout Patterns

### 1. Sticky-Left + Scrolling-Right (Two-Column)
```tsx
<section className="py-24 lg:py-32 bg-background">
  <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
    {/* Left Column — sticky on desktop */}
    <div className="md:sticky md:top-32 space-y-6">
      {/* Eyebrow + heading */}
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
        Section Title
      </h2>
      <p className="text-secondary text-lg max-w-md">
        Supporting description text.
      </p>
    </div>

    {/* Right Column — scrolls naturally */}
    <div className="space-y-6">
      {items.map((item, i) => (
        <ItemCard key={i} {...item} />
      ))}
    </div>
  </div>
</section>
```

### 2. Full-Bleed Hero
```tsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface" />

  {/* Content */}
  <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
    <h1 className="text-[2.35rem] sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
      Hero Headline
    </h1>
    <p className="text-secondary text-base sm:text-lg max-w-2xl mx-auto mt-6">
      Supporting copy
    </p>
    <div className="flex items-center justify-center gap-4 mt-10">
      <Button size="lg">Primary CTA</Button>
      <Button variant="outline" size="lg">Secondary CTA</Button>
    </div>
  </div>
</section>
```

### 3. Masonry/Bento Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Span 2 columns */}
  <div className="md:col-span-2 rounded-2xl border border-border bg-surface p-8">
    {/* Wide card */}
  </div>
  {/* Standard card */}
  <div className="rounded-2xl border border-border bg-surface p-8">
    {/* Normal card */}
  </div>
  {/* Full-width row */}
  <div className="md:col-span-3 rounded-2xl border border-border bg-surface p-8">
    {/* Full-width card */}
  </div>
</div>
```

### 4. Alternating Image+Text Rows
```tsx
{sections.map((section, i) => (
  <div
    key={i}
    className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center py-24",
      i % 2 === 1 && "md:flex-row-reverse"
    )}
  >
    <div className={cn("space-y-6", i % 2 === 1 && "md:order-2")}>
      {/* Text content */}
    </div>
    <div className={cn("relative aspect-video rounded-2xl overflow-hidden", i % 2 === 1 && "md:order-1")}>
      <Image src={section.image} alt={section.title} fill className="object-cover" />
    </div>
  </div>
))}
```

### 5. Stats/Metrics Row
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-y border-border">
  {stats.map((stat) => (
    <div key={stat.label} className="text-center space-y-2">
      <div className="text-4xl md:text-5xl font-semibold text-foreground">
        {stat.value}
      </div>
      <div className="text-sm text-secondary font-mono uppercase tracking-wider">
        {stat.label}
      </div>
    </div>
  ))}
</div>
```

---

## Responsive Patterns

### Desktop-First Typography
```
Hero:    text-7xl lg:text-7xl md:text-6xl sm:text-5xl text-[2.35rem]
         → Since Tailwind is mobile-first, write: text-[2.35rem] sm:text-5xl md:text-6xl lg:text-7xl
Section: text-3xl md:text-4xl lg:text-5xl
Body:    text-base sm:text-lg
```

### Conditional Mobile/Desktop Components
```tsx
{/* Mobile only */}
<div className="md:hidden">{/* Mobile layout */}</div>

{/* Desktop only */}
<div className="hidden md:flex">{/* Desktop layout */}</div>
```

### Responsive Grid Progression
```tsx
{/* 1 col → 2 cols → 3 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* 1 col → 2 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

{/* 2 cols → 4 cols */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
```

---

## Dark Mode Patterns

### Use CSS Variables (Preferred)
```tsx
// GOOD — respects theme automatically
className="bg-background text-foreground border-border"

// BAD — breaks in dark mode
className="bg-white text-black border-gray-200"
```

### color-mix for Subtle Tints
```tsx
// Tinted background that respects theme
className="bg-[color-mix(in_oklab,var(--background)_94%,var(--primary)_6%)]"

// Semi-transparent accent
className="bg-primary/10 text-primary"
```

### Dark Mode Image Handling
```tsx
<Image
  src={src}
  alt={alt}
  fill
  className="object-cover dark:brightness-90 dark:contrast-105"
/>
```

---

## Form Patterns

### Input with Label
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

### Inline Error
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    className={cn(error && "border-destructive focus-visible:ring-destructive")}
  />
  {error && (
    <p className="text-xs text-destructive">{error}</p>
  )}
</div>
```

---

## Loading States

### Skeleton
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-6 bg-border/50 rounded-md w-3/4" />
  <div className="h-4 bg-border/50 rounded-md w-1/2" />
  <div className="h-4 bg-border/50 rounded-md w-5/6" />
</div>
```

### Shimmer Scan
```tsx
<div className="relative overflow-hidden rounded-xl bg-surface">
  <div className="absolute inset-0 animate-loading-scan bg-gradient-to-r from-transparent via-white/20 to-transparent" />
</div>
```
