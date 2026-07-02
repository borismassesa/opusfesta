import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OtpInput } from '@/components/auth/OtpInput';
import { authTheme } from '@/constants/theme';

export default function ResetPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordHint =
    newPassword.length > 0 && newPassword.length < 8 ? `${8 - newPassword.length} more characters needed` : undefined;

  const handleResendCode = async () => {
    if (!isLoaded || !signIn || !email) return;
    await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
  };

  const handleComplete = async (code: string) => {
    if (!isLoaded || !signIn) return;
    if (newPassword.length < 8) {
      setError('Enter your new password above first (at least 8 characters)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else if (result.status === 'needs_second_factor') {
        setError('This account requires a two-factor code, which isn\'t supported here yet. Contact support.');
      } else {
        setError('Password reset could not be completed. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: authTheme.bg }}>
      <AuthHeader onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 26, color: authTheme.ink, marginBottom: 8 }}>
            Choose a new password
          </Text>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 15, color: authTheme.textSecondary, marginBottom: 28 }}>
            We sent a 6-digit code to {email}. Set your new password, then enter the code below.
          </Text>

          <View style={{ gap: 24 }}>
            <AuthInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password-new"
              hint={passwordHint}
            />

            <OtpInput onComplete={handleComplete} error={error} onResend={handleResendCode} resendCooldownSeconds={30} />

            {loading && (
              <Text
                style={{
                  fontFamily: 'WorkSans-Regular',
                  fontSize: 14,
                  color: authTheme.textSecondary,
                  textAlign: 'center',
                }}
              >
                Resetting password...
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
