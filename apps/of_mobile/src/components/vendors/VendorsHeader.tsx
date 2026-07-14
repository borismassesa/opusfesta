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
    <View className="flex-row items-center justify-between px-5 pt-2">
      <Text className="font-playfair-bold text-[22px] text-ed-on-surface">Vendors</Text>
      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={() => router.push('/(tabs)/messages')}
          className="w-10 h-10 rounded-full items-center justify-center bg-ed-surface-container-lowest"
        >
          <Ionicons name="mail-outline" size={19} color={editorial.onSurface} />
        </Pressable>
        <Pressable
          onPress={onHeartPress}
          className="w-10 h-10 rounded-full items-center justify-center bg-ed-surface-container-lowest"
        >
          <Ionicons name="heart-outline" size={19} color={editorial.onSurface} />
          {savedVendorIds.length > 0 && (
            <View className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-[9px] px-1 items-center justify-center bg-[#C4426B]">
              <Text className="font-work-sans-bold text-[10px] text-white">
                {savedVendorIds.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
