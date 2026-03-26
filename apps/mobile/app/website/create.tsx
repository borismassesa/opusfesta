import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateWebsite, useWeddingWebsite, useUpdateWebsite } from '@/hooks/useWeddingWebsite';
import { useOpusFestaAuth } from '@/lib/auth';
import { generateSlug } from '@/lib/api/wedding-website';
import { WEBSITE_THEMES } from '@/constants/wedding-sections';
import { colors, brutalist } from '@/constants/theme';
import type { WebsiteTheme } from '@/types/wedding-website';

export default function CreateWebsiteScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { user } = useOpusFestaAuth();
  const { data: existingWebsite } = useWeddingWebsite();
  const createWebsite = useCreateWebsite();
  const updateWebsite = useUpdateWebsite();

  const isEdit = edit === 'true' && !!existingWebsite;

  const [theme, setTheme] = useState<WebsiteTheme>(
    (existingWebsite?.theme as WebsiteTheme) ?? 'classic',
  );
  const [slug, setSlug] = useState(
    existingWebsite?.slug ?? generateSlug(user?.name ?? 'our-wedding'),
  );

  const handleCreate = async () => {
    if (!user) return;

    try {
      if (isEdit && existingWebsite) {
        const themeConfig = WEBSITE_THEMES.find((t) => t.key === theme);
        await updateWebsite.mutateAsync({
          websiteId: existingWebsite.id,
          updates: {
            slug,
            theme,
            primary_color: themeConfig?.primaryColor,
            accent_color: themeConfig?.accentColor,
            font_family: themeConfig?.fontFamily,
          },
        });
      } else {
        await createWebsite.mutateAsync({
          slug,
          theme,
          userId: user.id,
        });
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Header title={isEdit ? 'Edit Theme' : 'Create Website'} showBack />

        {/* Theme picker */}
        <Text className="font-dm-sans-bold text-base text-of-text mb-4 mt-4">
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
                  isSelected ? 'border-of-primary bg-of-pale' : 'border-of-border bg-white'
                }`}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: t.primaryColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-dm-sans-bold text-sm ${
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

        {/* Slug input */}
        <Text className="font-dm-sans-bold text-base text-of-text mb-2">
          Website URL
        </Text>
        <View className="flex-row items-center bg-white border border-of-border rounded-input overflow-hidden mb-2">
          <View className="bg-of-pale px-3 py-3.5 border-r border-of-border">
            <Text className="text-xs text-of-muted font-dm-sans-medium">opusfesta.com/w/</Text>
          </View>
          <Input
            value={slug}
            onChangeText={(text) => setSlug(text.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="fatma-and-said"
            autoCapitalize="none"
            containerClassName="flex-1"
          />
        </View>
        <Text className="text-xs text-of-muted mb-8">
          This will be your shareable wedding website link
        </Text>

        {/* CTA */}
        <Button
          title={isEdit ? 'Save Changes' : 'Create My Website'}
          onPress={handleCreate}
          loading={createWebsite.isPending || updateWebsite.isPending}
          disabled={slug.length < 3}
        />
      </View>
    </SafeAreaView>
  );
}
