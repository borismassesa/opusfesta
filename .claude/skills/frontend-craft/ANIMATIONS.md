# Frontend Craft — Animation & Motion Library

Complete reference for implementing animations. Two systems coexist — choose based on use case.

---

## Decision Matrix

| Scenario | Use This | Why |
|----------|----------|-----|
| Scroll-triggered reveal | GSAP + ScrollTrigger | Best scroll performance, precise control |
| Section pinning/parallax | GSAP + ScrollTrigger | Built-in pin support |
| Staggered list entrance | GSAP timeline | Precise stagger timing |
| Page load animation | GSAP timeline | Complex sequencing |
| Component hover/tap | Framer Motion | Declarative, React-native |
| Layout animations | Framer Motion `layout` | Auto-animates layout changes |
| Drag interactions | Framer Motion | Built-in drag constraints |
| Exit animations | Framer Motion `AnimatePresence` | Only option for unmount animations |
| Simple hover transition | CSS `transition` | Zero JS overhead |
| Infinite loops (marquee) | CSS `@keyframes` | GPU-accelerated, no JS |
| Loading shimmer | CSS `@keyframes` | Pure CSS, no bundle cost |

---

## GSAP + ScrollTrigger

### Basic Scroll Reveal
```tsx
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function RevealSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert(); // CRITICAL: always cleanup
  }, []);

  return (
    <section ref={containerRef} className="py-24 lg:py-32">
      <h2 ref={headingRef}>Animated Heading</h2>
    </section>
  );
}
```

### Staggered Grid Reveal
```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".grid-item",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
        },
      }
    );
  }, containerRef);

  return () => ctx.revert();
}, []);
```

### Sticky Section with Content Swap
```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.matchMedia({
      "(min-width: 768px)": function () {
        // Pin the visual column
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: ".visual-panel",
        });

        // Swap images on scroll
        sections.forEach((section, i) => {
          ScrollTrigger.create({
            trigger: section.ref,
            start: "top center",
            onEnter: () => setActiveImage(i),
            onEnterBack: () => setActiveImage(i),
          });
        });
      },
      "(max-width: 767px)": function () {
        // Mobile: simple fade-in
        gsap.fromTo(".mobile-content",
          { y: 30, autoAlpha: 0 },
          {
            y: 0, autoAlpha: 1, duration: 0.6,
            stagger: 0.15, ease: "power2.out",
            scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
          }
        );
      },
    });
  }, containerRef);

  return () => ctx.revert();
}, []);
```

### Hero Page-Load Timeline
```tsx
useEffect(() => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-reveal", {
    yPercent: 108,
    duration: 1,
    stagger: 0.12,
  }, 0.2)
  .from(".hero-fade", {
    y: 24,
    autoAlpha: 0,
    duration: 0.8,
    stagger: 0.1,
  }, 0.45)
  .from(".hero-cta", {
    scale: 0.9,
    autoAlpha: 0,
    duration: 0.6,
  }, 0.8);

  return () => tl.kill();
}, []);
```

### Counter Animation
```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(".counter-value", {
      textContent: 0,
      duration: 2,
      ease: "power1.out",
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: ".counter-section",
        start: "top 75%",
      },
    });
  }, containerRef);

  return () => ctx.revert();
}, []);
```

### GSAP Easing Reference
```
power1.out    — gentle deceleration
power2.out    — medium deceleration (default for most)
power3.out    — strong deceleration (hero reveals)
power4.out    — dramatic deceleration
back.out(1.7) — slight overshoot
elastic.out   — bouncy spring
expo.out      — very sharp deceleration
```

---

## Framer Motion

### Basic Entrance
```tsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  Content
</motion.div>
```

### Scroll-Triggered (whileInView)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>
  Card content
</motion.div>
```

### Staggered Children
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Hover + Tap Interactions
```tsx
<motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

### Layout Animation
```tsx
<motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
  {/* This element auto-animates when its layout position changes */}
</motion.div>
```

### Exit Animation (AnimatePresence)
```tsx
import { AnimatePresence, motion } from "motion/react";

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      Content that animates in and out
    </motion.div>
  )}
</AnimatePresence>
```

