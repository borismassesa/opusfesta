import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorConversations } from '@/hooks/useVendorMessages';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { shadowSoftSm } from '@/constants/theme';

export default function VendorMessagesScreen() {
  const router = useRouter();
  const { vendor } = useCurrentVendor();
  const { data: conversations, isLoading } = useVendorConversations(vendor?.id);

  const rows = (conversations ?? []).map((c) => ({
    id: c.id,
    coupleName: c.users?.name ?? 'Couple',
    coupleAvatar: c.users?.avatar,
    lastMessage: c.last_message ?? '',
    timestamp: formatRelativeTime(c.updated_at),
    unreadCount: c.unread_count ?? 0,
  }));

  return (
    <ScreenWrapper scrollable={false}>
      <Text className="font-dancing-script-bold text-[28px] text-ed-primary-container mb-5">
        Messages
      </Text>

      {!isLoading && rows.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-20">
          <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center">
            No conversations yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(vendor-tabs)/messages/[id]',
                  params: { id: item.id, coupleName: item.coupleName },
                } as Href)
              }
              className="bg-ed-surface-container-lowest border border-ed-outline-variant rounded-xl p-4 flex-row items-center gap-3.5"
              style={shadowSoftSm}
            >
              <Avatar name={item.coupleName} imageUrl={item.coupleAvatar} size="md" />
              <View className="flex-1 min-w-0">
                <View className="flex-row justify-between items-center">
                  <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface">
                    {item.coupleName}
                  </Text>
                  <Text className="font-work-sans text-[11px] text-ed-on-surface-variant">
                    {item.timestamp}
                  </Text>
                </View>
                <Text
                  className="font-work-sans text-sm text-ed-on-surface-variant mt-0.5"
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <View className="w-[22px] h-[22px] rounded-[11px] items-center justify-center bg-ed-primary-container">
                  <Text className="font-work-sans-bold text-[10px] text-white">{item.unreadCount}</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </ScreenWrapper>
  );
}
