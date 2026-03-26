import { Pressable, Text } from 'react-native';
import { brutalist, brutalistShadowSm } from '@/constants/theme';

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
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderWidth: 2,
          backgroundColor: active ? brutalist.primaryContainer : brutalist.surfaceContainerLowest,
          borderColor: active ? brutalist.primaryContainer : brutalist.outlineVariant,
        },
        active ? brutalistShadowSm : {},
      ]}
    >
      <Text
        style={{
          fontFamily: 'WorkSans-Bold',
          fontSize: 13,
          letterSpacing: 0.5,
          color: active ? brutalist.onPrimary : brutalist.onSurfaceVariant,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
