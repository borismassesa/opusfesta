import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { uploadToBucket } from '@/lib/storage';
import { useUpdateCoupleProfile } from '@/hooks/useCoupleProfile';
import { useTheme } from '@/theme/useTheme';

interface CoupleAvatarProps {
  imageUrl?: string | null;
  name?: string;
}

export function CoupleAvatar({ imageUrl, name }: CoupleAvatarProps) {
  const { editorial } = useTheme();
  const { getToken } = useAuth();
  const { user } = useUser();
  const updateProfile = useUpdateCoupleProfile();
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const token = await getToken({ template: 'supabase' });
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!token || !supabaseUrl || !user?.id) return;

      const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const url = await uploadToBucket('couple-avatars', filename, result.assets[0].uri, token, supabaseUrl);
      if (url) await updateProfile.mutateAsync({ avatar_url: url });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Pressable onPress={pickAndUpload} disabled={uploading} style={{ position: 'relative' }}>
      <Avatar imageUrl={imageUrl} name={name} size="lg" />
      <View
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: editorial.primaryContainer,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: editorial.headerTint,
        }}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Ionicons name="camera" size={13} color="#ffffff" />
        )}
      </View>
    </Pressable>
  );
}
