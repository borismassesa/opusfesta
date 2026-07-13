import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { VENDOR_NEED_ITEMS } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function VendorNeedsStep() {
  const router = useRouter();
  const { data, setVendorNeeds } = useCoupleOnboarding();
  const { editorial } = useTheme();
  const [selected, setSelected] = useState<string[]>(data.vendorNeeds?.vendorNeeds ?? []);

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleNext = () => {
    setVendorNeeds({ vendorNeeds: selected });
    router.push('/(onboarding)/couple/step10-complete');
  };

  return (
    <StepContainer
      title="What vendors"
      titleAccent="do you need?"
      subtitle="Select all you're looking for. You can update this later."
      currentStep={8}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={selected.length === 0}
    >
      <View className="flex-row flex-wrap gap-3 mt-1">
        {VENDOR_NEED_ITEMS.map((item) => {
          const isSelected = selected.includes(item.key);
          return (
            <Pressable
              key={item.key}
              onPress={() => toggle(item.key)}
              className={`w-[47%] p-4 rounded-xl ${
                isSelected ? 'bg-ed-tertiary-fixed border-2 border-of-light' : 'bg-ed-surface-container-low border-0 border-transparent'
              }`}
              style={shadowSoft}
            >
              {isSelected && (
                <View className="absolute top-2 right-2 w-[22px] h-[22px] rounded-[11px] items-center justify-center bg-of-light">
                  <Ionicons name="checkmark" size={14} color={editorial.onSurface} />
                </View>
              )}
              <View className="mb-2.5">
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={32}
                  color={editorial.tertiaryContainer}
                />
              </View>
              <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface">
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="font-work-sans text-xs text-ed-on-surface-variant text-center mt-4">
        You can always modify these preferences in your planning dashboard.
      </Text>
    </StepContainer>
  );
}
