import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';
import { OtpInput } from '@/components/auth/OtpInput';
import { authTheme } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type SecondFactorStrategy = 'totp' | 'phone_code' | 'email_code' | 'backup_code';

const SECOND_FACTOR_PRIORITY: SecondFactorStrategy[] = ['totp', 'phone_code', 'email_code', 'backup_code'];

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secondFactor, setSecondFactor] = useState<SecondFactorStrategy | null>(null);
  const [backupCode, setBackupCode] = useState('');

  const emailError = email.length > 0 && !isValidEmail(email) ? 'Enter a valid email' : undefined;

  const prepareSecondFactor = async (strategy: 'phone_code' | 'email_code', factors: any[]) => {
    if (!signIn) return;
    if (strategy === 'phone_code') {
      const factor = factors.find((f) => f.strategy === 'phone_code');
      if (factor) await signIn.prepareSecondFactor({ strategy: 'phone_code', phoneNumberId: factor.phoneNumberId });
    } else {
      const factor = factors.find((f) => f.strategy === 'email_code');
      if (factor) await signIn.prepareSecondFactor({ strategy: 'email_code', emailAddressId: factor.emailAddressId });
    }
  };

  const handleEmailSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else if (result.status === 'needs_second_factor') {
        const factors = result.supportedSecondFactors ?? [];
        const strategy = SECOND_FACTOR_PRIORITY.find((s) => factors.some((f) => f.strategy === s));
        if (!strategy) {
          setError('This account requires a two-factor method that isn\'t supported here yet. Contact support.');
          return;
        }
        if (strategy === 'phone_code' || strategy === 'email_code') {
          await prepareSecondFactor(strategy, factors);
        }
        setSecondFactor(strategy);
      } else if (result.status === 'needs_new_password') {
        setError('Your password needs to be reset before you can sign in.');
      } else {
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSecondFactorComplete = async (code: string) => {
    if (!isLoaded || !signIn || !secondFactor) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptSecondFactor({ strategy: secondFactor, code } as any);
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        setError('That code didn\'t work. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signIn || (secondFactor !== 'phone_code' && secondFactor !== 'email_code')) return;
    await prepareSecondFactor(secondFactor, signIn.supportedSecondFactors ?? []);
  };

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow, router]);

  if (secondFactor) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: authTheme.bg }}>
        <AuthHeader onBack={() => setSecondFactor(null)} />
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 24, color: authTheme.ink, marginBottom: 8 }}>
            Two-factor verification
          </Text>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: authTheme.textSecondary, marginBottom: 24 }}>
            {secondFactor === 'totp' && 'Enter the 6-digit code from your authenticator app.'}
            {secondFactor === 'phone_code' && 'We sent a 6-digit code to your phone.'}
            {secondFactor === 'email_code' && `We sent a 6-digit code to ${email}.`}
            {secondFactor === 'backup_code' && 'Enter one of your backup codes.'}
          </Text>

          {secondFactor === 'backup_code' ? (
            <View style={{ gap: 18 }}>
              <AuthInput
                label="Backup Code"
                value={backupCode}
                onChangeText={setBackupCode}
                placeholder="Enter backup code"
                autoCapitalize="none"
                error={error || undefined}
              />
              <AuthButton
                label={loading ? 'Verifying...' : 'Verify'}
                onPress={() => handleSecondFactorComplete(backupCode)}
                loading={loading}
                disabled={backupCode.length === 0}
              />
            </View>
          ) : (
            <>
              <OtpInput
                onComplete={handleSecondFactorComplete}
                error={error}
                onResend={secondFactor === 'phone_code' || secondFactor === 'email_code' ? handleResendCode : undefined}
                resendCooldownSeconds={30}
              />
              {loading && (
                <Text
                  style={{
                    fontFamily: 'WorkSans-Regular',
                    fontSize: 14,
                    color: authTheme.textSecondary,
                    textAlign: 'center',
                    marginTop: 16,
                  }}
                >
                  Verifying...
                </Text>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: authTheme.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, marginBottom: 32 }}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="arrow-back" size={24} color={authTheme.ink} />
            </Pressable>
          </View>

          {/* Header */}
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 28,
              color: authTheme.ink,
              marginBottom: 8,
            }}
          >
            Welcome Back.
          </Text>
          <Text
            style={{
              fontFamily: 'WorkSans-Regular',
              fontSize: 15,
              lineHeight: 22,
              color: authTheme.textSecondary,
              marginBottom: 32,
            }}
          >
            Curating your next great celebration begins here.
          </Text>

          {/* Form */}
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
            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              rightLabel="Forgot password?"
              onRightPress={() => router.push('/(auth)/forgot-password')}
            />

            {error ? (
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: authTheme.danger }}>{error}</Text>
            ) : null}

            <AuthButton
              label={loading ? 'Signing in...' : 'Log In'}
              onPress={handleEmailSignIn}
              loading={loading}
              disabled={!isValidEmail(email) || password.length === 0}
            />
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: authTheme.border }} />
            <Text
              style={{
                fontFamily: 'WorkSans-SemiBold',
                fontSize: 11,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: authTheme.textSecondary,
                marginHorizontal: 16,
              }}
            >
              Or continue with
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: authTheme.border }} />
          </View>

          {/* Social Buttons */}
          <View style={{ gap: 12 }}>
            <AuthButton
              variant="outline"
              label="Continue with Google"
              accessibilityLabel="Continue with Google"
              icon={<Ionicons name="logo-google" size={18} color={authTheme.ink} />}
              onPress={handleGoogleSignIn}
            />
            <AppleSignInButton onSuccess={() => router.replace('/')} onError={setError} />
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 32 }}>
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: authTheme.textSecondary }}>
              Don't have an account?{' '}
              <Text
                style={{ fontFamily: 'WorkSans-SemiBold', color: authTheme.accent }}
                onPress={() => router.push('/(auth)/sign-up')}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
