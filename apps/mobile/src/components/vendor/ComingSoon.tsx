import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { editorial } from '@/constants/theme';

export function ComingSoon({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return (
    <ScreenWrapper>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 24 }}>
        <Ionicons name={icon} size={40} color={editorial.primaryContainer} />
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: editorial.onSurface, marginTop: 16, textAlign: 'center' }}>
          {title}
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: editorial.onSurfaceVariant, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          {body}
        </Text>
      </View>
    </ScreenWrapper>
  );
}
