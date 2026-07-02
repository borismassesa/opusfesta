import { Text, type TextStyle } from 'react-native';
import { editorial } from '@/constants/theme';

interface CoupleNamesProps {
  partner1?: string;
  partner2?: string;
  /** Joiner between names. Defaults to an ampersand. */
  joiner?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  align?: TextStyle['textAlign'];
  style?: TextStyle;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 44,
  xl: 56,
} as const;

/**
 * The signature romantic motif — couple names in Dancing Script. Reserved for
 * emotional peaks (dashboard header, onboarding finish, wedding-website hero).
 * Gracefully renders a single name when the partner is not yet set.
 */
export function CoupleNames({
  partner1,
  partner2,
  joiner = '&',
  size = 'lg',
  color = editorial.primaryContainer,
  align = 'center',
  style,
}: CoupleNamesProps) {
  const p1 = partner1?.trim();
  const p2 = partner2?.trim();
  const text = p1 && p2 ? `${p1} ${joiner} ${p2}` : p1 || p2 || '';
  if (!text) return null;

  return (
    <Text
      numberOfLines={2}
      style={{
        fontFamily: 'DancingScript-Bold',
        fontSize: sizeMap[size],
        lineHeight: sizeMap[size] * 1.15,
        color,
        textAlign: align,
        ...style,
      }}
    >
      {text}
    </Text>
  );
}
