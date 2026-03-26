import { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface Props {
  content: any;
  onSave: (content: any) => void;
  saving: boolean;
}

export function CountdownEditor({ content, onSave, saving }: Props) {
  const [targetDate, setTargetDate] = useState(content.target_date ?? '');
  const [message, setMessage] = useState(content.message ?? '');
  const [showOnHomepage, setShowOnHomepage] = useState(content.show_on_homepage ?? true);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}>
      <Input label="Wedding date" value={targetDate} onChangeText={setTargetDate} placeholder="2025-09-14" />
      <Input label="Countdown message" value={message} onChangeText={setMessage} placeholder="We can't wait to celebrate with you!" />
      <View className="flex-row items-center justify-between bg-white border border-of-border rounded-xl px-4 py-3">
        <Text className="font-dm-sans-medium text-sm text-of-text">Show on homepage</Text>
        <Switch
          value={showOnHomepage}
          onValueChange={setShowOnHomepage}
          trackColor={{ false: '#e2e8f0', true: colors.light }}
          thumbColor={showOnHomepage ? colors.primary : '#fff'}
        />
      </View>
      <Button title="Save" onPress={() => onSave({ target_date: targetDate, message, show_on_homepage: showOnHomepage })} loading={saving} />
    </ScrollView>
  );
}
