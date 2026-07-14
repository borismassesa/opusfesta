import { Pressable, Text } from 'react-native';
import { shadowSoftSm } from '@/constants/theme';

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
      className={
        active
          ? 'rounded-full px-4 py-2 border-[1.5px] bg-ed-primary-container border-ed-primary-container'
          : 'rounded-full px-4 py-2 border border-ed-outline-variant bg-ed-surface-container-lowest'
      }
      style={active ? shadowSoftSm : undefined}
    >
      <Text className={`font-work-sans-bold text-[13px] tracking-[0.5px] ${active ? 'text-ed-on-primary' : 'text-ed-on-surface-variant'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
