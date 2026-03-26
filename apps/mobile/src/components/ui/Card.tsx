import { View, type ViewProps } from 'react-native';
import { brutalist, brutalistShadow } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  className = '',
  style,
  ...props
}: CardProps) {
  const variantStyles = {
    default: {
      backgroundColor: brutalist.surfaceContainerLowest,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: brutalist.outlineVariant,
    },
    elevated: {
      backgroundColor: brutalist.surfaceContainerLowest,
      borderRadius: 12,
      ...brutalistShadow,
    },
    outlined: {
      backgroundColor: brutalist.surfaceContainerLowest,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: brutalist.primaryContainer,
    },
  };

  return (
    <View
      style={[{ padding: 16 }, variantStyles[variant], style]}
      className={className}
      {...props}
    >
      {children}
    </View>
  );
}
