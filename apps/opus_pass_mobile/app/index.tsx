import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-ed-bg">
        <ActivityIndicator color="#7E5896" />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? '/(tabs)' : '/(auth)/sign-in'} />;
}
