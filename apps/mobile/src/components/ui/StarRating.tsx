import { View, Text } from 'react-native';
import { brutalist } from '@/constants/theme';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, count, size = 'sm' }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const starFontSize = size === 'sm' ? 12 : 16;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: starFontSize, color: '#C4920A' }}>
        {'★'.repeat(fullStars)}
        {hasHalf ? '★' : ''}
        {'☆'.repeat(emptyStars)}
      </Text>
      {count !== undefined && (
        <Text
          style={{
            fontFamily: 'WorkSans-Regular',
            fontSize: 12,
            color: brutalist.onSurfaceVariant,
            marginLeft: 4,
          }}
        >
          {rating.toFixed(1)}
          {count > 0 && ` (${count})`}
        </Text>
      )}
    </View>
  );
}
