import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  onPress: () => void;
  /** Renders the value in muted grey (same size) — for unset placeholder values like "--". */
  muted?: boolean;
}

export function StatCard({ icon, value, label, onPress, muted = false }: StatCardProps) {
  const { editorial } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-ed-surface-container-lowest rounded-2xl py-3.5 px-2.5 items-start"
    >
      <View className="flex-row items-center gap-2">
        {/* Tinted icon chip — mirrors the checklist goal-card treatment so the stat
            cards read as part of the same system rather than bare dashboard widgets. */}
        <View className="w-[26px] h-[26px] rounded-[13px] items-center justify-center bg-ed-tertiary-fixed">
          <Ionicons name={icon} size={15} color={editorial.tertiaryContainer} />
        </View>
        <Text
          className={`font-space-grotesk-bold text-[17px] ${muted ? 'text-ed-on-surface-variant' : 'text-ed-on-surface'}`}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
      <Text className="font-work-sans text-[11px] text-ed-on-surface-variant mt-1.5" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
