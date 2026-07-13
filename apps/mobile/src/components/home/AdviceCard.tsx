import { View, Text, Pressable, Image } from 'react-native';
import { Linking } from 'react-native';
import { shadowSoft } from '@/constants/theme';
import { resolveAdviceIdeasImage } from '@/lib/api/adviceIdeas';

interface AdviceCardProps {
  slug: string;
  title: string;
  category?: string | null;
  imageSrc?: string | null;
}

export function AdviceCard({ slug, title, category, imageSrc }: AdviceCardProps) {
  const image = resolveAdviceIdeasImage(imageSrc);

  return (
    <Pressable
      onPress={() => Linking.openURL(`https://opusfesta.com/advice-and-ideas/${slug}`)}
      className="w-[200px]"
    >
      <View
        className="w-[200px] h-[130px] rounded-2xl overflow-hidden bg-ed-surface-container-low mb-2"
        style={shadowSoft}
      >
        {image && <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />}
      </View>
      {category && (
        <Text className="font-work-sans-bold text-[10px] tracking-[0.4px] uppercase text-ed-tertiary-container mb-0.5">
          {category}
        </Text>
      )}
      <Text numberOfLines={2} className="font-space-grotesk-bold text-[13px] text-ed-on-surface leading-[17px]">
        {title}
      </Text>
    </Pressable>
  );
}
