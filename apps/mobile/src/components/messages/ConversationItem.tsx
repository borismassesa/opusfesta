import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { brutalist, brutalistShadowSm } from '@/constants/theme';

interface ConversationItemProps {
  id: string;
  vendorName: string;
  vendorLogo?: string | null;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export function ConversationItem({
  id,
  vendorName,
  vendorLogo,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
}: ConversationItemProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/messages/${id}`)}
      style={[
        {
          backgroundColor: brutalist.surfaceContainerLowest,
          borderWidth: 2,
          borderColor: brutalist.outlineVariant,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        },
        brutalistShadowSm,
      ]}
    >
      <View style={{ position: 'relative' }}>
        <Avatar name={vendorName} imageUrl={vendorLogo} size="md" />
        {isOnline && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#16a34a',
              borderWidth: 2,
              borderColor: brutalist.surfaceContainerLowest,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk-Bold',
              fontSize: 15,
              color: brutalist.onSurface,
            }}
          >
            {vendorName}
          </Text>
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 11,
              color: brutalist.onSurfaceVariant,
            }}
          >
            {timestamp}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'WorkSans-Regular',
            fontSize: 14,
            color: brutalist.onSurfaceVariant,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {lastMessage}
        </Text>
      </View>
      {unreadCount > 0 && (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: brutalist.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 10,
              color: '#fff',
            }}
          >
            {unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
