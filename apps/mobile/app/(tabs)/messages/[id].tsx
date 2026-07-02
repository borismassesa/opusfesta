import { useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useOpusFestaAuth } from '@/lib/auth';
import { editorial, shadowSoftSm } from '@/constants/theme';

export default function ChatScreen() {
  const { id, vendorName } = useLocalSearchParams<{ id: string; vendorName?: string }>();
  const [message, setMessage] = useState('');
  const { user } = useOpusFestaAuth();
  const { data: messages, isLoading } = useMessages(id);
  const sendMessage = useSendMessage();

  const handleSend = () => {
    const content = message.trim();
    if (!content || !id) return;
    setMessage('');
    sendMessage.mutate({ threadId: id, content });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: editorial.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Header title={vendorName || 'Messages'} showBack />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={editorial.primaryContainer} />
        </View>
      ) : (
        <FlatList
          data={messages ?? []}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ paddingTop: 40, alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: 'WorkSans-Regular',
                  fontSize: 14,
                  color: editorial.onSurfaceVariant,
                  textAlign: 'center',
                }}
              >
                No messages yet. Say hello!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id;
            return (
              <View
                style={[
                  {
                    maxWidth: '80%',
                    padding: 14,
                    borderRadius: 12,
                    ...(isMe
                      ? {
                          backgroundColor: editorial.primaryContainer,
                          alignSelf: 'flex-end',
                          borderBottomRightRadius: 4,
                        }
                      : {
                          backgroundColor: editorial.surfaceContainerLowest,
                          alignSelf: 'flex-start',
                          borderBottomLeftRadius: 4,
                          borderWidth: 1,
                          borderColor: editorial.outlineVariant,
                        }),
                  },
                  !isMe ? shadowSoftSm : {},
                ]}
              >
                <Text
                  style={{
                    fontFamily: 'WorkSans-Regular',
                    fontSize: 14,
                    color: isMe ? '#ffffff' : editorial.onSurface,
                  }}
                >
                  {item.content}
                </Text>
                <Text
                  style={{
                    fontFamily: 'WorkSans-Regular',
                    fontSize: 10,
                    marginTop: 4,
                    color: isMe ? 'rgba(255,255,255,0.6)' : editorial.onSurfaceVariant,
                  }}
                >
                  {formatTime(item.created_at)}
                </Text>
              </View>
            );
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderTopWidth: 2,
            borderTopColor: editorial.outlineVariant,
            backgroundColor: editorial.surfaceContainerLowest,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={editorial.outlineVariant}
            style={{
              flex: 1,
              backgroundColor: editorial.surfaceContainerLow,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: editorial.onSurface,
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={sendMessage.isPending}
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: editorial.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sendMessage.isPending ? 0.6 : 1,
              },
              shadowSoftSm,
            ]}
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
