import { useState } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { useWeddingWebsite, useRsvpList } from '@/hooks/useWeddingWebsite';
import { colors, brutalist } from '@/constants/theme';
import type { WeddingRsvp } from '@/types/wedding-website';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'yes', label: 'Attending' },
  { key: 'no', label: 'Declined' },
  { key: 'pending', label: 'Pending' },
] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  yes: { bg: 'bg-green-50', text: 'text-green-700' },
  no: { bg: 'bg-red-50', text: 'text-red-600' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  maybe: { bg: 'bg-blue-50', text: 'text-blue-600' },
};

export default function RsvpListScreen() {
  const { data: website } = useWeddingWebsite();
  const { data: rsvps = [], isLoading } = useRsvpList(website?.id);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? rsvps
    : rsvps.filter((r: WeddingRsvp) => r.attending === filter);

  const counts = {
    all: rsvps.length,
    yes: rsvps.filter((r: WeddingRsvp) => r.attending === 'yes').length,
    no: rsvps.filter((r: WeddingRsvp) => r.attending === 'no').length,
    pending: rsvps.filter((r: WeddingRsvp) => r.attending === 'pending').length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Header title="RSVPs" showBack />
      </View>

      {/* Filter tabs */}
      <View className="flex-row gap-2 px-5 mt-2 mb-4">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
                backgroundColor: isActive ? colors.primary : '#F3EBF9',
              }}
            >
              <Text className="text-xs font-dm-sans-bold" style={{ color: isActive ? '#fff' : colors.muted }}>
                {f.label} ({counts[f.key as keyof typeof counts] ?? 0})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="mail-outline" size={48} color={colors.muted} />
          <Text className="text-sm text-of-muted text-center mt-4">No RSVPs yet. Share your website to start collecting responses.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: WeddingRsvp) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 24 }}
          renderItem={({ item }: { item: WeddingRsvp }) => {
            const statusStyle = STATUS_COLORS[item.attending] ?? STATUS_COLORS.pending;
            return (
              <View className="bg-white rounded-xl border border-of-border p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-dm-sans-bold text-sm text-of-text">{item.guest_name}</Text>
                  <View className={`px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
                    <Text className={`text-[10px] font-dm-sans-bold uppercase ${statusStyle.text}`}>
                      {item.attending}
                    </Text>
                  </View>
                </View>
                {item.plus_one && item.plus_one_name && (
                  <Text className="text-xs text-of-muted">+1: {item.plus_one_name}</Text>
                )}
                {item.meal_choice && (
                  <Text className="text-xs text-of-muted">Meal: {item.meal_choice}</Text>
                )}
                {item.dietary_notes && (
                  <Text className="text-xs text-of-muted">Diet: {item.dietary_notes}</Text>
                )}
                {item.message && (
                  <Text className="text-xs text-of-muted italic mt-1">"{item.message}"</Text>
                )}
                <Text className="text-[10px] text-of-muted mt-2">
                  via {item.submitted_via} • {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
