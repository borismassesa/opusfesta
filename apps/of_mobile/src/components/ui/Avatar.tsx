import { View, Text, Image } from 'react-native';
import { shadowSoftSm } from '@/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name?: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { dim: string; text: string }> = {
  sm: { dim: 'w-9 h-9', text: 'text-xs' },
  md: { dim: 'w-11 h-11', text: 'text-sm' },
  lg: { dim: 'w-20 h-20', text: 'text-[28px]' },
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  name,
  imageUrl,
  size = 'md',
  className = '',
}: AvatarProps) {
  const s = sizeClasses[size];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={`${className} ${s.dim} rounded-full`}
      />
    );
  }

  return (
    <View
      className={`${className} ${s.dim} rounded-full bg-ed-secondary-container items-center justify-center`}
      style={shadowSoftSm}
    >
      <Text className={`font-space-grotesk-bold ${s.text} text-ed-tertiary-container`}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
