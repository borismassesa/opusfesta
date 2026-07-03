import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface CategoryGridProps {
  categories: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[];
  selected: string[];
  onToggle: (key: string) => void;
  singleSelect?: boolean;
}

export function CategoryGrid({ categories, selected, onToggle, singleSelect }: CategoryGridProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row flex-wrap gap-3">
      {categories.map((cat) => {
        const isSelected = selected.includes(cat.key);
        return (
          <Pressable
            key={cat.key}
            onPress={() => onToggle(cat.key)}
            className={`w-[30%] items-center py-4 px-2 rounded-card border ${
              isSelected
                ? 'bg-of-pale border-of-primary'
                : 'bg-of-surface border-of-border'
            }`}
          >
            <Ionicons
              name={cat.icon}
              size={24}
              color={isSelected ? colors.primary : colors.muted}
            />
            <Text
              className={`mt-2 text-xs text-center ${
                isSelected ? 'font-work-sans-bold text-of-primary' : 'font-work-sans text-of-muted'
              }`}
              numberOfLines={2}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
