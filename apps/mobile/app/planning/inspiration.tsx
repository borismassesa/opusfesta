import { View, Text, Image, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useInspirationItems, useRemoveInspirationItem } from '@/hooks/useInspiration';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

const GAP = 10;

export default function InspirationScreen() {
  const { editorial } = useTheme();
  const router = useRouter();
  const { data: items = [], isLoading } = useInspirationItems();
  const removeItem = useRemoveInspirationItem();

  const handleRemove = (id: string) => {
    Alert.alert('Remove from board?', 'This will remove the item from your inspiration board.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem.mutate(id) },
    ]);
  };

  return (
    <ScreenWrapper scrollable={false}>
      <Header title="Inspiration" showBack />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="images-outline" size={40} color={editorial.outlineVariant} />
          <Text className="font-work-sans text-sm text-ed-on-surface-variant text-center mt-3">
            No inspiration saved yet. Save a vendor's cover photo from their profile to start your board.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ gap: GAP, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => item.vendor_id && router.push({ pathname: '/vendor/[id]', params: { id: item.vendor_id } })}
              onLongPress={() => handleRemove(item.id)}
              className="flex-1 aspect-square rounded-[14px] overflow-hidden bg-ed-surface-container-lowest border border-ed-outline-variant"
              style={shadowSoftSm}
            >
              <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
              <Pressable
                onPress={() => handleRemove(item.id)}
                hitSlop={8}
                className="absolute top-1.5 right-1.5 w-[26px] h-[26px] rounded-[13px] bg-black/40 items-center justify-center"
              >
                <Ionicons name="close" size={14} color="#fff" />
              </Pressable>
              {item.vendors?.business_name && (
                <View className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/35">
                  <Text className="font-work-sans-bold text-[11px] text-white" numberOfLines={1}>
                    {item.vendors.business_name}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </ScreenWrapper>
  );
}
