import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useConversations } from '@/hooks/useMessages';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/vendors/ui/Avatar';

function relativeDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ChatScreen() {
  const router = useRouter();
  const { editorial } = useTheme();
  const { data, isLoading, error } = useConversations();

  return (
    <SafeAreaView className="flex-1 bg-ed-bg" edges={['top']}>
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={editorial.onSurface} />
        </Pressable>
        <Text className="flex-1 font-playfair-bold text-xl text-ed-on-surface">Messages</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-32">
        {isLoading ? (
          <ActivityIndicator className="py-16" color={editorial.onSurfaceVariant} />
        ) : error ? (
          <EmptyState icon="alert-circle-outline" label="Could not load your messages." />
        ) : data && data.length > 0 ? (
          data.map((thread) => (
            <Pressable
              key={thread.id}
              className="flex-row items-center gap-3 border-b border-ed-outline-variant px-5 py-3"
              onPress={() => router.push(`/chat/${thread.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Conversation with ${thread.vendors?.business_name ?? 'vendor'}`}
            >
              <Avatar
                name={thread.vendors?.business_name ?? 'Vendor'}
                uri={thread.vendors?.logo}
              />

              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-2">
                  <Text
                    numberOfLines={1}
                    className="flex-1 font-work-sans-bold text-sm text-ed-on-surface"
                  >
                    {thread.vendors?.business_name ?? 'Vendor'}
                  </Text>
                  <Text className="font-work-sans text-[11px] text-ed-on-surface-variant">
                    {relativeDate(thread.last_message_at)}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Text
                    numberOfLines={1}
                    className="flex-1 font-work-sans text-xs text-ed-on-surface-variant"
                  >
                    {thread.preview ?? 'No messages yet'}
                  </Text>
                  {thread.unreadCount > 0 ? (
                    <View className="h-5 min-w-5 items-center justify-center rounded-full bg-ed-primary-container px-1.5">
                      <Text className="font-work-sans-bold text-[10px] text-ed-on-primary">
                        {thread.unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <EmptyState
            icon="chatbubbles-outline"
            label="No conversations yet. Request a quote from a vendor to start one."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
