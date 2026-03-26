import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ConversationItem } from '@/components/messages/ConversationItem';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { getConversations } from '@/lib/api/messages';
import { brutalist } from '@/constants/theme';

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    vendorName: 'Serena Grand',
    lastMessage: "Great news! Your date is confirmed for June 12...",
    timestamp: '2m ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '2',
    vendorName: 'Amina Photos',
    lastMessage: "I've uploaded the engagement shoot previews",
    timestamp: '1h ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    vendorName: 'Sweet Bites Cakes',
    lastMessage: 'Tasting session booked for next Saturday at 2pm',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '4',
    vendorName: 'Kanga Decor Studio',
    lastMessage: "Here's the mood board with 3 theme options...",
    timestamp: 'Mar 14',
    unreadCount: 0,
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const client = useAuthenticatedSupabase();

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(client),
  });

  const displayData =
    conversations?.length
      ? conversations.map((c: any) => ({
          id: c.id,
          vendorName: c.vendors?.business_name ?? 'Vendor',
          vendorLogo: c.vendors?.logo,
          lastMessage: c.last_message ?? '',
          timestamp: formatRelativeTime(c.updated_at),
          unreadCount: c.unread_count ?? 0,
          isOnline: false,
        }))
      : MOCK_CONVERSATIONS;

  return (
    <ScreenWrapper scrollable={false}>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 22,
          letterSpacing: -0.5,
          color: brutalist.onSurface,
          marginBottom: 20,
        }}
      >
        Messages
      </Text>

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
