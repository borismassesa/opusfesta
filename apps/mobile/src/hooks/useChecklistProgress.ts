import { useMemo } from 'react';
import { useCoupleProfile } from './useCoupleProfile';
import { useChecklistCompletion } from './useChecklist';
import {
  CHECKLIST_PHASES,
  CHECKLIST_TOTAL_GOALS,
  CHECKLIST_TOTAL_TASKS,
  isWidgetTaskComplete,
  type ChecklistTask,
} from '@/constants/checklist';

export type ChecklistGoalProgress = {
  id: string;
  title: string;
  icon: string;
  doneCount: number;
  totalCount: number;
};

export type ChecklistPhaseProgress = {
  id: string;
  label: string;
  goals: ChecklistGoalProgress[];
  doneCount: number;
  totalCount: number;
};

export function useChecklistProgress() {
  const { data: profile, isLoading: profileLoading } = useCoupleProfile();
  const { completed, toggle, loaded } = useChecklistCompletion();

  const loading = profileLoading || !loaded;

  const isTaskDone = (task: ChecklistTask) =>
    task.widget ? isWidgetTaskComplete(task.widget, profile) : completed.has(task.id);

  const perPhase = useMemo<ChecklistPhaseProgress[]>(
    () =>
      CHECKLIST_PHASES.map((phase) => {
        const goals = phase.goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          icon: goal.icon,
          doneCount: goal.tasks.filter(isTaskDone).length,
          totalCount: goal.tasks.length,
        }));
        return {
          id: phase.id,
          label: phase.label,
          goals,
          doneCount: goals.reduce((sum, g) => sum + g.doneCount, 0),
          totalCount: goals.reduce((sum, g) => sum + g.totalCount, 0),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, completed],
  );

  const doneCount = useMemo(() => perPhase.reduce((sum, phase) => sum + phase.doneCount, 0), [perPhase]);

  const doneGoalCount = useMemo(
    () =>
      perPhase.reduce(
        (sum, phase) => sum + phase.goals.filter((g) => g.totalCount > 0 && g.doneCount >= g.totalCount).length,
        0,
      ),
    [perPhase],
  );

  return {
    loading,
    doneCount,
    totalCount: CHECKLIST_TOTAL_TASKS,
    doneGoalCount,
    totalGoalCount: CHECKLIST_TOTAL_GOALS,
    progressPct: CHECKLIST_TOTAL_TASKS > 0 ? (doneCount / CHECKLIST_TOTAL_TASKS) * 100 : 0,
    perPhase,
    isTaskDone,
    toggle,
  };
}
