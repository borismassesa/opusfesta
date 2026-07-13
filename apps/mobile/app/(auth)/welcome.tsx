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
    <View className="flex-1" style={{ backgroundColor: editorial.bg }}>
      {/* ─── Top: Hero ─── */}
      <View className="relative overflow-hidden" style={{ flex: 0.45 }}>
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
        <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0">
          <View className="flex-row items-center px-6 pt-2">
            <Image
              source={logoMark}
              className="w-8 h-8"
              resizeMode="contain"
            />
            <Text
              className="font-space-grotesk-bold text-lg tracking-[-0.5px] ml-2"
              style={{ color: '#fff' }}
            >
              OpusFesta
            </Text>
          </View>
        </SafeAreaView>

        {/* Tagline over video bottom */}
        <View className="absolute bottom-6 left-6 right-6">
          <Text
            className="font-playfair-bold text-[32px] leading-[38px]"
            style={{ color: '#fff' }}
          >
            Plan Less.{'\n'}
            <Text style={{ color: purpleTints[300] }}>Celebrate More.</Text>
          </Text>
        </View>
      </View>

      {/* ─── Bottom: Content + CTAs ─── */}
      <SafeAreaView edges={['bottom']} style={{ flex: 0.55, backgroundColor: editorial.bg }}>
        <View className="flex-1 px-6 pt-6">
          {/* Subtitle */}
          <Text
            className="font-work-sans text-[15px] leading-[22px]"
            style={{ color: editorial.onSurfaceVariant }}
          >
            Discover East Africa's premier wedding vendors and create moments that last a lifetime.
          </Text>

          {/* Stats row */}
          <View className="flex-row mt-5 gap-2">
            {[
              { value: '500+', label: 'Vendors', emoji: '✨' },
              { value: '12k+', label: 'Events', emoji: '💍' },
              { value: '4.9', label: 'Rating', emoji: '⭐' },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 rounded-[10px] py-3 items-center border"
                style={{ backgroundColor: purpleTints[50], borderColor: purpleTints[150] }}
              >
                <Text className="text-base mb-1">{stat.emoji}</Text>
                <Text
                  className="font-space-grotesk-bold text-lg"
                  style={{ color: purpleTints[700] }}
                >
                  {stat.value}
                </Text>
                <Text
                  className="font-work-sans-bold text-[9px] tracking-[1px] uppercase mt-0.5"
                  style={{ color: editorial.outline }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Primary CTA */}
          <Pressable
            onPress={() => router.push('/(auth)/sign-up?role=couple')}
            className="rounded-full items-center justify-center flex-row gap-2 py-[18px]"
            style={[{ backgroundColor: purpleTints[700] }, shadowSoftPrimary]}
          >
            <Text
              className="font-space-grotesk-bold text-[17px]"
              style={{ color: '#fff' }}
            >
              Get Started
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            className="mt-3 py-4 rounded-full items-center justify-center border"
            style={[
              { borderColor: editorial.outlineVariant, backgroundColor: editorial.surfaceContainerLowest },
              shadowSoftSm,
            ]}
          >
            <Text
              className="font-space-grotesk-bold text-[15px]"
              style={{ color: editorial.onSurface }}
            >
              I already have an account
            </Text>
          </Pressable>

          {/* Vendor link */}
          <Pressable
            onPress={() => router.push('/(auth)/sign-up?role=vendor')}
            className="items-center mt-4 pb-2"
          >
            <Text
              className="font-work-sans-bold text-xs"
              style={{ color: purpleTints[500] }}
            >
              Are you a vendor?{' '}
              <Text className="underline">Join as a partner</Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
