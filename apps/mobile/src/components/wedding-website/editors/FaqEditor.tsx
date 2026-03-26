import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface Props { content: any; onSave: (content: any) => void; saving: boolean }

export function FaqEditor({ content, onSave, saving }: Props) {
  const [items, setItems] = useState<{ question: string; answer: string }[]>(content.items ?? []);

  const addItem = () => setItems([...items, { question: '', answer: '' }]);
  const updateItem = (i: number, field: 'question' | 'answer', value: string) =>
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 12, paddingTop: 16 }}>
      {items.map((item, i) => (
        <View key={i} className="bg-white border border-of-border rounded-xl p-4 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="font-dm-sans-bold text-xs text-of-muted">Q&A #{i + 1}</Text>
            <Pressable onPress={() => removeItem(i)}><Ionicons name="trash-outline" size={16} color={colors.coral} /></Pressable>
          </View>
          <Input label="Question" value={item.question} onChangeText={(v) => updateItem(i, 'question', v)} placeholder="When should I arrive?" />
          <Input label="Answer" value={item.answer} onChangeText={(v) => updateItem(i, 'answer', v)} placeholder="Please arrive 30 minutes before..." multiline />
        </View>
      ))}
      <Pressable onPress={addItem} className="flex-row items-center justify-center gap-2 py-3 border border-dashed border-of-border rounded-xl">
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text className="font-dm-sans-bold text-sm text-of-primary">Add Question</Text>
      </Pressable>
      <Button title="Save" onPress={() => onSave({ items })} loading={saving} />
    </ScrollView>
  );
}
