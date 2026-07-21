import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@opusfesta/plan-completed-goals';

/**
 * Which planning goals the couple has ticked off. Stored on-device rather
 * than in Supabase: the checklist itself is static content (see
 * src/constants/plan.ts) and there's no per-couple checklist table yet, so
 * there is nothing server-side to key completion against. Swapping the
 * storage for a table later only touches this hook.
 *
 * Every consumer keeps its own state copy, so writes are broadcast to the
 * other mounted consumers through a module-level listener set — otherwise
 * ticking a goal on its detail page would leave the Home list stale until
 * remount.
 */
const listeners = new Set<(completed: Set<string>) => void>();

function broadcast(next: Set<string>) {
  for (const listener of listeners) listener(new Set(next));
}

export function usePlanProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompleted(new Set(parsed.filter((id): id is string => typeof id === 'string')));
        }
      })
      .catch(() => {
        // Ignore read failures — an empty checklist is a safe starting point.
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    listeners.add(setCompleted);
    return () => {
      listeners.delete(setCompleted);
    };
  }, []);

  const toggleGoal = useCallback((goalId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(() => {
        // Non-fatal: the tick still applies for this session.
      });
      broadcast(next);
      return next;
    });
  }, []);

  return { completed, toggleGoal, hydrated };
}
