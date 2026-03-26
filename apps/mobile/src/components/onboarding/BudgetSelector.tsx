import { View, Text, Pressable } from 'react-native';
import { BUDGET_RANGES, type BudgetKey } from '@/constants/onboarding';

interface BudgetSelectorProps {
  value: string;
  onSelect: (key: BudgetKey) => void;
}

export function BudgetSelector({ value, onSelect }: BudgetSelectorProps) {
  return (
    <View className="gap-2.5">
      {BUDGET_RANGES.map((range) => {
        const isSelected = value === range.key;
        return (
          <Pressable
            key={range.key}
            onPress={() => onSelect(range.key)}
            className={`py-3.5 px-4 rounded-button border ${
              isSelected
                ? 'bg-of-pale border-of-primary'
                : 'bg-white border-of-border'
            }`}
          >
            <Text
              className={`font-dm-sans-medium text-sm ${
                isSelected ? 'text-of-primary' : 'text-of-text'
              }`}
            >
              {range.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
