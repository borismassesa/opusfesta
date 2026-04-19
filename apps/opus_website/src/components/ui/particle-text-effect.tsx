'use client'

import { useEffect, useRef } from 'react'

interface Vector2D {
  x: number
  y: number
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 }
  vel: Vector2D = { x: 0, y: 0 }
  acc: Vector2D = { x: 0, y: 0 }
  target: Vector2D = { x: 0, y: 0 }

  closeEnoughTarget = 100
  maxSpeed = 1.0
  maxForce = 0.1
  particleSize = 10
  isKilled = false

  startColor = { r: 0, g: 0, b: 0 }
  targetColor = { r: 0, g: 0, b: 0 }
  colorWeight = 0
  colorBlendRate = 0.01

  move() {
    let proximityMult = 1
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) +
        Math.pow(this.pos.y - this.target.y, 2),
    )

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.sqrt(
      towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y,
    )
    if (magnitude > 0) {
      towardsTarget.x =
        (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y =
        (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }

    const currentColor = {
      r: Math.round(
        this.startColor.r +
          (this.targetColor.r - this.startColor.r) * this.colorWeight,
      ),
      g: Math.round(
        this.startColor.g +
          (this.targetColor.g - this.startColor.g) * this.colorWeight,
      ),
      b: Math.round(
        this.startColor.b +
          (this.targetColor.b - this.startColor.b) * this.colorWeight,
      ),
    }

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width: number, height: number, fadeColor = { r: 0, g: 0, b: 0 }) {
    if (!this.isKilled) {
      const randomPos = this.generateRandomPos(
        width / 2,
        height / 2,
        (width + height) / 2,
      )
      this.target.x = randomPos.x
      this.target.y = randomPos.y

      this.startColor = {
        r:
          this.startColor.r +
          (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g:
          this.startColor.g +
          (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b:
          this.startColor.b +
          (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = fadeColor
      this.colorWeight = 0

      this.isKilled = true
    }
  }

  private generateRandomPos(x: number, y: number, mag: number): Vector2D {
    const randomX = Math.random() * 1000
    const randomY = Math.random() * 500

    const direction = { x: randomX - x, y: randomY - y }
    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y,
    )
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }
    return { x: x + direction.x, y: y + direction.y }
  }
}

interface ParticleTextEffectProps {
  words?: string[]
  className?: string
  /** ms between word transitions (default 4000) */
  wordIntervalMs?: number
  /** aria-label for the canvas (falls back to the words joined) */
  ariaLabel?: string
  /** visual theme — "dark" = particles on black, "light" = dark particles on white */
  background?: 'dark' | 'light'
  /** blend canvas into the page. "multiply" hides white pixels against a light bg. */
  blendMode?: 'normal' | 'multiply' | 'screen' | 'darken' | 'lighten'
}

const DEFAULT_WORDS = ['HELLO', 'PARTICLE', 'TEXT', 'EFFECT']

function hslToRgb(h: number, s: number, l: number) {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  }
}

export function ParticleTextEffect({
  words = DEFAULT_WORDS,
  className,
  wordIntervalMs = 4000,
  ariaLabel,
  background = 'dark',
  blendMode,
}: ParticleTextEffectProps) {
  const resolvedBlend =
    blendMode ?? (background === 'light' ? 'multiply' : 'normal')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<Particle[]>([])
  const frameCountRef = useRef(0)
  const wordIndexRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false })

  const pixelSteps = 6
  const drawAsPoints = true

  const generateRandomPos = (x: number, y: number, mag: number): Vector2D => {
    const randomX = Math.random() * 1000
    const randomY = Math.random() * 500
    const direction = { x: randomX - x, y: randomY - y }
    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y,
    )
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }
    return { x: x + direction.x, y: y + direction.y }
  }

  const nextWord = (word: string, canvas: HTMLCanvasElement) => {
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext('2d')!

    // Scale font based on word length so long phrases still fit
    const maxWidth = canvas.width * 0.88
    let fontSize = Math.min(160, Math.floor(canvas.height * 0.35))
    offscreenCtx.font = `bold ${fontSize}px Arial`
    while (offscreenCtx.measureText(word).width > maxWidth && fontSize > 28) {
      fontSize -= 4
      offscreenCtx.font = `bold ${fontSize}px Arial`
    }

    offscreenCtx.fillStyle = 'white'
    offscreenCtx.textAlign = 'center'
    offscreenCtx.textBaseline = 'middle'
    offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2)

    const imageData = offscreenCtx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    )
    const pixels = imageData.data

    const newColor =
      background === 'light'
        ? hslToRgb(Math.random() * 360, 0.85, 0.3 + Math.random() * 0.12)
        : {
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
          }

    const particles = particlesRef.current
    let particleIndex = 0

    const coordsIndexes: number[] = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }

    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coordsIndexes[i], coordsIndexes[j]] = [
        coordsIndexes[j],
        coordsIndexes[i],
      ]
    }

    for (const coordIndex of coordsIndexes) {
      const pixelIndex = coordIndex
      const alpha = pixels[pixelIndex + 3]

      if (alpha > 0) {
        const x = (pixelIndex / 4) % canvas.width
        const y = Math.floor(pixelIndex / 4 / canvas.width)

        let particle: Particle
        if (particleIndex < particles.length) {
          particle = particles[particleIndex]
          particle.isKilled = false
          particleIndex++
        } else {
          particle = new Particle()
          const randomPos = generateRandomPos(
            canvas.width / 2,
            canvas.height / 2,
            (canvas.width + canvas.height) / 2,
          )
          particle.pos.x = randomPos.x
          particle.pos.y = randomPos.y
          particle.maxSpeed = Math.random() * 3 + 1.5
          particle.maxForce = particle.maxSpeed * 0.05
          particle.particleSize = Math.random() * 6 + 6
          particle.colorBlendRate = Math.random() * 0.014 + 0.0015
          particles.push(particle)
        }

        particle.startColor = {
          r:
            particle.startColor.r +
            (particle.targetColor.r - particle.startColor.r) *
              particle.colorWeight,
          g:
            particle.startColor.g +
            (particle.targetColor.g - particle.startColor.g) *
              particle.colorWeight,
          b:
            particle.startColor.b +
            (particle.targetColor.b - particle.startColor.b) *
              particle.colorWeight,
        }
        particle.targetColor = newColor
        particle.colorWeight = 0
        particle.target.x = x
        particle.target.y = y
      }
    }

    const fadeColor =
      background === 'light' ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 }
    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height, fadeColor)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const particles = particlesRef.current

    const fadeColor =
      background === 'light' ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 }
    ctx.fillStyle =
      background === 'light'
        ? 'rgba(255, 255, 255, 0.18)'
        : 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.move()
      particle.draw(ctx, drawAsPoints)

      if (particle.isKilled) {
        if (
          particle.pos.x < 0 ||
          particle.pos.x > canvas.width ||
          particle.pos.y < 0 ||
          particle.pos.y > canvas.height
        ) {
          particles.splice(i, 1)
        }
      }
    }

    if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
      particles.forEach((particle) => {
        const distance = Math.sqrt(
          Math.pow(particle.pos.x - mouseRef.current.x, 2) +
            Math.pow(particle.pos.y - mouseRef.current.y, 2),
        )
        if (distance < 50) {
          particle.kill(canvas.width, canvas.height, fadeColor)
        }
      })
    }

    frameCountRef.current++
    // 60fps * (intervalMs / 1000) frames per word
    const framesPerWord = Math.max(60, Math.round((wordIntervalMs / 1000) * 60))
    if (frameCountRef.current % framesPerWord === 0) {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length
      nextWord(words[wordIndexRef.current], canvas)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 1000
    canvas.height = 500

    // Reset state so prop changes (e.g. theme switch) start from a clean slate
    particlesRef.current = []
    frameCountRef.current = 0
    wordIndexRef.current = 0

    // Paint an opaque base so the canvas doesn't accumulate stale pixels from
    // whatever was there before the effect (re-)ran.
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = background === 'light' ? '#ffffff' : '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    nextWord(words[0], canvas)
    animate()

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isPressed = true
      mouseRef.current.isRightClick = e.button === 2
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x =
        ((e.clientX - rect.left) / rect.width) * canvas.width
      mouseRef.current.y =
        ((e.clientY - rect.top) / rect.height) * canvas.height
    }

    const handleMouseUp = () => {
      mouseRef.current.isPressed = false
      mouseRef.current.isRightClick = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x =
        ((e.clientX - rect.left) / rect.width) * canvas.width
      mouseRef.current.y =
        ((e.clientY - rect.top) / rect.height) * canvas.height
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [background])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={ariaLabel ?? words.join('. ')}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        mixBlendMode: resolvedBlend,
      }}
    />
  )
}
