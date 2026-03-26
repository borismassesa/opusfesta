import { View, Text, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite';
import { colors, brutalist } from '@/constants/theme';

const BASE_URL = 'https://opusfesta.com/w';

export default function PreviewScreen() {
  const { data: website } = useWeddingWebsite();
  const url = website ? `${BASE_URL}/${website.slug}` : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Header title="Preview" showBack />

        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 rounded-full bg-of-pale items-center justify-center mb-6">
            <Ionicons name="eye-outline" size={40} color={colors.primary} />
          </View>
          <Text className="font-playfair-bold text-xl text-of-text text-center mb-2">
            Website Preview
          </Text>
          <Text className="text-sm text-of-muted text-center mb-2 px-4">
            Your wedding website is{' '}
            {website?.is_published ? (
              <Text className="text-of-green font-dm-sans-bold">live</Text>
            ) : (
              <Text className="text-amber-600 font-dm-sans-bold">unpublished</Text>
            )}
          </Text>
          <Text className="text-xs text-of-primary font-dm-sans-medium mb-8" selectable>
            {url}
          </Text>
          <Button title="Open in Browser" onPress={() => url && Linking.openURL(url)} />
        </View>
      </View>
    </SafeAreaView>
  );
}
