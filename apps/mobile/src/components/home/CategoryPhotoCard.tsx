import { View, Text, Pressable, Image } from 'react-native';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface CategoryPhotoCardProps {
  label: string;
  image: string;
  onPress: () => void;
}

const CARD_WIDTH = 140;
const CARD_HEIGHT = 96;

export function CategoryPhotoCard({ label, image, onPress }: CategoryPhotoCardProps) {
  const { editorial } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ width: CARD_WIDTH }}>
      <View
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: editorial.surfaceContainerLow,
            marginBottom: 8,
          },
          shadowSoft,
        ]}
      >
        <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>
      <Text
        numberOfLines={1}
        style={{ fontFamily: 'WorkSans-Bold', fontSize: 12, color: editorial.onSurface }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
