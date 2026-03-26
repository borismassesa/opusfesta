import { useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { brutalist, brutalistShadowSm } from '@/constants/theme';

const MOCK_MESSAGES = [
  {
    id: '1',
    content: 'Hi! I wanted to confirm the booking details for June 12.',
    sender: 'user',
    time: '10:30 AM',
  },
  {
    id: '2',
    content:
      "Great news! Your date is confirmed for June 12. We've reserved the Grand Ballroom for 250 guests.",
    sender: 'vendor',
    time: '10:32 AM',
  },
  {
    id: '3',
    content: 'Thank you! Can we schedule a walkthrough next week?',
    sender: 'user',
    time: '10:35 AM',
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Header title="Serena Grand" showBack />
      </View>

      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              {
                maxWidth: '80%',
                padding: 14,
                borderRadius: 12,
                ...(item.sender === 'user'
                  ? {
                      backgroundColor: brutalist.primaryContainer,
                      alignSelf: 'flex-end',
                      borderBottomRightRadius: 4,
                    }
                  : {
                      backgroundColor: brutalist.surfaceContainerLowest,
                      alignSelf: 'flex-start',
                      borderBottomLeftRadius: 4,
                      borderWidth: 2,
                      borderColor: brutalist.outlineVariant,
                    }),
              },
              item.sender === 'vendor' ? brutalistShadowSm : {},
            ]}
          >
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 14,
                color: item.sender === 'user' ? '#ffffff' : brutalist.onSurface,
              }}
            >
              {item.content}
            </Text>
            <Text
              style={{
                fontFamily: 'WorkSans-Regular',
                fontSize: 10,
                marginTop: 4,
                color: item.sender === 'user' ? 'rgba(255,255,255,0.6)' : brutalist.onSurfaceVariant,
              }}
            >
              {item.time}
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderTopWidth: 2,
            borderTopColor: brutalist.outlineVariant,
            backgroundColor: brutalist.surfaceContainerLowest,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={brutalist.outlineVariant}
            style={{
              flex: 1,
              backgroundColor: brutalist.surfaceContainerLow,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: brutalist.onSurface,
            }}
          />
          <Pressable
            onPress={() => {
              if (message.trim()) setMessage('');
            }}
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: brutalist.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              },
              brutalistShadowSm,
            ]}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
