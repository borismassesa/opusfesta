import { View, type ViewProps } from 'react-native';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

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
  const { editorial } = useTheme();

  const variantStyles = {
    default: {
      backgroundColor: editorial.surfaceContainerLowest,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: editorial.outlineVariant,
    },
    elevated: {
      backgroundColor: editorial.surfaceContainerLowest,
      borderRadius: 24,
      ...shadowSoft,
    },
    outlined: {
      backgroundColor: editorial.surfaceContainerLowest,
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: editorial.primaryContainer,
    },
  };

  return (
    <View
      style={[{ padding: 20 }, variantStyles[variant], style]}
      className={className}
      {...props}
    >
      {children}
    </View>
  );
}
