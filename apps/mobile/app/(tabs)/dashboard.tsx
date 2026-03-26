import { View, Text, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOpusFestaAuth } from '@/lib/auth';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getDashboardData } from '@/lib/api/events';
import { brutalist, brutalistShadow, brutalistShadowSm } from '@/constants/theme';

const MOCK_TASKS = [
  {
    id: '1',
    title: 'Finalize Catering Menu',
    due: 'Due in 2 days • May 15',
    priority: 'urgent' as const,
    completed: false,
  },
  {
    id: '2',
    title: 'Send Digital Invitations',
    due: 'Due in 5 days • May 18',
    priority: 'medium' as const,
    completed: false,
  },
  {
    id: '3',
    title: 'Book Wedding Photographer',
    due: 'Completed on May 10',
    completed: true,
  },
];

const MOCK_VENDORS = [
  {
    id: '1',
    name: 'Movenpick Catering',
    detail: 'Catering & Service',
    icon: 'restaurant-outline' as const,
    status: 'Confirmed',
  },
  {
    id: '2',
    name: 'Studio Opus Photography',
    detail: 'Photography',
    icon: 'camera-outline' as const,
    status: 'Confirmed',
  },
];

const PRIORITY_STYLES = {
  urgent: { bg: brutalist.error, text: '#ffffff', label: 'URGENT' },
  medium: { bg: brutalist.secondaryContainer, text: brutalist.tertiaryContainer, label: 'MEDIUM' },
};

export default function DashboardScreen() {
  const { user } = useOpusFestaAuth();
  const client = useAuthenticatedSupabase();

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(client),
  });

  const event = data?.event;
  const daysLeft = event?.date
    ? Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 87;

  const weddingDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Saturday, September 14, 2024';

  const displayName = event?.name ?? user?.name ?? 'Fatma & Said';

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Pressable style={{ padding: 4 }}>
          <Ionicons name="menu" size={24} color={brutalist.primaryContainer} />
        </Pressable>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 20,
            letterSpacing: -0.5,
            color: brutalist.tertiaryContainer,
          }}
        >
          {displayName}
        </Text>
        <Pressable style={{ position: 'relative', padding: 4 }}>
          <Ionicons name="notifications-outline" size={24} color={brutalist.primaryContainer} />
          <View
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: brutalist.error,
            }}
          />
        </Pressable>
      </View>

      {/* Countdown Banner */}
      <View
        style={[
          {
            borderRadius: 12,
            padding: 24,
            marginBottom: 28,
            backgroundColor: brutalist.primaryContainer,
          },
          brutalistShadow,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text
              style={{
                fontFamily: 'WorkSans-Bold',
                fontSize: 10,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 4,
              }}
            >
              The Big Day Countdown
            </Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 32,
                color: '#ffffff',
              }}
            >
              {daysLeft} days left
            </Text>
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
                marginTop: 8,
              }}
            >
              {weddingDate}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              width: 64,
              height: 64,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="calendar-outline" size={32} color="#fff" />
          </View>
        </View>
      </View>

      {/* Overview */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Ionicons name="analytics-outline" size={20} color={brutalist.primaryContainer} />
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: brutalist.onSurface }}>
          Overview
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
        {/* Budget card */}
        <View
          style={[
            {
              flex: 1,
              backgroundColor: brutalist.surfaceContainerLowest,
              padding: 20,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: brutalist.outlineVariant,
            },
            brutalistShadowSm,
          ]}
        >
          <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 13, color: brutalist.onSurfaceVariant }}>
            Budget Used
          </Text>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: brutalist.primaryContainer, marginTop: 4 }}>
            TZS 18M
          </Text>
          <ProgressBar progress={62} className="mt-3" />
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: brutalist.onSurfaceVariant,
              marginTop: 8,
            }}
          >
            62% of TZS 29M
          </Text>
        </View>
        {/* Tasks card */}
        <View
          style={[
            {
              flex: 1,
              backgroundColor: brutalist.surfaceContainerLowest,
              padding: 20,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: brutalist.outlineVariant,
            },
            brutalistShadowSm,
          ]}
        >
          <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 13, color: brutalist.onSurfaceVariant }}>
            Tasks Done
          </Text>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#2D8E5B', marginTop: 4 }}>
            14/22
          </Text>
          <ProgressBar progress={64} color="#2D8E5B" className="mt-3" />
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: brutalist.onSurfaceVariant,
              marginTop: 8,
            }}
          >
            64% complete
          </Text>
        </View>
      </View>

      {/* Upcoming Tasks */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="checkbox-outline" size={20} color={brutalist.primaryContainer} />
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: brutalist.onSurface }}>
            Upcoming Tasks
          </Text>
        </View>
        <Pressable>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: brutalist.primaryContainer }}>
            View All
          </Text>
        </Pressable>
      </View>
      <View
        style={[
          {
            backgroundColor: brutalist.surfaceContainerLowest,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: brutalist.outlineVariant,
            overflow: 'hidden',
            marginBottom: 28,
          },
          brutalistShadowSm,
        ]}
      >
        {MOCK_TASKS.map((task, i) => (
          <View
            key={task.id}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 12,
              padding: 16,
              borderBottomWidth: i < MOCK_TASKS.length - 1 ? 1 : 0,
              borderBottomColor: brutalist.surfaceContainerHigh,
              backgroundColor: task.completed ? brutalist.surfaceContainerLow : 'transparent',
            }}
          >
            {/* Checkbox */}
            <View
              style={{
                width: 24,
                height: 24,
                marginTop: 2,
                borderRadius: 4,
                borderWidth: 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: task.completed ? brutalist.primaryContainer : brutalist.surfaceContainerLowest,
                borderColor: brutalist.primaryContainer,
              }}
            >
              {task.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            {/* Content */}
            <View style={{ flex: 1, opacity: task.completed ? 0.5 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk-Bold',
                    fontSize: 14,
                    color: brutalist.onSurface,
                    textDecorationLine: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </Text>
                {task.priority && !task.completed && (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                      backgroundColor: PRIORITY_STYLES[task.priority].bg,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'WorkSans-Bold',
                        fontSize: 9,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: PRIORITY_STYLES[task.priority].text,
                      }}
                    >
                      {PRIORITY_STYLES[task.priority].label}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: brutalist.onSurfaceVariant }}>
                {task.due}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Booked Vendors */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="storefront-outline" size={20} color={brutalist.primaryContainer} />
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: brutalist.onSurface }}>
            Booked Vendors
          </Text>
        </View>
        <Pressable>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: brutalist.primaryContainer }}>
            Manage
          </Text>
        </Pressable>
      </View>
      <View style={{ gap: 12 }}>
        {MOCK_VENDORS.map((vendor) => (
          <View
            key={vendor.id}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                backgroundColor: brutalist.surfaceContainerLowest,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: brutalist.outlineVariant,
              },
              brutalistShadowSm,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: brutalist.tertiaryFixed,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={vendor.icon} size={22} color={brutalist.tertiaryContainer} />
              </View>
              <View>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: brutalist.onSurface }}>
                  {vendor.name}
                </Text>
                <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: brutalist.onSurfaceVariant }}>
                  {vendor.detail}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#e8f5e9',
                borderRadius: 4,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: '#c8e6c9',
              }}
            >
              <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: '#16a34a' }}>
                {vendor.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
}
