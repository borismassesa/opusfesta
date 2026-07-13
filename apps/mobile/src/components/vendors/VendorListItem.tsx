import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { shadowSoftSm } from '@/constants/theme';

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
      className="bg-ed-surface-container-lowest rounded-[20px] border border-ed-outline-variant p-3.5 flex-row items-center gap-3.5"
      style={shadowSoftSm}
    >
      <Avatar name={name} imageUrl={logo} size="md" />
      <View className="flex-1">
        <Text className="font-space-grotesk-bold text-sm text-ed-on-surface">
          {name}
        </Text>
        <Text className="font-work-sans text-xs text-ed-on-surface-variant mt-0.5">
          {category} {location ? `· ${location}` : ''}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <StarRating rating={rating} />
          {verified && <Badge label="Verified" variant="success" />}
        </View>
      </View>
    </Pressable>
  );
}
