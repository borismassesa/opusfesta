import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface Hotel { name: string; address: string; url: string; price_range: string; notes: string }
interface Props { content: any; onSave: (content: any) => void; saving: boolean }

export function TravelEditor({ content, onSave, saving }: Props) {
  const [title, setTitle] = useState(content.title ?? 'Travel & Accommodation');
  const [hotels, setHotels] = useState<Hotel[]>(content.hotels ?? []);
  const [transportTips, setTransportTips] = useState(content.transport_tips ?? '');
  const [localTips, setLocalTips] = useState(content.local_tips ?? '');

  const addHotel = () => setHotels([...hotels, { name: '', address: '', url: '', price_range: '', notes: '' }]);
  const updateHotel = (i: number, field: keyof Hotel, value: string) =>
    setHotels(hotels.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)));
  const removeHotel = (i: number) => setHotels(hotels.filter((_, idx) => idx !== i));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 12, paddingTop: 16 }}>
      <Input label="Section title" value={title} onChangeText={setTitle} />
      {hotels.map((h, i) => (
        <View key={i} className="bg-white border border-of-border rounded-xl p-4 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="font-dm-sans-bold text-xs text-of-muted">Hotel #{i + 1}</Text>
            <Pressable onPress={() => removeHotel(i)}><Ionicons name="trash-outline" size={16} color={colors.coral} /></Pressable>
          </View>
          <Input label="Name" value={h.name} onChangeText={(v) => updateHotel(i, 'name', v)} placeholder="Serena Hotel" />
          <Input label="Address" value={h.address} onChangeText={(v) => updateHotel(i, 'address', v)} placeholder="Ohio Street, Dar" />
          <Input label="Website" value={h.url} onChangeText={(v) => updateHotel(i, 'url', v)} placeholder="https://..." autoCapitalize="none" />
          <Input label="Price range" value={h.price_range} onChangeText={(v) => updateHotel(i, 'price_range', v)} placeholder="TZS 200k - 500k / night" />
        </View>
      ))}
      <Pressable onPress={addHotel} className="flex-row items-center justify-center gap-2 py-3 border border-dashed border-of-border rounded-xl">
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text className="font-dm-sans-bold text-sm text-of-primary">Add Hotel</Text>
      </Pressable>
      <Input label="Transport tips" value={transportTips} onChangeText={setTransportTips} placeholder="Uber and Bolt are available..." multiline />
      <Input label="Local tips" value={localTips} onChangeText={setLocalTips} placeholder="Best restaurants nearby..." multiline />
      <Button title="Save" onPress={() => onSave({ title, hotels, transport_tips: transportTips, local_tips: localTips })} loading={saving} />
    </ScrollView>
  );
}
