import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHECKLIST_TASKS, type ChecklistTask } from '@/constants/checklist';
import { useCoupleProfile } from '@/hooks/useDashboard';

const DONE_KEY = '@opusfesta/checklist-done';
const CUSTOM_KEY = '@opusfesta/checklist-custom';
const HIDDEN_KEY = '@opusfesta/checklist-hidden';

export interface CustomChecklistTask {
  key: string;
  title: string;
  categoryId: string;
  monthsBefore: number | null;
}

/** A built-in or custom task, resolved against the couple's wedding date. */
export interface ResolvedTask extends ChecklistTask {
  custom: boolean;
  done: boolean;
  /** The day this falls due — null when there's no wedding date. */
  dueDate: Date | null;
  /** First of the due month, used for the "By month" grouping. */
  dueMonth: Date | null;
  /** Due in the past and still not ticked. Always false without a date. */
  pastDue: boolean;
}

/**
 * Checklist progress and custom tasks, stored on-device.
 *
 * The 119 built-in tasks live in code (src/constants/checklist.ts) because
 * they're identical for every couple — only progress is per-couple, so there's
 * nothing to seed and no table to keep in sync. Custom tasks and completion
 * therefore stay on this device; moving them to Supabase later only touches
 * this hook.
 *
 * Consumers each hold their own copy of state, so writes are broadcast through
 * a module-level listener set — otherwise ticking a task in one accordion
 * would leave the header count stale.
 */
const doneListeners = new Set<(next: Set<string>) => void>();
const customListeners = new Set<(next: CustomChecklistTask[]) => void>();
const hiddenListeners = new Set<(next: Set<string>) => void>();

function broadcastDone(next: Set<string>) {
  for (const listener of doneListeners) listener(new Set(next));
}

function broadcastCustom(next: CustomChecklistTask[]) {
  for (const listener of customListeners) listener([...next]);
}

function broadcastHidden(next: Set<string>) {
  for (const listener of hiddenListeners) listener(new Set(next));
}

/**
 * The day a task falls due: `monthsBefore` months back from the wedding,
 * then staggered a day per task sharing that offset so a bucket of ten
 * "9 months out" tasks reads as a sequence of dates rather than ten
 * identical ones. Clamps the day so shifting into a shorter month can't
 * roll over (31 Mar - 1 month must be 28/29 Feb, not 2/3 Mar).
 */
