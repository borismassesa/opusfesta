import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackButton } from '@/components/navigation/BackButton';
import { useInvitationProducts } from '@/hooks/useInvitationProducts';
import { useTheme } from '@/theme/useTheme';
import type { InvitationProduct } from '@/types/invitations';

function formatTzs(amount: number) {
  return `TZS ${amount.toLocaleString('en-US')}`;
}

/** Product descriptions are TipTap-authored HTML on the web; strip tags for plain-text display here. */
function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BADGE_INFO: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  most_popular: { label: 'Most Popular', icon: 'flame-outline' },
  premium: { label: 'Premium Template', icon: 'diamond-outline' },
  trending: { label: 'Trending This Week', icon: 'trending-up-outline' },
};

function RelatedCard({
  product,
  onPress,
}: {
  product: InvitationProduct;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="w-36">
      <Image
        source={{ uri: product.image_url }}
        className="aspect-[3/4] w-full rounded-xl bg-ed-surface-container-low"
        resizeMode="cover"
      />
      <Text
        className="mt-2 font-work-sans-semibold text-xs text-ed-on-surface"
        numberOfLines={1}
      >
        {product.name}
      </Text>
      {product.price_now > 0 ? (
        <Text className="mt-0.5 font-work-sans text-[11px] text-ed-on-surface-variant">
          From {formatTzs(product.price_now)}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { editorial } = useTheme();
  const products = useInvitationProducts();
  const { width: windowWidth } = useWindowDimensions();
  const [liked, setLiked] = useState(false);
  const [slide, setSlide] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const product = useMemo(
    () => products.data?.find((p) => p.id === id),
    [products.data, id]
  );

  const slides = useMemo(() => {
    if (!product) return [];
    return [product.image_url, ...(product.designs ?? [])];
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return (products.data ?? [])
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 6);
  }, [products.data, product]);

  if (products.isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ed-bg">
        <ActivityIndicator color={editorial.secondary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-ed-bg" edges={['top']}>
        <View className="px-4 pt-2">
          <BackButton />
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={editorial.onSurfaceVariant}
          />
          <Text className="mt-3 text-center font-work-sans text-sm text-ed-on-surface-variant">
            We couldn't find this design. It may no longer be available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const badge = product.badge ? BADGE_INFO[product.badge] : null;
  const description = product.description ? stripHtml(product.description) : null;
  const hasDiscount =
    product.price_was != null && product.price_was > product.price_now;

  return (
    <SafeAreaView className="flex-1 bg-ed-bg" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 pt-2">
        <BackButton />
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Unlike design' : 'Like design'}
            onPress={() => setLiked((v) => !v)}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-ed-surface-container"
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={18}
              color={liked ? '#E0245E' : editorial.onSurface}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share design"
            onPress={() =>
              router.push({
                pathname: '/coming-soon',
                params: { title: 'Share design' },
              })
            }
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-ed-surface-container"
          >
            <Ionicons name="share-outline" size={18} color={editorial.onSurface} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero carousel */}
        <View className="mt-2">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const next = Math.round(
                event.nativeEvent.contentOffset.x / windowWidth
              );
              setSlide(next);
            }}
          >
            {slides.map((uri, index) => (
              <View
                key={`${uri}-${index}`}
                style={{ width: windowWidth }}
                className="px-5"
              >
                <Image
                  source={{ uri }}
                  className="aspect-[3/4] w-full rounded-2xl bg-ed-surface-container-low"
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {badge ? (
            <View
              className="absolute left-8 top-3 flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
            >
              <Ionicons name={badge.icon} size={13} color="#B8860B" />
              <Text className="font-work-sans-semibold text-[11px] text-ed-on-surface">
                {badge.label}
              </Text>
            </View>
          ) : null}

          {slides.length > 1 ? (
            <View className="mt-3 flex-row items-center justify-center gap-1.5">
              {slides.map((_, index) => (
                <View
                  key={index}
                  className="h-1.5 rounded-full"
                  style={{
                    width: index === slide ? 16 : 6,
                    backgroundColor:
                      index === slide
                        ? editorial.onSurface
                        : editorial.outlineVariant,
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View className="px-5">
          {/* Category + title */}
          <Text className="mt-6 font-work-sans-medium text-xs uppercase tracking-[2px] text-ed-on-surface-variant">
            {product.category}
          </Text>
          <Text className="mt-1.5 font-playfair-bold text-2xl text-ed-on-surface">
            {product.name}
          </Text>

          {/* Pricing */}
          <View className="mt-3 gap-1">
            {product.digital_unit_price && product.digital_unit_price > 0 ? (
              <View className="flex-row flex-wrap items-baseline gap-x-1.5">
                <Text className="font-work-sans-semibold text-base text-ed-on-surface">
                  From {formatTzs(product.digital_unit_price)}
                </Text>
                <Text className="font-work-sans text-xs text-ed-on-surface-variant">
                  per design
                </Text>
              </View>
            ) : null}
            {product.price_now > 0 ? (
              <View className="flex-row flex-wrap items-baseline gap-x-1.5">
                <Text className="font-work-sans-medium text-sm text-ed-on-surface-variant">
                  Paper cards from {formatTzs(product.price_now)}
                </Text>
                {hasDiscount ? (
                  <Text className="font-work-sans text-xs text-ed-on-surface-variant line-through">
                    {formatTzs(product.price_was as number)}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Description */}
          {description ? (
            <View className="mt-5">
              <Text
                className="font-work-sans text-sm leading-6 text-ed-on-surface-variant"
                numberOfLines={descriptionExpanded ? undefined : 4}
              >
                {description}
              </Text>
              {description.length > 180 ? (
                <Pressable
                  onPress={() => setDescriptionExpanded((v) => !v)}
                  className="mt-1.5"
                >
                  <Text className="font-work-sans-semibold text-sm text-ed-on-surface">
                    {descriptionExpanded ? 'Read less' : 'Read more'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {product.designer ? (
            <Text className="mt-4 font-work-sans text-xs text-ed-on-surface-variant">
              Designed by {product.designer}
            </Text>
          ) : null}

          {/* CTA */}
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/coming-soon',
                params: { title: 'Customize this design' },
              })
            }
            className="mt-6 items-center rounded-full bg-ed-primary-container py-4"
          >
            <Text className="font-work-sans-semibold text-sm text-ed-on-primary">
              Continue with this design
            </Text>
          </Pressable>
        </View>

        {/* Similar designs */}
        {related.length > 0 ? (
          <View className="mt-10">
            <Text className="px-5 font-playfair-bold text-xl text-ed-on-surface">
              Similar designs
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              contentContainerClassName="gap-4 px-5"
            >
              {related.map((item) => (
                <RelatedCard
                  key={item.id}
                  product={item}
                  onPress={() => router.push(`/card/${item.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
