import { View, Text, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useWeddingWebsite, useUpdateWebsite } from '@/hooks/useWeddingWebsite';
import { useOpusFestaAuth } from '@/lib/auth';
import { WEDDING_SECTIONS } from '@/constants/wedding-sections';
import { brutalist, brutalistShadow, brutalistShadowSm } from '@/constants/theme';
import type { WeddingWebsiteSection } from '@/types/wedding-website';

export default function WebsiteTabScreen() {
  const router = useRouter();
  const { user } = useOpusFestaAuth();
  const { data: website, isLoading } = useWeddingWebsite();
  const updateWebsite = useUpdateWebsite();

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color={brutalist.primaryContainer} />
        </View>
      </ScreenWrapper>
    );
  }

  // No website yet → Empty state CTA
  if (!website) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
          <View
            style={[
              {
                width: 80,
                height: 80,
                borderRadius: 12,
                backgroundColor: brutalist.tertiaryFixed,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              },
              brutalistShadowSm,
            ]}
          >
            <Ionicons name="globe-outline" size={40} color={brutalist.tertiaryContainer} />
          </View>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk-Bold',
              fontSize: 22,
              letterSpacing: -0.5,
              color: brutalist.onSurface,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Your Wedding Website
          </Text>
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 15,
              lineHeight: 22,
              color: brutalist.onSurfaceVariant,
              textAlign: 'center',
              marginBottom: 32,
              paddingHorizontal: 32,
            }}
          >
            Create a beautiful website to share your wedding details, collect RSVPs, and keep guests informed
          </Text>
          <Pressable
            onPress={() => router.push('/website/create')}
            style={[
              {
                backgroundColor: brutalist.primaryContainer,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              },
              brutalistShadow,
            ]}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#fff' }}>
              Create Website
            </Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  // Website exists → Dashboard
  const sections: WeddingWebsiteSection[] = website.wedding_website_sections ?? [];
  const publishedCount = sections.filter((s: WeddingWebsiteSection) => s.is_published).length;
  const sortedSections = [...sections].sort(
    (a: WeddingWebsiteSection, b: WeddingWebsiteSection) => a.sort_order - b.sort_order,
  );

  const handleTogglePublish = () => {
    updateWebsite.mutate({
      websiteId: website.id,
      updates: {
        is_published: !website.is_published,
        ...(website.is_published ? {} : { published_at: new Date().toISOString() }),
      },
    });
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 22,
            letterSpacing: -0.5,
            color: brutalist.onSurface,
          }}
        >
          My Website
        </Text>
        <Pressable
          onPress={() => router.push('/website/share')}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: brutalist.tertiaryFixed,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            },
            brutalistShadowSm,
          ]}
        >
          <Ionicons name="share-outline" size={16} color={brutalist.tertiaryContainer} />
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: brutalist.tertiaryContainer }}>
            Share
          </Text>
        </Pressable>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <View
          style={[
            {
              flex: 1,
              backgroundColor: brutalist.surfaceContainerLowest,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: brutalist.outlineVariant,
              alignItems: 'center',
            },
            brutalistShadowSm,
          ]}
        >
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: brutalist.primaryContainer }}>
            {publishedCount}
          </Text>
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: brutalist.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            Sections
          </Text>
        </View>
        <View
          style={[
            {
              flex: 1,
              backgroundColor: brutalist.surfaceContainerLowest,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: brutalist.outlineVariant,
              alignItems: 'center',
            },
            brutalistShadowSm,
          ]}
        >
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: brutalist.primaryContainer }}>
            {website.view_count}
          </Text>
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: brutalist.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            Views
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/website/rsvp-list')}
          style={[
            {
              flex: 1,
              backgroundColor: brutalist.surfaceContainerLowest,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: brutalist.outlineVariant,
              alignItems: 'center',
            },
            brutalistShadowSm,
          ]}
        >
          <Ionicons name="mail-outline" size={20} color={brutalist.primaryContainer} />
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: brutalist.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            RSVPs
          </Text>
        </Pressable>
      </View>

      {/* Publish toggle */}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: brutalist.surfaceContainerLowest,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: brutalist.outlineVariant,
            marginBottom: 24,
          },
          brutalistShadowSm,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: website.is_published ? '#16a34a' : brutalist.outline,
            }}
          />
          <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 14, color: brutalist.onSurface }}>
            {website.is_published ? 'Published' : 'Unpublished'}
          </Text>
        </View>
        <Switch
          value={website.is_published}
          onValueChange={handleTogglePublish}
          trackColor={{ false: brutalist.surfaceContainerHighest, true: brutalist.primaryFixed }}
          thumbColor={website.is_published ? brutalist.primaryContainer : brutalist.surfaceContainerLowest}
        />
      </View>

      {/* Preview + Settings buttons */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Pressable
          onPress={() => router.push('/website/preview')}
          style={[
            {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: brutalist.primaryContainer,
              paddingVertical: 14,
              borderRadius: 12,
            },
            brutalistShadow,
          ]}
        >
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#fff' }}>Preview</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/website/create?edit=true')}
          style={[
            {
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: brutalist.surfaceContainerLowest,
              paddingVertical: 14,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: brutalist.outlineVariant,
            },
            brutalistShadowSm,
          ]}
        >
          <Ionicons name="color-palette-outline" size={18} color={brutalist.primaryContainer} />
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: brutalist.primaryContainer }}>
            Theme
          </Text>
        </Pressable>
      </View>

      {/* Section list */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 16,
          color: brutalist.onSurface,
          marginBottom: 12,
        }}
      >
        Sections
      </Text>
      <View style={{ gap: 8 }}>
        {sortedSections.map((section: WeddingWebsiteSection) => {
          const config = WEDDING_SECTIONS.find((s) => s.key === section.section_key);
          if (!config) return null;
          return (
            <Pressable
              key={section.id}
              onPress={() => router.push(`/website/section/${section.section_key}`)}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: brutalist.surfaceContainerLowest,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: brutalist.outlineVariant,
                  padding: 16,
                },
                brutalistShadowSm,
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: brutalist.tertiaryFixed,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name={config.icon as any} size={20} color={brutalist.tertiaryContainer} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: brutalist.onSurface }}>
                  {config.label}
                </Text>
                <Text
                  style={{
                    fontFamily: 'WorkSans-Bold',
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: brutalist.onSurfaceVariant,
                    marginTop: 2,
                  }}
                >
                  {section.is_published ? 'Visible' : 'Hidden'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={brutalist.outline} />
            </Pressable>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}
