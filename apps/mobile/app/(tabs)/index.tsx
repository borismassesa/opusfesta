import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { CoupleNames } from '@/components/ui/CoupleNames';
import { CoupleAvatar } from '@/components/home/CoupleAvatar';
import { StatCard } from '@/components/home/StatCard';
import { CategoryPhotoCard } from '@/components/home/CategoryPhotoCard';
import { PhaseStepper } from '@/components/home/PhaseStepper';
import { ChecklistSectionCard } from '@/components/home/ChecklistSectionCard';
import { AdviceCard } from '@/components/home/AdviceCard';
import { VendorCard } from '@/components/vendors/VendorCard';
import { useCoupleProfile } from '@/hooks/useCoupleProfile';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useSavedVendorIds } from '@/hooks/useSavedVendors';
import { useWeddingEvent, useGuestList } from '@/hooks/useGuestList';
import { useAdviceIdeas } from '@/hooks/useAdviceIdeas';
import { getFeaturedVendors } from '@/lib/api/vendors';
import { BROWSE_CATEGORIES } from '@/constants/vendorCategories';
import { BUDGET_RANGES, CITIES } from '@/constants/onboarding';
import { purpleTints } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

// Which checklist phase should be highlighted by default, based on how close
// the wedding date is — purely a starting point, the stepper stays tappable.
function defaultPhaseId(daysLeft: number | null): string {
  if (daysLeft == null) return 'p1';
  const monthsLeft = daysLeft / 30.44;
  if (monthsLeft >= 12) return 'p1';
  if (monthsLeft >= 5) return 'p2';
  if (monthsLeft >= 3) return 'p3';
  return 'p4';
}

export default function HomeScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { data: profile } = useCoupleProfile();
  const { doneGoalCount, totalGoalCount, perPhase } = useChecklistProgress();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: savedVendorIds = [] } = useSavedVendorIds();
  const { data: weddingEvent } = useWeddingEvent();
  const { data: guests = [] } = useGuestList(weddingEvent?.id);
  const { data: adviceIdeas = [] } = useAdviceIdeas();
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  const { data: featuredVendors = [] } = useQuery({
    queryKey: ['vendors', 'featured'],
    queryFn: getFeaturedVendors,
  });

  const daysLeft = profile?.wedding_date
    ? Math.max(0, Math.ceil((new Date(profile.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const missingDate = !profile?.wedding_date && !profile?.date_undecided;
  const missingCity = !profile?.city;
  const cityLabel = CITIES.find((c) => c.key === profile?.city)?.label ?? null;
  const dateText = daysLeft != null ? `${daysLeft} days to go!` : profile?.date_undecided ? 'Date TBD' : null;

  const activePhaseId = selectedPhaseId ?? defaultPhaseId(daysLeft);
  const activePhase = perPhase.find((p) => p.id === activePhaseId) ?? perPhase[0];

  const attendingCount = guests
    .filter((g: any) => g.rsvp_status === 'attending')
    .reduce((sum: number, g: any) => sum + (g.party_size ?? 1), 0);

  // "undisclosed" ("Prefer not to say") reads as unset for a goal-budget stat — show "--" like the other empty stats.
  const budgetLabel =
    !profile?.budget_range || profile.budget_range === 'undisclosed'
      ? '--'
      : BUDGET_RANGES.find((r) => r.key === profile.budget_range)?.label ?? '--';

  const stickyHeader = (
    <View
      style={{
        backgroundColor: editorial.headerTint,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      <Pressable onPress={() => router.push('/profile-settings')} style={{ padding: 4 }}>
        <Ionicons name="settings-outline" size={22} color={editorial.onSurface} />
      </Pressable>

      <Pressable
        onPress={() => router.push('/search')}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: purpleTints[100],
          paddingHorizontal: 14,
          height: 40,
        }}
      >
        <Ionicons name="sparkles" size={16} color={editorial.tertiaryContainer} />
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant }}>
          Ask anything
        </Text>
      </Pressable>

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
  );

  return (
    <ScreenWrapper backgroundColor={editorial.headerTint} stickyHeader={stickyHeader}>
      {/* Warm header zone — couple block, stat cards (icon row is now the sticky header above) */}
      <View
        style={{
          backgroundColor: editorial.headerTint,
          marginHorizontal: -20,
          marginTop: -8,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          marginBottom: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <CoupleAvatar imageUrl={profile?.avatar_url} name={profile?.partner1_name} />
          <View style={{ flex: 1 }}>
            {profile?.partner1_name || profile?.partner2_name ? (
              <CoupleNames partner1={profile?.partner1_name} partner2={profile?.partner2_name} size="sm" align="left" />
            ) : (
              <Text style={{ fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: editorial.onSurface }}>
                Welcome
              </Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              {missingCity ? (
                <Text
                  onPress={() => router.push('/wedding-details')}
                  style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer, textDecorationLine: 'underline' }}
                >
                  Add city
                </Text>
              ) : (
                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.onSurfaceVariant }}>
                  {cityLabel}
                </Text>
              )}
              <Text style={{ fontSize: 12, color: editorial.onSurfaceVariant, marginHorizontal: 6 }}>•</Text>
              {missingDate ? (
                <Text
                  onPress={() => router.push('/wedding-details')}
                  style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer, textDecorationLine: 'underline' }}
                >
                  Add date
                </Text>
              ) : (
                <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.onSurfaceVariant }}>
                  {dateText}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard
            icon="wallet-outline"
            value={budgetLabel}
            label="Goal budget"
            muted={budgetLabel === '--'}
            onPress={() => router.push('/planning/budget')}
          />
          <StatCard
            icon="storefront-outline"
            value={savedVendorIds.length}
            label="Saved vendors"
            onPress={() => router.push('/saved-vendors')}
          />
          <StatCard
            icon="people-outline"
            value={attendingCount}
            label="Attending"
            onPress={() => router.push('/planning/guests')}
          />
        </View>
      </View>

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
        contentContainerStyle={{ gap: 12 }}
      >
        {BROWSE_CATEGORIES.map((cat) => (
          <CategoryPhotoCard
            key={cat.key}
            label={cat.label}
            image={cat.image}
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
          {doneGoalCount}/{totalGoalCount} goals
        </Text>
      </View>

      <View style={{ marginBottom: 18 }}>
        <PhaseStepper
          sections={perPhase.map((p) => ({ id: p.id, title: p.label }))}
          selectedId={activePhaseId}
          onSelect={setSelectedPhaseId}
        />
      </View>

      {activePhase && (
        <View style={{ gap: 10, marginBottom: 12 }}>
          {activePhase.goals.map((goal) => (
            <ChecklistSectionCard
              key={goal.id}
              icon={goal.icon}
              title={goal.title}
              doneCount={goal.doneCount}
              totalCount={goal.totalCount}
              onPress={() => router.push({ pathname: '/planning/checklist', params: { goal: goal.id } })}
            />
          ))}
        </View>
      )}

      <Pressable onPress={() => router.push('/planning/checklist')} style={{ marginBottom: 28 }}>
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

      {/* Ideas & advice */}
      {adviceIdeas.length > 0 && (
        <>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk-Bold',
              fontSize: 18,
              letterSpacing: -0.3,
              color: editorial.onSurface,
              marginBottom: 14,
            }}
          >
            Ideas & advice
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 28 }}
            contentContainerStyle={{ gap: 14 }}
          >
            {adviceIdeas.map((post: any) => (
              <AdviceCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                category={post.category}
                imageSrc={post.hero_media_src}
              />
            ))}
          </ScrollView>
        </>
      )}

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
