import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { useWeddingWebsite, useUpdateSection } from '@/hooks/useWeddingWebsite';
import { WEDDING_SECTIONS } from '@/constants/wedding-sections';
import { colors, brutalist } from '@/constants/theme';
import type { SectionKey, WeddingWebsiteSection } from '@/types/wedding-website';

// Section editors
import { WeddingDetailsEditor } from '@/components/wedding-website/editors/WeddingDetailsEditor';
import { OurStoryEditor } from '@/components/wedding-website/editors/OurStoryEditor';
import { CountdownEditor } from '@/components/wedding-website/editors/CountdownEditor';
import { PhotoGalleryEditor } from '@/components/wedding-website/editors/PhotoGalleryEditor';
import { RsvpEditor } from '@/components/wedding-website/editors/RsvpEditor';
import { FaqEditor } from '@/components/wedding-website/editors/FaqEditor';
import { BridalPartyEditor } from '@/components/wedding-website/editors/BridalPartyEditor';
import { RegistryEditor } from '@/components/wedding-website/editors/RegistryEditor';
import { TravelEditor } from '@/components/wedding-website/editors/TravelEditor';
import { DressCodeEditor } from '@/components/wedding-website/editors/DressCodeEditor';
import { GuestbookEditor } from '@/components/wedding-website/editors/GuestbookEditor';

const EDITOR_MAP: Record<SectionKey, React.ComponentType<{ content: any; onSave: (content: any) => void; saving: boolean }>> = {
  wedding_details: WeddingDetailsEditor,
  our_story: OurStoryEditor,
  countdown: CountdownEditor,
  photo_gallery: PhotoGalleryEditor,
  rsvp: RsvpEditor,
  faq: FaqEditor,
  bridal_party: BridalPartyEditor,
  registry: RegistryEditor,
  travel: TravelEditor,
  dress_code: DressCodeEditor,
  guestbook: GuestbookEditor,
};

export default function SectionEditorScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const { data: website, isLoading } = useWeddingWebsite();
  const updateSection = useUpdateSection();

  const sectionKey = key as SectionKey;
  const config = WEDDING_SECTIONS.find((s) => s.key === sectionKey);
  const section: WeddingWebsiteSection | undefined = website?.wedding_website_sections?.find(
    (s: WeddingWebsiteSection) => s.section_key === sectionKey,
  );

  const Editor = EDITOR_MAP[sectionKey];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!section || !Editor || !config) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Header title="Section" showBack />
          <Text className="text-of-muted text-sm mt-4">Section not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = (content: any) => {
    updateSection.mutate(
      { sectionId: section.id, updates: { content } },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Header title={config.label} showBack />
        <Editor
          content={section.content}
          onSave={handleSave}
          saving={updateSection.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
