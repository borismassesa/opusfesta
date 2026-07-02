import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { authTheme } from '@/constants/theme';

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
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Could not send reset code');
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
            Reset your password
          </Text>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 15, color: authTheme.textSecondary, marginBottom: 28 }}>
            Enter the email associated with your account and we'll send you a reset code.
          </Text>

          <View style={{ gap: 18 }}>
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
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: authTheme.danger }}>{error}</Text>
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
