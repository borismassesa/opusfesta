import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { ScannerSession } from '@/types/checkin';

const SESSION_KEY = 'opuspass.scanner.session';

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (!cancelled && raw) setSession(JSON.parse(raw) as ScannerSession);
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

  const saveSession = useCallback(async (next: ScannerSession) => {
    setSession(next);
    try {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
    } catch {
      // Non-fatal: the shift continues in memory, it just won't survive a restart.
    }
  }, []);

  const clearSession = useCallback(async () => {
    setSession(null);
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch {
      // Already gone.
    }
  }, []);

  return { session, isLoading, saveSession, clearSession };
}
