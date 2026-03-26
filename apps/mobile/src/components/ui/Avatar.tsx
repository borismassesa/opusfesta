import { View, Text, Image } from 'react-native';
import { brutalist, brutalistShadowSm } from '@/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name?: string;
  imageUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { dim: number; fontSize: number }> = {
  sm: { dim: 36, fontSize: 12 },
  md: { dim: 44, fontSize: 14 },
  lg: { dim: 80, fontSize: 28 },
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
  const s = sizeMap[size];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={className}
        style={{ width: s.dim, height: s.dim, borderRadius: s.dim / 2 }}
      />
    );
  }

  return (
    <View
      className={className}
      style={[
        {
          width: s.dim,
          height: s.dim,
          borderRadius: s.dim / 2,
          backgroundColor: brutalist.secondaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
        },
        brutalistShadowSm,
      ]}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: s.fontSize,
          color: brutalist.tertiaryContainer,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
