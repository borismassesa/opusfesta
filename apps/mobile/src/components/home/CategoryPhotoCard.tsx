import { View, Text, Pressable, Image } from 'react-native';
import { shadowSoft, purpleTints } from '@/constants/theme';
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
        {/* Uniform lavender wash — the source photos are vendor cover images with
            mismatched color temperatures; this gives the row one consistent tone.
            Fixed tone (does not flip in dark), like CategoryTile's palette usage. */}
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: purpleTints[500], opacity: 0.12 }}
        />
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
