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
    .filter((g) => g.rsvp_status === 'attending')
    .reduce((sum, g) => sum + (g.party_size ?? 1), 0);

  // "undisclosed" ("Prefer not to say") reads as unset for a goal-budget stat — show "--" like the other empty stats.
  const budgetLabel =
    !profile?.budget_range || profile.budget_range === 'undisclosed'
      ? '--'
      : BUDGET_RANGES.find((r) => r.key === profile.budget_range)?.label ?? '--';

  const stickyHeader = (
    <View className="bg-ed-header-tint flex-row items-center gap-2.5 px-5 pt-2 pb-3">
      <Pressable onPress={() => router.push('/profile-settings')} className="p-1">
        <Ionicons name="settings-outline" size={22} color={editorial.onSurface} />
      </Pressable>

      <Pressable
        onPress={() => router.push('/search')}
        className="flex-1 flex-row items-center gap-2 bg-ed-surface-container-lowest rounded-3xl border border-[#F0E2F7] px-3.5 h-10"
      >
        <Ionicons name="sparkles" size={16} color={editorial.tertiaryContainer} />
        <Text className="font-work-sans text-[13px] text-ed-on-surface-variant">
          Ask anything
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/saved-vendors')} className="p-1">
        <Ionicons name="heart-outline" size={22} color={editorial.onSurface} />
      </Pressable>
      <Pressable onPress={() => router.push('/notifications')} className="relative p-1">
        <Ionicons name="notifications-outline" size={22} color={editorial.onSurface} />
        {unreadCount > 0 && (
          <View className="absolute top-1 right-1 w-2 h-2 rounded-[4px] bg-ed-error" />
        )}
      </Pressable>
    </View>
  );

  return (
    <ScreenWrapper backgroundColor={editorial.headerTint} stickyHeader={stickyHeader}>
      {/* Warm header zone — couple block, stat cards (icon row is now the sticky header above) */}
      <View className="bg-ed-header-tint -mx-5 -mt-2 px-5 pt-2 pb-5 rounded-b-[28px] mb-6">
        <View className="flex-row items-center gap-3.5 mb-[18px]">
          <CoupleAvatar imageUrl={profile?.avatar_url} name={profile?.partner1_name} />
          <View className="flex-1">
            {profile?.partner1_name || profile?.partner2_name ? (
              <CoupleNames partner1={profile?.partner1_name} partner2={profile?.partner2_name} size="sm" align="left" />
            ) : (
              <Text className="font-playfair-bold text-[22px] text-ed-on-surface">
                Welcome
              </Text>
            )}
            <View className="flex-row items-center mt-1">
              {missingCity ? (
                <Text
                  onPress={() => router.push('/wedding-details')}
                  className="font-work-sans-bold text-xs text-ed-primary-container underline"
                >
                  Add city
                </Text>
              ) : (
                <Text className="font-work-sans-bold text-xs text-ed-on-surface-variant">
                  {cityLabel}
                </Text>
              )}
              <Text className="text-xs text-ed-on-surface-variant mx-1.5">•</Text>
              {missingDate ? (
                <Text
                  onPress={() => router.push('/wedding-details')}
                  className="font-work-sans-bold text-xs text-ed-primary-container underline"
                >
                  Add date
                </Text>
              ) : (
                <Text className="font-work-sans-bold text-xs text-ed-on-surface-variant">
                  {dateText}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View className="flex-row gap-2.5">
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
      <Text className="font-space-grotesk-bold text-lg tracking-[-0.3px] text-ed-on-surface mb-3.5">
        Jump right in
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-7"
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
      <View className="flex-row justify-between items-center mb-3.5">
        <Text className="font-space-grotesk-bold text-lg tracking-[-0.3px] text-ed-on-surface">
          Your plan
        </Text>
        <Text className="font-work-sans-bold text-xs text-ed-on-surface-variant">
          {doneGoalCount}/{totalGoalCount} goals
        </Text>
      </View>

      <View className="mb-[18px]">
        <PhaseStepper
          sections={perPhase.map((p) => ({ id: p.id, title: p.label }))}
          selectedId={activePhaseId}
          onSelect={setSelectedPhaseId}
        />
      </View>

      {activePhase && (
        <View className="gap-2.5 mb-3">
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

      <Pressable onPress={() => router.push('/planning/checklist')} className="mb-7">
        <Text className="font-work-sans-bold text-xs text-ed-primary-container underline">
          View full checklist
        </Text>
      </Pressable>

      {/* Ideas & advice */}
      {adviceIdeas.length > 0 && (
        <>
          <Text className="font-space-grotesk-bold text-lg tracking-[-0.3px] text-ed-on-surface mb-3.5">
            Ideas & advice
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-7"
            contentContainerStyle={{ gap: 14 }}
          >
            {adviceIdeas.map((post) => (
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
      <Text className="font-space-grotesk-bold text-lg tracking-[-0.3px] text-ed-on-surface mb-3.5">
        Featured vendors
      </Text>
      {featuredVendors.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14 }}
        >
          {featuredVendors.map((vendor) => (
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
        <Text className="font-work-sans text-sm text-ed-on-surface-variant">
          No featured vendors yet — check back soon.
        </Text>
      )}
    </ScreenWrapper>
  );
}
