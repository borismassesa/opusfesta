import { View, Text, Pressable, ScrollView } from 'react-native';

interface PhaseStepperProps {
  sections: { id: string; title: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PhaseStepper({ sections, selectedId, onSelect }: PhaseStepperProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 14, paddingVertical: 4, paddingHorizontal: 2 }}
    >
      {sections.map((section, index) => {
        const active = section.id === selectedId;
        return (
          <Pressable key={section.id} onPress={() => onSelect(section.id)} className="items-center w-[68px]">
            <View
              className={`w-9 h-9 rounded-full items-center justify-center mb-1.5 ${
                active ? 'bg-ed-primary-container border-0' : 'bg-ed-surface-container-low border border-ed-outline-variant'
              }`}
            >
              <Text className={`font-space-grotesk-bold text-sm ${active ? 'text-white' : 'text-ed-on-surface-variant'}`}>
                {index + 1}
              </Text>
            </View>
            <Text
              numberOfLines={2}
              className={`font-work-sans-bold text-[9px] text-center ${active ? 'text-ed-on-surface' : 'text-ed-on-surface-variant'}`}
            >
              {section.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
