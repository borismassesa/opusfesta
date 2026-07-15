import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { uploadToBucket } from '@/lib/storage';
import { useUpdateCoupleProfile } from '@/hooks/useCoupleProfile';

interface CoupleAvatarProps {
  imageUrl?: string | null;
  name?: string;
}

export function CoupleAvatar({ imageUrl, name }: CoupleAvatarProps) {
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
    <Pressable onPress={pickAndUpload} disabled={uploading} className="relative">
      <Avatar imageUrl={imageUrl} name={name} size="lg" />
      <View className="absolute -bottom-0.5 -right-0.5 w-[26px] h-[26px] rounded-[13px] items-center justify-center border-2 bg-ed-primary-container border-ed-header-tint">
        {uploading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Ionicons name="camera" size={13} color="#ffffff" />
        )}
      </View>
    </Pressable>
  );
}
