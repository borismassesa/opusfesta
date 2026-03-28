// Motion design tokens — single source of truth for all animation values

// Typed as a mutable tuple so motion/react accepts it as a cubic-bezier Easing
export const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const duration = {
  xs: 0.35,
  sm: 0.5,
  md: 0.65,
  lg: 0.9,
}

export const drift = {
  sm: 16,
  md: 32,
  lg: 48,
}

export const stagger = {
  desktop: 0.07,
  mobile: 0.04,
}

export const threshold = {
  default: 0.15,
  conversion: 0.10,
}

export const rootMargin = {
  default: '0px 0px -60px 0px',
  faq: '0px 0px -80px 0px',
  conversion: '0px 0px -40px 0px',
}
