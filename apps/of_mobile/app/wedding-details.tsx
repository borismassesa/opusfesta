import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DatePickerField } from '@/components/onboarding/DatePickerField';
import { CITIES, type CityKey } from '@/constants/onboarding';
import { useCoupleProfile, useUpdateCoupleProfile } from '@/hooks/useCoupleProfile';
import { shadowSoftSm } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';

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
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Something went wrong'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ed-bg">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
        <Header title="Wedding Details" showBack />

        <View className="gap-4">
          <Input label="Partner 1 name" value={partner1Name} onChangeText={setPartner1Name} placeholder="Your name" />
          <Input label="Partner 2 name" value={partner2Name} onChangeText={setPartner2Name} placeholder="Their name" />

          <View>
            <Text className="font-work-sans-bold text-[11px] tracking-[2px] uppercase text-ed-on-surface-variant mb-1.5 ml-0.5">
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
              className="flex-row items-center gap-2 mt-2.5"
            >
              <View
                className={`w-[18px] h-[18px] rounded border-2 ${
                  dateUndecided ? 'border-ed-primary-container bg-ed-primary-container' : 'border-ed-outline-variant bg-transparent'
                }`}
              />
              <Text className="font-work-sans text-sm text-ed-on-surface-variant">
                We haven't decided yet
              </Text>
            </Pressable>
          </View>

          <View>
            <Text className="font-work-sans-bold text-[11px] tracking-[2px] uppercase text-ed-on-surface-variant mb-1.5 ml-0.5">
              City
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CITIES.map((c) => {
                const isSelected = city === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCity(c.key)}
                    className={`flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-input border ${
                      isSelected ? 'bg-of-light border-of-light' : 'bg-ed-surface-container-lowest border-ed-outline-variant'
                    }`}
                    style={shadowSoftSm}
                  >
                    <Text className="text-sm">{c.icon}</Text>
                    <Text className="font-work-sans-medium text-[13px] text-ed-on-surface">
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
