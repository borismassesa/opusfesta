import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { editorial, shadowSoftSm } from '@/constants/theme';
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
  const copy = COPY[state.kind];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: 12,
          padding: 18,
          borderRadius: 20,
          backgroundColor: editorial.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: editorial.outlineVariant,
          marginBottom: 20,
        },
        shadowSoftSm,
      ]}
    >
      <Ionicons name={copy.icon} size={22} color={editorial.primaryContainer} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: editorial.onSurface, marginBottom: 4 }}>
          {copy.title}
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: editorial.onSurfaceVariant, lineHeight: 19 }}>
          {copy.body}
        </Text>
      </View>
    </View>
  );
}
