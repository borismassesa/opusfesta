import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import { useCoupleOnboarding } from './_layout';

export default function CongratsScreen() {
  const router = useRouter();
  const { data } = useCoupleOnboarding();
  const { editorial } = useTheme();

  const partner1 = data.names?.partner1FirstName || 'You';
  const partner2 = data.names?.partner2FirstName || '';
  const names = partner2 ? `${partner1} & ${partner2}` : partner1;

  return (
    <SafeAreaView className="flex-1 bg-ed-bg">
      {/* Decorative blurs */}
      <View className="absolute -top-10 -left-10 w-[200px] h-[200px] rounded-full bg-[rgba(66,20,104,0.06)]" />
      <View className="absolute -right-[60px] w-[240px] h-[240px] rounded-full bg-[rgba(219,180,254,0.15)]" style={{ top: '25%' }} />

      <Pressable
        onPress={() => router.push('/(onboarding)/couple/step2-planning-stage')}
        className="flex-1 items-center justify-center px-7"
      >
        {/* Hero image placeholder */}
        <View
          className="w-full h-[220px] rounded-xl bg-ed-surface-container-highest mb-8 overflow-hidden items-center justify-center"
          style={shadowSoft}
        >
          <Ionicons name="sparkles" size={64} color={editorial.onPrimaryContainer} style={{ opacity: 0.4 }} />
        </View>

        {/* Label */}
        <Text className="font-space-grotesk-bold text-[11px] tracking-[4px] uppercase text-ed-on-secondary-container mb-3">
          The Journey Begins
        </Text>

        {/* Headline */}
        <Text className="font-playfair-bold text-[32px] leading-9 text-ed-on-surface text-center">
          {names},{'\n'}
          <Text className="text-ed-on-primary-container">congratulations!</Text>
        </Text>

        {/* Body */}
        <Text className="font-work-sans text-[17px] leading-[26px] text-ed-on-surface-variant text-center mt-4 max-w-[340px]">
          Let's build your wedding plan together. Your unique celebration deserves a curated masterpiece.
        </Text>

        {/* CTA */}
        <Pressable
          onPress={() => router.push('/(onboarding)/couple/step2-planning-stage')}
          className="bg-ed-primary-container py-[18px] px-10 rounded-xl flex-row items-center gap-2.5 mt-8"
          style={shadowSoft}
        >
          <Text className="font-space-grotesk-bold text-xl text-ed-on-primary">
            Let's Go
          </Text>
          <Ionicons name="arrow-forward" size={22} color={editorial.onPrimary} />
        </Pressable>

        {/* Decorative chips */}
        <View className="flex-row gap-2.5 mt-6">
          {['Traditional', 'Gala', 'Destination'].map((label) => (
            <View
              key={label}
              className={`px-4 py-2 rounded-[20px] ${
                label === 'Traditional' ? 'bg-ed-tertiary-fixed' : label === 'Destination' ? 'bg-[#f0dbff]' : 'bg-ed-surface-container-high'
              }`}
            >
              <Text className="font-work-sans-semibold text-[10px] tracking-[2px] uppercase text-ed-on-surface-variant">
                {label}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
