import { Pressable, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface OAuthButtonsProps {
  onGooglePress: () => void;
  loading?: boolean;
}

export function OAuthButtons({ onGooglePress, loading }: OAuthButtonsProps) {
  return (
    <Pressable
      onPress={onGooglePress}
      disabled={loading}
      className="flex-row items-center justify-center bg-white border border-of-border rounded-button py-3.5 px-4"
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#4285F4" style={{ marginRight: 10 }} />
          <Text className="font-dm-sans-bold text-sm text-of-text">Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}
