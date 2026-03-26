import { Redirect, Stack } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function OnboardingLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const onboardingComplete =
    (user?.publicMetadata?.onboardingComplete as boolean) ||
    (user?.unsafeMetadata?.onboardingComplete as boolean) ||
    false;
  if (onboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    />
  );
}
