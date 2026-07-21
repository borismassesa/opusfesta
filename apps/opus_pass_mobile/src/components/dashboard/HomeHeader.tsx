import { Image, Pressable, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 4,
};

export function HomeHeader() {
  const { editorial } = useTheme();
  const { user } = useUser();
  const router = useRouter();

  const iconColor = editorial.onSurface;

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => router.push('/profile')}
        style={[
          {
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: editorial.surfaceContainerLowest,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          },
          SHADOW,
        ]}
      >
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={{ width: 52, height: 52 }} />
        ) : (
          <Ionicons name="person-circle-outline" size={30} color={iconColor} />
        )}
      </Pressable>

      <View
        style={[
          {
            flexDirection: 'row',
            backgroundColor: editorial.surfaceContainerLowest,
            borderRadius: 999,
            paddingHorizontal: 6,
          },
          SHADOW,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan ticket"
          onPress={() => router.push({ pathname: '/coming-soon', params: { title: 'Scanner' } })}
          style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialCommunityIcons name="barcode-scan" size={20} color={iconColor} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push({ pathname: '/coming-soon', params: { title: 'Notifications' } })}
          style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="notifications-outline" size={20} color={iconColor} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Favorites"
          onPress={() => router.push({ pathname: '/coming-soon', params: { title: 'Favorites' } })}
          style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="heart-outline" size={20} color={iconColor} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registry"
          onPress={() => router.navigate('/registry')}
          style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="cart-outline" size={20} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}
