import { View, Text, Pressable } from 'react-native';
import { CITIES, type CityKey } from '@/constants/onboarding';

interface CitySelectorProps {
  value: string;
  onSelect: (city: CityKey) => void;
}

export function CitySelector({ value, onSelect }: CitySelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {CITIES.map((city) => {
        const isSelected = value === city.key;
        return (
          <Pressable
            key={city.key}
            onPress={() => onSelect(city.key)}
            className={`px-4 py-3 rounded-card border ${
              isSelected
                ? 'bg-of-primary border-of-primary'
                : 'bg-white border-of-border'
            }`}
          >
            <Text className="text-lg mb-1">{city.icon}</Text>
            <Text
              className={`font-dm-sans-medium text-sm ${
                isSelected ? 'text-white' : 'text-of-text'
              }`}
            >
              {city.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
