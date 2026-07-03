import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCoupleProfile } from '@/hooks/useCoupleProfile';
import { useCreateWebsite, useSaveWebsiteMeta, useWeddingWebsite } from '@/hooks/useWeddingWebsite';
import { WEBSITE_THEMES } from '@/constants/wedding-sections';
import { useTheme } from '@/theme/useTheme';
import type { WebsiteTheme } from '@/types/wedding-website';

export default function CreateWebsiteScreen() {
  const { editorial, colors } = useTheme();
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { data: profile } = useCoupleProfile();
  const { data: website } = useWeddingWebsite();
  const createWebsite = useCreateWebsite();
  const saveMeta = useSaveWebsiteMeta();

  const isEdit = edit === 'true' && !!website?.doc;

  const currentThemeKey = WEBSITE_THEMES.find((t) => t.presetId === website?.doc?.meta.presetId)?.key ?? 'classic';
  const [theme, setTheme] = useState<WebsiteTheme>(currentThemeKey);
  const [welcome, setWelcome] = useState(website?.doc?.meta.welcome ?? "We're getting married!");

  const partnerA = profile?.partner1_name ?? '';
  const partnerB = profile?.partner2_name ?? '';

  const handleCreate = async () => {
    const presetId = WEBSITE_THEMES.find((t) => t.key === theme)!.presetId;

    try {
      if (isEdit && website?.doc) {
        await saveMeta.mutateAsync({
          doc: website.doc,
          metaPatch: { presetId, welcome },
        });
      } else {
        await createWebsite.mutateAsync({ partnerA, partnerB, presetId, welcome });
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Header title={isEdit ? 'Edit Theme' : 'Create Website'} showBack />

        {/* Theme picker */}
        <Text className="font-work-sans-bold text-base text-of-text mb-4 mt-4">
          Choose a theme
        </Text>
        <View className="gap-3 mb-8">
          {WEBSITE_THEMES.map((t) => {
            const isSelected = theme === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTheme(t.key)}
                className={`flex-row items-center p-4 rounded-xl border ${
                  isSelected ? 'border-of-primary bg-of-pale' : 'border-of-border bg-of-surface'
                }`}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-work-sans-bold text-sm ${
                      isSelected ? 'text-of-primary' : 'text-of-text'
                    }`}
                  >
                    {t.label}
                  </Text>
                  <Text className="text-xs text-of-muted">{t.description}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Welcome message */}
        <Input
          label="Welcome message"
          value={welcome}
          onChangeText={setWelcome}
          placeholder="We're getting married!"
          containerClassName="mb-2"
        />
        <Text className="text-xs text-of-muted mb-8">
          Shown at the top of your public wedding website
        </Text>

        {/* CTA */}
        <Button
          title={isEdit ? 'Save Changes' : 'Create My Website'}
          onPress={handleCreate}
          loading={createWebsite.isPending || saveMeta.isPending}
          disabled={!partnerA}
        />
      </View>
    </SafeAreaView>
  );
}
