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

const COLLAGE_SIZE = 88;
const PHOTO_SIZE = COLLAGE_SIZE * 0.7;

export function PlanProgressCard({ daysLeft, photos, onPress }: PlanProgressCardProps) {
  const { editorial } = useTheme();
  const previewPhotos = photos.slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 18,
          borderRadius: 24,
          padding: 20,
          marginBottom: 24,
          backgroundColor: editorial.primaryContainer,
        },
        shadowSoftPrimary,
      ]}
    >
      <View style={{ width: COLLAGE_SIZE, height: COLLAGE_SIZE }}>
        {previewPhotos.length > 0 ? (
          previewPhotos.map((uri, i) => (
            <Image
              key={`${uri}-${i}`}
              source={{ uri }}
              resizeMode="cover"
              style={{
                position: 'absolute',
                width: PHOTO_SIZE,
                height: PHOTO_SIZE,
                borderRadius: 8,
                borderWidth: 3,
                borderColor: '#fff',
                top: i * 8,
                left: i * 10,
                transform: [{ rotate: `${(i - 1) * 8}deg` }],
              }}
            />
          ))
        ) : (
          <LinearGradient
            colors={[editorial.secondaryContainer, editorial.tertiaryFixed]}
            style={{
              width: COLLAGE_SIZE,
              height: COLLAGE_SIZE,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="heart-outline" size={30} color={editorial.tertiaryContainer} />
          </LinearGradient>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            Your progress
          </Text>
          <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.8)" />
        </View>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#ffffff' }}>
          {daysLeft !== null ? `${daysLeft} days to go` : 'No date yet'}
        </Text>
      </View>
    </Pressable>
  );
}
