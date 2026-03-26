import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { useWeddingWebsite, useGuestbook, useApproveGuestbook } from '@/hooks/useWeddingWebsite';
import { colors, brutalist } from '@/constants/theme';
import type { GuestbookEntry } from '@/types/wedding-website';

export default function GuestbookManageScreen() {
  const { data: website } = useWeddingWebsite();
  const { data: entries = [], isLoading } = useGuestbook(website?.id);
  const approve = useApproveGuestbook();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Header title="Guestbook" showBack />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={48} color={colors.muted} />
          <Text className="text-sm text-of-muted text-center mt-4">
            No guestbook messages yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item: GuestbookEntry) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingTop: 12, paddingBottom: 24 }}
          renderItem={({ item }: { item: GuestbookEntry }) => (
            <View className="bg-white rounded-xl border border-of-border p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-of-primary items-center justify-center">
                    <Text className="text-white font-dm-sans-bold text-xs">
                      {item.guest_name.charAt(0)}
                    </Text>
                  </View>
                  <Text className="font-dm-sans-bold text-sm text-of-text">{item.guest_name}</Text>
                </View>
                <View className={`px-2 py-0.5 rounded-full ${item.is_approved ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <Text className={`text-[10px] font-dm-sans-bold uppercase ${item.is_approved ? 'text-green-700' : 'text-amber-700'}`}>
                    {item.is_approved ? 'Approved' : 'Pending'}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-of-muted italic mb-3">"{item.message}"</Text>
              <View className="flex-row gap-3">
                {!item.is_approved && (
                  <Pressable
                    onPress={() => approve.mutate({ entryId: item.id, approved: true })}
                    className="flex-row items-center gap-1 bg-green-50 px-3 py-1.5 rounded-button border border-green-100"
                  >
                    <Ionicons name="checkmark" size={14} color="#16a34a" />
                    <Text className="text-xs font-dm-sans-bold text-green-700">Approve</Text>
                  </Pressable>
                )}
                {item.is_approved && (
                  <Pressable
                    onPress={() => approve.mutate({ entryId: item.id, approved: false })}
                    className="flex-row items-center gap-1 bg-red-50 px-3 py-1.5 rounded-button border border-red-100"
                  >
                    <Ionicons name="close" size={14} color="#dc2626" />
                    <Text className="text-xs font-dm-sans-bold text-red-600">Hide</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
