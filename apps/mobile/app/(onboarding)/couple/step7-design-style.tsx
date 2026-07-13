import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { shadowSoft } from '@/constants/theme';
import { DESIGN_STYLES } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function DesignStyleStep() {
  const router = useRouter();
  const { data, setDesignStyle } = useCoupleOnboarding();
  const [selected, setSelected] = useState<string[]>(data.designStyle?.designStyles ?? []);

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleNext = () => {
    setDesignStyle({ designStyles: selected });
    router.push('/(onboarding)/couple/step8-vendor-needs');
  };

  return (
    <StepContainer
      title="What design style"
      titleAccent="speaks to you?"
      subtitle="Select all the aesthetics that match your dream celebration vision."
      currentStep={7}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={selected.length === 0}
    >
      <View className="flex-row flex-wrap gap-3.5 mt-1">
        {DESIGN_STYLES.map((style) => {
          const isSelected = selected.includes(style.key);
          return (
            <Pressable
              key={style.key}
              onPress={() => toggle(style.key)}
              className="w-[47%]"
            >
              <View
                className="aspect-[0.8] rounded-xl overflow-hidden bg-ed-surface-container-highest items-center justify-center"
                style={shadowSoft}
              >
                <Text className="text-[48px]">{style.emoji}</Text>
                {isSelected && (
                  <View className="absolute top-2.5 right-2.5 w-7 h-7 rounded-[14px] items-center justify-center bg-ed-tertiary-container">
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
              <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mt-2 pl-0.5">
                {style.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </StepContainer>
  );
}