function dueDateFor(weddingDate: Date, monthsBefore: number, stagger: number): Date {
  const target = new Date(weddingDate.getFullYear(), weddingDate.getMonth() - monthsBefore, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(weddingDate.getDate(), lastDay));
  target.setDate(target.getDate() - stagger);
  return target;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseWeddingDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  // Stored as a DATE ("2027-07-18"); widen to local midnight so the month
  // never shifts backwards through a UTC conversion.
  const parsed = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function useChecklist() {
  const profile = useCoupleProfile();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<CustomChecklistTask[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(DONE_KEY),
      AsyncStorage.getItem(CUSTOM_KEY),
      AsyncStorage.getItem(HIDDEN_KEY),
    ])
      .then(([storedDone, storedCustom, storedHidden]) => {
        if (!active) return;
        if (storedDone) {
          const parsed: unknown = JSON.parse(storedDone);
          if (Array.isArray(parsed)) {
            setDone(new Set(parsed.filter((k): k is string => typeof k === 'string')));
          }
        }
        if (storedCustom) {
          const parsed: unknown = JSON.parse(storedCustom);
          if (Array.isArray(parsed)) setCustom(parsed as CustomChecklistTask[]);
        }
        if (storedHidden) {
          const parsed: unknown = JSON.parse(storedHidden);
          if (Array.isArray(parsed)) {
            setHidden(new Set(parsed.filter((k): k is string => typeof k === 'string')));
          }
        }
      })
      .catch(() => {
        // Ignore read failures — an untouched checklist is a safe start.
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    doneListeners.add(setDone);
    customListeners.add(setCustom);
    hiddenListeners.add(setHidden);
    return () => {
      doneListeners.delete(setDone);
      customListeners.delete(setCustom);
      hiddenListeners.delete(setHidden);
    };
  }, []);

  const weddingDate = parseWeddingDate(profile.data?.wedding_date);

  const toggleTask = useCallback((taskKey: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(taskKey)) next.delete(taskKey);
      else next.add(taskKey);
      AsyncStorage.setItem(DONE_KEY, JSON.stringify([...next])).catch(() => {});
      broadcastDone(next);
      return next;
    });
  }, []);

  const addTask = useCallback((task: Omit<CustomChecklistTask, 'key'>) => {
    setCustom((prev) => {
      // Suffixed with the list length so two tasks added in the same
      // millisecond can't collide on a timestamp alone.
      const next = [...prev, { ...task, key: `custom-${Date.now()}-${prev.length}` }];
      AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(next)).catch(() => {});
      broadcastCustom(next);
      return next;
    });
  }, []);

  /**
   * Custom tasks are deleted outright; built-in ones are only hidden, since
   * the catalogue is code and can't have rows removed from it. Hiding is
   * reversible via resetChecklist, so a mis-swipe is never permanent.
   */
  const deleteTask = useCallback((taskKey: string, custom: boolean) => {
    if (custom) {
      setCustom((prev) => {
        const next = prev.filter((t) => t.key !== taskKey);
        AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(next)).catch(() => {});
        broadcastCustom(next);
        return next;
      });
    } else {
      setHidden((prev) => {
        const next = new Set(prev).add(taskKey);
        AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify([...next])).catch(() => {});
        broadcastHidden(next);
        return next;
      });
    }
    setDone((prev) => {
      if (!prev.has(taskKey)) return prev;
      const next = new Set(prev);
      next.delete(taskKey);
      AsyncStorage.setItem(DONE_KEY, JSON.stringify([...next])).catch(() => {});
      broadcastDone(next);
      return next;
    });
  }, []);

  /** Clears ticks and restores hidden built-ins. Custom tasks the couple
   *  wrote are theirs to keep, so those survive a reset. */
  const resetChecklist = useCallback(() => {
    const empty = new Set<string>();
    setDone(empty);
    setHidden(empty);
    AsyncStorage.multiSet([
      [DONE_KEY, JSON.stringify([])],
      [HIDDEN_KEY, JSON.stringify([])],
    ]).catch(() => {});
    broadcastDone(empty);
    broadcastHidden(empty);
  }, []);

  const tasks: ResolvedTask[] = useMemo(() => {
    const today = startOfToday();
    // Position within the set of tasks sharing a monthsBefore offset, so
    // dueDateFor can spread them across consecutive days.
    const staggerByOffset = new Map<number, number>();

    // Stagger is assigned over the FULL catalogue before hidden tasks are
    // dropped, so deleting one task can't shift the due dates of the others
    // sharing its offset.
    const builtIn = CHECKLIST_TASKS.map((task) => {
      const stagger = staggerByOffset.get(task.monthsBefore) ?? 0;
      staggerByOffset.set(task.monthsBefore, stagger + 1);
      const dueDate = weddingDate ? dueDateFor(weddingDate, task.monthsBefore, stagger) : null;
      const isDone = done.has(task.key);
      return {
        ...task,
        custom: false,
        done: isDone,
        dueDate,
        dueMonth: dueDate ? startOfMonth(dueDate) : null,
        pastDue: Boolean(dueDate && !isDone && dueDate < today),
      };
    }).filter((task) => !hidden.has(task.key));

    const written = custom.map((task) => {
      const isDone = done.has(task.key);
      const dueDate =
        weddingDate && task.monthsBefore !== null
          ? dueDateFor(weddingDate, task.monthsBefore, 0)
          : null;
      return {
        key: task.key,
        categoryId: task.categoryId,
        title: task.title,
        monthsBefore: task.monthsBefore ?? 0,
        custom: true,
        done: isDone,
        dueDate,
        dueMonth: dueDate ? startOfMonth(dueDate) : null,
        pastDue: Boolean(dueDate && !isDone && dueDate < today),
      };
    });

    // Earliest first, so each accordion reads as a schedule.
    return [...builtIn, ...written].sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [custom, done, hidden, weddingDate?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

  const completedCount = tasks.filter((t) => t.done).length;

  return {
    tasks,
    completedCount,
    totalCount: tasks.length,
    weddingDate,
    hydrated: hydrated && !profile.isPending,
    toggleTask,
    addTask,
    deleteTask,
    resetChecklist,
  };
}
