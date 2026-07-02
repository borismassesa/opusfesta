import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';
import { editorial } from '@/constants/theme';
import { ErrorFallback } from '@/components/ErrorFallback';

const AUTH_LOAD_TIMEOUT_MS = 8000;

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoaded) return;
    setTimedOut(false);
    const timeout = setTimeout(() => setTimedOut(true), AUTH_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isLoaded, attempt]);

  if (!isLoaded) {
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
        <ActivityIndicator size="small" color="#5B2D8E" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Check both publicMetadata (set by backend/webhook) and unsafeMetadata (set by client)
  const onboardingComplete =
    (user?.publicMetadata?.onboardingComplete as boolean) ||
    (user?.unsafeMetadata?.onboardingComplete as boolean) ||
    false;

  if (!onboardingComplete) {
    const userType =
      (user?.publicMetadata?.userType as string) ??
      (user?.unsafeMetadata?.userType as string) ??
      // Legacy fallback: users who signed up before the key was standardized.
      (user?.unsafeMetadata?.user_type as string) ??
      'couple';

    if (userType === 'vendor') {
      return <Redirect href="/(onboarding)/vendor/step1-business" />;
    }
    return <Redirect href="/(onboarding)/couple/step1-names" />;
  }

  return <Redirect href="/(tabs)" />;
}
