import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';
import type { VendorApprovalState } from '@/hooks/useCurrentVendor';

const COPY: Record<'pending' | 'suspended', { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = {
  pending: {
    icon: 'time-outline',
    title: 'Your storefront is under review',
    body: 'Our team is verifying your business details. You can keep your storefront up to date in the meantime — leads and bookings unlock once you’re approved.',
  },
  suspended: {
    icon: 'alert-circle-outline',
    title: 'Your account is suspended',
    body: 'Reach out to OpusFesta support to resolve this and restore access.',
  },
};

/**
 * Shown on screens that should be locked until vendors.onboarding_status is
 * 'active' (Home/Leads/Bookings/Calendar). Storefront and Messages
 * deliberately don't render this — see the open questions in the vendor
 * mode plan for why those stay accessible pre-approval.
 */
export function ApprovalBanner({ state }: { state: Extract<VendorApprovalState, { kind: 'pending' | 'suspended' }> }) {
  const { editorial } = useTheme();
  const copy = COPY[state.kind];

  return (
    <View
      className="flex-row gap-3 p-[18px] rounded-[20px] bg-ed-surface-container-lowest border border-ed-outline-variant mb-5"
      style={shadowSoftSm}
    >
      <Ionicons name={copy.icon} size={22} color={editorial.primaryContainer} />
      <View className="flex-1">
        <Text className="font-space-grotesk-bold text-[15px] text-ed-on-surface mb-1">
          {copy.title}
        </Text>
        <Text className="font-work-sans text-[13px] text-ed-on-surface-variant leading-[19px]">
          {copy.body}
        </Text>
      </View>
    </View>
  );
}
