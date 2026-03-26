import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface RegistryItem { name: string; url: string; price_tzs: number; image_url: string; purchased: boolean }
interface Props { content: any; onSave: (content: any) => void; saving: boolean }

export function RegistryEditor({ content, onSave, saving }: Props) {
  const [title, setTitle] = useState(content.title ?? 'Gift Registry');
  const [message, setMessage] = useState(content.message ?? '');
  const [items, setItems] = useState<RegistryItem[]>(content.items ?? []);
  const [mmProvider, setMmProvider] = useState(content.mobile_money?.provider ?? '');
  const [mmNumber, setMmNumber] = useState(content.mobile_money?.number ?? '');
  const [mmName, setMmName] = useState(content.mobile_money?.name ?? '');

  const addItem = () => setItems([...items, { name: '', url: '', price_tzs: 0, image_url: '', purchased: false }]);
  const updateItem = (i: number, field: string, value: any) =>
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 12, paddingTop: 16 }}>
      <Input label="Section title" value={title} onChangeText={setTitle} placeholder="Gift Registry" />
      <Input label="Message to guests" value={message} onChangeText={setMessage} placeholder="Your presence is the best gift..." multiline />

      <Text className="font-dm-sans-bold text-sm text-of-text mt-2">Mobile Money</Text>
      <View className="bg-white border border-of-border rounded-xl p-4 gap-3">
        <Input label="Provider" value={mmProvider} onChangeText={setMmProvider} placeholder="M-Pesa / Airtel / Tigo" />
        <Input label="Number" value={mmNumber} onChangeText={setMmNumber} placeholder="+255 712 345 678" keyboardType="phone-pad" />
        <Input label="Registered name" value={mmName} onChangeText={setMmName} placeholder="Fatma Said" />
      </View>

      <Text className="font-dm-sans-bold text-sm text-of-text mt-2">Wishlist Items</Text>
      {items.map((item, i) => (
        <View key={i} className="bg-white border border-of-border rounded-xl p-4 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="font-dm-sans-bold text-xs text-of-muted">Item #{i + 1}</Text>
            <Pressable onPress={() => removeItem(i)}><Ionicons name="trash-outline" size={16} color={colors.coral} /></Pressable>
          </View>
          <Input label="Item name" value={item.name} onChangeText={(v) => updateItem(i, 'name', v)} placeholder="Kitchen mixer" />
          <Input label="Link (optional)" value={item.url} onChangeText={(v) => updateItem(i, 'url', v)} placeholder="https://..." autoCapitalize="none" />
          <Input label="Price (TZS)" value={item.price_tzs ? String(item.price_tzs) : ''} onChangeText={(v) => updateItem(i, 'price_tzs', parseInt(v, 10) || 0)} keyboardType="number-pad" placeholder="150000" />
        </View>
      ))}
      <Pressable onPress={addItem} className="flex-row items-center justify-center gap-2 py-3 border border-dashed border-of-border rounded-xl">
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text className="font-dm-sans-bold text-sm text-of-primary">Add Item</Text>
      </Pressable>
      <Button title="Save" onPress={() => onSave({
        title, message, items,
        mobile_money: mmProvider ? { provider: mmProvider, number: mmNumber, name: mmName } : null,
      })} loading={saving} />
    </ScrollView>
  );
}
