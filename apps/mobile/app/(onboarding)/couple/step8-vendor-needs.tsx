import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrutalistStepContainer } from '@/components/onboarding/BrutalistStepContainer';
import { brutalist, brutalistShadow } from '@/constants/theme';
import { VENDOR_NEED_ITEMS } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function VendorNeedsStep() {
  const router = useRouter();
  const { data, setVendorNeeds } = useCoupleOnboarding();
  const [selected, setSelected] = useState<string[]>(data.vendorNeeds?.vendorNeeds ?? []);

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleNext = () => {
    setVendorNeeds({ vendorNeeds: selected });
    router.push('/(onboarding)/couple/step9-offers');
  };

  return (
    <BrutalistStepContainer
      title="What vendors"
      titleAccent="do you need?"
      subtitle="Select all you're looking for. You can update this later."
      currentStep={8}
      totalSteps={9}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={selected.length === 0}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
        {VENDOR_NEED_ITEMS.map((item) => {
          const isSelected = selected.includes(item.key);
          return (
            <Pressable
              key={item.key}
              onPress={() => toggle(item.key)}
              style={[
                {
                  width: '47%',
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: isSelected ? brutalist.tertiaryFixed : brutalist.surfaceContainerLow,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? brutalist.primaryContainer : 'transparent',
                },
                brutalistShadow,
              ]}
            >
              {isSelected && (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: brutalist.primaryContainer,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
              <View style={{ marginBottom: 10 }}>
                <Ionicons
                  name={item.icon as any}
                  size={32}
                  color={brutalist.tertiaryContainer}
                />
              </View>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: brutalist.onSurface }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: brutalist.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
        You can always modify these preferences in your planning dashboard.
      </Text>
    </BrutalistStepContainer>
  );
}
