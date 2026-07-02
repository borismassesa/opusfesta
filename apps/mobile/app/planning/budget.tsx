import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useCoupleProfile, useUpdateCoupleProfile } from '@/hooks/useCoupleProfile';
import { BUDGET_RANGES } from '@/constants/onboarding';
import { formatCurrency } from '@opusfesta/lib';
import { editorial, shadowSoftSm } from '@/constants/theme';

export default function BudgetScreen() {
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : (
        <>
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 13,
              color: editorial.onSurfaceVariant,
              marginBottom: 20,
              lineHeight: 19,
            }}
          >
            Pick the range that best fits your overall wedding budget. This helps us tailor vendor
            recommendations to your price point.
          </Text>

          <View style={{ gap: 10, marginBottom: 20 }}>
            {BUDGET_RANGES.map((range) => {
              const isSelected = selected === range.key;
              return (
                <Pressable
                  key={range.key}
                  onPress={() => setSelected(range.key)}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      borderRadius: 14,
                      backgroundColor: isSelected ? editorial.primaryContainer : editorial.surfaceContainerLowest,
                      borderWidth: 1,
                      borderColor: isSelected ? editorial.primaryContainer : editorial.outlineVariant,
                    },
                    shadowSoftSm,
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk-Bold',
                      fontSize: 15,
                      color: isSelected ? '#fff' : editorial.onSurface,
                    }}
                  >
                    {range.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                </Pressable>
              );
            })}
          </View>

          {perGuestEstimate != null && (
            <View
              style={[
                {
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: editorial.surfaceContainerLow,
                  marginBottom: 20,
                },
              ]}
            >
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant }}>
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
