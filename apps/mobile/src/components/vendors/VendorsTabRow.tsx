import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type VendorsTabKey = 'find' | 'booked' | 'favorites';

const TABS: { key: VendorsTabKey; label: string }[] = [
  { key: 'find', label: 'Find vendors' },
  { key: 'booked', label: 'Booked vendors' },
  { key: 'favorites', label: 'Favorites' },
];

interface VendorsTabRowProps {
  activeKey: VendorsTabKey;
  onChange: (key: VendorsTabKey) => void;
}

export function VendorsTabRow({ activeKey, onChange }: VendorsTabRowProps) {
  const { editorial } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 22,
        paddingHorizontal: 20,
        marginTop: 18,
        borderBottomWidth: 1,
        borderBottomColor: editorial.outlineVariant,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              paddingBottom: 12,
              borderBottomWidth: 2,
              borderBottomColor: isActive ? editorial.onSurface : 'transparent',
            }}
          >
            <Text
              style={{
                fontFamily: isActive ? 'WorkSans-Bold' : 'WorkSans-Regular',
                fontSize: 14,
                color: isActive ? editorial.onSurface : editorial.onSurfaceVariant,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
