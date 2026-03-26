import { Redirect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';
import { brutalist } from '@/constants/theme';

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brutalist.bg }}>
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
      (user?.unsafeMetadata?.user_type as string) ??
      'couple';

    if (userType === 'vendor') {
      return <Redirect href="/(onboarding)/vendor/step1-business" />;
    }
    return <Redirect href="/(onboarding)/couple/step1-names" />;
  }

  return <Redirect href="/(tabs)" />;
}
