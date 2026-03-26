import { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface Props { content: any; onSave: (content: any) => void; saving: boolean }

export function GuestbookEditor({ content, onSave, saving }: Props) {
  const [title, setTitle] = useState(content.title ?? 'Leave us a message');
  const [subtitle, setSubtitle] = useState(content.subtitle ?? 'Share your wishes');
  const [moderated, setModerated] = useState(content.moderated ?? true);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}>
      <Input label="Title" value={title} onChangeText={setTitle} placeholder="Leave us a message" />
      <Input label="Subtitle" value={subtitle} onChangeText={setSubtitle} placeholder="Share your wishes for the happy couple" />
      <View className="flex-row items-center justify-between bg-white border border-of-border rounded-xl px-4 py-3">
        <View>
          <Text className="font-dm-sans-bold text-sm text-of-text">Moderate messages</Text>
          <Text className="text-xs text-of-muted">Approve messages before they appear</Text>
        </View>
        <Switch
          value={moderated}
          onValueChange={setModerated}
          trackColor={{ false: '#e2e8f0', true: colors.light }}
          thumbColor={moderated ? colors.primary : '#fff'}
        />
      </View>
      <Button title="Save" onPress={() => onSave({ title, subtitle, moderated })} loading={saving} />
    </ScrollView>
  );
}
