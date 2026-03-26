import { View, Text, ScrollView, Pressable, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { getVendorById, getVendorReviews, getVendorPackages } from '@/lib/api/vendors';
import { formatCurrency } from '@opusfesta/lib';
import { colors } from '@/constants/theme';

const HERO_HEIGHT = 384;

// ── Fallback data ──
const FALLBACK_TIERS = [
  { id: '1', name: 'Intimate Garden Ceremony', description: 'Up to 50 guests \u2022 4 hours', price: 1200000 },
  {
    id: '2',
    name: 'Classic Reception',
    description: 'Up to 200 guests \u2022 Full day',
    price: 5000000,
    popular: true,
    features: [
      'Choice of 3 garden locations',
      'Basic site management & security',
      'Bridal preparation suite',
    ],
  },
  { id: '3', name: 'The Arboretum Gala', description: 'Up to 300 guests \u2022 Exclusive access', price: 8500000 },
];

const FALLBACK_DETAILS = {
  amenities:
    'Ceremony Area, Covered Outdoors Space, Dressing Room, Handicap Accessible, Indoor Event Space, Liability Insurance, Outdoor Event Space, Reception Area, Wireless Internet',
  ceremony_types:
    'Civil Union, Commitment Ceremony, Elopement, Interfaith Ceremony, Non-Religious Ceremony, Religious Ceremony, Second Wedding, Vow Renewal Ceremony',
  settings: 'Ballroom, Garden, Historic Venue, Museum, Park, Tented, Trees',
  service_offerings: 'Service Staff, Transportation',
};

const FALLBACK_REVIEW = {
  id: '1',
  user: { name: 'Lex C', initials: 'L' },
  rating: 5,
  date: '09/02/25',
  content:
    "It's 52 days later and we (and our guests) are still absolutely gushing over our outdoor, tented reception...",
  highlighted: true,
};

const FALLBACK_TEAM = {
  name: 'Sarah Johnson',
  role: 'Venue Coordinator',
  quote:
    "I've helped over 200 couples realize their dream garden wedding. I can't wait to hear your story!",
};

const CONNECT_LINKS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'call-outline', label: 'Call' },
  { icon: 'globe-outline', label: 'Website' },
  { icon: 'logo-whatsapp', label: 'WhatsApp' },
  { icon: 'logo-instagram', label: 'Instagram' },
  { icon: 'logo-facebook', label: 'Facebook' },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="font-playfair-bold text-xl text-of-text mb-4">{children}</Text>
  );
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-dm-sans-bold text-of-text mb-1.5">{title}</Text>
      <Text className="text-sm text-of-muted leading-relaxed">{text}</Text>
    </View>
  );
}

