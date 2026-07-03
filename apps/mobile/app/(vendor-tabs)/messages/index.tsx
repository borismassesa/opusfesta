import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { useCurrentVendor } from '@/hooks/useCurrentVendor';
import { useVendorConversations } from '@/hooks/useVendorMessages';
import { editorial, shadowSoftSm } from '@/constants/theme';

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function VendorMessagesScreen() {
  const router = useRouter();
  const { vendor } = useCurrentVendor();
  const { data: conversations, isLoading } = useVendorConversations(vendor?.id);

  const rows = (conversations ?? []).map((c: any) => ({
    id: c.id,
    coupleName: c.users?.name ?? 'Couple',
    coupleAvatar: c.users?.avatar,
    lastMessage: c.last_message ?? '',
    timestamp: formatRelativeTime(c.updated_at),
    unreadCount: c.unread_count ?? 0,
  }));

  return (
    <ScreenWrapper scrollable={false}>
      <Text style={{ fontFamily: 'DancingScript-Bold', fontSize: 28, color: editorial.primaryContainer, marginBottom: 20 }}>
        Messages
      </Text>

      {!isLoading && rows.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant, textAlign: 'center' }}>
            No conversations yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(vendor-tabs)/messages/[id]',
                  params: { id: item.id, coupleName: item.coupleName },
                } as any)
              }
              style={[
                {
                  backgroundColor: editorial.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: editorial.outlineVariant,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                },
                shadowSoftSm,
              ]}
            >
              <Avatar name={item.coupleName} imageUrl={item.coupleAvatar} size="md" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface }}>
                    {item.coupleName}
                  </Text>
                  <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 11, color: editorial.onSurfaceVariant }}>
                    {item.timestamp}
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: editorial.primaryContainer,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, color: '#fff' }}>{item.unreadCount}</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </ScreenWrapper>
  );
}
