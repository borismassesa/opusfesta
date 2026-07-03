import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EditorialStepContainer } from '@/components/onboarding/EditorialStepContainer';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { PLANNING_STAGES } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function PlanningStageStep() {
  const router = useRouter();
  const { data, setPlanningStage } = useCoupleOnboarding();
  const { editorial } = useTheme();
  const [selected, setSelected] = useState(data.planningStage?.stage ?? '');

  const handleNext = () => {
    setPlanningStage({ stage: selected });
    router.push('/(onboarding)/couple/step3-date');
  };

  return (
    <EditorialStepContainer
      title="Where are you in your"
      titleAccent="planning journey?"
      subtitle="Every great celebration starts with a single step. Tell us your status so we can tailor your dashboard."
      currentStep={2}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={!selected}
      showSkip
      onSkip={() => {
        setPlanningStage({ stage: 'exploring' });
        router.push('/(onboarding)/couple/step3-date');
      }}
    >
      <View style={{ gap: 14, marginTop: 8 }}>
        {PLANNING_STAGES.map((stage) => {
          const isSelected = selected === stage.key;
          return (
            <Pressable
              key={stage.key}
              onPress={() => setSelected(stage.key)}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: isSelected ? editorial.surfaceContainerLowest : editorial.surfaceContainerLow,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? editorial.onSecondaryContainer : 'transparent',
                },
                shadowSoft,
              ]}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  backgroundColor: stage.bgColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={stage.icon as any} size={26} color={stage.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: editorial.onSurface }}>
                  {stage.label}
                </Text>
                <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant, marginTop: 2 }}>
                  {stage.description}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={editorial.onSecondaryContainer} />
              )}
            </Pressable>
          );
        })}
      </View>
    </EditorialStepContainer>
  );
}
