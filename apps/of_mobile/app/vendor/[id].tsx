import { View, Text, ScrollView, Pressable, Image, Linking, Share, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getVendorById, getVendorReviews, getVendorPackages } from '@/lib/api/vendors';
import type { VendorListing } from '@/types/vendor';
import { formatAddress, toUrl } from '@/lib/vendorLinks';
import { useSavedVendorIds, useToggleSavedVendor, useSavedVendorStatus, useMarkVendorBooked } from '@/hooks/useSavedVendors';
import { useAddInspirationItem } from '@/hooks/useInspiration';
import { formatCurrency } from '@opusfesta/lib';
import { useTheme } from '@/theme/useTheme';

const VENDOR_BASE_URL = 'https://opusfesta.com/vendors';

function buildConnectLinks(vendor: VendorListing): { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] {
  const contact = vendor?.contact_info ?? {};
  const social = vendor?.social_links ?? {};
  const links: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [];

  if (contact.phone) {
    links.push({ icon: 'call-outline', label: 'Call', onPress: () => Linking.openURL(`tel:${contact.phone}`) });
  }
  if (social.website) {
    links.push({ icon: 'globe-outline', label: 'Website', onPress: () => Linking.openURL(toUrl(social.website)) });
  }
  const whatsapp = contact.whatsapp || social.whatsapp;
  if (whatsapp) {
    const digits = String(whatsapp).replace(/[^\d]/g, '');
    links.push({ icon: 'logo-whatsapp', label: 'WhatsApp', onPress: () => Linking.openURL(`https://wa.me/${digits}`) });
  }
  if (social.instagram) {
    links.push({
      icon: 'logo-instagram',
      label: 'Instagram',
      onPress: () => Linking.openURL(toUrl(social.instagram, 'https://instagram.com/')),
    });
  }
  if (social.facebook) {
    links.push({
      icon: 'logo-facebook',
      label: 'Facebook',
      onPress: () => Linking.openURL(toUrl(social.facebook, 'https://facebook.com/')),
    });
  }
  return links;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="font-playfair-bold text-xl text-of-text mb-4">{children}</Text>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View className="p-5 rounded-xl bg-of-pale border border-of-border items-center">
      <Text className="text-sm text-of-muted text-center">{text}</Text>
    </View>
  );
}

