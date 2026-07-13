import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { getErrorMessage } from '@/lib/errors';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailError = email.length > 0 && !isValidEmail(email) ? 'Enter a valid email' : undefined;

  const handleSendCode = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      router.push({ pathname: '/(auth)/reset-password', params: { email } });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send reset code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-of-white">
      <AuthHeader onBack={() => router.back()} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-work-sans-bold text-[26px] text-of-ink mb-2">
            Reset your password
          </Text>
          <Text className="font-work-sans text-[15px] text-of-muted mb-7">
            Enter the email associated with your account and we'll send you a reset code.
          </Text>

          <View className="gap-[18px]">
            <AuthInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@celebrate.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
            />

            {error ? (
              <Text className="font-work-sans text-[13px] text-of-danger">{error}</Text>
            ) : null}

            <AuthButton
              label={loading ? 'Sending...' : 'Send code'}
              onPress={handleSendCode}
              loading={loading}
              disabled={!isValidEmail(email)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
