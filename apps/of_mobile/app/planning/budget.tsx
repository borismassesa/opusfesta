import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useCoupleProfile, useUpdateCoupleProfile } from '@/hooks/useCoupleProfile';
import { BUDGET_RANGES } from '@/constants/onboarding';
import { formatCurrency } from '@opusfesta/lib';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

export default function BudgetScreen() {
  const { editorial } = useTheme();
  const { data: profile, isLoading } = useCoupleProfile();
  const updateProfile = useUpdateCoupleProfile();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.budget_range) setSelected(profile.budget_range);
  }, [profile?.budget_range]);

  const hasChanges = selected !== (profile?.budget_range ?? null);
  const selectedRange = BUDGET_RANGES.find((r) => r.key === selected);
  const guestCount: number | null = profile?.guest_count ?? null;

  const perGuestEstimate =
    selectedRange?.min != null && selectedRange?.max != null && guestCount
      ? Math.round(((selectedRange.min + selectedRange.max) / 2) / guestCount)
      : null;

  return (
    <ScreenWrapper scrollable={false}>
      <Header title="Budget" showBack />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : (
        <>
          <Text className="font-work-sans text-[13px] text-ed-on-surface-variant mb-5 leading-[19px]">
            Pick the range that best fits your overall wedding budget. This helps us tailor vendor
            recommendations to your price point.
          </Text>

          <View className="gap-2.5 mb-5">
            {BUDGET_RANGES.map((range) => {
              const isSelected = selected === range.key;
              return (
                <Pressable
                  key={range.key}
                  onPress={() => setSelected(range.key)}
                  className={`flex-row items-center justify-between p-4 rounded-[14px] border ${
                    isSelected ? 'bg-of-light border-of-light' : 'bg-ed-surface-container-lowest border-ed-outline-variant'
                  }`}
                  style={shadowSoftSm}
                >
                  <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface">
                    {range.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={editorial.onSurface} />}
                </Pressable>
              );
            })}
          </View>

          {perGuestEstimate != null && (
            <View className="p-3.5 rounded-xl bg-ed-surface-container-low mb-5">
              <Text className="font-work-sans text-xs text-ed-on-surface-variant">
                Based on {guestCount} guests, that's roughly {formatCurrency(perGuestEstimate)} per guest.
              </Text>
            </View>
          )}

          <Button
            title="Save budget"
            onPress={() => selected && updateProfile.mutate({ budget_range: selected })}
            loading={updateProfile.isPending}
            disabled={!hasChanges || !selected}
          />
        </>
      )}
    </ScreenWrapper>
  );
}
