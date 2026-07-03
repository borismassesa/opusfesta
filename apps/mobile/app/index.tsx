import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useOnboardingState } from '@/lib/auth';

const AUTH_LOAD_TIMEOUT_MS = 8000;

export default function IndexScreen() {
  const { isLoaded } = useAuth();
  const onboarding = useOnboardingState();
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { editorial, colors } = useTheme();

  useEffect(() => {
    if (isLoaded) return;
    setTimedOut(false);
    const timeout = setTimeout(() => setTimedOut(true), AUTH_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isLoaded, attempt]);

  if (!isLoaded || onboarding.status === 'loading') {
    if (timedOut) {
      return (
        <ErrorFallback
          error={new Error('Sign-in is taking longer than expected. Check your connection and try again.')}
          retry={() => setAttempt((a) => a + 1)}
          title="Couldn't load your session"
        />
      );
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: editorial.bg }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (onboarding.status === 'signed-out') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (onboarding.status === 'incomplete') {
    // 'unknown' (no userType metadata yet) defaults to the couple wizard —
    // the historical behavior for accounts that predate the metadata key.
    if (onboarding.userType === 'vendor') {
      return <Redirect href="/(onboarding)/vendor/step1-business" />;
    }
    return <Redirect href="/(onboarding)/couple/step1-names" />;
  }

  return <Redirect href={onboarding.status === 'vendor' ? '/(vendor-tabs)' : '/(tabs)'} />;
}
