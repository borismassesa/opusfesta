import { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { colors } from '@/constants/theme';

interface Props {
  content: any;
  onSave: (content: any) => void;
  saving: boolean;
}

export function RsvpEditor({ content, onSave, saving }: Props) {
  const [deadline, setDeadline] = useState(content.deadline ?? '');
  const [maxPlusOnes, setMaxPlusOnes] = useState(String(content.max_plus_ones ?? 1));
  const [mealOptions, setMealOptions] = useState((content.meal_options ?? []).join(', '));
  const [whatsappFallback, setWhatsappFallback] = useState(content.whatsapp_fallback ?? true);
  const [whatsappNumber, setWhatsappNumber] = useState(content.whatsapp_number ?? '');
  const [customMessage, setCustomMessage] = useState(content.custom_message ?? '');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}>
      <Input label="RSVP deadline" value={deadline} onChangeText={setDeadline} placeholder="2025-08-01" />
      <Input label="Max plus-ones per guest" value={maxPlusOnes} onChangeText={setMaxPlusOnes} keyboardType="number-pad" placeholder="1" />
      <Input label="Meal options (comma-separated)" value={mealOptions} onChangeText={setMealOptions} placeholder="Chicken, Fish, Vegetarian, Vegan" />
      <Input label="Custom RSVP message" value={customMessage} onChangeText={setCustomMessage} placeholder="We'd love to know if you can make it!" multiline />

      <View className="bg-white border border-of-border rounded-xl p-4 gap-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-dm-sans-bold text-sm text-of-text">WhatsApp RSVP</Text>
            <Text className="text-xs text-of-muted">Allow guests to RSVP via WhatsApp</Text>
          </View>
          <Switch
            value={whatsappFallback}
            onValueChange={setWhatsappFallback}
            trackColor={{ false: '#e2e8f0', true: colors.light }}
            thumbColor={whatsappFallback ? colors.primary : '#fff'}
          />
        </View>
        {whatsappFallback && (
          <PhoneInput value={whatsappNumber} onChangeText={setWhatsappNumber} />
        )}
      </View>

      <Button
        title="Save"
        onPress={() =>
          onSave({
            deadline,
            max_plus_ones: parseInt(maxPlusOnes, 10) || 1,
            meal_options: mealOptions.split(',').map((s: string) => s.trim()).filter(Boolean),
            whatsapp_fallback: whatsappFallback,
            whatsapp_number: whatsappNumber,
            custom_message: customMessage,
          })
        }
        loading={saving}
      />
    </ScrollView>
  );
}
