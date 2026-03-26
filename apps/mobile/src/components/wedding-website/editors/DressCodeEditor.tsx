import { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface Props { content: any; onSave: (content: any) => void; saving: boolean }

export function DressCodeEditor({ content, onSave, saving }: Props) {
  const [title, setTitle] = useState(content.title ?? 'Dress Code');
  const [description, setDescription] = useState(content.description ?? '');
  const [colorsToAvoid, setColorsToAvoid] = useState((content.colors_to_avoid ?? []).join(', '));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}>
      <Input label="Section title" value={title} onChangeText={setTitle} placeholder="Dress Code" />
      <View>
        <Text className="text-sm font-dm-sans-bold text-of-text mb-1.5">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="We'd love for our guests to dress in semi-formal attire. Think cocktail dresses and suits..."
          placeholderTextColor={`${colors.muted}80`}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="bg-white border border-of-border rounded-input px-4 py-3.5 text-sm font-dm-sans text-of-text min-h-[120px]"
        />
      </View>
      <Input label="Colors to avoid (comma-separated)" value={colorsToAvoid} onChangeText={setColorsToAvoid} placeholder="White, Cream, Red" />
      <Button title="Save" onPress={() => onSave({
        title, description,
        examples: content.examples ?? [],
        colors_to_avoid: colorsToAvoid.split(',').map((s: string) => s.trim()).filter(Boolean),
      })} loading={saving} />
    </ScrollView>
  );
}
