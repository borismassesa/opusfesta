import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import type { NotificationItem } from '@/lib/api/notifications';

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
  const { editorial } = useTheme();

  const hasUnread = notifications.some((n) => !n.read);

  const handlePress = (item: NotificationItem) => {
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
              <Text className="font-work-sans-bold text-xs text-ed-primary-container">
                Mark all read
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="notifications-outline" size={40} color={editorial.outlineVariant} />
          <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center mt-3">
            No notifications yet. We'll let you know when something needs your attention.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handlePress(item)}
              className={`flex-row items-start gap-3 p-3.5 rounded-xl border border-ed-outline-variant ${
                item.read ? 'bg-ed-surface-container-lowest' : 'bg-ed-surface-container-low'
              }`}
              style={shadowSoftSm}
            >
              <View className="w-9 h-9 rounded-full items-center justify-center bg-ed-tertiary-fixed">
                <Ionicons name={TYPE_ICON[item.type] ?? 'notifications-outline'} size={18} color={editorial.tertiaryContainer} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  {!item.read && (
                    <View className="w-1.5 h-1.5 rounded-[3px] bg-ed-error" />
                  )}
                  <Text className="font-space-grotesk-bold text-sm text-ed-on-surface flex-1">
                    {item.title}
                  </Text>
                </View>
                {item.body && (
                  <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-[3px]">
                    {item.body}
                  </Text>
                )}
                <Text className="font-work-sans text-[11px] text-ed-outline-variant mt-1">
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
