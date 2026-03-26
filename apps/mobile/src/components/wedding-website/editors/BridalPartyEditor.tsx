import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';

interface Member { name: string; role: string; photo_url: string; bio: string }
interface Props { content: any; onSave: (content: any) => void; saving: boolean }

export function BridalPartyEditor({ content, onSave, saving }: Props) {
  const [title, setTitle] = useState(content.title ?? 'Meet the Bridal Party');
  const [members, setMembers] = useState<Member[]>(content.members ?? []);

  const addMember = () => setMembers([...members, { name: '', role: '', photo_url: '', bio: '' }]);
  const updateMember = (i: number, field: keyof Member, value: string) =>
    setMembers(members.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 12, paddingTop: 16 }}>
      <Input label="Section title" value={title} onChangeText={setTitle} placeholder="Meet the Bridal Party" />
      {members.map((m, i) => (
        <View key={i} className="bg-white border border-of-border rounded-xl p-4 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="font-dm-sans-bold text-xs text-of-muted">Member #{i + 1}</Text>
            <Pressable onPress={() => removeMember(i)}><Ionicons name="trash-outline" size={16} color={colors.coral} /></Pressable>
          </View>
          <Input label="Name" value={m.name} onChangeText={(v) => updateMember(i, 'name', v)} placeholder="Sarah Mwangi" />
          <Input label="Role" value={m.role} onChangeText={(v) => updateMember(i, 'role', v)} placeholder="Maid of Honor" />
          <Input label="Short bio" value={m.bio} onChangeText={(v) => updateMember(i, 'bio', v)} placeholder="Best friend since primary school" multiline />
        </View>
      ))}
      <Pressable onPress={addMember} className="flex-row items-center justify-center gap-2 py-3 border border-dashed border-of-border rounded-xl">
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text className="font-dm-sans-bold text-sm text-of-primary">Add Member</Text>
      </Pressable>
      <Button title="Save" onPress={() => onSave({ title, members })} loading={saving} />
    </ScrollView>
  );
}
