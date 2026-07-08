import { useMemo } from 'react';
import { useCoupleProfile } from './useCoupleProfile';
import { useChecklistCompletion } from './useChecklist';
import { CHECKLIST_SECTIONS, CHECKLIST_TOTAL_TASKS, isWidgetTaskComplete, type ChecklistTask } from '@/constants/checklist';

export type ChecklistSectionProgress = {
  id: string;
  title: string;
  icon: string;
  doneCount: number;
  totalCount: number;
};

export function useChecklistProgress() {
  const { data: profile, isLoading: profileLoading } = useCoupleProfile();
  const { completed, toggle, loaded } = useChecklistCompletion();

  const loading = profileLoading || !loaded;

  const isTaskDone = (task: ChecklistTask) =>
    task.widget ? isWidgetTaskComplete(task.widget, profile) : completed.has(task.id);

  const perSection = useMemo<ChecklistSectionProgress[]>(
    () =>
      CHECKLIST_SECTIONS.map((section) => ({
        id: section.id,
        title: section.title,
        icon: section.icon,
        doneCount: section.tasks.filter(isTaskDone).length,
        totalCount: section.tasks.length,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, completed],
  );

  const doneCount = useMemo(
    () => perSection.reduce((sum, section) => sum + section.doneCount, 0),
    [perSection],
  );

  return {
    loading,
    doneCount,
    totalCount: CHECKLIST_TOTAL_TASKS,
    progressPct: CHECKLIST_TOTAL_TASKS > 0 ? (doneCount / CHECKLIST_TOTAL_TASKS) * 100 : 0,
    perSection,
    isTaskDone,
    toggle,
  };
}
