import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EditorialStepContainer } from '@/components/onboarding/EditorialStepContainer';
import { editorial, shadowSoft } from '@/constants/theme';
import { VENUE_STYLES } from '@/constants/onboarding';
import { useCoupleOnboarding } from './_layout';

export default function VenueSettingStep() {
  const router = useRouter();
  const { data, setVenueSetting } = useCoupleOnboarding();
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
    <EditorialStepContainer
      title="What's your dream setting?"
      subtitle="Select all that appeal to you."
      currentStep={6}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={selected.length === 0}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 4 }}>
        {VENUE_STYLES.map((style) => {
          const isSelected = selected.includes(style.key);
          return (
            <Pressable
              key={style.key}
              onPress={() => toggle(style.key)}
              style={{ width: '47%' }}
            >
              <View
                style={[
                  {
                    aspectRatio: 1,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: editorial.surfaceContainerHighest,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? editorial.primaryContainer : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  shadowSoft,
                ]}
              >
                <Text style={{ fontSize: 48 }}>{style.emoji}</Text>
                {isSelected && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(91,45,142,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={40} color={editorial.primaryContainer} />
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 15,
                  color: isSelected ? editorial.primaryContainer : editorial.onSurface,
                  marginTop: 8,
                }}
              >
                {style.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
        You can change these preferences later.
      </Text>
    </EditorialStepContainer>
  );
}
