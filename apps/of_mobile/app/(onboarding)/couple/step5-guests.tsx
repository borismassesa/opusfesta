import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { shadowSoft, shadowSoftPrimary } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { GUEST_COUNT_OPTIONS } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function GuestsStep() {
  const router = useRouter();
  const { data, setGuests } = useCoupleOnboarding();
  const { editorial, colors } = useTheme();
  const [selected, setSelected] = useState(data.guests?.guestCountKey ?? '');

  const handleNext = () => {
    const opt = GUEST_COUNT_OPTIONS.find((o) => o.key === selected);
    setGuests({ guestCountKey: selected, guestCount: opt?.value ?? null });
    router.push('/(onboarding)/couple/step6-venue-setting');
  };

  return (
    <StepContainer
      title="How many guests are you expecting?"
      subtitle="This helps us recommend venues and catering packages that perfectly fit your celebration's scale."
      currentStep={5}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={!selected}
    >
      <View className="gap-3 mt-2">
        {GUEST_COUNT_OPTIONS.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSelected(opt.key)}
              className={`flex-row items-center justify-between p-[18px] rounded-xl ${
                isSelected ? 'bg-ed-secondary-container border-2 border-of-light' : 'bg-ed-surface-container-low border-0 border-transparent'
              }`}
              style={isSelected ? shadowSoftPrimary : shadowSoft}
            >
              <View>
                <Text className={`font-space-grotesk-bold text-[22px] mb-0.5 ${isSelected ? 'text-ed-on-secondary-container' : 'text-ed-on-surface'}`}>
                  {opt.label}
                </Text>
                <Text className="font-work-sans text-[13px] text-ed-on-surface-variant">
                  {opt.subtitle}
                </Text>
              </View>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.light} />
              ) : (
                <Ionicons name="person-outline" size={20} color={editorial.onSurfaceVariant} />
              )}
            </Pressable>
          );
        })}

        <Text className="font-work-sans-medium text-[13px] text-ed-on-surface-variant text-center mt-2">
          You can adjust this guest count later in your event dashboard.
        </Text>
      </View>
    </StepContainer>
  );
}
