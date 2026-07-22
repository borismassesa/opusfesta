import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';

const TIPS: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}[] = [
  {
    icon: 'qr-code-outline',
    text: "Point the camera at the QR on the guest's ticket and hold the phone still",
  },
  {
    icon: 'scan-outline',
    text: 'Keep the whole code inside the brackets, about a hand-span away',
  },
  {
    icon: 'create-outline',
    text: "If the QR won't scan, type the 6-character ticket code or find the guest by name",
  },
];

interface ScanTipsModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * The one piece of training a door attendant gets.
 *
 * Shown unprompted the first time the scan screen opens, because the moment
 * they need it — a guest in front of them, a queue behind — is the moment
 * they will not go looking for help.
 */
export function ScanTipsModal({ visible, onClose }: ScanTipsModalProps) {
  const { editorial } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-ed-bg" edges={['bottom']}>
        {/* Illustrated hero rather than another icon list: it signals "read
            this once" instead of "another dialog to dismiss". */}
        <LinearGradient
          colors={['#7E5896', '#4A2E63']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            hitSlop={12}
            className="absolute left-4 top-4 h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Pressable>

          <View className="items-center justify-center">
            <View
              className="h-[132px] w-[104px] items-center justify-center rounded-[20px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={52} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>

        <View className="flex-1 px-6 pt-7">
          <Text className="font-playfair-bold text-[30px] leading-9 text-ed-on-surface">
            Scan the pass to{'\n'}check a guest in
          </Text>

          <View className="mt-8">
            {TIPS.map((tip) => (
              <View key={tip.icon} className="mb-6 flex-row items-start gap-4">
                <View
                  className="h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: editorial.onSurface }}
                >
                  <Ionicons name={tip.icon} size={22} color={editorial.bg} />
                </View>
                <Text className="mt-2 flex-1 font-work-sans text-[15px] leading-6 text-ed-on-surface">
                  {tip.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="border-t border-ed-outline-variant px-4 pb-2 pt-3">
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="h-14 items-center justify-center rounded-2xl bg-ed-primary-container"
          >
            <Text className="font-work-sans-bold text-base text-ed-on-primary">
              Got it
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

interface ScanTipsBannerProps {
  onOpen: () => void;
  onDismiss: () => void;
}

/** Persistent way back to the tips, dismissible once the shift finds its feet. */
export function ScanTipsBanner({ onOpen, onDismiss }: ScanTipsBannerProps) {
  return (
    <View
      className="mx-4 flex-row items-center gap-3 rounded-2xl px-4 py-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
    >
      <Ionicons name="bulb-outline" size={19} color="#FFFFFF" />
      <Text className="flex-1 font-work-sans text-[13px] text-white" numberOfLines={1}>
        Tips for scanning passes
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        hitSlop={8}
        className="rounded-full px-3 py-1"
        style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
      >
        <Text className="font-work-sans-semibold text-[12px] text-white">See tips</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss scanning tips"
        onPress={onDismiss}
        hitSlop={10}
      >
        <Ionicons name="close" size={17} color="rgba(255,255,255,0.75)" />
      </Pressable>
    </View>
  );
}
