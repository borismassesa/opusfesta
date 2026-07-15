import { View, Text, Pressable, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Header } from '@/components/layout/Header';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'How do I contact a vendor?',
    answer:
      'Open a vendor\'s profile and tap "Request a quote" to send an inquiry, or use the Call, WhatsApp, Instagram, and Facebook links on their profile if they\'ve shared them.',
  },
  {
    question: 'How do I save vendors for later?',
    answer: 'Tap the heart icon on any vendor card or profile to add them to Saved vendors, found from your profile menu.',
  },
  {
    question: 'How do I track my guest list and RSVPs?',
    answer: 'Open the Planning tab and choose Guest List to add guests and update their RSVP status.',
  },
  {
    question: 'Where does my wedding website live?',
    answer: 'The Website tab manages your wedding website — edit sections, preview it, and share the link with guests once you publish.',
  },
];

const LINK_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
  {
    icon: 'mail-outline',
    label: 'Email support: hello@opusfesta.com',
    onPress: () => Linking.openURL('mailto:hello@opusfesta.com'),
  },
  {
    icon: 'document-text-outline',
    label: 'Terms of use',
    onPress: () => WebBrowser.openBrowserAsync('https://opusfesta.com/terms-of-use'),
  },
  {
    icon: 'shield-checkmark-outline',
    label: 'Privacy policy',
    onPress: () => WebBrowser.openBrowserAsync('https://opusfesta.com/privacy-policy'),
  },
];

export default function HelpSupportScreen() {
  const { editorial } = useTheme();
  return (
    <ScreenWrapper>
      <Header title="Help & support" showBack />

      <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mb-3">
        Frequently asked questions
      </Text>
      <View className="gap-2.5 mb-7">
        {FAQ_ITEMS.map((item) => (
          <View
            key={item.question}
            className="bg-ed-surface-container-lowest rounded-xl border border-ed-outline-variant p-3.5"
            style={shadowSoftSm}
          >
            <Text className="font-space-grotesk-bold text-[13px] text-ed-on-surface mb-1">
              {item.question}
            </Text>
            <Text className="font-work-sans text-xs text-ed-on-surface-variant leading-[18px]">
              {item.answer}
            </Text>
          </View>
        ))}
      </View>

      <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mb-3">
        Get in touch
      </Text>
      <View>
        {LINK_ITEMS.map((item, i) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            className={`flex-row items-center gap-3.5 py-3.5 ${i < LINK_ITEMS.length - 1 ? 'border-b border-ed-outline-variant' : ''}`}
          >
            <Ionicons name={item.icon} size={20} color={editorial.primaryContainer} />
            <Text className="flex-1 font-work-sans-medium text-sm text-ed-on-surface">
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={editorial.outlineVariant} />
          </Pressable>
        ))}
      </View>
    </ScreenWrapper>
  );
}