export default function VendorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: vendor } = useQuery({
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

  const displayName = vendor?.business_name ?? 'Norfolk Botanical Garden';
  const displayLocation = vendor?.location?.city ?? 'Dar es Salaam';
  const displayAddress = vendor?.location?.address ?? '6700 Azalea Garden Road, Norfolk';
  const displayPrice = vendor?.price_range?.min ?? 5000000;
  const displayRating = vendor?.stats?.rating_avg ?? 4.6;
  const reviewCount = vendor?.stats?.reviewCount ?? 22;
  const displayCategory = vendor?.category ?? 'Wedding Venue';
  const displayCapacity = 'Up to 300 guests';
  const displayDescription =
    vendor?.description ??
    'Norfolk Botanical Garden, located in the heart of Dar es Salaam, is a picturesque outdoor wedding venue spanning over 175 acres. With lush landscapes, water views on three sides, and curated floral displays, it offers a serene and scenic setting for weddings of all sizes.';
  const isVerified = vendor?.verified ?? true;
  const heroImage = vendor?.cover_image ?? null;

  const tiers =
    packages.length > 0
      ? packages.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          popular: p.is_featured,
          features: p.features ?? [],
        }))
      : FALLBACK_TIERS;

  const displayReviews = reviews.length > 0 ? reviews : [FALLBACK_REVIEW];

  const contactInfo = vendor?.contact_info ?? {};

  return (
    <View className="flex-1 bg-br-bg">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ═══ 1. Hero Image ═══ */}
        <View style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
          {heroImage ? (
            <Image
              source={{ uri: heroImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#5B2D8E', '#7B4FA2', '#C9A0DC']}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 72 }}>🌿</Text>
            </LinearGradient>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
          />
          {/* Nav buttons */}
          <View
            style={{
              position: 'absolute',
              top: insets.top + 8,
              left: 16,
              right: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <Pressable
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="heart-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* ═══ 2. Title Card ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: -48 }}>
          <View
            className="bg-white rounded-xl p-6"
            style={{
              shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 }, elevation: 4,
              borderWidth: 1, borderColor: 'rgba(91,45,142,0.05)',
            }}
          >
            <Text className="font-playfair-bold text-2xl text-of-text mb-1">
              {displayName}
            </Text>
            <View className="flex-row items-center gap-1 mb-4">
              <Ionicons name="location-sharp" size={14} color={colors.muted} />
              <Text className="text-sm text-of-muted">{displayLocation}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] uppercase tracking-widest text-of-muted font-dm-sans-bold">
                  Starting from
                </Text>
                <Text className="text-xl font-dm-sans-bold text-of-primary">
                  {formatCurrency(displayPrice)}
                </Text>
              </View>
              {isVerified && (
                <View className="flex-row items-center gap-1 bg-green-50 rounded-full px-3 py-1.5 border border-green-100">
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text className="text-[10px] font-dm-sans-bold text-green-700 uppercase">
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
            <Text className="text-[10px] font-dm-sans-bold text-of-primary uppercase tracking-tight">
              {displayCategory}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-amber-50 rounded-xl px-3 h-8 border border-amber-100">
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text className="text-[10px] font-dm-sans-bold text-amber-700 uppercase tracking-tight">
              {displayRating} Rating
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 bg-slate-100 rounded-xl px-3 h-8 border border-slate-200">
            <Ionicons name="people-outline" size={14} color="#475569" />
            <Text className="text-[10px] font-dm-sans-bold text-slate-700 uppercase tracking-tight">
              {displayCapacity}
            </Text>
          </View>
        </ScrollView>

        {/* ═══ 4. About ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <SectionTitle>About this Vendor</SectionTitle>
          <Text className="text-sm text-of-muted leading-relaxed">{displayDescription}</Text>
        </View>

        {/* ═══ 5. Details ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
          <SectionTitle>Details</SectionTitle>
          <DetailBlock title="Amenities" text={FALLBACK_DETAILS.amenities} />
          <DetailBlock title="Ceremony types" text={FALLBACK_DETAILS.ceremony_types} />
          <DetailBlock title="Settings" text={FALLBACK_DETAILS.settings} />
          <DetailBlock title="Venue service offerings" text={FALLBACK_DETAILS.service_offerings} />
        </View>

        {/* ═══ 6. Packages & Pricing ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <SectionTitle>Packages & Pricing</SectionTitle>
          <View className="gap-4">
            {tiers.map((tier: any) =>
              tier.popular ? (
                <View
                  key={tier.id}
                  className="p-5 rounded-xl relative"
                  style={{ borderWidth: 2, borderColor: colors.primary, backgroundColor: 'rgba(91,45,142,0.02)' }}
                >
                  <View
                    style={{
                      position: 'absolute', top: -12, left: 16,
                      backgroundColor: colors.primary,
                      paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
                    }}
                  >
                    <Text className="text-[9px] font-dm-sans-bold text-white uppercase tracking-widest">
                      Most Popular
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-start mt-1">
                    <View className="flex-1 mr-2">
                      <Text className="font-dm-sans-bold text-sm text-of-primary">{tier.name}</Text>
                      <Text className="text-xs" style={{ color: 'rgba(91,45,142,0.6)' }}>
                        {tier.description}
                      </Text>
                    </View>
                    <Text className="font-dm-sans-bold text-of-primary">
                      {formatCurrency(tier.price)}
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
                  className="p-5 rounded-xl bg-white border border-of-border"
                  style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                      <Text className="font-dm-sans-bold text-sm text-of-text">{tier.name}</Text>
                      <Text className="text-xs text-of-muted">{tier.description}</Text>
                    </View>
                    <Text className="font-dm-sans-bold text-of-text">
                      {formatCurrency(tier.price)}
                    </Text>
                  </View>
                </View>
              ),
            )}
          </View>
        </View>

        {/* ═══ 7. Availability ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
          <View className="p-6 rounded-2xl bg-of-pale border border-of-border">
            <View className="flex-row items-start gap-4">
              <View className="w-10 h-10 rounded-full bg-of-pale items-center justify-center border border-of-border">
                <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-dm-sans-bold text-of-text mb-1">Availability</Text>
                <Text className="text-sm text-of-muted leading-relaxed">
                  Looking for the perfect match? We currently have limited dates for 2025. Continue browsing or request a date to check specific availability.
                </Text>
                <Pressable className="flex-row items-center gap-1 mt-4">
                  <Text className="text-sm font-dm-sans-bold text-of-primary">
                    Check available dates
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* ═══ 8. Meet the Team ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
          <SectionTitle>Meet the Team</SectionTitle>
          <View
            className="flex-row items-center gap-4 p-4 bg-white rounded-xl border border-of-border"
            style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
          >
            <View className="w-20 h-20 rounded-full bg-of-pale items-center justify-center overflow-hidden">
              <Text style={{ fontSize: 32 }}>👩</Text>
            </View>
            <View className="flex-1">
              <Text className="font-dm-sans-bold text-of-text">{FALLBACK_TEAM.name}</Text>
              <Text className="text-xs font-dm-sans-bold text-of-primary uppercase mb-2">
                {FALLBACK_TEAM.role}
              </Text>
              <Text className="text-xs text-of-muted leading-tight italic">
                "{FALLBACK_TEAM.quote}"
              </Text>
            </View>
          </View>
        </View>

        {/* ═══ 9. Reviews ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
          <View className="flex-row items-center justify-between mb-5">
            <Text className="font-playfair-bold text-xl text-of-text">{reviewCount} reviews</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text className="font-dm-sans-bold text-of-text">{displayRating}</Text>
            </View>
          </View>

          {displayReviews.map((review: any) => (
            <View
              key={review.id}
              className="bg-white rounded-xl p-5 border border-of-border mb-3"
              style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
            >
              {review.highlighted && (
                <View className="bg-slate-100 self-start px-2 py-0.5 rounded mb-3">
                  <Text className="text-[10px] font-dm-sans-bold text-of-muted uppercase tracking-wider">
                    Highlighted review
                  </Text>
                </View>
              )}
              <View className="flex-row items-start gap-3 mb-3">
                <View className="w-10 h-10 rounded-full bg-of-primary items-center justify-center">
                  <Text className="font-dm-sans-bold text-white text-sm">
                    {review.user?.initials ?? review.user?.name?.charAt(0) ?? '?'}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <Text className="font-dm-sans-bold text-sm text-of-text">
                      {review.user?.name}
                    </Text>
                    {review.date && (
                      <Text className="text-[10px] text-of-muted">{review.date}</Text>
                    )}
                  </View>
                  <View className="flex-row gap-0.5 mt-0.5">
                    {Array.from({ length: review.rating ?? 5 }).map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#f59e0b" />
                    ))}
                  </View>
                </View>
              </View>
              <Text className="text-sm text-of-muted leading-relaxed">
                {review.content}
                <Text className="text-of-primary font-dm-sans-bold"> Read more</Text>
              </Text>
            </View>
          ))}

          <Pressable className="py-3 rounded-full border border-of-primary items-center mt-3">
            <Text className="text-sm font-dm-sans-bold text-of-primary">
              See all {reviewCount} reviews
            </Text>
          </Pressable>
        </View>

        {/* ═══ 10. Location ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 40 }}>
          <SectionTitle>Location and service area</SectionTitle>
          {/* Map placeholder */}
          <View
            className="rounded-xl overflow-hidden mb-4 items-center justify-center"
            style={{ height: 200, backgroundColor: '#e2e8f0' }}
          >
            <View className="bg-white p-3 rounded-full" style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}>
              <Ionicons name="location" size={28} color={colors.primary} />
            </View>
          </View>
          <View className="flex-row items-start gap-2">
            <Ionicons name="location-sharp" size={18} color={colors.primary} />
            <Text className="text-sm text-of-muted flex-1">{displayAddress}</Text>
          </View>
        </View>

        {/* ═══ 11. Connect ═══ */}
        <View style={{ paddingHorizontal: 20, marginTop: 40, marginBottom: 48 }}>
          <SectionTitle>Connect with this vendor</SectionTitle>
          <View>
            {CONNECT_LINKS.map((link, i) => (
              <Pressable
                key={link.label}
                className={`flex-row items-center gap-4 py-3.5 ${
                  i < CONNECT_LINKS.length - 1 ? 'border-b border-of-border' : ''
                }`}
              >
                <Ionicons name={link.icon} size={20} color={colors.primary} />
                <Text className="flex-1 font-dm-sans-medium text-of-text">{link.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bottom spacer for sticky CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══ Sticky CTA ═══ */}
      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          paddingHorizontal: 16, paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 1, borderTopColor: 'rgba(91,45,142,0.06)',
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
          <Text className="font-dm-sans-bold text-base text-white">Request a quote</Text>
        </Pressable>
      </View>
    </View>
  );
}
