import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
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
    <StepContainer
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
      <View className="gap-3.5 mt-2">
        {PLANNING_STAGES.map((stage) => {
          const isSelected = selected === stage.key;
          return (
            <Pressable
              key={stage.key}
              onPress={() => setSelected(stage.key)}
              className={`flex-row items-center gap-4 p-4 rounded-xl ${
                isSelected ? 'bg-ed-surface-container-lowest border-2 border-ed-on-secondary-container' : 'bg-ed-surface-container-low border-0 border-transparent'
              }`}
              style={shadowSoft}
            >
              <View
                className="w-[52px] h-[52px] rounded-[10px] items-center justify-center"
                style={{ backgroundColor: stage.bgColor }}
              >
                <Ionicons name={stage.icon as keyof typeof Ionicons.glyphMap} size={26} color={stage.iconColor} />
              </View>
              <View className="flex-1">
                <Text className="font-space-grotesk-bold text-lg text-ed-on-surface">
                  {stage.label}
                </Text>
                <Text className="font-work-sans text-[13px] text-ed-on-surface-variant mt-0.5">
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
    </StepContainer>
  );
}
