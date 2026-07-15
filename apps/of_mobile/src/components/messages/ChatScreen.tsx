import { useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useOpusFestaAuth } from '@/lib/auth';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface ChatScreenProps {
  threadId: string;
  counterpartName?: string;
}

/**
 * Shared by both the couple and vendor message-detail routes - role-agnostic
 * (isMe derives from sender_id === user?.id, no couple/vendor-specific
 * copy), so only the title differs per caller.
 */
export function ChatScreen({ threadId, counterpartName }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const { editorial } = useTheme();
  const { user } = useOpusFestaAuth();
  const { data: messages, isLoading } = useMessages(threadId);
  const sendMessage = useSendMessage();

  const handleSend = () => {
    const content = message.trim();
    if (!content || !threadId) return;
    setMessage('');
    sendMessage.mutate({ threadId, content });
  };

  return (
    <SafeAreaView className="flex-1 bg-ed-bg" edges={['top']}>
      <View className="px-5 pt-2">
        <Header title={counterpartName || 'Messages'} showBack />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={editorial.primaryContainer} />
        </View>
      ) : (
        <FlatList
          data={messages ?? []}
          keyExtractor={(item) => item.id}
          className="flex-1 px-5"
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="pt-10 items-center">
              <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center">
                No messages yet. Say hello!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id;
            const bubbleClass = isMe
              ? 'max-w-[80%] p-3.5 rounded-xl self-end rounded-br-[4px] bg-ed-primary-container'
              : 'max-w-[80%] p-3.5 rounded-xl self-start rounded-bl-[4px] bg-ed-surface-container-lowest border border-ed-outline-variant';
            return (
              <View className={bubbleClass} style={!isMe ? shadowSoftSm : undefined}>
                <Text className={`font-work-sans text-sm ${isMe ? 'text-white' : 'text-ed-on-surface'}`}>
                  {item.content}
                </Text>
                <Text className={`font-work-sans text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-ed-on-surface-variant'}`}>
                  {formatTime(item.created_at)}
                </Text>
              </View>
            );
          }}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="px-5 py-3 border-t-2 border-ed-outline-variant bg-ed-surface-container-lowest flex-row items-center gap-3">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={editorial.outlineVariant}
            className="flex-1 bg-ed-surface-container-low rounded-xl px-4 py-3 font-work-sans text-sm text-ed-on-surface"
          />
          <Pressable
            onPress={handleSend}
            disabled={sendMessage.isPending}
            className={`w-10 h-10 rounded-lg items-center justify-center bg-ed-primary-container ${sendMessage.isPending ? 'opacity-60' : 'opacity-100'}`}
            style={shadowSoftSm}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
