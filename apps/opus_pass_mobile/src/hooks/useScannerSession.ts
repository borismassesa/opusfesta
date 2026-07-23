import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { ScannerSession } from '@/types/checkin';

const SESSION_KEY = 'opuspass.scanner.session';

/** setTimeout stores its delay in a signed 32-bit int; a longer delay silently
 *  fires immediately. A shift is at most days away, but clamp so a far-future
 *  expiry still schedules a real timer rather than firing at once. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** True once the shift's window has closed. Sessions without an expiry (saved
 *  before auto-end shipped) never count as over here — the server still turns
 *  away any late scan. */
function isShiftOver(session: Pick<ScannerSession, 'expiresAt'>): boolean {
  if (!session.expiresAt) return false;
  const endsAt = new Date(session.expiresAt).getTime();
  return !Number.isNaN(endsAt) && Date.now() >= endsAt;
}

/**
 * Persists the validated door session.
 *
 * Stored in SecureStore rather than AsyncStorage because the access token is
 * a live credential that admits guests — and kept at all because a door
 * shift runs for hours on one device: an app restart or a phone locking
 * mid-queue must not send the attendant back to re-typing a code while
 * guests wait.
 *
 * The stored token is not trusted on its own: every scan re-verifies it
 * server-side, so a revoked or expired code fails at the door even though
 * it's still cached here.
 */
export function useScannerSession() {
  const [session, setSession] = useState<ScannerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    setSession(null);
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch {
      // Already gone.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as ScannerSession;
          // The event may have ended while the app was closed — a forgotten
          // shift must not resume days later. Drop it instead of restoring.
          if (isShiftOver(parsed)) {
            await SecureStore.deleteItemAsync(SESSION_KEY);
          } else {
            setSession(parsed);
          }
        }
      } catch {
        // Corrupt or unreadable entry — treat as signed out rather than crashing.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-end watchdog: close the shift the instant its window passes, and
  // re-check every time the app returns to the foreground — a JS timer doesn't
  // fire while the app is backgrounded, which is exactly when a shift is left
  // running overnight. This is why the attendant never has to remember to end
  // a shift: the door code's own expiry ends it for them.
  useEffect(() => {
    if (!session?.expiresAt) return;
    const endsAt = new Date(session.expiresAt).getTime();
    if (Number.isNaN(endsAt)) return;

    const endIfOver = () => {
      if (Date.now() >= endsAt) void clearSession();
    };
    endIfOver();
    const timer = setTimeout(endIfOver, Math.min(Math.max(endsAt - Date.now(), 0), MAX_TIMEOUT_MS));
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') endIfOver();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [session?.expiresAt, clearSession]);

  const saveSession = useCallback(async (next: ScannerSession) => {
    setSession(next);
    try {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
    } catch {
      // Non-fatal: the shift continues in memory, it just won't survive a restart.
    }
  }, []);

  return { session, isLoading, saveSession, clearSession };
}
