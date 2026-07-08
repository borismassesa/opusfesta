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
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: editorial.surfaceContainerLowest,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          padding: 14,
        },
        shadowSoftSm,
      ]}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          backgroundColor: editorial.tertiaryFixed,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon as any} size={22} color={editorial.tertiaryContainer} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface }}>{title}</Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: editorial.onSurfaceVariant, marginTop: 2 }}>
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
