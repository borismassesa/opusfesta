import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSavedVendorIds } from '@/hooks/useSavedVendors';
import { useTheme } from '@/theme/useTheme';

interface VendorsHeaderProps {
  onHeartPress: () => void;
}

export function VendorsHeader({ onHeartPress }: VendorsHeaderProps) {
  const { editorial } = useTheme();
  const router = useRouter();
  const { data: savedVendorIds = [] } = useSavedVendorIds();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
      }}
    >
      <Text style={{ fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: editorial.onSurface }}>Vendors</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          onPress={() => router.push('/(tabs)/messages')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: editorial.surfaceContainerLowest,
          }}
        >
          <Ionicons name="mail-outline" size={19} color={editorial.onSurface} />
        </Pressable>
        <Pressable
          onPress={onHeartPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: editorial.surfaceContainerLowest,
          }}
        >
          <Ionicons name="heart-outline" size={19} color={editorial.onSurface} />
          {savedVendorIds.length > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                paddingHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#C4426B',
              }}
            >
              <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 10, color: '#fff' }}>
                {savedVendorIds.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
