import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  content: any;
  onSave: (content: any) => void;
  saving: boolean;
}

export function WeddingDetailsEditor({ content, onSave, saving }: Props) {
  const [data, setData] = useState({
    ceremony_date: content.ceremony_date ?? '',
    ceremony_time: content.ceremony_time ?? '',
    ceremony_venue: content.ceremony_venue ?? '',
    ceremony_address: content.ceremony_address ?? '',
    reception_venue: content.reception_venue ?? '',
    reception_address: content.reception_address ?? '',
    reception_time: content.reception_time ?? '',
    dress_code: content.dress_code ?? '',
    notes: content.notes ?? '',
  });

  const update = (key: string, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}>
      <Input label="Ceremony date" value={data.ceremony_date} onChangeText={(v) => update('ceremony_date', v)} placeholder="2025-09-14" />
      <Input label="Ceremony time" value={data.ceremony_time} onChangeText={(v) => update('ceremony_time', v)} placeholder="2:00 PM" />
      <Input label="Ceremony venue" value={data.ceremony_venue} onChangeText={(v) => update('ceremony_venue', v)} placeholder="St. Joseph Cathedral" />
      <Input label="Ceremony address" value={data.ceremony_address} onChangeText={(v) => update('ceremony_address', v)} placeholder="123 Main St, Dar es Salaam" />
      <Input label="Reception venue" value={data.reception_venue} onChangeText={(v) => update('reception_venue', v)} placeholder="Serena Grand Ballroom" />
      <Input label="Reception address" value={data.reception_address} onChangeText={(v) => update('reception_address', v)} placeholder="Oyster Bay Road" />
      <Input label="Reception time" value={data.reception_time} onChangeText={(v) => update('reception_time', v)} placeholder="5:00 PM" />
      <Input label="Dress code" value={data.dress_code} onChangeText={(v) => update('dress_code', v)} placeholder="Black tie / Semi-formal" />
      <Input label="Additional notes" value={data.notes} onChangeText={(v) => update('notes', v)} placeholder="Any special instructions..." multiline />
      <Button title="Save" onPress={() => onSave(data)} loading={saving} />
    </ScrollView>
  );
}
