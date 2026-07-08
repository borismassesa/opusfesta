import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftSm, purpleTints } from '@/constants/theme';
import type { IonIcon } from '@/constants/vendorCategories';
import { useTheme } from '@/theme/useTheme';

interface CategoryTileProps {
  label: string;
  icon: IonIcon;
  bg: string;
  iconColor: string;
  onPress: () => void;
}

const TILE_SIZE = 72;

export function CategoryTile({ label, icon, iconColor, onPress }: CategoryTileProps) {
  const { editorial } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', width: TILE_SIZE + 12 }}>
      {({ pressed }) => (
        <>
          <View
            style={[
              {
                width: TILE_SIZE,
                height: TILE_SIZE,
                borderRadius: 18,
                backgroundColor: pressed ? purpleTints[300] : editorial.surfaceContainerLowest,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                borderWidth: pressed ? 0 : 2,
                borderColor: editorial.outlineVariant,
              },
              shadowSoftSm,
            ]}
          >
            <Ionicons name={icon} size={26} color={pressed ? purpleTints[900] : iconColor} />
          </View>
          {/* Fixed purpleTints tone (not theme-driven) so the label reads
              correctly on both the plain and lavender (pressed) tiles. */}
          <Text
            numberOfLines={1}
            style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: purpleTints[900], textAlign: 'center' }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
