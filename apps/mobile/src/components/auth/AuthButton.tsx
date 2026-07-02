import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { authTheme } from '@/constants/theme';

type AuthButtonVariant = 'primary' | 'outline';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: AuthButtonVariant;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  accessibilityLabel,
  style,
}: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        {
          backgroundColor: isPrimary ? authTheme.ink : authTheme.bg,
          borderRadius: authTheme.radius,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: authTheme.border,
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? authTheme.bg : authTheme.ink} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={{
              fontFamily: 'WorkSans-SemiBold',
              fontSize: 16,
              color: isPrimary ? authTheme.bg : authTheme.ink,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
