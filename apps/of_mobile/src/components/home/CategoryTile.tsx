import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftSm, purpleTints } from '@/constants/theme';
import type { IonIcon } from '@/constants/vendorCategories';

interface CategoryTileProps {
  label: string;
  icon: IonIcon;
  bg: string;
  iconColor: string;
  onPress: () => void;
}

export function CategoryTile({ label, icon, iconColor, onPress }: CategoryTileProps) {
  return (
    <Pressable onPress={onPress} className="items-center w-[84px]">
      {({ pressed }) => (
        <>
          <View
            className={`w-[72px] h-[72px] rounded-[18px] items-center justify-center mb-2 ${
              pressed ? 'bg-[#C9A0DC] border-0' : 'bg-ed-surface-container-lowest border-2 border-ed-outline-variant'
            }`}
            style={shadowSoftSm}
          >
            <Ionicons name={icon} size={26} color={pressed ? purpleTints[900] : iconColor} />
          </View>
          {/* Fixed purpleTints tone (not theme-driven) so the label reads
              correctly on both the plain and lavender (pressed) tiles. */}
          <Text numberOfLines={1} className="font-work-sans-bold text-[11px] text-[#2A1245] text-center">
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
