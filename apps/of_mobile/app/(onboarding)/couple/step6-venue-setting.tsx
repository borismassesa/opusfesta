import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { VENUE_STYLES } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function VenueSettingStep() {
  const router = useRouter();
  const { data, setVenueSetting } = useCoupleOnboarding();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>(data.venueSetting?.venueSettings ?? []);

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleNext = () => {
    setVenueSetting({ venueSettings: selected });
    router.push('/(onboarding)/couple/step7-design-style');
  };

  return (
    <StepContainer
      title="What's your dream setting?"
      subtitle="Select all that appeal to you."
      currentStep={6}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={selected.length === 0}
    >
      <View className="flex-row flex-wrap gap-3.5 mt-1">
        {VENUE_STYLES.map((style) => {
          const isSelected = selected.includes(style.key);
          return (
            <Pressable
              key={style.key}
              onPress={() => toggle(style.key)}
              className="w-[47%]"
            >
              <View
                className={`aspect-square rounded-xl overflow-hidden bg-ed-surface-container-highest items-center justify-center ${
                  isSelected ? 'border-2 border-of-light' : 'border-0 border-transparent'
                }`}
                style={shadowSoft}
              >
                <Text className="text-[48px]">{style.emoji}</Text>
                {isSelected && (
                  <View className="absolute inset-0 bg-[rgba(26,26,26,0.2)] items-center justify-center">
                    <Ionicons name="checkmark-circle" size={40} color={colors.light} />
                  </View>
                )}
              </View>
              <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mt-2">
                {style.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="font-work-sans text-xs text-ed-on-surface-variant text-center mt-4">
        You can change these preferences later.
      </Text>
    </StepContainer>
  );
}
