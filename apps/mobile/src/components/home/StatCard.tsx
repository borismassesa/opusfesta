import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  onPress: () => void;
}

export function StatCard({ icon, value, label, onPress }: StatCardProps) {
  const { editorial } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: editorial.surfaceContainerLowest,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'flex-start',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={icon} size={16} color={editorial.tertiaryContainer} />
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: editorial.onSurface }} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Text
        style={{ fontFamily: 'WorkSans-Regular', fontSize: 11, color: editorial.onSurfaceVariant, marginTop: 4 }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
