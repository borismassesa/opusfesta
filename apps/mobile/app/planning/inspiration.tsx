import { View, Text, Image, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { useInspirationItems, useRemoveInspirationItem } from '@/hooks/useInspiration';
import { editorial, shadowSoftSm } from '@/constants/theme';

const GAP = 10;

export default function InspirationScreen() {
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={editorial.primaryContainer} />
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="images-outline" size={40} color={editorial.outlineVariant} />
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 14,
              color: editorial.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 12,
            }}
          >
            No inspiration saved yet. Save a vendor's cover photo from their profile to start your board.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP }}
          contentContainerStyle={{ gap: GAP, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: any) => (
            <Pressable
              onPress={() => item.vendor_id && router.push({ pathname: '/vendor/[id]', params: { id: item.vendor_id } })}
              onLongPress={() => handleRemove(item.id)}
              style={[
                {
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 14,
                  overflow: 'hidden',
                  backgroundColor: editorial.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: editorial.outlineVariant,
                },
                shadowSoftSm,
              ]}
            >
              <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              <Pressable
                onPress={() => handleRemove(item.id)}
                hitSlop={8}
                style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 26, height: 26, borderRadius: 13,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </Pressable>
              {item.vendors?.business_name && (
                <View
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    paddingHorizontal: 8, paddingVertical: 6,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                  }}
                >
                  <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: '#fff' }} numberOfLines={1}>
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
