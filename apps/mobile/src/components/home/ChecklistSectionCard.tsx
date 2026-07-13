import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface ChecklistSectionCardProps {
  icon: string;
  title: string;
  doneCount: number;
  totalCount: number;
  onPress: () => void;
}

export function ChecklistSectionCard({ icon, title, doneCount, totalCount, onPress }: ChecklistSectionCardProps) {
  const { editorial } = useTheme();
  const allDone = totalCount > 0 && doneCount >= totalCount;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 bg-ed-surface-container-lowest rounded-2xl border border-ed-outline-variant p-3.5"
      style={shadowSoftSm}
    >
      <View className="w-12 h-12 rounded-[10px] items-center justify-center bg-ed-tertiary-fixed">
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={editorial.tertiaryContainer} />
      </View>
      <View className="flex-1">
        <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface">{title}</Text>
        <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-0.5">
          {allDone ? 'All done' : `${doneCount}/${totalCount} tasks`}
        </Text>
      </View>
      {allDone ? (
        <Ionicons name="checkmark-circle" size={20} color={editorial.primaryContainer} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={editorial.outline} />
      )}
    </Pressable>
  );
}
