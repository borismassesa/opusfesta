import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrutalistStepContainer } from '@/components/onboarding/BrutalistStepContainer';
import { brutalist, brutalistShadow } from '@/constants/theme';
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
    <BrutalistStepContainer
      title="What design style"
      titleAccent="speaks to you?"
      subtitle="Select all the aesthetics that match your dream celebration vision."
      currentStep={7}
      totalSteps={9}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={selected.length === 0}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 4 }}>
        {DESIGN_STYLES.map((style) => {
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
                    aspectRatio: 0.8,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: brutalist.surfaceContainerHighest,
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
                      top: 10,
                      right: 10,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: brutalist.tertiaryContainer,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 15,
                  color: brutalist.onSurface,
                  marginTop: 8,
                  paddingLeft: 2,
                }}
              >
                {style.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BrutalistStepContainer>
  );
}
