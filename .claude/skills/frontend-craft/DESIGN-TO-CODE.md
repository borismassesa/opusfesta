# Frontend Craft — Design-to-Code Guide

Workflow for converting screenshots, verbal descriptions, and reference URLs into pixel-perfect production code.

---

## Input Analysis Process

### Step 1: Identify Input Type

| Input | How to Handle |
|-------|--------------|
| Screenshot/image | Analyze layout grid, spacing, colors, typography, component hierarchy |
| Verbal description | Ask clarifying questions if vague, propose a layout before building |
| Reference URL | Capture visual essence, adapt to project design system — do NOT copy |

### Step 2: Decompose into Building Blocks

Break every design into these layers:
1. **Layout** — grid structure, container width, section spacing
2. **Typography** — heading hierarchy, body size, font weights
3. **Colors** — map to CSS variables (`--primary`, `--accent`, etc.)
4. **Spacing** — padding, margins, gaps → map to Tailwind scale
5. **Components** — identify reusable shadcn/ui components
6. **Interactions** — hover states, animations, transitions
7. **Responsive** — how it adapts across breakpoints

### Step 3: Map to Project Design System

Always translate external designs into project tokens. Never introduce new colors or fonts.

---

## Color Mapping — OpusFesta Brand (Light + Dark)

Map every color in external designs to OpusFesta's semantic tokens. These tokens automatically switch between light and dark themes.

### Light Theme `:root`
```
External Design Element        → Token               Light Hex
──────────────────────────────────────────────────────────────────
Primary / CTA / brand color    → --primary            #6F3393
Hover / pressed / deep accent  → --primary-deep        #591C7D
Light accent / soft highlight  → --accent              #D0B1D4
Subtle accent / tag / badge    → --accent-muted         #A287AF
White / page background        → --background           #FFFFFF
Off-white / card background    → --surface              #F8F9FA
Dark text / headings           → --foreground           #000000
Gray / secondary text          → --secondary            #7E7383
Muted labels / captions        → --muted-foreground     #7E7383
Borders / dividers             → --border               #E2DDE5
Error / danger                 → --destructive          #DC2626
Focus ring                     → --ring                 #6F3393
```

### Dark Theme `.dark`
```
Token                          Dark Hex         Notes
──────────────────────────────────────────────────────────────────
--primary                      #8B4DB3          Lifted for visibility on dark surfaces
--primary-deep                 #6F3393          Light primary becomes the deep
--accent                       #D0B1D4          Stays — use at low opacity for glow
--accent-muted                 #A287AF          Stays
--background                   #0C0A10          Near-black with purple undertone
--surface                      #151219          Dark purple-gray for elevated cards
--foreground                   #F2EFF5          Warm off-white with lavender tint
--secondary                    #9B8FA3          Lighter for readability on dark
--muted-foreground             #9B8FA3          Matches secondary
--border                       #2A2433          Subtle purple-tinted borders
--destructive                  #EF4444          Brighter red for dark contrast
--ring                         #8B4DB3          Matches dark primary
```

### Usage Patterns (work in both themes)
```tsx
// CTA button — auto-adapts in dark mode
className="bg-primary text-white hover:bg-primary-deep"

// Soft lavender surface — glows in dark, tints in light
className="bg-accent/10 border border-accent/20"

// Tinted background (navbar scrolled state)
className="bg-[color-mix(in_oklab,var(--background)_94%,var(--primary)_6%)]"

// Semi-transparent primary for badges/pills
className="bg-primary/10 text-primary"

// Card with elevation — off-white in light, dark purple-gray in dark
className="bg-surface border border-border rounded-2xl"

// Text hierarchy — auto-adjusts in dark mode
className="text-foreground"   // headings
className="text-secondary"    // body/captions
```

### Dark Mode Dos and Don'ts
```tsx
// BAD — hardcoded colors break in dark mode
className="bg-white text-black border-gray-200"

// GOOD — semantic tokens auto-switch
className="bg-background text-foreground border-border"

// BAD — hardcoded hex values
className="bg-[#6F3393] text-[#D0B1D4]"

// GOOD — token classes
className="bg-primary text-accent"
```

