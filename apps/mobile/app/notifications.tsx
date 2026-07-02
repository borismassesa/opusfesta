import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { editorial, shadowSoftSm } from '@/constants/theme';

type IonIcon = keyof typeof Ionicons.glyphMap;

const TYPE_ICON: Record<string, IonIcon> = {
  rsvp_received: 'people-outline',
  pledge_received: 'gift-outline',
  payment_confirmed: 'checkmark-circle-outline',
  system: 'information-circle-outline',
};

function timeAgo(iso: string): string {
  const diffMs = Date.parse(iso) ? Date.now() - Date.parse(iso) : 0;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const hasUnread = notifications.some((n: any) => !n.read);

  const handlePress = (item: any) => {
    // `href` is minted by OpusPass (web) server actions and points at web
    // routes — not valid inside mobile's own route table, so we only mark
    // read here rather than navigating.
    if (!item.read) markRead.mutate(item.id);
  };

  return (
    <ScreenWrapper scrollable={false}>
      <Header
        title="Notifications"
        showBack
        rightAction={
          hasUnread ? (
            <Pressable onPress={() => markAllRead.mutate()}>
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.primaryContainer }}>
                Mark all read
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="notifications-outline" size={40} color={editorial.outlineVariant} />
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: editorial.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            No notifications yet. We'll let you know when something needs your attention.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <Pressable
              onPress={() => handlePress(item)}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: item.read ? editorial.surfaceContainerLowest : editorial.surfaceContainerLow,
                  borderWidth: 1,
                  borderColor: editorial.outlineVariant,
                },
                shadowSoftSm,
              ]}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: editorial.tertiaryFixed,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={TYPE_ICON[item.type] ?? 'notifications-outline'} size={18} color={editorial.tertiaryContainer} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!item.read && (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: editorial.error }} />
                  )}
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: editorial.onSurface, flex: 1 }}>
                    {item.title}
                  </Text>
                </View>
                {item.body && (
                  <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 3 }}>
                    {item.body}
                  </Text>
                )}
                <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 11, color: editorial.outlineVariant, marginTop: 4 }}>
                  {timeAgo(item.created_at)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </ScreenWrapper>
  );
}
