import { View, Text, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftPrimary } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface PlanProgressCardProps {
  daysLeft: number | null;
  photos: string[];
  onPress: () => void;
}

export function PlanProgressCard({ daysLeft, photos, onPress }: PlanProgressCardProps) {
  const { editorial } = useTheme();
  const previewPhotos = photos.slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-[18px] rounded-3xl p-5 mb-6 bg-ed-primary-container"
      style={shadowSoftPrimary}
    >
      <View className="w-[88px] h-[88px]">
        {previewPhotos.length > 0 ? (
          previewPhotos.map((uri, i) => (
            <Image
              key={`${uri}-${i}`}
              source={{ uri }}
              resizeMode="cover"
              className="absolute w-[61.6px] h-[61.6px] rounded-lg border-[3px] border-white"
              style={{
                top: i * 8,
                left: i * 10,
                transform: [{ rotate: `${(i - 1) * 8}deg` }],
              }}
            />
          ))
        ) : (
          <LinearGradient
            colors={[editorial.secondaryContainer, editorial.tertiaryFixed]}
            style={{ width: 88, height: 88, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="heart-outline" size={30} color={editorial.tertiaryContainer} />
          </LinearGradient>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1.5">
          <Text className="font-work-sans-bold text-[13px] text-white/80">
            Your progress
          </Text>
          <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.8)" />
        </View>
        <Text className="font-space-grotesk-bold text-2xl text-white">
          {daysLeft !== null ? `${daysLeft} days to go` : 'No date yet'}
        </Text>
      </View>
    </Pressable>
  );
}
