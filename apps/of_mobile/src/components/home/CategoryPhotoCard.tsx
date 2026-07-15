import { View, Text, Pressable, Image } from 'react-native';
import { shadowSoft } from '@/constants/theme';

interface CategoryPhotoCardProps {
  label: string;
  image: string;
  onPress: () => void;
}

export function CategoryPhotoCard({ label, image, onPress }: CategoryPhotoCardProps) {
  return (
    <Pressable onPress={onPress} className="w-[140px]">
      <View
        className="w-[140px] h-24 rounded-2xl overflow-hidden bg-ed-surface-container-low mb-2"
        style={shadowSoft}
      >
        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
        {/* Uniform lavender wash — the source photos are vendor cover images with
            mismatched color temperatures; this gives the row one consistent tone.
            Fixed tone (does not flip in dark), like CategoryTile's palette usage.
            Opacity stays inline: NativeWind's opacity utility only accepts the
            standard 5%-step scale, not arbitrary values, so `opacity-[0.12]`
            silently fails to generate. */}
        <View className="absolute inset-0 bg-[#7B4FA2]" style={{ opacity: 0.12 }} />
      </View>
      <Text numberOfLines={1} className="font-work-sans-bold text-xs text-ed-on-surface">
        {label}
      </Text>
    </Pressable>
  );
}
