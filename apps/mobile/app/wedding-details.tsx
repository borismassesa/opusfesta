import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DatePickerField } from '@/components/onboarding/DatePickerField';
import { CITIES, type CityKey } from '@/constants/onboarding';
import { useCoupleProfile, useUpdateCoupleProfile } from '@/hooks/useCoupleProfile';
import { shadowSoftSm, radii } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const formatDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const parseStored = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default function WeddingDetailsScreen() {
  const { data: profile } = useCoupleProfile();
  const updateProfile = useUpdateCoupleProfile();
  const { editorial } = useTheme();

  const [partner1Name, setPartner1Name] = useState(profile?.partner1_name ?? '');
  const [partner2Name, setPartner2Name] = useState(profile?.partner2_name ?? '');
  const [weddingDate, setWeddingDate] = useState<Date | null>(parseStored(profile?.wedding_date));
  const [dateUndecided, setDateUndecided] = useState<boolean>(!!profile?.date_undecided);
  const [city, setCity] = useState<CityKey | null>((profile?.city as CityKey) ?? null);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        partner1_name: partner1Name.trim(),
        partner2_name: partner2Name.trim() || null,
        wedding_date: dateUndecided ? null : weddingDate ? toIsoDate(weddingDate) : null,
        date_undecided: dateUndecided,
        city: city ?? null,
      });
      Alert.alert('Saved', 'Your wedding details have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
        <Header title="Wedding Details" showBack />

        <View style={{ gap: 16 }}>
          <Input label="Partner 1 name" value={partner1Name} onChangeText={setPartner1Name} placeholder="Your name" />
          <Input label="Partner 2 name" value={partner2Name} onChangeText={setPartner2Name} placeholder="Their name" />

          <View>
            <Text
              style={{
                fontFamily: 'WorkSans-Bold',
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: editorial.onSurfaceVariant,
                marginBottom: 6,
                marginLeft: 2,
              }}
            >
              Wedding date
            </Text>
            {!dateUndecided && (
              <DatePickerField
                value={weddingDate}
                onChange={setWeddingDate}
                placeholder="Select your wedding date"
                formatValue={formatDate}
              />
            )}
            <Pressable
              onPress={() => setDateUndecided((v) => !v)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: dateUndecided ? editorial.primaryContainer : editorial.outlineVariant,
                  backgroundColor: dateUndecided ? editorial.primaryContainer : 'transparent',
                }}
              />
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant }}>
                We haven't decided yet
              </Text>
            </Pressable>
          </View>

          <View>
            <Text
              style={{
                fontFamily: 'WorkSans-Bold',
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: editorial.onSurfaceVariant,
                marginBottom: 6,
                marginLeft: 2,
              }}
            >
              City
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CITIES.map((c) => {
                const isSelected = city === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCity(c.key)}
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: radii.input,
                        backgroundColor: isSelected ? editorial.secondaryContainer : editorial.surfaceContainerLowest,
                      },
                      shadowSoftSm,
                    ]}
                  >
                    <Text style={{ fontSize: 14 }}>{c.icon}</Text>
                    <Text
                      style={{
                        fontFamily: 'WorkSans-Medium',
                        fontSize: 13,
                        color: isSelected ? editorial.onSecondaryContainer : editorial.onSurface,
                      }}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={updateProfile.isPending}
            disabled={!partner1Name.trim()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
