import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface PhaseStepperProps {
  sections: { id: string; title: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PhaseStepper({ sections, selectedId, onSelect }: PhaseStepperProps) {
  const { editorial } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 14, paddingVertical: 4, paddingHorizontal: 2 }}
    >
      {sections.map((section, index) => {
        const active = section.id === selectedId;
        return (
          <Pressable key={section.id} onPress={() => onSelect(section.id)} style={{ alignItems: 'center', width: 68 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? editorial.primaryContainer : editorial.surfaceContainerLow,
                borderWidth: active ? 0 : 1,
                borderColor: editorial.outlineVariant,
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontSize: 14,
                  color: active ? '#ffffff' : editorial.onSurfaceVariant,
                }}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'WorkSans-Bold',
                fontSize: 9,
                textAlign: 'center',
                color: active ? editorial.onSurface : editorial.onSurfaceVariant,
              }}
            >
              {section.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
