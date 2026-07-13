import { View, Text, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import {
  useWeddingWebsite,
  usePublishWebsite,
  useUnpublishWebsite,
  useSaveWebsiteMeta,
} from '@/hooks/useWeddingWebsite';
import { WEBSITE_PAGES } from '@/constants/wedding-sections';
import { shadowSoft, shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import type { BuilderPage } from '@/types/site-doc';

export default function WebsiteTabScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { data: website, isLoading } = useWeddingWebsite();
  const publishWebsite = usePublishWebsite();
  const unpublishWebsite = useUnpublishWebsite();
  const saveMeta = useSaveWebsiteMeta();

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      </ScreenWrapper>
    );
  }

  // No website yet → Empty state CTA
  if (!website?.doc) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center py-10">
          <View
            className="w-20 h-20 rounded-xl items-center justify-center mb-6 bg-ed-tertiary-fixed"
            style={shadowSoftSm}
          >
            <Ionicons name="globe-outline" size={40} color={editorial.tertiaryContainer} />
          </View>
          <Text className="font-playfair-bold text-[22px] text-ed-on-surface text-center mb-2">
            Your Wedding Website
          </Text>
          <Text className="font-work-sans text-[15px] leading-[22px] text-ed-on-surface-variant text-center mb-8 px-8">
            Create a beautiful website to share your wedding details, collect RSVPs, and keep guests informed
          </Text>
          <Pressable
            onPress={() => router.push('/website/create')}
            className="bg-ed-primary-container py-4 px-8 rounded-xl flex-row items-center gap-2"
            style={shadowSoft}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text className="font-space-grotesk-bold text-base text-white">
              Create Website
            </Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  // Website exists → Dashboard
  const doc = website.doc;
  const pages = doc.meta.pages;
  const visibleCount = pages.filter((p) => p.visible).length;
  const isPublished = !!website.publishedAt;

  const handleTogglePublish = () => {
    if (isPublished) {
      unpublishWebsite.mutate();
    } else {
      publishWebsite.mutate(doc);
    }
  };

  const handleTogglePage = (key: BuilderPage['key']) => {
    const nextPages = pages.map((p) => (p.key === key ? { ...p, visible: !p.visible } : p));
    saveMeta.mutate({ doc, metaPatch: { pages: nextPages } });
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="font-playfair-bold text-[22px] text-ed-on-surface">
          My Website
        </Text>
        <Pressable
          onPress={() => router.push('/website/share')}
          className="flex-row items-center gap-1 bg-ed-tertiary-fixed px-3 py-2 rounded-lg"
          style={shadowSoftSm}
        >
          <Ionicons name="share-outline" size={16} color={editorial.tertiaryContainer} />
          <Text className="font-work-sans-bold text-xs text-ed-tertiary-container">
            Share
          </Text>
        </Pressable>
      </View>

      {/* Stats row */}
      <View className="flex-row gap-3 mb-6">
        <View
          className="flex-1 bg-ed-surface-container-lowest p-4 rounded-[20px] border border-ed-outline-variant items-center"
          style={shadowSoftSm}
        >
          <Text className="font-space-grotesk-bold text-xl text-ed-primary-container">
            {visibleCount}
          </Text>
          <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-on-surface-variant mt-1">
            Pages
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/planning/guests')}
          className="flex-1 bg-ed-surface-container-lowest p-4 rounded-[20px] border border-ed-outline-variant items-center"
          style={shadowSoftSm}
        >
          <Ionicons name="mail-outline" size={20} color={editorial.primaryContainer} />
          <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-on-surface-variant mt-1">
            RSVPs
          </Text>
        </Pressable>
      </View>

      {/* Publish toggle */}
      <View
        className="flex-row items-center justify-between bg-ed-surface-container-lowest px-4 py-3 rounded-[20px] border border-ed-outline-variant mb-6"
        style={shadowSoftSm}
      >
        <View className="flex-row items-center gap-2">
          <View className={`w-2 h-2 rounded-[4px] ${isPublished ? 'bg-[#16a34a]' : 'bg-ed-outline'}`} />
          <Text className="font-work-sans-medium text-sm text-ed-on-surface">
            {isPublished ? 'Published' : 'Unpublished'}
          </Text>
        </View>
        <Switch
          value={isPublished}
          onValueChange={handleTogglePublish}
          trackColor={{ false: editorial.surfaceContainerHighest, true: editorial.primaryFixed }}
          thumbColor={isPublished ? editorial.primaryContainer : editorial.surfaceContainerLowest}
        />
      </View>

      {/* Preview + Settings buttons */}
      <View className="flex-row gap-3 mb-6">
        <Pressable
          onPress={() => router.push('/website/preview')}
          className="flex-1 flex-row items-center justify-center gap-2 bg-ed-primary-container py-3.5 rounded-xl"
          style={shadowSoft}
        >
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text className="font-space-grotesk-bold text-sm text-white">Preview</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/website/create?edit=true')}
          className="flex-1 flex-row items-center justify-center gap-2 bg-ed-surface-container-lowest py-3.5 rounded-[20px] border border-ed-outline-variant"
          style={shadowSoftSm}
        >
          <Ionicons name="color-palette-outline" size={18} color={editorial.primaryContainer} />
          <Text className="font-space-grotesk-bold text-sm text-ed-primary-container">
            Theme
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/website/guestbook-manage')}
          className="flex-1 flex-row items-center justify-center gap-2 bg-ed-surface-container-lowest py-3.5 rounded-[20px] border border-ed-outline-variant"
          style={shadowSoftSm}
        >
          <Ionicons name="book-outline" size={18} color={editorial.primaryContainer} />
          <Text className="font-space-grotesk-bold text-sm text-ed-primary-container">
            Guestbook
          </Text>
        </Pressable>
      </View>

      {/* Pages list */}
      <Text className="font-space-grotesk-bold text-base text-ed-on-surface mb-1">
        Pages
      </Text>
      <Text className="font-work-sans text-xs text-ed-on-surface-variant mb-3">
        Choose which pages show on your public website
      </Text>
      <View className="gap-2">
        {WEBSITE_PAGES.map((config) => {
          const page = pages.find((p) => p.key === config.key);
          const visible = page?.visible ?? true;
          return (
            <View
              key={config.key}
              className="flex-row items-center bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-4"
              style={shadowSoftSm}
            >
              <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-ed-tertiary-fixed">
                <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={20} color={editorial.tertiaryContainer} />
              </View>
              <View className="flex-1">
                <Text className="font-space-grotesk-bold text-sm text-ed-on-surface">
                  {config.label}
                </Text>
                <Text className="font-work-sans-bold text-[10px] tracking-[1px] uppercase text-ed-on-surface-variant mt-0.5">
                  {visible ? 'Visible' : 'Hidden'}
                </Text>
              </View>
              <Switch
                value={visible}
                onValueChange={() => handleTogglePage(config.key)}
                trackColor={{ false: editorial.surfaceContainerHighest, true: editorial.primaryFixed }}
                thumbColor={visible ? editorial.primaryContainer : editorial.surfaceContainerLowest}
              />
            </View>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}
