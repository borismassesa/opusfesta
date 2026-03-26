import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { brutalist, brutalistShadow } from '@/constants/theme';
import { useCoupleOnboarding } from './_layout';

export default function CongratsScreen() {
  const router = useRouter();
  const { data } = useCoupleOnboarding();

  const partner1 = data.names?.partner1FirstName || 'You';
  const partner2 = data.names?.partner2FirstName || '';
  const names = partner2 ? `${partner1} & ${partner2}` : partner1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      {/* Decorative blurs */}
      <View style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(66,20,104,0.06)' }} />
      <View style={{ position: 'absolute', top: '25%', right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(219,180,254,0.15)' }} />

      <Pressable
        onPress={() => router.push('/(onboarding)/couple/step2-planning-stage')}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}
      >
        {/* Hero image placeholder */}
        <View
          style={[
            {
              width: '100%',
              height: 220,
              borderRadius: 12,
              backgroundColor: brutalist.surfaceContainerHighest,
              marginBottom: 32,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            },
            brutalistShadow,
          ]}
        >
          <Ionicons name="sparkles" size={64} color={brutalist.onPrimaryContainer} style={{ opacity: 0.4 }} />
        </View>

        {/* Label */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 11,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: brutalist.onSecondaryContainer,
            marginBottom: 12,
          }}
        >
          The Journey Begins
        </Text>

        {/* Headline */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 32,
            lineHeight: 36,
            letterSpacing: -1,
            color: brutalist.onSurface,
            textAlign: 'center',
          }}
        >
          {names},{'\n'}
          <Text style={{ color: brutalist.onPrimaryContainer }}>congratulations!</Text>
        </Text>

        {/* Body */}
        <Text
          style={{
            fontFamily: 'WorkSans-Regular',
            fontSize: 17,
            lineHeight: 26,
            color: brutalist.onSurfaceVariant,
            textAlign: 'center',
            marginTop: 16,
            maxWidth: 340,
          }}
        >
          Let's build your wedding plan together. Your unique celebration deserves a curated masterpiece.
        </Text>

        {/* CTA */}
        <Pressable
          onPress={() => router.push('/(onboarding)/couple/step2-planning-stage')}
          style={[
            {
              backgroundColor: brutalist.primaryContainer,
              paddingVertical: 18,
              paddingHorizontal: 40,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 32,
            },
            brutalistShadow,
          ]}
        >
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: brutalist.onPrimary }}>
            Let's Go
          </Text>
          <Ionicons name="arrow-forward" size={22} color={brutalist.onPrimary} />
        </Pressable>

        {/* Decorative chips */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
          {['Traditional', 'Gala', 'Destination'].map((label) => (
            <View
              key={label}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: label === 'Traditional' ? brutalist.tertiaryFixed : label === 'Destination' ? '#f0dbff' : brutalist.surfaceContainerHigh,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: 'WorkSans-SemiBold',
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: brutalist.onSurfaceVariant,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
