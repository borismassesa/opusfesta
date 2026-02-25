import confetti from 'canvas-confetti';

export type FireworksConfettiOptions = {
  durationMs?: number;
  intervalMs?: number;
  baseParticleCount?: number;
  colors?: string[];
  zIndex?: number;
  disableForReducedMotion?: boolean;
};

export type FireworksController = {
  stop: () => void;
  isRunning: () => boolean;
  didFail: () => boolean;
};

const DEFAULT_COLORS = ['#6F3393', '#591C7D', '#D0B1D4', '#171717', '#9E83B0'];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getShouldSkipForMotion(disableForReducedMotion: boolean): boolean {
  if (!disableForReducedMotion || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function startFireworksConfetti(options: FireworksConfettiOptions = {}): FireworksController {
  const {
    durationMs = 5000,
    intervalMs = 250,
    baseParticleCount = 50,
    colors = DEFAULT_COLORS,
    zIndex = 0,
    disableForReducedMotion = true,
  } = options;

  if (typeof window === 'undefined' || getShouldSkipForMotion(disableForReducedMotion)) {
    return {
      stop: () => {},
      isRunning: () => false,
      didFail: () => false,
    };
  }

  let running = true;
  let failed = false;
  const animationEnd = Date.now() + durationMs;
  let intervalId: number | null = null;

  const fire = (particleCount: number, originXMin: number, originXMax: number) => {
    try {
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex,
        colors,
        origin: {
          x: randomInRange(originXMin, originXMax),
          y: randomInRange(0.2, 0.45),
        },
      });
    } catch {
      failed = true;
      running = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    }
  };

  const launchFireworks = () => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0 || failed) {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      running = false;
      return;
    }

    const particleCount = Math.max(6, Math.floor(baseParticleCount * (timeLeft / durationMs)));
    fire(particleCount, 0.1, 0.3);
    fire(particleCount, 0.7, 0.9);
  };

  launchFireworks();

  if (!failed) {
    intervalId = window.setInterval(launchFireworks, intervalMs);
  }

  return {
    stop: () => {
      if (!running) return;
      running = false;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    },
    isRunning: () => running,
    didFail: () => failed,
  };
}
