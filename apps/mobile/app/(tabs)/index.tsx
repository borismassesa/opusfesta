import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { CoupleNames } from '@/components/ui/CoupleNames';
import { PlanProgressCard } from '@/components/home/PlanProgressCard';
import { CategoryTile } from '@/components/home/CategoryTile';
import { PhaseStepper } from '@/components/home/PhaseStepper';
import { ChecklistSectionCard } from '@/components/home/ChecklistSectionCard';
import { VendorCard } from '@/components/vendors/VendorCard';
import { useCoupleProfile } from '@/hooks/useCoupleProfile';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { getFeaturedVendors } from '@/lib/api/vendors';
import { BROWSE_CATEGORIES } from '@/constants/vendorCategories';
import { useTheme } from '@/theme/useTheme';

// Which checklist phase should be highlighted by default, based on how close
// the wedding date is — purely a starting point, the stepper stays tappable.
function defaultSectionId(daysLeft: number | null): string {
  if (daysLeft == null) return 's12';
  const monthsLeft = daysLeft / 30.44;
  if (monthsLeft >= 12) return 's12';
  if (monthsLeft >= 9) return 's9';
  if (monthsLeft >= 6) return 's6';
  if (monthsLeft >= 3) return 's3';
  if (monthsLeft >= 1) return 's1';
  return 'sf';
}

export default function HomeScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { data: profile } = useCoupleProfile();
  const { doneCount, totalCount, perSection } = useChecklistProgress();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const { data: featuredVendors = [] } = useQuery({
    queryKey: ['vendors', 'featured'],
    queryFn: getFeaturedVendors,
  });

  const daysLeft = profile?.wedding_date
    ? Math.max(0, Math.ceil((new Date(profile.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const heroPhotos = featuredVendors
    .map((vendor: any) => vendor.cover_image)
    .filter((uri: string | null | undefined): uri is string => !!uri)
    .slice(0, 3);

  const missingDate = !profile?.wedding_date && !profile?.date_undecided;
  const missingCity = !profile?.city;

  const activeSectionId = selectedSectionId ?? defaultSectionId(daysLeft);
  const activeSection = perSection.find((s) => s.id === activeSectionId) ?? perSection[0];

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
        <Pressable onPress={() => router.push('/profile-settings')} style={{ padding: 4 }}>
          <Ionicons name="settings-outline" size={22} color={editorial.onSurface} />
        </Pressable>

        <View style={{ flex: 1, marginHorizontal: 12 }}>
          {profile?.partner1_name || profile?.partner2_name ? (
            <CoupleNames partner1={profile?.partner1_name} partner2={profile?.partner2_name} size="sm" align="left" />
          ) : (
            <Text style={{ fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: editorial.onSurface }}>
              Welcome
            </Text>
          )}
          {(missingDate || missingCity) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              {missingDate && (
                <Text
                  onPress={() => router.push('/wedding-details')}
                  style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer, textDecorationLine: 'underline' }}
                >
                  Add wedding date
                </Text>
              )}
              {missingDate && missingCity && (
                <Text style={{ fontSize: 12, color: editorial.onSurfaceVariant, marginHorizontal: 6 }}>•</Text>
              )}
              {missingCity && (
                <Text
                  onPress={() => router.push('/wedding-details')}
                  style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer, textDecorationLine: 'underline' }}
                >
                  Add city
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => router.push('/saved-vendors')} style={{ padding: 4 }}>
            <Ionicons name="heart-outline" size={22} color={editorial.onSurface} />
          </Pressable>
          <Pressable onPress={() => router.push('/notifications')} style={{ position: 'relative', padding: 4 }}>
            <Ionicons name="notifications-outline" size={22} color={editorial.onSurface} />
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: editorial.error,
                }}
              />
            )}
          </Pressable>
        </View>
      </View>

      {/* Progress hero */}
      <PlanProgressCard daysLeft={daysLeft} photos={heroPhotos} onPress={() => router.push('/planning/checklist')} />

      {/* Jump right in */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 18,
          letterSpacing: -0.3,
          color: editorial.onSurface,
          marginBottom: 14,
        }}
      >
        Jump right in
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 28 }}
        contentContainerStyle={{ gap: 4 }}
      >
        {BROWSE_CATEGORIES.map((cat) => (
          <CategoryTile
            key={cat.key}
            label={cat.label}
            icon={cat.icon}
            bg={cat.bg}
            iconColor={cat.iconColor}
            onPress={() => router.push({ pathname: '/(tabs)/categories', params: { category: cat.key } })}
          />
        ))}
      </ScrollView>

      {/* Your plan */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, letterSpacing: -0.3, color: editorial.onSurface }}>
          Your plan
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.onSurfaceVariant }}>
          {doneCount}/{totalCount} goals
        </Text>
      </View>

      <View style={{ marginBottom: 14 }}>
        <PhaseStepper sections={perSection} selectedId={activeSectionId} onSelect={setSelectedSectionId} />
      </View>

      {activeSection && (
        <ChecklistSectionCard
          icon={activeSection.icon}
          title={activeSection.title}
          doneCount={activeSection.doneCount}
          totalCount={activeSection.totalCount}
          onPress={() => router.push({ pathname: '/planning/checklist', params: { section: activeSection.id } })}
        />
      )}

      <Pressable onPress={() => router.push('/planning/checklist')} style={{ marginTop: 12, marginBottom: 28 }}>
        <Text
          style={{
            fontFamily: 'WorkSans-Bold',
            fontSize: 12,
            color: editorial.primaryContainer,
            textDecorationLine: 'underline',
          }}
        >
          View full checklist
        </Text>
      </Pressable>

      {/* Featured vendors */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 18,
          letterSpacing: -0.3,
          color: editorial.onSurface,
          marginBottom: 14,
        }}
      >
        Featured vendors
      </Text>
      {featuredVendors.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14 }}
        >
          {featuredVendors.map((vendor: any) => (
            <VendorCard
              key={vendor.id}
              id={vendor.id}
              name={vendor.business_name}
              category={vendor.category}
              location={vendor.location?.city}
              rating={vendor.stats?.averageRating ?? 0}
              ratingCount={vendor.stats?.reviewCount ?? 0}
              priceRange={vendor.price_range}
              coverImage={vendor.cover_image}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant }}>
          No featured vendors yet — check back soon.
        </Text>
      )}
    </ScreenWrapper>
  );
}
