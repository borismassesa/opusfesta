import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { DatePickerField } from '@/components/onboarding/DatePickerField';
import { shadowSoft, shadowSoftSm } from '@/constants/theme';
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
    <StepContainer
      title="When's the big day?"
      currentStep={3}
      totalSteps={8}
      onNext={handleNext}
      onBack={() => router.back()}
      nextDisabled={nextDisabled}
    >
      <View className="gap-2 mt-2">
        {/* Calendar icon hero */}
        <View className="bg-ed-surface-container-low rounded-card p-6 items-center mb-2">
          <View
            className="w-[72px] h-[72px] rounded-full items-center justify-center mb-3 bg-ed-tertiary-fixed"
            style={shadowSoft}
          >
            <Ionicons name="calendar" size={32} color={editorial.onTertiaryFixed} />
          </View>
          <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center max-w-[280px]">
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
                className={`p-4 rounded-card ${isSelected ? 'bg-ed-secondary-container' : 'bg-ed-surface-container-low'}`}
                style={shadowSoft}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-9 h-9 rounded-lg items-center justify-center bg-ed-surface-container-lowest"
                    style={shadowSoftSm}
                  >
                    <Ionicons name={opt.icon as keyof typeof Ionicons.glyphMap} size={18} color={editorial.onSecondaryContainer} />
                  </View>
                  <Text className="font-space-grotesk-bold text-[17px] text-ed-on-surface flex-1">
                    {opt.label}
                  </Text>
                </View>

                {/* Expanded date picker */}
                {isSelected && opt.key === 'exact' && (
                  <View className="mt-3.5">
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
                  <View className="mt-3.5">
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
    </StepContainer>
  );
}
