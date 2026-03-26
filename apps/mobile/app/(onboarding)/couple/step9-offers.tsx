import { useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrutalistStepContainer } from '@/components/onboarding/BrutalistStepContainer';
import { brutalist, brutalistShadow } from '@/constants/theme';
import { useCoupleOnboarding } from './_layout';

const OFFERS = [
  {
    id: 'serengeti_sands',
    badge: 'Venue Spotlight',
    name: 'Serengeti Sands Resort',
    description: 'Get 15% off your booking fee and a complimentary champagne reception for up to 50 guests.',
  },
  {
    id: 'swahili_flavors',
    badge: 'Catering',
    name: 'Swahili Flavors Elite',
    description: 'Complimentary tasting session for up to 4 guests when you book a full catering package.',
  },
  {
    id: 'premium_planner',
    badge: 'Planning',
    name: 'Premium Planner Access',
    description: 'Get 1 month of premium planning tools free when you complete your profile today.',
  },
];

export default function OffersStep() {
  const router = useRouter();
  const [claimAll, setClaimAll] = useState(false);
  const [claimed, setClaimed] = useState<string[]>([]);

  const toggleClaim = (id: string) => {
    setClaimed((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    router.push('/(onboarding)/couple/step10-complete');
  };

  return (
    <BrutalistStepContainer
      title="Exclusive offers from our partners"
      subtitle="We've curated special deals from East Africa's top vendors to make your celebration even more memorable."
      currentStep={9}
      totalSteps={9}
      onNext={handleNext}
      onBack={() => router.back()}
      nextLabel="Sign me up"
      showSkip
      onSkip={handleNext}
    >
      <View style={{ gap: 16, marginTop: 4 }}>
        {/* Claim all toggle */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            backgroundColor: brutalist.surfaceContainerLow,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: brutalist.onSurface }}>
            Claim all available offers
          </Text>
          <Switch
            value={claimAll}
            onValueChange={(val) => {
              setClaimAll(val);
              setClaimed(val ? OFFERS.map((o) => o.id) : []);
            }}
            trackColor={{ false: brutalist.surfaceContainerHighest, true: brutalist.primaryContainer }}
            thumbColor="#fff"
          />
        </View>

        {/* Offer Cards */}
        {OFFERS.map((offer) => {
          const isActive = claimed.includes(offer.id) || claimAll;
          return (
            <Pressable
              key={offer.id}
              onPress={() => toggleClaim(offer.id)}
              style={[
                {
                  backgroundColor: brutalist.surfaceContainerHighest,
                  borderRadius: 12,
                  overflow: 'hidden',
                },
                brutalistShadow,
              ]}
            >
              {/* Image placeholder */}
              <View
                style={{
                  height: 120,
                  backgroundColor: brutalist.surfaceContainerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="gift-outline" size={40} color={brutalist.onSurfaceVariant} style={{ opacity: 0.3 }} />
              </View>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <View
                    style={{
                      backgroundColor: brutalist.tertiaryFixed,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: brutalist.onTertiaryFixed }}>
                      {offer.badge}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: brutalist.onSurface,
                      backgroundColor: isActive ? brutalist.primaryContainer : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isActive && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </View>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: brutalist.onSurface, marginBottom: 6 }}>
                  {offer.name}
                </Text>
                <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, lineHeight: 19, color: brutalist.onSurfaceVariant }}>
                  {offer.description}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <Ionicons name="checkmark-circle" size={14} color={brutalist.primaryContainer} />
                  <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: brutalist.primaryContainer, fontStyle: 'italic' }}>
                    Verified Partner
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </BrutalistStepContainer>
  );
}
