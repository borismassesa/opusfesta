import { View, Text, FlatList } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ConversationItem } from '@/components/messages/ConversationItem';
import { useConversations } from '@/hooks/useMessages';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

export default function MessagesScreen() {

  const { data: conversations, isLoading } = useConversations();

  const displayData = (conversations ?? []).map((c) => ({
    id: c.id,
    vendorName: c.vendors?.business_name ?? 'Vendor',
    vendorLogo: c.vendors?.logo,
    lastMessage: c.last_message ?? '',
    timestamp: formatRelativeTime(c.updated_at),
    unreadCount: c.unread_count ?? 0,
    isOnline: false,
  }));

  return (
    <ScreenWrapper scrollable={false}>
      <Text className="font-playfair-bold text-[22px] text-ed-on-surface mb-5">
        Messages
      </Text>

      {!isLoading && displayData.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-20">
          <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center">
            No conversations yet.{'\n'}Message a vendor to start planning together.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
          renderItem={({ item }) => (
            <ConversationItem
              id={item.id}
              vendorName={item.vendorName}
              vendorLogo={item.vendorLogo}
              lastMessage={item.lastMessage}
              timestamp={item.timestamp}
              unreadCount={item.unreadCount}
              isOnline={item.isOnline}
            />
          )}
        />
      )}
    </ScreenWrapper>
  );
}
