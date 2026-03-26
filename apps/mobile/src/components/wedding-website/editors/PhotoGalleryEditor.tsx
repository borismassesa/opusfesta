import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhotoUploader } from '@/components/onboarding/PhotoUploader';

interface Props {
  content: any;
  onSave: (content: any) => void;
  saving: boolean;
}

export function PhotoGalleryEditor({ content, onSave, saving }: Props) {
  const [title, setTitle] = useState(content.title ?? 'Our Gallery');
  const [photos, setPhotos] = useState<string[]>(
    (content.photos ?? []).map((p: any) => (typeof p === 'string' ? p : p.url)),
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}>
      <Input label="Gallery title" value={title} onChangeText={setTitle} placeholder="Our Gallery" />
      <PhotoUploader photos={photos} onPhotosChange={setPhotos} maxPhotos={20} minPhotos={0} />
      <Button
        title="Save"
        onPress={() =>
          onSave({ title, photos: photos.map((url) => ({ url, caption: '' })) })
        }
        loading={saving}
      />
    </ScrollView>
  );
}
