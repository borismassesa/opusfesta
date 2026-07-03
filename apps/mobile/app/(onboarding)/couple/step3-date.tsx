import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EditorialStepContainer } from '@/components/onboarding/EditorialStepContainer';
import { DatePickerField } from '@/components/onboarding/DatePickerField';
import { shadowSoft, shadowSoftSm, radii } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { useCoupleOnboarding } from './_layout';

type DateOption = 'exact' | 'month_year' | 'not_sure';

const OPTIONS: { key: DateOption; label: string; icon: string }[] = [
  { key: 'exact', label: 'I have an exact date', icon: 'calendar' },
  { key: 'month_year', label: 'I know the month and year', icon: 'calendar-outline' },
  { key: 'not_sure', label: 'Not sure yet', icon: 'help-circle-outline' },
];

// Local (timezone-safe) YYYY-MM-DD used to persist an exact wedding date.
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const formatExact = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const formatMonthYear = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

// Rebuild a Date from a previously stored value so the picker reopens on it.
const parseStored = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default function DateStep() {
  const router = useRouter();
  const { data, setDate } = useCoupleOnboarding();
  const { editorial } = useTheme();

  const [option, setOption] = useState<DateOption | null>(data.date?.dateOption ?? null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(parseStored(data.date?.weddingDate));

  // A date must be picked unless "Not sure yet".
  const nextDisabled = option === null || (option !== 'not_sure' && selectedDate === null);

  const handleNext = () => {
    let weddingDate: string | null = null;
    if (option === 'exact' && selectedDate) weddingDate = toIsoDate(selectedDate);
    else if (option === 'month_year' && selectedDate) weddingDate = formatMonthYear(selectedDate);

    setDate({
      weddingDate,
      dateOption: option!,
    });
    router.push('/(onboarding)/couple/step4-location');
  };

  return (
    <EditorialStepContainer
      title="When's the big day?"
      currentStep={3}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={nextDisabled}
    >
      <View style={{ gap: 8, marginTop: 8 }}>
        {/* Calendar icon hero */}
        <View
          style={{
            backgroundColor: editorial.surfaceContainerLow,
            borderRadius: radii.card,
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
                backgroundColor: editorial.tertiaryFixed,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              },
              shadowSoft,
            ]}
          >
            <Ionicons name="calendar" size={32} color={editorial.onTertiaryFixed} />
          </View>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant, textAlign: 'center', maxWidth: 280 }}>
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
                    borderRadius: radii.card,
                    backgroundColor: isSelected ? editorial.secondaryContainer : editorial.surfaceContainerLow,
                  },
                  shadowSoft,
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={[
                      {
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: editorial.surfaceContainerLowest,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                      shadowSoftSm,
                    ]}
                  >
                    <Ionicons name={opt.icon as any} size={18} color={editorial.onSecondaryContainer} />
                  </View>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: editorial.onSurface, flex: 1 }}>
                    {opt.label}
                  </Text>
                </View>

                {/* Expanded date picker */}
                {isSelected && opt.key === 'exact' && (
                  <View style={{ marginTop: 14 }}>
                    <DatePickerField
                      value={selectedDate}
                      onChange={setSelectedDate}
                      placeholder="Select your wedding date"
                      formatValue={formatExact}
                      minimumDate={new Date()}
                    />
                  </View>
                )}
                {isSelected && opt.key === 'month_year' && (
                  <View style={{ marginTop: 14 }}>
                    <DatePickerField
                      value={selectedDate}
                      onChange={setSelectedDate}
                      placeholder="Select month and year"
                      formatValue={formatMonthYear}
                      minimumDate={new Date()}
                    />
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </EditorialStepContainer>
  );
}
