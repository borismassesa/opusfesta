import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/theme';

interface PhotoUploaderProps {
  /** Array of local file URIs */
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  minPhotos?: number;
  label?: string;
  circular?: boolean;
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  minPhotos = 0,
  label = 'Add photos',
  circular = false,
}: PhotoUploaderProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: maxPhotos > 1,
      selectionLimit: maxPhotos - photos.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      onPhotosChange([...photos, ...newUris].slice(0, maxPhotos));
    }
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  if (circular && maxPhotos === 1) {
    // Single circular avatar mode
    const hasPhoto = photos.length > 0;
    return (
      <View className="items-center">
        <Pressable onPress={pickImage} className="items-center">
          {hasPhoto ? (
            <Image
              source={{ uri: photos[0] }}
              className="w-28 h-28 rounded-full"
            />
          ) : (
            <View className="w-28 h-28 rounded-full bg-of-pale border-2 border-dashed border-of-border items-center justify-center">
              <Ionicons name="camera-outline" size={32} color={colors.muted} />
            </View>
          )}
          <Text className="mt-3 font-dm-sans-medium text-sm text-of-primary">
            {hasPhoto ? 'Change photo' : label}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row flex-wrap gap-3">
        {photos.map((uri, i) => (
          <View key={uri} className="relative">
            <Image source={{ uri }} className="w-24 h-24 rounded-card" />
            <Pressable
              onPress={() => removePhoto(i)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-of-coral items-center justify-center"
            >
              <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
        {photos.length < maxPhotos && (
          <Pressable
            onPress={pickImage}
            className="w-24 h-24 rounded-card border-2 border-dashed border-of-border items-center justify-center bg-white"
          >
            <Ionicons name="add" size={28} color={colors.muted} />
            <Text className="text-[10px] text-of-muted mt-1">Add</Text>
          </Pressable>
        )}
      </View>
      {minPhotos > 0 && (
        <Text className="text-xs text-of-muted mt-2">
          {photos.length}/{minPhotos} minimum photos
        </Text>
      )}
    </View>
  );
}
