import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { CHECKLIST_PHASES } from '@/constants/checklist';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

export default function ChecklistScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { goal: targetGoal } = useLocalSearchParams<{ goal?: string }>();
  const { loading: isLoading, doneCount, totalCount, progressPct, isTaskDone, toggle } = useChecklistProgress();

  const scrollRef = useRef<ScrollView>(null);
  const goalOffsets = useRef<Record<string, number>>({});
  const [hasScrolledToTarget, setHasScrolledToTarget] = useState(false);

  useEffect(() => {
    setHasScrolledToTarget(false);
  }, [targetGoal]);

  useEffect(() => {
    if (isLoading || !targetGoal || hasScrolledToTarget) return;
    const offset = goalOffsets.current[targetGoal];
    if (offset == null) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, offset - 12), animated: true });
    setHasScrolledToTarget(true);
  }, [isLoading, targetGoal, hasScrolledToTarget]);

  return (
    <ScreenWrapper scrollable={false}>
      <Header title="Checklist" showBack />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : (
        <>
          <View className="mb-5">
            <View className="flex-row justify-between mb-2">
              <Text className="font-work-sans-bold text-xs text-ed-on-surface-variant">
                {doneCount} of {totalCount} complete
              </Text>
              <Text className="font-work-sans-bold text-xs text-ed-primary-container">
                {Math.round(progressPct)}%
              </Text>
            </View>
            <ProgressBar progress={progressPct} />
          </View>

          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {CHECKLIST_PHASES.map((phase) => (
              <View key={phase.id} className="mb-2">
                <Text className="font-work-sans-bold text-xs tracking-[0.4px] uppercase text-ed-on-surface-variant mb-3.5">
                  {phase.label}
                </Text>
                {phase.goals.map((goal) => (
                  <View
                    key={goal.id}
                    className="mb-6"
                    onLayout={(e) => {
                      goalOffsets.current[goal.id] = e.nativeEvent.layout.y;
                    }}
                  >
                    <View className="flex-row items-center gap-2 mb-2.5">
                      <Ionicons name={goal.icon as keyof typeof Ionicons.glyphMap} size={16} color={editorial.tertiaryContainer} />
                      <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface">
                        {goal.title}
                      </Text>
                    </View>
                    <View className="gap-2">
                      {goal.tasks.map((task) => {
                        const done = isTaskDone(task);
                        return (
                          <View
                            key={task.id}
                            className="flex-row items-center bg-ed-surface-container-lowest rounded-xl border border-ed-outline-variant p-3 gap-2.5"
                            style={shadowSoftSm}
                          >
                            <Pressable
                              onPress={() => !task.widget && toggle(task.id)}
                              disabled={!!task.widget}
                              className="p-0.5"
                            >
                              <Ionicons
                                name={done ? 'checkmark-circle' : 'ellipse-outline'}
                                size={22}
                                color={done ? editorial.primaryContainer : editorial.outlineVariant}
                              />
                            </Pressable>
                            <Text
                              className={`flex-1 font-work-sans text-[13px] text-ed-on-surface ${done ? 'line-through opacity-60' : 'no-underline opacity-100'}`}
                            >
                              {task.text}
                            </Text>
                            {task.cta && (
                              <Pressable
                                onPress={() => router.push({ pathname: task.cta!.route, params: task.cta!.params } as Href)}
                                className="px-1"
                              >
                                <Text className="font-work-sans-bold text-[11px] text-ed-primary-container">
                                  {task.cta.label}
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </ScreenWrapper>
  );
}
