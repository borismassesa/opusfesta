import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useCoupleProfile } from '@/hooks/useCoupleProfile';
import { useChecklistCompletion } from '@/hooks/useChecklist';
import { CHECKLIST_SECTIONS, CHECKLIST_TOTAL_TASKS, isWidgetTaskComplete, type ChecklistTask } from '@/constants/checklist';
import { editorial, shadowSoftSm } from '@/constants/theme';

export default function ChecklistScreen() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useCoupleProfile();
  const { completed, toggle, loaded } = useChecklistCompletion();

  const isLoading = profileLoading || !loaded;

  const isTaskDone = (task: ChecklistTask) =>
    task.widget ? isWidgetTaskComplete(task.widget, profile) : completed.has(task.id);

  const doneCount = CHECKLIST_SECTIONS.reduce(
    (sum, section) => sum + section.tasks.filter(isTaskDone).length,
    0,
  );
  const progress = CHECKLIST_TOTAL_TASKS > 0 ? (doneCount / CHECKLIST_TOTAL_TASKS) * 100 : 0;

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
                {doneCount} of {CHECKLIST_TOTAL_TASKS} complete
              </Text>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer }}>
                {Math.round(progress)}%
              </Text>
            </View>
            <ProgressBar progress={progress} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {CHECKLIST_SECTIONS.map((section) => (
              <View key={section.id} style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk-Bold',
                    fontSize: 15,
                    color: editorial.onSurface,
                    marginBottom: 10,
                  }}
                >
                  {section.title}
                </Text>
                <View style={{ gap: 8 }}>
                  {section.tasks.map((task) => {
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
          </ScrollView>
        </>
      )}
    </ScreenWrapper>
  );
}