### Design Direction Reminders
- **Light mode**: Soft lavender surfaces, clean white backgrounds, deep purple CTAs
- **Dark mode**: Purple-tinted dark surfaces (not neutral gray), glowy accent highlights, warm off-white text
- Use `bg-accent/10` for highlighted areas — soft tint in light, rich glow in dark
- Use `text-foreground` / `text-secondary` — never hardcode white or black text
- Borders: `border-border` gives soft purple tint in both themes

---

## Spacing Mapping

Estimate pixel spacing from designs → map to Tailwind classes:

```
Pixels  → Tailwind   Usage
────────────────────────────────────
2px     → 0.5        Tight inner padding
4px     → 1          Icon-to-text gap
6px     → 1.5        Small gap
8px     → 2          Standard inner padding
12px    → 3          Medium gap
16px    → 4          Standard padding
20px    → 5          Comfortable padding
24px    → 6          Section inner padding, horizontal page padding (mobile)
32px    → 8          Card padding
40px    → 10         Large gap
48px    → 12         Desktop horizontal page padding
64px    → 16         Section gap
80px    → 20         Large section gap
96px    → 24         Section vertical padding (py-24)
128px   → 32         Large section vertical padding (py-32)
```

---

## Typography Mapping

```
Design Size          → Tailwind Class Chain
──────────────────────────────────────────────
Display / Hero       → text-[2.35rem] sm:text-6xl lg:text-7xl
                       font-semibold tracking-tight leading-[1.05]

Section Heading      → text-3xl md:text-4xl lg:text-5xl
                       font-semibold tracking-tight leading-[1.1]

Card Title           → text-xl md:text-2xl font-semibold

Body Large           → text-base sm:text-lg text-secondary

Body                 → text-sm sm:text-base text-secondary

Caption / Meta       → text-xs text-muted-foreground

Eyebrow Label        → font-mono text-xs tracking-widest uppercase text-accent

Italic Accent        → font-serif italic font-normal text-secondary
```

---

## From Screenshot to Code

### 1. Layout Analysis
Look at the screenshot and determine:
- Is it full-width or contained? → `max-w-[1400px]` vs `max-w-6xl`
- How many columns? → `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Is there a sticky column? → `md:sticky md:top-32`
- Is it a hero section? → `min-h-screen flex items-center justify-center`

### 2. Component Identification
Match visual elements to existing components:
```
Rounded rectangle with shadow  → Card component
Text with icon on left          → Badge or list item
Full-width form                 → shadcn Form + Input + Label
Image with overlay text         → Relative container + absolute overlay
Pill-shaped clickable           → Button variant="outline" + rounded-full
Rating stars                    → Custom StarRating component
Avatar circles                  → Avatar component
Dropdown menu                   → DropdownMenu (Radix)
Modal/popup                     → Dialog (Radix)
Tab sections                    → Tabs (Radix)
Accordion/FAQ                   → Accordion (Radix)
```

### 3. Build Output
Produce a complete, runnable component:
```tsx
"use client";

import { cn } from "@/lib/utils";
// ... all necessary imports

interface SectionProps {
  className?: string;
}

