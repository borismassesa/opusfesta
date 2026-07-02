import { View, Text } from 'react-native';
import { editorial } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'count';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: editorial.tertiaryFixed, text: editorial.tertiaryContainer },
  success: { bg: '#dcfce7', text: '#16a34a' },
  warning: { bg: '#fff7ed', text: '#C4920A' },
  count: { bg: editorial.primaryContainer, text: '#ffffff' },
};

export function Badge({
  label,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const v = variantConfig[variant];

  return (
    <View
      className={className}
      style={{
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: v.bg,
      }}
    >
      <Text
        style={{
          fontFamily: 'WorkSans-Bold',
          fontSize: 11,
          color: v.text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
