import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useVendor, useVendorPackages, useVendorReviews } from '@/hooks/useVendors';
import { useMarkVendorBooked, useSavedVendorStatus } from '@/hooks/useSavedVendors';
import { EmptyState } from '@/components/ui/EmptyState';
import { SaveVendorButton } from '@/components/vendors/SaveVendorButton';
import { StarRating } from '@/components/vendors/ui/StarRating';
import { Avatar } from '@/components/vendors/ui/Avatar';
import {
  buildConnectLinks,
  formatVendorAddress,
  startingPriceLabel,
  vendorImages,
} from '@/lib/vendor-format';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2 border-t border-ed-outline-variant px-5 py-5">
      <Text className="font-work-sans-bold text-sm text-ed-on-surface">{title}</Text>
      {children}
    </View>
  );
}

export default function VendorDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editorial } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: vendor, isLoading, error } = useVendor(id);
  const { data: packages } = useVendorPackages(id);
  const { data: reviews } = useVendorReviews(id);
  const savedStatus = useSavedVendorStatus(id);
  const markBooked = useMarkVendorBooked();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ed-bg">
        <ActivityIndicator color={editorial.onSurfaceVariant} />
      </SafeAreaView>
    );
  }

  if (error || !vendor) {
    return (
      <SafeAreaView className="flex-1 bg-ed-bg" edges={['top']}>
        <View className="flex-row items-center gap-3 px-5 pt-2">
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={editorial.onSurface} />
          </Pressable>
        </View>
        <EmptyState icon="alert-circle-outline" label="This vendor could not be loaded." />
      </SafeAreaView>
    );
  }

  const images = vendorImages(vendor);
  const hero = images[0];
  const rating = vendor.stats?.averageRating ?? 0;
  const reviewCount = vendor.stats?.reviewCount ?? 0;
  const address = formatVendorAddress(vendor.location);
  const fromPrice = startingPriceLabel(packages);
  const connectLinks = buildConnectLinks(vendor);
  const isBooked = savedStatus === 'booked';

  const onShare = () =>
    Share.share({
      message: `${vendor.business_name} on OpusFesta`,
      url: `https://opusfesta.com/vendors/${vendor.slug}`,
    }).catch(() => {});

  const onMarkBooked = () => {
    if (isBooked) return;
    Alert.alert('Mark as booked?', `Confirm you have booked ${vendor.business_name}.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark booked',
        onPress: () =>
          markBooked.mutate(vendor.id, {
            onError: (err) =>
              Alert.alert(
                'Could not update',
                err instanceof Error ? err.message : 'Please try again.',
              ),
          }),
      },
    ]);
  };

  const openLink = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Could not open link'));

  return (
    <View className="flex-1 bg-ed-bg">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="h-80 w-full bg-ed-surface-container">
          {hero ? (
            <Image source={{ uri: hero }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Ionicons name="storefront-outline" size={40} color={editorial.onSurfaceVariant} />
            </View>
          )}

          <View
            style={{ top: insets.top + 8 }}
            className="absolute w-full flex-row items-center justify-between px-5"
          >
            <Pressable
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full bg-black/40"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </Pressable>

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={onMarkBooked}
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isBooked ? 'bg-[#16a34a]' : 'bg-black/40'
                }`}
                accessibilityLabel={isBooked ? 'Booked' : 'Mark as booked'}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </Pressable>

              <Pressable
                onPress={onShare}
                className="h-9 w-9 items-center justify-center rounded-full bg-black/40"
                accessibilityLabel="Share vendor"
              >
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              </Pressable>

              <View className="h-9 w-9 items-center justify-center rounded-full bg-black/40">
                <SaveVendorButton vendorId={vendor.id} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        <View className="-mt-6 rounded-t-3xl bg-ed-bg px-5 pt-5">
          <View className="flex-row items-start gap-2">
            <Text className="flex-1 font-playfair-bold text-2xl text-ed-on-surface">
              {vendor.business_name}
            </Text>
            {vendor.verified ? (
              <Ionicons name="checkmark-circle" size={20} color={editorial.secondary} />
            ) : null}
          </View>

          {address ? (
            <Text className="mt-1 font-work-sans text-sm text-ed-on-surface-variant">{address}</Text>
          ) : null}

          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            <View className="rounded-full bg-ed-surface-container px-3 py-1">
              <Text className="font-work-sans-bold text-[11px] text-ed-on-surface">
                {vendor.category}
              </Text>
            </View>
            {reviewCount > 0 ? (
              <View className="rounded-full bg-ed-surface-container px-3 py-1">
                <StarRating rating={rating} count={reviewCount} />
              </View>
            ) : null}
            {isBooked ? (
              <View className="rounded-full bg-[#dcfce7] px-3 py-1">
                <Text className="font-work-sans-bold text-[11px] text-[#16a34a]">Booked</Text>
              </View>
            ) : null}
          </View>

          <Text className="mt-4 font-work-sans text-sm text-ed-on-surface-variant">
            {fromPrice ? `Starting from ${fromPrice}` : 'Contact for pricing'}
          </Text>
        </View>

        <View className="mt-5">
          {vendor.description || vendor.bio ? (
            <Section title="About">
              <Text className="font-work-sans text-sm leading-5 text-ed-on-surface-variant">
                {vendor.description || vendor.bio}
              </Text>
            </Section>
          ) : null}

          {vendor.services_offered && vendor.services_offered.length > 0 ? (
            <Section title="Services offered">
              <View className="gap-1.5">
                {vendor.services_offered.map((service) => (
                  <View key={service} className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle-outline" size={16} color={editorial.secondary} />
                    <Text className="flex-1 font-work-sans text-sm text-ed-on-surface-variant">
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section title="Packages & pricing">
            {packages && packages.length > 0 ? (
              <View className="gap-3">
                {packages.map((pkg) => (
                  <View
                    key={pkg.id}
                    className={`rounded-2xl border p-4 ${
                      pkg.badge
                        ? 'border-ed-secondary bg-ed-surface-container-low'
                        : 'border-ed-outline-variant bg-ed-surface'
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="flex-1 font-work-sans-bold text-sm text-ed-on-surface">
                        {pkg.name}
                      </Text>
                      {pkg.badge ? (
                        <View className="rounded-full bg-ed-primary-container px-2 py-0.5">
                          <Text className="font-work-sans-bold text-[10px] text-ed-on-primary">
                            {pkg.badge.label}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {pkg.price ? (
                      <Text className="mt-1 font-work-sans-bold text-base text-ed-on-surface">
                        TZS {pkg.price}
                      </Text>
                    ) : null}

                    {pkg.description ? (
                      <Text className="mt-1 font-work-sans text-xs text-ed-on-surface-variant">
                        {pkg.description}
                      </Text>
                    ) : null}

                    {pkg.includes && pkg.includes.length > 0 ? (
                      <View className="mt-2 gap-1">
                        {pkg.includes.map((item) => (
                          <View key={item} className="flex-row items-center gap-2">
                            <Ionicons name="ellipse" size={4} color={editorial.onSurfaceVariant} />
                            <Text className="flex-1 font-work-sans text-xs text-ed-on-surface-variant">
                              {item}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="font-work-sans text-sm text-ed-on-surface-variant">
                No packages published yet — request a quote for pricing.
              </Text>
            )}
          </Section>

          {vendor.team && vendor.team.length > 0 ? (
            <Section title="Meet the team">
              <View className="gap-3">
                {vendor.team.map((member) => (
                  <View key={member.id} className="flex-row items-center gap-3">
                    <Avatar name={member.name} uri={member.avatar} size={40} />
                    <View className="flex-1">
                      <Text className="font-work-sans-bold text-sm text-ed-on-surface">
                        {member.name}
                      </Text>
                      {member.role ? (
                        <Text className="font-work-sans text-xs text-ed-on-surface-variant">
                          {member.role}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section title={reviewCount > 0 ? `Reviews (${reviewCount})` : 'Reviews'}>
            {reviews && reviews.length > 0 ? (
              <View className="gap-4">
                {reviews.map((review) => (
                  <View key={review.id} className="gap-1">
                    <View className="flex-row items-center gap-2">
                      <Avatar name={review.user.name} uri={review.user.avatar} size={32} />
                      <View className="flex-1">
                        <Text className="font-work-sans-bold text-sm text-ed-on-surface">
                          {review.user.name}
                        </Text>
                        <StarRating rating={review.rating} />
                      </View>
                    </View>
                    {review.content ? (
                      <Text className="font-work-sans text-sm leading-5 text-ed-on-surface-variant">
                        {review.content}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="font-work-sans text-sm text-ed-on-surface-variant">
                No reviews yet.
              </Text>
            )}
          </Section>

          {address ? (
            <Section title="Location">
              <Text className="font-work-sans text-sm text-ed-on-surface-variant">{address}</Text>
              <Pressable
                className="mt-2 flex-row items-center gap-2"
                onPress={() =>
                  openLink(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Open in Maps"
              >
                <Ionicons name="map-outline" size={16} color={editorial.secondary} />
                <Text className="font-work-sans-bold text-sm text-ed-secondary">Open in Maps</Text>
              </Pressable>
            </Section>
          ) : null}

          {connectLinks.length > 0 ? (
            <Section title="Connect">
              <View className="gap-1">
                {connectLinks.map((link) => (
                  <Pressable
                    key={link.key}
                    className="flex-row items-center gap-3 py-2"
                    onPress={() => openLink(link.url)}
                    accessibilityRole="button"
                    accessibilityLabel={link.label}
                  >
                    <Ionicons name={link.icon} size={18} color={editorial.onSurface} />
                    <Text className="flex-1 font-work-sans text-sm text-ed-on-surface">
                      {link.label}
                    </Text>
                    <Ionicons name="open-outline" size={14} color={editorial.onSurfaceVariant} />
                  </Pressable>
                ))}
              </View>
            </Section>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute bottom-0 w-full border-t border-ed-outline-variant bg-ed-surface px-5 pt-3"
      >
        <Pressable
          className="items-center rounded-full bg-ed-primary-container py-3.5"
          onPress={() => router.push(`/booking/${vendor.id}`)}
          accessibilityRole="button"
          accessibilityLabel="Request a quote"
        >
          <Text className="font-work-sans-bold text-sm text-ed-on-primary">Request a quote</Text>
        </Pressable>
      </View>
    </View>
  );
}