export function NewSection({ className }: SectionProps) {
  return (
    <section className={cn("py-24 lg:py-32 bg-background", className)}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Full implementation */}
      </div>
    </section>
  );
}
```

---

## From Verbal Description to Code

### Prompt Interpretation Guide

| User Says | Translate To |
|-----------|-------------|
| "modern", "clean" | Lots of whitespace, subtle borders, soft shadows |
| "bold", "striking" | Large typography, high contrast, accent colors |
| "minimal" | Fewer elements, more space, monochrome with one accent |
| "playful" | Rounded corners, bouncy animations, varied colors |
| "professional" | Structured grid, conservative spacing, muted palette |
| "luxury", "premium" | Serif accents, gold/deep tones, subtle animations |
| "like Apple/Stripe" | Full-bleed heroes, large type, scroll animations |
| "dashboard" | Dense data layout, sidebar nav, cards with metrics |
| "landing page" | Hero → features → social proof → CTA flow |
| "card grid" | Equal-height cards in responsive grid |

### When Description is Vague
Ask ONE clarifying question, then build. Don't over-ask. Example:
> "Should this be a full-page section with a hero, or a contained card within an existing page?"

---

## From Reference URL to Code

### Process
1. User shares a URL → analyze the visual design (NOT the code)
2. Identify the key visual elements: layout, typography, colors, spacing
3. **Adapt** to project design system — never copy directly
4. Use project tokens, animations, and component patterns

### What to Capture
- Overall layout structure (grid, flexbox patterns)
- Typography hierarchy (size ratios, weights)
- White space rhythm (spacing between sections)
- Interaction patterns (hover effects, scroll behavior)
- Color usage patterns (primary vs accent vs neutral ratios)

### What NOT to Capture
- Exact colors (map to project tokens instead)
- Exact fonts (use Roboto)
- External component libraries (use shadcn/ui)
- Exact pixel dimensions (use Tailwind scale)

---

## Quality Checklist

Before delivering any design-to-code output, verify:

- [ ] All colors use CSS variables, not hardcoded hex
- [ ] Typography follows the project scale
- [ ] Responsive at all breakpoints (test mobile, tablet, desktop)
- [ ] Dark mode works (inspect with `.dark` class)
- [ ] Hover/focus states on all interactive elements
- [ ] `aria-label` or semantic HTML for screen readers
- [ ] Animations have reduced-motion fallback
- [ ] `cn()` used for all conditional classNames
- [ ] Images use `next/image` with proper `sizes` attribute
- [ ] No unused imports or dead code
- [ ] Component is self-contained with typed props
- [ ] Matches the section eyebrow pattern if it's a marketing section

---

## Common Design-to-Code Recipes

### Testimonial Card
```tsx
<div className="rounded-2xl border border-border bg-surface p-8 space-y-4">
  <div className="flex items-center gap-1 text-amber-400">
    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
  </div>
  <p className="text-foreground text-base leading-relaxed">
    &ldquo;{testimonial.quote}&rdquo;
  </p>
  <div className="flex items-center gap-3 pt-2">
    <Avatar className="w-10 h-10">
      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
      <AvatarFallback>{testimonial.initials}</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
    </div>
  </div>
</div>
```

### Pricing Card
```tsx
<div className={cn(
  "rounded-2xl border p-8 space-y-6",
  featured
    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
    : "border-border bg-surface"
)}>
  {featured && (
    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
  )}
  <div>
    <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
    <p className="text-sm text-secondary mt-1">{plan.description}</p>
  </div>
  <div className="flex items-baseline gap-1">
    <span className="text-4xl font-semibold text-foreground">${plan.price}</span>
    <span className="text-sm text-muted-foreground">/month</span>
  </div>
  <ul className="space-y-3">
    {plan.features.map((feature) => (
      <li key={feature} className="flex items-center gap-2 text-sm text-secondary">
        <Check className="w-4 h-4 text-primary shrink-0" />
        {feature}
      </li>
    ))}
  </ul>
  <Button className="w-full" variant={featured ? "default" : "outline"}>
    Get Started
  </Button>
</div>
```

### Feature Comparison Table
```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border">
        <th className="text-left py-4 pr-6 font-medium text-foreground">Feature</th>
        {plans.map((plan) => (
          <th key={plan.name} className="text-center py-4 px-6 font-medium text-foreground">
            {plan.name}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {features.map((feature) => (
        <tr key={feature.name} className="border-b border-border/50">
          <td className="py-3 pr-6 text-secondary">{feature.name}</td>
          {plans.map((plan) => (
            <td key={plan.name} className="text-center py-3 px-6">
              {feature[plan.id] ? (
                <Check className="w-4 h-4 text-primary mx-auto" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### CTA Section
```tsx
<section className="py-24 lg:py-32 bg-primary text-primary-foreground">
  <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
      Ready to get started?
    </h2>
    <p className="text-primary-foreground/80 text-base sm:text-lg max-w-2xl mx-auto">
      Join thousands of couples who trust our platform.
    </p>
    <div className="flex items-center justify-center gap-4">
      <Button size="lg" variant="secondary">
        Start Free Trial
      </Button>
      <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
        Learn More
      </Button>
    </div>
  </div>
</section>
```
