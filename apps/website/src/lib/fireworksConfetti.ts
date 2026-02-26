import confetti from "canvas-confetti";

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
};

const DEFAULT_COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe"];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getShouldSkipForMotion(disableForReducedMotion: boolean): boolean {
  if (!disableForReducedMotion || typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  if (typeof window === "undefined" || getShouldSkipForMotion(disableForReducedMotion)) {
    return {
      stop: () => {},
      isRunning: () => false,
    };
  }

  let running = true;
  const animationEnd = Date.now() + durationMs;

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
      // Ignore animation failures so success flow remains stable.
    }
  };

  const intervalId = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(intervalId);
      running = false;
      return;
    }

    const particleCount = Math.max(6, Math.floor(baseParticleCount * (timeLeft / durationMs)));
    fire(particleCount, 0.1, 0.3);
    fire(particleCount, 0.7, 0.9);
  }, intervalMs);

  return {
    stop: () => {
      if (!running) return;
      running = false;
      window.clearInterval(intervalId);
    },
    isRunning: () => running,
  };
}
