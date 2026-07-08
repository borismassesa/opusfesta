import { View, Text, Pressable, Image } from 'react-native';
import { Linking } from 'react-native';
import { shadowSoft } from '@/constants/theme';
import { resolveAdviceIdeasImage } from '@/lib/api/adviceIdeas';
import { useTheme } from '@/theme/useTheme';

interface AdviceCardProps {
  slug: string;
  title: string;
  category?: string | null;
  imageSrc?: string | null;
}

const CARD_WIDTH = 200;
const CARD_HEIGHT = 130;

export function AdviceCard({ slug, title, category, imageSrc }: AdviceCardProps) {
  const { editorial } = useTheme();
  const image = resolveAdviceIdeasImage(imageSrc);

  return (
    <Pressable
      onPress={() => Linking.openURL(`https://opusfesta.com/advice-and-ideas/${slug}`)}
      style={{ width: CARD_WIDTH }}
    >
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
        {image && <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
      </View>
      {category && (
        <Text
          style={{
            fontFamily: 'WorkSans-Bold',
            fontSize: 10,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: editorial.tertiaryContainer,
            marginBottom: 2,
          }}
        >
          {category}
        </Text>
      )}
      <Text
        numberOfLines={2}
        style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: editorial.onSurface, lineHeight: 17 }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
