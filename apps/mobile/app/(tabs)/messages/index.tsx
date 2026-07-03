import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ConversationItem } from '@/components/messages/ConversationItem';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getConversations } from '@/lib/api/messages';
import { useTheme } from '@/theme/useTheme';

export default function MessagesScreen() {
  const { editorial } = useTheme();
  const client = useAuthenticatedSupabase();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(client),
  });

  const displayData = (conversations ?? []).map((c: any) => ({
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
      <Text
        style={{
          fontFamily: 'PlayfairDisplay-Bold',
          fontSize: 22,
          color: editorial.onSurface,
          marginBottom: 20,
        }}
      >
        Messages
      </Text>

      {!isLoading && displayData.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: editorial.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            No conversations yet.{'\n'}Message a vendor to start planning together.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }: any) => (
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

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
