import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { shadowSoftSm } from '@/constants/theme';

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
      onPress={() =>
        router.push({
          pathname: '/(tabs)/messages/[id]',
          params: { id, vendorName, vendorLogo: vendorLogo ?? '' },
        })
      }
      className="bg-ed-surface-container-lowest border border-ed-outline-variant rounded-xl p-4 flex-row items-center gap-3.5"
      style={shadowSoftSm}
    >
      <View className="relative">
        <Avatar name={vendorName} imageUrl={vendorLogo} size="md" />
        {isOnline && (
          <View className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-[5px] bg-[#16a34a] border-2 border-ed-surface-container-lowest" />
        )}
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row justify-between items-center">
          <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface">
            {vendorName}
          </Text>
          <Text className="font-work-sans text-[11px] text-ed-on-surface-variant">
            {timestamp}
          </Text>
        </View>
        <Text className="font-work-sans text-sm text-ed-on-surface-variant mt-0.5" numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
      {unreadCount > 0 && (
        <View className="w-[22px] h-[22px] rounded-[11px] items-center justify-center bg-ed-primary-container">
          <Text className="font-work-sans-bold text-[10px] text-white">
            {unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
