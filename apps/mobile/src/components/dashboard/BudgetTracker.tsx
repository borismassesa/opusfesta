import { View, Text } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency } from '@opusfesta/lib';

interface BudgetTrackerProps {
  total: number;
  allocated: number;
}

export function BudgetTracker({ total, allocated }: BudgetTrackerProps) {
  const percentage = total > 0 ? Math.round((allocated / total) * 100) : 0;

  return (
    <View className="bg-of-pale p-4 rounded-card">
      <Text className="text-xs text-of-medium mb-1">Budget</Text>
      <Text className="text-xl font-dm-sans-bold text-of-primary">
        {formatCurrency(total)}
      </Text>
      <ProgressBar progress={percentage} className="mt-2" />
      <Text className="text-[11px] text-of-muted mt-1">
        {percentage}% allocated
      </Text>
    </View>
  );
}
