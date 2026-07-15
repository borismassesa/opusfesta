import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRedeemInviteCode } from '@/hooks/useVendorTeam';
import { getErrorMessage } from '@/lib/errors';

// Redeeming patches Clerk publicMetadata server-side (userType 'vendor',
// onboardingComplete true) — reload the Clerk user and bounce through the
// index route so onboarding routing lands in the vendor tabs, same as
// step4-portfolio does after regular onboarding.
export default function JoinTeamScreen() {
  const router = useRouter();
  const { user } = useUser();
  const redeemMutation = useRedeemInviteCode();
  const [code, setCode] = useState('');

  const submit = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) {
      Alert.alert('Invalid code', 'Enter the invite code you were sent.');
      return;
    }
    redeemMutation.mutate(
      { code: trimmed },
      {
        onSuccess: async (result) => {
          await user?.reload();
          Alert.alert('Welcome aboard', result.businessName ? `You've joined ${result.businessName}.` : "You've joined the team.", [
            { text: 'Continue', onPress: () => router.replace('/') },
          ]);
        },
        onError: (err) => Alert.alert('Could not join', getErrorMessage(err, 'Check the code and try again.')),
      }
    );
  };

  return (
    <View className="flex-1 bg-of-cream px-6 justify-center">
      <Pressable onPress={() => router.back()} className="absolute top-16 left-5 p-2">
        <Ionicons name="chevron-back" size={26} color="#1A1A1A" />
      </Pressable>

      <Text className="font-space-grotesk-bold text-2xl text-of-text mb-2">Join your team</Text>
      <Text className="font-work-sans text-sm text-of-muted mb-8">
        Enter the invite code the business owner shared with you.
      </Text>

      <TextInput
        value={code}
        onChangeText={(v) => setCode(v.toUpperCase())}
        placeholder="ABCD2345"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={8}
        className="bg-of-white border border-of-border rounded-2xl px-5 py-4 font-space-grotesk-bold text-2xl text-of-text tracking-[8px] text-center mb-6"
      />

      <Pressable
        disabled={redeemMutation.isPending || code.trim().length < 6}
        onPress={submit}
        className={`bg-of-primary rounded-2xl py-4 items-center ${
          redeemMutation.isPending || code.trim().length < 6 ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <Text className="font-work-sans-bold text-base text-white">
          {redeemMutation.isPending ? 'Joining…' : 'Join team'}
        </Text>
      </Pressable>
    </View>
  );
}
