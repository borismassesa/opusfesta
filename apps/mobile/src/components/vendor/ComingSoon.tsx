import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useTheme } from '@/theme/useTheme';

export function ComingSoon({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  const { editorial } = useTheme();
  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-center pt-20 px-6">
        <Ionicons name={icon} size={40} color={editorial.primaryContainer} />
        <Text className="font-playfair-bold text-xl text-ed-on-surface mt-4 text-center">
          {title}
        </Text>
        <Text className="font-work-sans text-sm text-ed-on-surface-variant mt-2 text-center leading-5">
          {body}
        </Text>
      </View>
    </ScreenWrapper>
  );
}
