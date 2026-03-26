import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { brutalist, brutalistShadowSm } from '@/constants/theme';

interface VendorListItemProps {
  id: string;
  name: string;
  category: string;
  location?: string;
  rating?: number;
  logo?: string | null;
  verified?: boolean;
}

export function VendorListItem({
  id,
  name,
  category,
  location,
  rating = 0,
  logo,
  verified = false,
}: VendorListItemProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/vendor/${id}`)}
      style={[
        {
          backgroundColor: brutalist.surfaceContainerLowest,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: brutalist.outlineVariant,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        },
        brutalistShadowSm,
      ]}
    >
      <Avatar name={name} imageUrl={logo} size="md" />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: brutalist.onSurface }}>
          {name}
        </Text>
        <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 12, color: brutalist.onSurfaceVariant, marginTop: 2 }}>
          {category} {location ? `· ${location}` : ''}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <StarRating rating={rating} />
          {verified && <Badge label="Verified" variant="success" />}
        </View>
      </View>
    </Pressable>
  );
}
