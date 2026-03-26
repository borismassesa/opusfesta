import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../ui/Badge';

interface ChecklistItemProps {
  title: string;
  dueText?: string;
  completed?: boolean;
  urgent?: boolean;
  onToggle?: () => void;
}

export function ChecklistItem({
  title,
  dueText,
  completed = false,
  urgent = false,
  onToggle,
}: ChecklistItemProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="bg-white rounded-card border border-of-border p-3.5 flex-row items-center gap-3"
    >
      <View
        className={`w-5.5 h-5.5 rounded-md border-2 items-center justify-center ${
          completed
            ? 'bg-of-primary border-of-primary'
            : 'border-of-primary bg-transparent'
        }`}
      >
        {completed && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <View className="flex-1">
        <Text
          className={`font-dm-sans-bold text-sm ${
            completed
              ? 'text-of-muted line-through'
              : 'text-of-text'
          }`}
        >
          {title}
        </Text>
        {dueText && (
          <Text className="text-xs text-of-muted">{dueText}</Text>
        )}
      </View>
      {urgent && <Badge label="Urgent" variant="warning" />}
    </Pressable>
  );
}
