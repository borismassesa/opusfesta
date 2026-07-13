import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { OtpInput } from '@/components/auth/OtpInput';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { authTheme } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';

WebBrowser.maybeCompleteAuthSession();

type VerifyMode = 'email' | 'phone' | null;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const { role = 'couple' } = useLocalSearchParams<{ role?: string }>();
  const roleLabel = role === 'vendor' ? 'Vendor' : 'Couple';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyMode, setVerifyMode] = useState<VerifyMode>(null);
  const [tips, setTips] = useState(false);

  const emailError = email.length > 0 && !isValidEmail(email) ? 'Enter a valid email' : undefined;
  const passwordHint =
    password.length > 0 && password.length < 8 ? `${8 - password.length} more characters needed` : undefined;

  const handleEmailSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { userType: role },
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifyMode('email');
    } catch (err) {
      setError(getErrorMessage(err, 'Sign up failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { createdSessionId, setActive: setOAuthActive, signUp: oauthSignUp } = await startOAuthFlow({
        unsafeMetadata: { userType: role },
      });
      if (createdSessionId && setOAuthActive) {
        if (oauthSignUp?.createdUserId) {
          await oauthSignUp.update({ unsafeMetadata: { userType: role } });
        }
        await setOAuthActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Google sign up failed'));
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow, role, router]);

  const handleVerify = async (code: string) => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        setError('Verification could not be completed. Please try again.');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

  if (verifyMode) {
    return (
      <SafeAreaView className="flex-1 bg-of-white">
        <AuthHeader onBack={() => setVerifyMode(null)} />
        <View className="flex-1 px-6 pt-6">
          <Text className="font-work-sans-bold text-2xl text-of-ink mb-2">
            Verify your account
          </Text>
          <Text className="font-work-sans text-sm text-of-muted mb-6">
            We sent a 6-digit code to {email}
          </Text>
          <OtpInput onComplete={handleVerify} error={error} onResend={handleResendCode} resendCooldownSeconds={30} />
          {loading && (
            <Text className="font-work-sans text-sm text-of-muted text-center mt-4">
              Verifying...
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-of-white">
      <AuthHeader onBack={() => router.back()} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text className="font-work-sans-bold text-[26px] text-of-ink mb-1">
            Create Account
          </Text>
          <View className="self-start bg-of-pale rounded-full px-2.5 py-1 mb-3">
            <Text className="font-work-sans-semibold text-xs text-of-ink">
              Signing up as {roleLabel}
            </Text>
          </View>
          <Text className="font-work-sans text-[15px] text-of-muted mb-7">
            Start your celebration journey with the finest curators.
          </Text>

          {/* Form */}
          <View className="gap-[18px]">
            <AuthInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="curator@festivals.tz"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
            />
            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password-new"
              hint={passwordHint}
            />

            {/* Tips checkbox */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setTips(!tips);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: tips }}
              accessibilityLabel="Send me planning tips and vendor offers"
              className="flex-row items-center gap-2.5 py-1"
            >
              <View
                className={`w-5 h-5 rounded items-center justify-center border-[1.5px] border-of-line ${tips ? 'bg-of-ink' : 'bg-of-white'}`}
              >
                {tips && <Ionicons name="checkmark" size={14} color={authTheme.bg} />}
              </View>
              <Text className="font-work-sans text-[13px] text-of-ink">
                Send me planning tips and vendor offers
              </Text>
            </Pressable>

            {error ? (
              <Text className="font-work-sans text-[13px] text-of-danger">{error}</Text>
            ) : null}

            <AuthButton
              label={loading ? 'Creating...' : 'Create Account'}
              onPress={handleEmailSignUp}
              loading={loading}
              disabled={!isValidEmail(email) || password.length < 8}
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-of-line" />
            <Text className="font-work-sans-semibold text-[11px] tracking-[1px] uppercase text-of-muted mx-4">
              or
            </Text>
            <View className="flex-1 h-px bg-of-line" />
          </View>

          {/* Social Buttons */}
          <View className="gap-3">
            <AuthButton
              variant="outline"
              label="Continue with Google"
              accessibilityLabel="Continue with Google"
              icon={<Ionicons name="logo-google" size={18} color={authTheme.ink} />}
              onPress={handleGoogleSignUp}
            />
            <AppleSignInButton role={role} onSuccess={() => router.replace('/')} onError={setError} />
          </View>

          {/* Footer */}
          <View className="items-center mt-6 mb-6">
            <Text className="font-work-sans text-sm text-of-muted">
              Already have an account?{' '}
              <Text
                className="font-work-sans-semibold text-of-accent"
                onPress={() => router.push('/(auth)/sign-in')}
              >
                Log in
              </Text>
            </Text>
            <View className="flex-row gap-4 mt-4">
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Terms of Use"
                onPress={() => WebBrowser.openBrowserAsync('https://opusfesta.com/terms-of-use')}
              >
                <Text className="font-work-sans-semibold text-[11px] tracking-[1px] uppercase text-of-muted underline">
                  Terms
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Privacy Policy"
                onPress={() => WebBrowser.openBrowserAsync('https://opusfesta.com/privacy-policy')}
              >
                <Text className="font-work-sans-semibold text-[11px] tracking-[1px] uppercase text-of-muted underline">
                  Privacy
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
