import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

/** Circular back button for pushed screens (sign-in, stub destinations, etc). */
export function BackButton() {
  const router = useRouter();
  const { editorial } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={() => router.back()}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: editorial.surfaceContainer,
      }}
    >
      <Ionicons name="arrow-back" size={20} color={editorial.onSurface} />
    </Pressable>
  );
}
