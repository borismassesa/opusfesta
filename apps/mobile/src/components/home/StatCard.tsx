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
      style={{
        flex: 1,
        backgroundColor: editorial.surfaceContainerLowest,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'flex-start',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Tinted icon chip — mirrors the checklist goal-card treatment so the stat
            cards read as part of the same system rather than bare dashboard widgets. */}
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: editorial.tertiaryFixed,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={15} color={editorial.tertiaryContainer} />
        </View>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 17,
            color: muted ? editorial.onSurfaceVariant : editorial.onSurface,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
      <Text
        style={{ fontFamily: 'WorkSans-Regular', fontSize: 11, color: editorial.onSurfaceVariant, marginTop: 6 }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
