import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrutalistStepContainer } from '@/components/onboarding/BrutalistStepContainer';
import { brutalist, brutalistShadow } from '@/constants/theme';
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
    <BrutalistStepContainer
      title="What's your dream setting?"
      subtitle="Select all that appeal to you."
      currentStep={6}
      totalSteps={9}
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
                    backgroundColor: brutalist.surfaceContainerHighest,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? brutalist.primaryContainer : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  brutalistShadow,
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
                    <Ionicons name="checkmark-circle" size={40} color={brutalist.primaryContainer} />
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 15,
                  color: isSelected ? brutalist.primaryContainer : brutalist.onSurface,
                  marginTop: 8,
                }}
              >
                {style.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: brutalist.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
        You can change these preferences later.
      </Text>
    </BrutalistStepContainer>
  );
}
