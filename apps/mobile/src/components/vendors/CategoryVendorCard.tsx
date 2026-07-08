import { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, Dimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCompactCurrencyRange } from '@opusfesta/lib';
import { shadowSoft } from '@/constants/theme';
import { useSavedVendorIds, useToggleSavedVendor } from '@/hooks/useSavedVendors';
import { useTheme } from '@/theme/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const IMAGE_HEIGHT = 220;

interface CategoryVendorCardProps {
  id: string;
  name: string;
  location?: string | null;
  rating?: number | null;
  reviewCount?: number;
  priceMin?: number | null;
  priceMax?: number | null;
  images: string[];
}

export function CategoryVendorCard({
  id,
  name,
  location,
  rating,
  reviewCount = 0,
  priceMin,
  priceMax,
  images,
}: CategoryVendorCardProps) {
  const { editorial } = useTheme();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: savedVendorIds = [] } = useSavedVendorIds();
  const toggleSaved = useToggleSavedVendor();
  const isSaved = savedVendorIds.includes(id);

  const photos = images.filter(Boolean);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <Pressable
      onPress={() => router.push(`/vendor/${id}`)}
      style={[
        {
          width: CARD_WIDTH,
          marginHorizontal: 20,
          marginBottom: 24,
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
        },
        shadowSoft,
      ]}
    >
      <View style={{ height: IMAGE_HEIGHT }}>
        {photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
          >
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : (
          <LinearGradient
            colors={[editorial.secondaryContainer, editorial.tertiaryFixed]}
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 40 }}>🏛️</Text>
          </LinearGradient>
        )}

        {photos.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            {photos.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </View>
        )}

        <Pressable
          onPress={() => toggleSaved.mutate({ vendorId: id, isSaved })}
          disabled={toggleSaved.isPending}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={isSaved ? '#E0558A' : '#fff'} />
        </Pressable>
      </View>

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text
            style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: editorial.onSurface, flex: 1 }}
            numberOfLines={1}
          >
            {name}
          </Text>
          {rating != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 8 }}>
              <Ionicons name="star" size={13} color="#C4920A" />
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: editorial.onSurface }}>{rating}</Text>
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant }}>
                ({reviewCount})
              </Text>
            </View>
          )}
        </View>
        {location && (
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant, marginBottom: 6 }}>
            {location}
          </Text>
        )}
        <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: editorial.onSurface }}>
          {formatCompactCurrencyRange(priceMin, priceMax)}
        </Text>
      </View>
    </Pressable>
  );
}
