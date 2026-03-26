import { View, Text } from 'react-native';

interface CountdownWidgetProps {
  daysLeft: number;
  eventName?: string;
}

export function CountdownWidget({ daysLeft, eventName }: CountdownWidgetProps) {
  return (
    <View className="bg-of-primary rounded-button p-3 items-center">
      <Text className="text-2xl font-dm-sans-bold text-white">{daysLeft}</Text>
      <Text className="text-[10px] text-of-light">Days left</Text>
    </View>
  );
}
