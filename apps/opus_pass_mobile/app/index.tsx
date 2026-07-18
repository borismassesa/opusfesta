import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-ed-bg">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-dancing-script-bold text-4xl text-ed-on-surface">OpusPass</Text>
        <Text className="mt-3 text-center font-work-sans text-base leading-6 text-ed-on-surface-variant">
          Invitations, RSVPs, guest lists and pledges — in your pocket.
        </Text>
      </View>
    </SafeAreaView>
  );
}
