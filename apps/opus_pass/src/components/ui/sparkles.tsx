'use client'

import { useEffect, useRef } from 'react'
import { tsParticles } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import type { Container, ISourceOptions } from '@tsparticles/engine'

// Load the slim bundle into the global engine exactly once, no matter how many
// Sparkles instances mount. (`@tsparticles/react` v4 gates rendering behind a
// provider that never paints if the engine is slow to report ready — so we
// drive the engine directly instead.)
let enginePromise: Promise<void> | null = null
function ensureEngine() {
  if (!enginePromise) {
    enginePromise = loadSlim(tsParticles).then(() => undefined)
  }
  return enginePromise
}

type SparklesProps = {
  className?: string
  size?: number
  minSize?: number | null
  density?: number
  speed?: number
  minSpeed?: number | null
  opacity?: number
  opacitySpeed?: number
  minOpacity?: number | null
  color?: string
  background?: string
  options?: ISourceOptions
}

export function Sparkles({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = '#FFFFFF',
  background = 'transparent',
  options = {},
}: SparklesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let instance: Container | undefined
    let cancelled = false

    const defaultOptions: ISourceOptions = {
      background: { color: { value: background } },
      fullScreen: { enable: false, zIndex: 1 },
      fpsLimit: 120,
      particles: {
        // tsparticles v4 moved the particle fill colour under `paint.color`
        // (the loaded paint updater reads it); `color` is kept for back-compat
        // with v3 configs and is harmlessly ignored on v4.
        color: { value: color },
        paint: {
          color: { value: color },
          fill: { enable: true },
        },
        move: {
          enable: true,
          direction: 'none',
          speed: { min: minSpeed || speed / 10, max: speed },
          straight: false,
        },
        number: { value: density },
        opacity: {
          value: { min: minOpacity || opacity / 10, max: opacity },
          animation: { enable: true, sync: false, speed: opacitySpeed },
        },
        size: { value: { min: minSize || size / 2.5, max: size } },
      },
      detectRetina: true,
    }

    ensureEngine().then(() => {
      if (cancelled || !containerRef.current) return
      return tsParticles
        .load({
          element: containerRef.current,
          options: { ...defaultOptions, ...options },
        })
        .then((container) => {
          if (cancelled) {
            container?.destroy()
            return
          }
          instance = container
        })
    })

    return () => {
      cancelled = true
      instance?.destroy()
    }
  }, [
    background,
    color,
    density,
    minOpacity,
    minSize,
    minSpeed,
    opacity,
    opacitySpeed,
    options,
    size,
    speed,
  ])

  return <div ref={containerRef} className={className} />
}