export default function VendorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { editorial, colors } = useTheme();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => getVendorById(id!),
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews', id],
    queryFn: () => getVendorReviews(id!),
    enabled: !!id,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['vendor-packages', id],
    queryFn: () => getVendorPackages(id!),
    enabled: !!id,
  });

  const { data: savedVendorIds = [] } = useSavedVendorIds();
  const toggleSaved = useToggleSavedVendor();
  const isSaved = savedVendorIds.includes(id!);
  const addInspirationItem = useAddInspirationItem();
  const bookedStatus = useSavedVendorStatus(id);
  const isBooked = bookedStatus === 'booked';
  const markBooked = useMarkVendorBooked();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-of-cream">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-of-cream px-6">
        <Ionicons name="alert-circle-outline" size={40} color={colors.muted} />
        <Text className="font-work-sans-bold text-of-text mt-3">Vendor not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-sm font-work-sans-bold text-of-primary">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const displayName = vendor.business_name;
  const displayLocation = vendor.location?.city ?? null;
  const displayAddress = formatAddress(vendor.location);
  const displayPrice = vendor.price_range?.min ?? null;
  const displayRating = vendor.stats?.averageRating ?? null;
  const reviewCount = vendor.stats?.reviewCount ?? 0;
  const displayCategory = vendor.category;
  const displayDescription = vendor.description ?? null;
  const isVerified = vendor.verified ?? false;
  const heroImage = vendor.cover_image ?? null;
  const servicesOffered: string[] = Array.isArray(vendor.services_offered)
    ? vendor.services_offered.filter((s: unknown) => typeof s === 'string' && s.trim())
    : [];
  const team: { id: string; name: string; role?: string; bio?: string; avatar?: string }[] = Array.isArray(vendor.team)
    ? vendor.team.filter((m) => m?.name)
    : [];

  const tiers = packages.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    popular: p.is_featured,
    features: p.features ?? [],
  }));

  const connectLinks = buildConnectLinks(vendor);

  const handleSaveToInspiration = () => {
    if (!heroImage || !id) return;
    addInspirationItem.mutate(
      { imageUrl: heroImage, vendorId: id, category: displayCategory },
      { onSuccess: () => Alert.alert('Saved', 'Added to your inspiration board.') },
    );
  };

  const handleShare = () => {
    if (!vendor.slug) return;
    Share.share({
      message: `Check out ${displayName} on OpusFesta: ${VENDOR_BASE_URL}/${vendor.slug}`,
      url: `${VENDOR_BASE_URL}/${vendor.slug}`,
    });
  };

  return (
    <View className="flex-1 bg-of-cream">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ═══ 1. Hero Image ═══ */}
        <View className="h-[384px] overflow-hidden">
          {heroImage ? (
            <Image
              source={{ uri: heroImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#1A1A1A', '#7E5896', '#C9A0DC']}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className="text-[72px]">🌿</Text>
            </LinearGradient>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
          />
          {/* Nav buttons */}
          <View
            className="absolute left-4 right-4 flex-row justify-between"
            style={{ top: insets.top + 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center bg-black/20"
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View className="flex-row gap-2.5">
              {heroImage && (
                <Pressable
                  onPress={handleSaveToInspiration}
                  disabled={addInspirationItem.isPending}
                  className="w-10 h-10 rounded-full items-center justify-center bg-black/20"
                >
                  <Ionicons name="images-outline" size={20} color="#fff" />
                </Pressable>
              )}
              {vendor.slug && (
                <Pressable
                  onPress={handleShare}
                  className="w-10 h-10 rounded-full items-center justify-center bg-black/20"
                >
                  <Ionicons name="share-social-outline" size={20} color="#fff" />
                </Pressable>
              )}
              <Pressable
                onPress={() => id && !isBooked && markBooked.mutate(id)}
                disabled={markBooked.isPending || isBooked}
                className="w-10 h-10 rounded-full items-center justify-center bg-black/20"
              >
                <Ionicons
                  name={isBooked ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={22}
                  color={isBooked ? '#2D8E5B' : '#fff'}
                />
              </Pressable>
              <Pressable
                onPress={() => id && toggleSaved.mutate({ vendorId: id, isSaved })}
                disabled={toggleSaved.isPending}
                className="w-10 h-10 rounded-full items-center justify-center bg-black/20"
              >
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={22} color={isSaved ? '#E0558A' : '#fff'} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ═══ 2. Title Card ═══ */}
        <View className="px-5 -mt-12">
          <View
            className="bg-of-surface rounded-xl p-6"
            style={{
              shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 }, elevation: 4,
              borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
            }}
          >
            <Text className="font-playfair-bold text-2xl text-of-text mb-1">
              {displayName}
            </Text>
            {displayLocation && (
              <View className="flex-row items-center gap-1 mb-4">
                <Ionicons name="location-sharp" size={14} color={colors.muted} />
                <Text className="text-sm text-of-muted">{displayLocation}</Text>
              </View>
            )}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] uppercase tracking-widest text-of-muted font-work-sans-bold">
                  Starting from
                </Text>
                <Text className="text-xl font-work-sans-bold text-of-primary">
                  {displayPrice != null ? formatCurrency(displayPrice) : 'Contact for pricing'}
                </Text>
              </View>
              {isVerified && (
                <View className="flex-row items-center gap-1 bg-green-50 rounded-full px-3 py-1.5 border border-green-100">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text className="text-[10px] font-work-sans-bold text-green-700 uppercase">
                    Verified
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ═══ 3. Quick Badges ═══ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 16 }}
        >
          <View className="flex-row items-center gap-1.5 bg-of-pale rounded-xl px-3 h-8 border border-of-border">
            <Ionicons name="storefront-outline" size={14} color={colors.primary} />
            <Text className="text-[10px] font-work-sans-bold text-of-primary uppercase tracking-tight">
              {displayCategory}
            </Text>
          </View>
          {displayRating != null && (
            <View className="flex-row items-center gap-1.5 bg-amber-50 rounded-xl px-3 h-8 border border-amber-100">
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text className="text-[10px] font-work-sans-bold text-amber-700 uppercase tracking-tight">
                {displayRating} Rating
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ═══ 4. About ═══ */}
        <View className="px-5 mt-4">
          <SectionTitle>About this Vendor</SectionTitle>
          <Text className="text-sm text-of-muted leading-relaxed">
            {displayDescription || 'This vendor hasn’t added a description yet.'}
          </Text>
        </View>

        {/* ═══ 5. Details ═══ */}
        {servicesOffered.length > 0 && (
          <View className="px-5 mt-10">
            <SectionTitle>Services offered</SectionTitle>
            <View className="gap-2">
              {servicesOffered.map((service, i) => (
                <View key={i} className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  <Text className="text-sm text-of-muted">{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ═══ 6. Packages & Pricing ═══ */}
        <View className="px-5 mt-10">
          <SectionTitle>Packages & Pricing</SectionTitle>
          {tiers.length === 0 ? (
            <EmptyState text="This vendor hasn't published pricing packages yet. Request a quote to get custom pricing." />
          ) : (
            <View className="gap-4">
              {tiers.map((tier) =>
                tier.popular ? (
                  <View
                    key={tier.id}
                    className="p-5 rounded-xl relative border-2 border-of-primary"
                    style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    <View className="absolute -top-3 left-4 bg-of-primary px-3 py-1 rounded-full">
                      <Text className="text-[9px] font-work-sans-bold text-white uppercase tracking-widest">
                        Most Popular
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-start mt-1">
                      <View className="flex-1 mr-2">
                        <Text className="font-work-sans-bold text-sm text-of-primary">{tier.name}</Text>
                        <Text className="text-xs text-ed-on-surface-variant">
                          {tier.description}
                        </Text>
                      </View>
                      <Text className="font-work-sans-bold text-of-primary">
                        {formatCurrency(tier.price ?? 0)}
                      </Text>
                    </View>
                    {tier.features?.length > 0 && (
                      <View className="mt-3 gap-2">
                        {tier.features.map((f: string, i: number) => (
                          <View key={i} className="flex-row items-center gap-2">
                            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                            <Text className="text-xs text-of-muted">{f}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View
                    key={tier.id}
                    className="p-5 rounded-xl bg-of-surface border border-of-border"
                    style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-2">
                        <Text className="font-work-sans-bold text-sm text-of-text">{tier.name}</Text>
                        <Text className="text-xs text-of-muted">{tier.description}</Text>
                      </View>
                      <Text className="font-work-sans-bold text-of-text">
                        {formatCurrency(tier.price ?? 0)}
                      </Text>
                    </View>
                  </View>
                ),
              )}
            </View>
          )}
        </View>

        {/* ═══ 7. Availability ═══ */}
        <View className="px-5 mt-10">
          <View className="p-6 rounded-2xl bg-of-pale border border-of-border">
            <View className="flex-row items-start gap-4">
              <View className="w-10 h-10 rounded-full bg-of-pale items-center justify-center border border-of-border">
                <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-work-sans-bold text-of-text mb-1">Availability</Text>
                <Text className="text-sm text-of-muted leading-relaxed">
                  Interested in this vendor? Request a quote to check their availability for your date.
                </Text>
                <Pressable
                  onPress={() => router.push(`/booking/${id}`)}
                  className="flex-row items-center gap-1 mt-4"
                >
                  <Text className="text-sm font-work-sans-bold text-of-primary">
                    Check available dates
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ═══ 8. Meet the Team ═══ */}
        {team.length > 0 && (
          <View className="px-5 mt-10">
            <SectionTitle>Meet the Team</SectionTitle>
            <View className="gap-3">
              {team.map((member) => (
                <View
                  key={member.id}
                  className="flex-row items-center gap-4 p-4 bg-of-surface rounded-xl border border-of-border"
                  style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
                >
                  <View className="w-20 h-20 rounded-full bg-of-pale items-center justify-center overflow-hidden">
                    {member.avatar ? (
                      <Image source={{ uri: member.avatar }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="font-work-sans-bold text-of-primary text-xl">
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-work-sans-bold text-of-text">{member.name}</Text>
                    {member.role && (
                      <Text className="text-xs font-work-sans-bold text-of-primary uppercase mb-2">
                        {member.role}
                      </Text>
                    )}
                    {member.bio && (
                      <Text className="text-xs text-of-muted leading-tight">{member.bio}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ═══ 9. Reviews ═══ */}
        <View className="px-5 mt-10">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="font-playfair-bold text-xl text-of-text">{reviewCount} reviews</Text>
            {displayRating != null && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text className="font-work-sans-bold text-of-text">{displayRating}</Text>
              </View>
            )}
          </View>

          {reviews.length === 0 ? (
            <EmptyState text="No reviews yet. Be the first to book and share your experience." />
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                className="bg-of-surface rounded-xl p-5 border border-of-border mb-3"
                style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
              >
                <View className="flex-row items-start gap-3 mb-3">
                  <View className="w-10 h-10 rounded-full bg-of-primary items-center justify-center">
                    <Text className="font-work-sans-bold text-white text-sm">
                      {review.user?.name?.charAt(0) ?? '?'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="font-work-sans-bold text-sm text-of-text">
                        {review.user?.name}
                      </Text>
                      {review.created_at && (
                        <Text className="text-[10px] text-of-muted">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row gap-0.5 mt-0.5">
                      {Array.from({ length: Math.round(review.rating ?? 0) }).map((_, i) => (
                        <Ionicons key={i} name="star" size={12} color="#f59e0b" />
                      ))}
                    </View>
                  </View>
                </View>
                <Text className="text-sm text-of-muted leading-relaxed">{review.content}</Text>
              </View>
            ))
          )}
        </View>

        {/* ═══ 10. Location ═══ */}
        {(displayAddress || displayLocation) && (
          <View className="px-5 mt-10">
            <SectionTitle>Location and service area</SectionTitle>
            <View className="flex-row items-start gap-2 mb-3">
              <Ionicons name="location-sharp" size={18} color={colors.primary} />
              <Text className="text-sm text-of-muted flex-1">{displayAddress ?? displayLocation}</Text>
            </View>
            <Pressable
              onPress={() => {
                const query = encodeURIComponent(displayAddress ?? displayLocation ?? '');
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
              }}
              className="flex-row items-center gap-1.5 self-start"
            >
              <Ionicons name="map-outline" size={16} color={colors.primary} />
              <Text className="text-sm font-work-sans-bold text-of-primary">Open in Maps</Text>
            </Pressable>
          </View>
        )}

        {/* ═══ 11. Connect ═══ */}
        {connectLinks.length > 0 && (
          <View className="px-5 mt-10 mb-12">
            <SectionTitle>Connect with this vendor</SectionTitle>
            <View>
              {connectLinks.map((link, i) => (
                <Pressable
                  key={link.label}
                  onPress={link.onPress}
                  className={`flex-row items-center gap-4 py-3.5 ${
                    i < connectLinks.length - 1 ? 'border-b border-of-border' : ''
                  }`}
                >
                  <Ionicons name={link.icon} size={20} color={colors.primary} />
                  <Text className="flex-1 font-work-sans-medium text-of-text">{link.label}</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacer for sticky CTA */}
        <View className="h-[100px]" />
      </ScrollView>

      {/* ═══ Sticky CTA ═══ */}
      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          paddingHorizontal: 16, paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          backgroundColor: editorial.surfaceContainerLowest,
          borderTopWidth: 1, borderTopColor: editorial.outlineVariant,
        }}
      >
        <Pressable
          onPress={() => router.push(`/booking/${id}`)}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16, borderRadius: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 6,
          }}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text className="font-work-sans-bold text-base text-white">Request a quote</Text>
        </Pressable>
      </View>
    </View>
  );
}
