import { Pressable, Text } from 'react-native';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

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
  const { editorial } = useTheme();
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
