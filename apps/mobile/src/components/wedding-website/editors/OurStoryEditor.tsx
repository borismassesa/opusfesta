import { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhotoUploader } from '@/components/onboarding/PhotoUploader';
import { colors } from '@/constants/theme';

interface Props {
  content: any;
  onSave: (content: any) => void;
  saving: boolean;
}

export function OurStoryEditor({ content, onSave, saving }: Props) {
  const [title, setTitle] = useState(content.title ?? 'Our Story');
  const [story, setStory] = useState(content.story ?? '');
  const [photos, setPhotos] = useState<string[]>(content.photos ?? []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}>
      <Input label="Section title" value={title} onChangeText={setTitle} placeholder="Our Story" />
      <View>
        <Text className="text-sm font-dm-sans-bold text-of-text mb-1.5">Your love story</Text>
        <TextInput
          value={story}
          onChangeText={setStory}
          placeholder="Tell guests how you met, your proposal story, or what makes your relationship special..."
          placeholderTextColor={`${colors.muted}80`}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          className="bg-white border border-of-border rounded-input px-4 py-3.5 text-sm font-dm-sans text-of-text min-h-[160px]"
        />
      </View>
      <View>
        <Text className="text-sm font-dm-sans-bold text-of-text mb-2">Photos</Text>
        <PhotoUploader photos={photos} onPhotosChange={setPhotos} maxPhotos={8} />
      </View>
      <Button title="Save" onPress={() => onSave({ title, story, photos, timeline: content.timeline ?? [] })} loading={saving} />
    </ScrollView>
  );
}
