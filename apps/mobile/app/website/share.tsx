import { View, Text, Pressable, Alert, Share, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
// expo-clipboard — install if needed: npx expo install expo-clipboard
import { Header } from '@/components/layout/Header';
import { useWeddingWebsite } from '@/hooks/useWeddingWebsite';
import { colors, brutalist } from '@/constants/theme';

const BASE_URL = 'https://opusfesta.com/w';

export default function ShareScreen() {
  const { data: website } = useWeddingWebsite();
  const url = website ? `${BASE_URL}/${website.slug}` : '';

  const handleCopy = async () => {
    // Uses native share as clipboard fallback
    await Share.share({ message: url });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`You're invited! View our wedding website: ${url}`);
    Linking.openURL(`https://wa.me/?text=${message}`);
  };

  const handleSMS = () => {
    const message = encodeURIComponent(`You're invited to our wedding! ${url}`);
    Linking.openURL(`sms:?body=${message}`);
  };

  const handleNativeShare = async () => {
    await Share.share({ message: `You're invited! View our wedding website: ${url}`, url });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <Header title="Share Website" showBack />

        {/* URL display */}
        <View className="bg-white border border-of-border rounded-xl p-4 mt-4 mb-6">
          <Text className="text-xs text-of-muted font-dm-sans-bold uppercase tracking-wider mb-2">
            Your website link
          </Text>
          <Text className="text-sm font-dm-sans-medium text-of-primary" selectable>
            {url}
          </Text>
        </View>

        {/* Share options */}
        <View className="gap-3">
          <Pressable onPress={handleCopy} className="flex-row items-center gap-4 bg-white border border-of-border rounded-xl p-4">
            <View className="w-12 h-12 rounded-full bg-of-pale items-center justify-center">
              <Ionicons name="copy-outline" size={22} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-dm-sans-bold text-sm text-of-text">Copy Link</Text>
              <Text className="text-xs text-of-muted">Paste anywhere</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>

          <Pressable onPress={handleWhatsApp} className="flex-row items-center gap-4 bg-white border border-of-border rounded-xl p-4">
            <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center">
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <View className="flex-1">
              <Text className="font-dm-sans-bold text-sm text-of-text">Share via WhatsApp</Text>
              <Text className="text-xs text-of-muted">Send to contacts or groups</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>

          <Pressable onPress={handleSMS} className="flex-row items-center gap-4 bg-white border border-of-border rounded-xl p-4">
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center">
              <Ionicons name="chatbubble-outline" size={22} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="font-dm-sans-bold text-sm text-of-text">Share via SMS</Text>
              <Text className="text-xs text-of-muted">Text the link to guests</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>

          <Pressable onPress={handleNativeShare} className="flex-row items-center gap-4 bg-white border border-of-border rounded-xl p-4">
            <View className="w-12 h-12 rounded-full bg-of-pale items-center justify-center">
              <Ionicons name="share-social-outline" size={22} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-dm-sans-bold text-sm text-of-text">More Options</Text>
              <Text className="text-xs text-of-muted">Email, Instagram, Facebook...</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
