import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { editorial, shadowSoftSm, shadowSoftPrimary, purpleTints } from '@/constants/theme';

const logoMark = require('../../assets/images/logo-mark.png');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: editorial.bg }}>
      {/* ─── Top: Hero ─── */}
      <View style={{ flex: 0.45, position: 'relative', overflow: 'hidden' }}>
        <LinearGradient
          colors={[purpleTints[200], purpleTints[300], purpleTints[400]]}
          style={StyleSheet.absoluteFill}
        />
        {/* Dark overlay for readability */}
        <LinearGradient
          colors={['transparent', 'rgba(26,10,46,0.4)', 'rgba(26,10,46,0.7)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Logo on top of video */}
        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 }}>
            <Image
              source={logoMark}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 18,
                color: '#fff',
                letterSpacing: -0.5,
                marginLeft: 8,
              }}
            >
              OpusFesta
            </Text>
          </View>
        </SafeAreaView>

        {/* Tagline over video bottom */}
        <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <Text
            style={{
              fontFamily: 'PlayfairDisplay-Bold',
              fontSize: 32,
              lineHeight: 38,
              color: '#fff',
            }}
          >
            Plan Less.{'\n'}
            <Text style={{ color: purpleTints[300] }}>Celebrate More.</Text>
          </Text>
        </View>
      </View>

      {/* ─── Bottom: Content + CTAs ─── */}
      <SafeAreaView edges={['bottom']} style={{ flex: 0.55, backgroundColor: editorial.bg }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Subtitle */}
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 15,
              lineHeight: 22,
              color: editorial.onSurfaceVariant,
            }}
          >
            Discover East Africa's premier wedding vendors and create moments that last a lifetime.
          </Text>

          {/* Stats row */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              gap: 8,
            }}
          >
            {[
              { value: '500+', label: 'Vendors', emoji: '✨' },
              { value: '12k+', label: 'Events', emoji: '💍' },
              { value: '4.9', label: 'Rating', emoji: '⭐' },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[
                  {
                    flex: 1,
                    backgroundColor: purpleTints[50],
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: purpleTints[150],
                  },
                ]}
              >
                <Text style={{ fontSize: 16, marginBottom: 4 }}>{stat.emoji}</Text>
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk-Bold',
                    fontSize: 18,
                    color: purpleTints[700],
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontFamily: 'WorkSans-Bold',
                    fontSize: 9,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: editorial.outline,
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Primary CTA */}
          <Pressable
            onPress={() => router.push('/(auth)/sign-up?role=couple')}
            style={[
              {
                backgroundColor: purpleTints[700],
                paddingVertical: 18,
                borderRadius: 9999,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              },
              shadowSoftPrimary,
            ]}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 17,
                color: '#fff',
              }}
            >
              Get Started
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            style={[
              {
                marginTop: 12,
                paddingVertical: 16,
                borderRadius: 9999,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: editorial.outlineVariant,
                backgroundColor: editorial.surfaceContainerLowest,
              },
              shadowSoftSm,
            ]}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 15,
                color: editorial.onSurface,
              }}
            >
              I already have an account
            </Text>
          </Pressable>

          {/* Vendor link */}
          <Pressable
            onPress={() => router.push('/(auth)/sign-up?role=vendor')}
            style={{ alignItems: 'center', marginTop: 16, paddingBottom: 8 }}
          >
            <Text
              style={{
                fontFamily: 'WorkSans-Bold',
                fontSize: 12,
                color: purpleTints[500],
              }}
            >
              Are you a vendor?{' '}
              <Text style={{ textDecorationLine: 'underline' }}>Join as a partner</Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
