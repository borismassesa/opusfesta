'use client'

import { useEffect, useMemo, useState } from 'react'

const BRAND_COLORS = [
  '#9FE870', // brand green
  '#10b981', // emerald
  '#34d399', // emerald light
  '#F0DFF6', // brand lilac
  '#7E5896', // brand purple
  '#FBBF24', // amber
  '#0F0F0F', // ink
  '#ffffff',
]

const PARTICLE_COUNT = 90
const SHAPES = ['rect', 'circle', 'strip'] as const

type Particle = {
  key: number
  left: number
  delay: number
  duration: number
  size: number
  color: string
  rotateStart: number
  rotateEnd: number
  drift: number
  shape: (typeof SHAPES)[number]
}

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    key: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.6 + Math.random() * 2.4,
    size: 6 + Math.random() * 8,
    color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
    rotateStart: Math.random() * 360,
    rotateEnd: (Math.random() * 720 + 360) * (Math.random() > 0.5 ? 1 : -1),
    drift: (Math.random() - 0.5) * 280,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  }))
}

export function Confetti({
  active,
  duration = 5000,
}: {
  active: boolean
  duration?: number
}) {
  const [visible, setVisible] = useState(false)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    if (!active) return
    setVisible(true)
    setRunId((n) => n + 1)
    const t = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(t)
  }, [active, duration])

  // Re-roll particles on each activation so a re-trigger looks different
  const particles = useMemo(() => buildParticles(), [runId])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      aria-hidden
    >
      <style>{`
        @keyframes opusfesta-confetti-fall {
          0% {
            transform: translate3d(0, -12vh, 0) rotate(var(--rs)) scale(0.9);
            opacity: 0;
          }
          8% { opacity: 1; }
          88% { opacity: 1; }
          100% {
            transform: translate3d(var(--drift), 110vh, 0) rotate(var(--re)) scale(1);
            opacity: 0;
          }
        }
        .opusfesta-confetti {
          position: absolute;
          top: 0;
          will-change: transform, opacity;
          animation-name: opusfesta-confetti-fall;
          animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1);
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
        .opusfesta-confetti--rect { border-radius: 2px; }
        .opusfesta-confetti--circle { border-radius: 9999px; }
        .opusfesta-confetti--strip { border-radius: 1px; }
      `}</style>

      {particles.map((p) => {
        const isStrip = p.shape === 'strip'
        const isCircle = p.shape === 'circle'
        return (
          <span
            key={p.key}
            className={`opusfesta-confetti opusfesta-confetti--${p.shape}`}
            style={{
              left: `${p.left}%`,
              width: isStrip ? p.size * 0.4 : p.size,
              height: isStrip ? p.size * 1.6 : isCircle ? p.size : p.size * 0.5,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--rs' as string]: `${p.rotateStart}deg`,
              ['--re' as string]: `${p.rotateEnd}deg`,
              ['--drift' as string]: `${p.drift}px`,
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}
