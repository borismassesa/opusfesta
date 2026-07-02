import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EditorialStepContainer } from '@/components/onboarding/EditorialStepContainer';
import { editorial, shadowSoft, shadowSoftPrimary } from '@/constants/theme';
import { GUEST_COUNT_OPTIONS } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function GuestsStep() {
  const router = useRouter();
  const { data, setGuests } = useCoupleOnboarding();
  const [selected, setSelected] = useState(data.guests?.guestCountKey ?? '');

  const handleNext = () => {
    const opt = GUEST_COUNT_OPTIONS.find((o) => o.key === selected);
    setGuests({ guestCountKey: selected, guestCount: opt?.value ?? null });
    router.push('/(onboarding)/couple/step6-venue-setting');
  };

  return (
    <EditorialStepContainer
      title="How many guests are you expecting?"
      subtitle="This helps us recommend venues and catering packages that perfectly fit your celebration's scale."
      currentStep={5}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={!selected}
    >
      <View style={{ gap: 12, marginTop: 8 }}>
        {GUEST_COUNT_OPTIONS.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSelected(opt.key)}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 18,
                  borderRadius: 12,
                  backgroundColor: isSelected ? editorial.secondaryContainer : editorial.surfaceContainerLow,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? editorial.primaryContainer : 'transparent',
                },
                isSelected ? shadowSoftPrimary : shadowSoft,
              ]}
            >
              <View>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: isSelected ? editorial.onSecondaryContainer : editorial.onSurface, marginBottom: 2 }}>
                  {opt.label}
                </Text>
                <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant }}>
                  {opt.subtitle}
                </Text>
              </View>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={24} color={editorial.primaryContainer} />
              ) : (
                <Ionicons name="person-outline" size={20} color={editorial.onSurfaceVariant} />
              )}
            </Pressable>
          );
        })}

        <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 13, color: editorial.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
          You can adjust this guest count later in your event dashboard.
        </Text>
      </View>
    </EditorialStepContainer>
  );
}