### Spring Physics
```tsx
// Snappy interaction (buttons, toggles)
transition={{ type: "spring", stiffness: 400, damping: 17 }}

// Smooth entrance (cards, panels)
transition={{ type: "spring", stiffness: 300, damping: 30 }}

// Gentle float (decorative elements)
transition={{ type: "spring", stiffness: 100, damping: 20 }}

// Bouncy (playful elements)
transition={{ type: "spring", stiffness: 500, damping: 15, bounce: 0.4 }}
```

### Magnetic Cursor Effect
```tsx
import { useMotionValue, useSpring, motion } from "motion/react";

export function Magnetic({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
```

---

## CSS Animations

### Available Keyframes (defined in globals.css)
```css
/* Marquee — horizontal infinite scroll */
@keyframes marquee-horizontal {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-100% - var(--marquee-gap))); }
}

/* Orbit — circular rotation */
@keyframes orbit {
  0%   { transform: rotate(calc(var(--angle) * 1deg))
         translateY(calc(var(--radius) * 1px))
         rotate(calc(var(--angle) * -1deg)); }
  100% { transform: rotate(calc(var(--angle) * 1deg + 360deg))
         translateY(calc(var(--radius) * 1px))
         rotate(calc(var(--angle) * -1deg - 360deg)); }
}

/* Shimmer loading scan */
@keyframes loading-scan {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

/* Vertical scroll loops */
@keyframes scroll-up   { 0% { transform: translateY(0); }   100% { transform: translateY(-50%); } }
@keyframes scroll-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
```

### Tailwind Animation Classes
```tsx
// Marquee
className="animate-marquee-horizontal"
style={{ "--marquee-duration": "30s", "--marquee-gap": "1rem" } as React.CSSProperties}

// Orbit
className="animate-orbit"
style={{ "--angle": "45", "--radius": "150" } as React.CSSProperties}

// Loading shimmer
className="animate-loading-scan"

// Pulse (built-in Tailwind)
className="animate-pulse"

// Spin (built-in Tailwind)
className="animate-spin"
```

### CSS Transition Patterns
```tsx
// Standard hover transition
className="transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"

// Color transition
className="transition-colors duration-200 hover:bg-primary/10"

// Transform transition
className="transition-transform duration-300 hover:scale-105"

// Background blur transition (navbar)
className="transition-all duration-300 backdrop-blur-xl"
```

---

## Lenis Smooth Scroll Integration

### Initialization (in page-level client component)
```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Sync with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}
```

---

## Reduced Motion

### ALWAYS implement reduced motion support.

#### Framer Motion
```tsx
import { useReducedMotion } from "motion/react";

export function AnimatedCard() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
```

#### GSAP
```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.matchMedia({
      "(prefers-reduced-motion: no-preference)": function () {
        // Full animations
        gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1 });
      },
      "(prefers-reduced-motion: reduce)": function () {
        // Show content immediately, no animation
        gsap.set(el, { opacity: 1, y: 0 });
      },
    });
  }, containerRef);

  return () => ctx.revert();
}, []);
```

#### CSS Fallback (globals.css)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## MotionPreset Component

Reusable entrance animation wrapper available in the codebase:

```tsx
import { MotionPreset } from "@/components/ui/motion-preset";

// Blur entrance
<MotionPreset preset="blur-sm" duration={0.6}>
  <Card />
</MotionPreset>

// Slide up
<MotionPreset preset="slide-up" duration={0.5} delay={0.2}>
  <Card />
</MotionPreset>

// Fade in on scroll
<MotionPreset preset="fade" inView duration={0.6}>
  <Card />
</MotionPreset>

// Available presets: blur-sm, blur-md, blur-lg, slide-up, slide-down,
//                    slide-left, slide-right, fade, zoom-in, zoom-out
```

---

## Performance Tips

1. **Use `will-change` sparingly** — only on elements actively animating
2. **Prefer `transform` and `opacity`** — these are GPU-composited (no layout recalc)
3. **Avoid animating `width`, `height`, `top`, `left`** — causes layout thrashing
4. **Use `autoAlpha` instead of `opacity`** in GSAP — also toggles `visibility` for better perf
5. **Batch ScrollTrigger creation** — create all triggers in one `gsap.context()`
6. **Use `once: true`** on `viewport` for Framer Motion — prevents re-triggering
7. **Cleanup always** — `ctx.revert()` for GSAP, component unmount for Framer
