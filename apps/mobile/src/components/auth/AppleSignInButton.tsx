import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSignInWithApple } from '@clerk/clerk-expo';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import { authTheme } from '@/constants/theme';

interface AppleSignInButtonProps {
  role?: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function AppleSignInButton({ role, onSuccess, onError }: AppleSignInButtonProps) {
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAvailable);
  }, []);

  if (Platform.OS !== 'ios' || !available) return null;

  const handlePress = async () => {
    // Guard against double-taps re-entering the flow while one is in flight.
    if (loading) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { createdSessionId, setActive } = await startAppleAuthenticationFlow(
        role ? { unsafeMetadata: { userType: role } } : undefined
      );
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        onSuccess();
      }
    } catch (err: any) {
      if (err?.code === 'ERR_REQUEST_CANCELED') return;
      onError(err.errors?.[0]?.message || err.message || 'Apple sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={authTheme.radius}
      style={{ height: 50, width: '100%', opacity: loading ? 0.6 : 1 }}
      onPress={handlePress}
    />
  );
}
