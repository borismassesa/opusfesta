import { useUser, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AttendanceDonut } from '@/components/dashboard/AttendanceDonut';
import { StatCard } from '@/components/dashboard/StatCard';
import { useCoupleProfile, useDashboardStats, useUpcomingEvents } from '@/hooks/useDashboard';
import { formatShortDate } from '@/lib/format-date';
import { EVENT_TYPE_LABELS, coupleFirstNames } from '@/types/dashboard';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-ed-bg" edges={['top']}>
      <SignedIn>
        <DashboardHome />
      </SignedIn>
      <SignedOut>
        <SignedOutState />
      </SignedOut>
    </SafeAreaView>
  );
}

function SignedOutState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="font-dancing-script-bold text-4xl text-ed-on-surface">OpusPass</Text>
      <Text className="mt-3 text-center font-work-sans text-base leading-6 text-ed-on-surface-variant">
        Sign in to see your wedding dashboard.
      </Text>
    </View>
  );
}

function DashboardHome() {
  const { user } = useUser();
  const profile = useCoupleProfile();
  const stats = useDashboardStats();
  const upcoming = useUpcomingEvents();

  const greetingName = profile.data ? coupleFirstNames(profile.data) : (user?.firstName ?? 'there');
  const isLoading = profile.isPending || stats.isPending || upcoming.isPending;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#7E5896" />
      </View>
    );
  }

  if (stats.isError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center font-work-sans text-sm text-ed-error">
          Couldn't load your dashboard. Pull to refresh, or try again shortly.
        </Text>
      </View>
    );
  }

  const s = stats.data!;
  const hasAnyData = s.totalGuests > 0 || upcoming.data?.length;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-5 pb-10 pt-2"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text className="font-work-sans text-sm text-ed-on-surface-variant">Welcome back,</Text>
      <Text className="mt-0.5 font-playfair-bold text-2xl text-ed-on-surface">{greetingName}</Text>

      {!hasAnyData ? (
        <View className="mt-6 rounded-2xl border border-ed-outline-variant bg-ed-surface-container-low p-6">
          <Text className="font-work-sans-semibold text-base text-ed-on-surface">
            Let's get your wedding set up
          </Text>
          <Text className="mt-1 font-work-sans text-sm leading-5 text-ed-on-surface-variant">
            Add an event and start inviting guests to see your dashboard come to life.
          </Text>
        </View>
      ) : (
        <>
          {/* Stat cards */}
          <View className="mt-6 flex-row gap-3">
            <StatCard label="Guests" value={s.totalGuests} accent />
            <StatCard label="Attending" value={s.attending} hint={`${s.expectedHeadcount} expected`} />
          </View>
          <View className="mt-3 flex-row gap-3">
            <StatCard label="Declined" value={s.declined} />
            <StatCard label="Awaiting reply" value={s.pending} />
          </View>

          {/* Response progress */}
          <View className="mt-6 rounded-2xl border border-ed-outline-variant bg-ed-surface p-4">
            <Text className="font-work-sans-semibold text-base text-ed-on-surface">Responses</Text>
            <View className="mt-4">
              <AttendanceDonut stats={s} />
            </View>
            {s.mealBreakdown.length > 0 ? (
              <View className="mt-5 gap-2 border-t border-ed-outline-variant pt-4">
                <Text className="font-work-sans-medium text-xs uppercase tracking-wide text-ed-on-surface-variant">
                  Meal choices
                </Text>
                {s.mealBreakdown.map((m) => (
                  <View key={m.choice} className="flex-row items-center justify-between">
                    <Text className="font-work-sans text-sm text-ed-on-surface">{m.choice}</Text>
                    <Text className="font-work-sans-semibold text-sm text-ed-on-surface-variant">
                      {m.count}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Upcoming events */}
          {upcoming.data && upcoming.data.length > 0 ? (
            <View className="mt-6">
              <Text className="font-work-sans-semibold text-base text-ed-on-surface">Upcoming events</Text>
              <View className="mt-3 gap-2">
                {upcoming.data.map((event) => (
                  <View
                    key={event.id}
                    className="rounded-2xl border border-ed-outline-variant bg-ed-surface p-4"
                  >
                    <Text className="font-work-sans-semibold text-sm text-ed-on-surface">{event.name}</Text>
                    <Text className="mt-1 font-work-sans text-xs text-ed-on-surface-variant">
                      {EVENT_TYPE_LABELS[event.event_type]}
                      {event.starts_at ? ` · ${formatShortDate(event.starts_at)}` : ''}
                      {event.venue_name ? ` · ${event.venue_name}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}

      {/* CTA */}
      <View className="mt-6 rounded-2xl bg-ed-primary-container p-5">
        <Text className="font-work-sans-semibold text-base text-ed-on-primary">
          Ready to invite more guests?
        </Text>
        <Text className="mt-1 font-work-sans text-sm leading-5 text-ed-on-primary-container">
          Send invitations by WhatsApp, SMS or a shareable link.
        </Text>
      </View>
    </ScrollView>
  );
}
