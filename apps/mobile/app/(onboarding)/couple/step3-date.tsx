import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrutalistStepContainer } from '@/components/onboarding/BrutalistStepContainer';
import { brutalist, brutalistShadow, brutalistShadowSm } from '@/constants/theme';
import { useCoupleOnboarding } from './_layout';

type DateOption = 'exact' | 'month_year' | 'not_sure';

const OPTIONS: { key: DateOption; label: string; icon: string }[] = [
  { key: 'exact', label: 'I have an exact date', icon: 'calendar' },
  { key: 'month_year', label: 'I know the month and year', icon: 'calendar-outline' },
  { key: 'not_sure', label: 'Not sure yet', icon: 'help-circle-outline' },
];

export default function DateStep() {
  const router = useRouter();
  const { data, setDate } = useCoupleOnboarding();

  const [option, setOption] = useState<DateOption | null>(data.date?.dateOption ?? null);
  const [dateValue, setDateValue] = useState(data.date?.weddingDate ?? '');

  const handleNext = () => {
    setDate({
      weddingDate: option === 'not_sure' ? null : dateValue || null,
      dateOption: option!,
    });
    router.push('/(onboarding)/couple/step4-location');
  };

  return (
    <BrutalistStepContainer
      title="When's the big day?"
      currentStep={3}
      totalSteps={9}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={option === null}
    >
      <View style={{ gap: 8, marginTop: 8 }}>
        {/* Calendar icon hero */}
        <View
          style={{
            backgroundColor: brutalist.surfaceContainerLow,
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <View
            style={[
              {
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: brutalist.tertiaryFixed,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              },
              brutalistShadow,
            ]}
          >
            <Ionicons name="calendar" size={32} color={brutalist.onTertiaryFixed} />
          </View>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: brutalist.onSurfaceVariant, textAlign: 'center', maxWidth: 280 }}>
            Every great story has a beginning. Tell us when yours starts so we can help you find the perfect vendors.
          </Text>
        </View>

        {/* Options */}
        {OPTIONS.map((opt) => {
          const isSelected = option === opt.key;
          return (
            <View key={opt.key}>
              <Pressable
                onPress={() => setOption(opt.key)}
                style={[
                  {
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: isSelected ? brutalist.secondaryContainer : brutalist.surfaceContainerLow,
                  },
                  brutalistShadow,
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={[
                      {
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: brutalist.surfaceContainerLowest,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                      brutalistShadowSm,
                    ]}
                  >
                    <Ionicons name={opt.icon as any} size={18} color={brutalist.onSecondaryContainer} />
                  </View>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: brutalist.onSurface, flex: 1 }}>
                    {opt.label}
                  </Text>
                </View>

                {/* Expanded date input */}
                {isSelected && opt.key === 'exact' && (
                  <View style={{ marginTop: 14 }}>
                    <TextInput
                      value={dateValue}
                      onChangeText={setDateValue}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={brutalist.outlineVariant}
                      keyboardType="numbers-and-punctuation"
                      style={{
                        fontFamily: 'WorkSans-Regular',
                        fontSize: 16,
                        color: brutalist.onSurface,
                        backgroundColor: brutalist.surfaceContainerLowest,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                      }}
                    />
                  </View>
                )}
                {isSelected && opt.key === 'month_year' && (
                  <View style={{ marginTop: 14 }}>
                    <TextInput
                      value={dateValue}
                      onChangeText={setDateValue}
                      placeholder="e.g. June 2026"
                      placeholderTextColor={brutalist.outlineVariant}
                      style={{
                        fontFamily: 'WorkSans-Regular',
                        fontSize: 16,
                        color: brutalist.onSurface,
                        backgroundColor: brutalist.surfaceContainerLowest,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 14,
                      }}
                    />
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </BrutalistStepContainer>
  );
}
