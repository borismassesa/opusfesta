import { Pressable, Text } from 'react-native';
import { editorial, shadowSoftSm } from '@/constants/theme';

interface CategoryPillProps {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export function CategoryPill({
  label,
  active = false,
  onPress,
}: CategoryPillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          borderRadius: 9999,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderWidth: active ? 1.5 : 1,
          backgroundColor: active ? editorial.primaryContainer : editorial.surfaceContainerLowest,
          borderColor: active ? editorial.primaryContainer : editorial.outlineVariant,
        },
        active ? shadowSoftSm : {},
      ]}
    >
      <Text
        style={{
          fontFamily: 'WorkSans-Bold',
          fontSize: 13,
          letterSpacing: 0.5,
          color: active ? editorial.onPrimary : editorial.onSurfaceVariant,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
