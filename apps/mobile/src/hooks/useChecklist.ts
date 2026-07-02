import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOpusFestaAuth } from '@/lib/auth';

// Regular checklist tasks aren't backed by a DB table — matching the web
// client, completion is stored locally per-device (see the "match web"
// checklist persistence decision in the roadmap: no wedding_tasks table).
export function useChecklistCompletion() {
  const { user } = useOpusFestaAuth();
  const storageKey = `opusfesta:checklist:${user?.id ?? 'guest'}`;
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            setCompleted(new Set(JSON.parse(raw)));
          } catch {
            setCompleted(new Set());
          }
        } else {
          setCompleted(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const toggle = useCallback(
    (taskId: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(taskId)) next.delete(taskId);
        else next.add(taskId);
        AsyncStorage.setItem(storageKey, JSON.stringify([...next])).catch(() => {});
        return next;
      });
    },
    [storageKey],
  );

  return { completed, toggle, loaded };
}
