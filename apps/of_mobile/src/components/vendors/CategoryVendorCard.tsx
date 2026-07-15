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
      className="mx-5 mb-6 bg-ed-surface-container-lowest rounded-2xl overflow-hidden border border-ed-outline-variant"
      style={[{ width: CARD_WIDTH }, shadowSoft]}
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
            <Text className="text-[40px]">🏛️</Text>
          </LinearGradient>
        )}

        {photos.length > 1 && (
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-[5px]">
            {photos.map((_, i) => (
              <View
                key={i}
                className={`w-1.5 h-1.5 rounded-[3px] ${i === activeIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </View>
        )}

        <Pressable
          onPress={() => toggleSaved.mutate({ vendorId: id, isSaved })}
          disabled={toggleSaved.isPending}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/35 items-center justify-center"
        >
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={18} color={isSaved ? '#E0558A' : '#fff'} />
        </Pressable>
      </View>

      <View className="p-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="font-space-grotesk-bold text-base text-ed-on-surface flex-1"
            numberOfLines={1}
          >
            {name}
          </Text>
          {rating != null && (
            <View className="flex-row items-center gap-[3px] ml-2">
              <Ionicons name="star" size={13} color="#C4920A" />
              <Text className="font-space-grotesk-bold text-[13px] text-ed-on-surface">{rating}</Text>
              <Text className="font-work-sans text-xs text-ed-on-surface-variant">
                ({reviewCount})
              </Text>
            </View>
          )}
        </View>
        {location && (
          <Text className="font-work-sans text-[13px] text-ed-on-surface-variant mb-1.5">
            {location}
          </Text>
        )}
        <Text className="font-work-sans-bold text-[13px] text-ed-on-surface">
          {formatCompactCurrencyRange(priceMin, priceMax)}
        </Text>
      </View>
    </Pressable>
  );
}
