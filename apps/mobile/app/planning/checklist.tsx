import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : (
        <>
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.onSurfaceVariant }}>
                {doneCount} of {totalCount} complete
              </Text>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer }}>
                {Math.round(progressPct)}%
              </Text>
            </View>
            <ProgressBar progress={progressPct} />
          </View>

          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {CHECKLIST_PHASES.map((phase) => (
              <View key={phase.id} style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontFamily: 'WorkSans-Bold',
                    fontSize: 12,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                    color: editorial.onSurfaceVariant,
                    marginBottom: 14,
                  }}
                >
                  {phase.label}
                </Text>
                {phase.goals.map((goal) => (
                  <View
                    key={goal.id}
                    style={{ marginBottom: 24 }}
                    onLayout={(e) => {
                      goalOffsets.current[goal.id] = e.nativeEvent.layout.y;
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name={goal.icon as any} size={16} color={editorial.tertiaryContainer} />
                      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface }}>
                        {goal.title}
                      </Text>
                    </View>
                    <View style={{ gap: 8 }}>
                      {goal.tasks.map((task) => {
                        const done = isTaskDone(task);
                        return (
                          <View
                            key={task.id}
                            style={[
                              {
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: editorial.surfaceContainerLowest,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: editorial.outlineVariant,
                                padding: 12,
                                gap: 10,
                              },
                              shadowSoftSm,
                            ]}
                          >
                            <Pressable
                              onPress={() => !task.widget && toggle(task.id)}
                              disabled={!!task.widget}
                              style={{ padding: 2 }}
                            >
                              <Ionicons
                                name={done ? 'checkmark-circle' : 'ellipse-outline'}
                                size={22}
                                color={done ? editorial.primaryContainer : editorial.outlineVariant}
                              />
                            </Pressable>
                            <Text
                              style={{
                                flex: 1,
                                fontFamily: 'WorkSans-Regular',
                                fontSize: 13,
                                color: editorial.onSurface,
                                textDecorationLine: done ? 'line-through' : 'none',
                                opacity: done ? 0.6 : 1,
                              }}
                            >
                              {task.text}
                            </Text>
                            {task.cta && (
                              <Pressable
                                onPress={() => router.push({ pathname: task.cta!.route as any, params: task.cta!.params })}
                                style={{ paddingHorizontal: 4 }}
                              >
                                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: editorial.primaryContainer }}>
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
