import { View, Text, Pressable } from 'react-native';

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
  return (
    <View className="flex-row gap-[22px] px-5 mt-[18px] border-b border-ed-outline-variant">
      {TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`pb-3 border-b-2 ${isActive ? 'border-ed-on-surface' : 'border-transparent'}`}
          >
            <Text
              className={`text-sm ${isActive ? 'font-work-sans-bold text-ed-on-surface' : 'font-work-sans text-ed-on-surface-variant'}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
