import { View, Text } from 'react-native';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, count, size = 'sm' }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View className="flex-row items-center gap-0.5">
      <Text className={`text-[#C4920A] ${size === 'sm' ? 'text-xs' : 'text-base'}`}>
        {'★'.repeat(fullStars)}
        {hasHalf ? '★' : ''}
        {'☆'.repeat(emptyStars)}
      </Text>
      {count !== undefined && (
        <Text className="font-work-sans text-xs text-ed-on-surface-variant ml-1">
          {rating.toFixed(1)}
          {count > 0 && ` (${count})`}
        </Text>
      )}
    </View>
  );
}
