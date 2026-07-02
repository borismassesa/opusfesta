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
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed');
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
      } as any);
      if (createdSessionId && setOAuthActive) {
        if (oauthSignUp?.createdUserId) {
          await oauthSignUp.update({ unsafeMetadata: { userType: role } });
        }
        await setOAuthActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Google sign up failed');
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
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed');
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
      <SafeAreaView style={{ flex: 1, backgroundColor: authTheme.bg }}>
        <AuthHeader onBack={() => setVerifyMode(null)} />
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 24, color: authTheme.ink, marginBottom: 8 }}>
            Verify your account
          </Text>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: authTheme.textSecondary, marginBottom: 24 }}>
            We sent a 6-digit code to {email}
          </Text>
          <OtpInput onComplete={handleVerify} error={error} onResend={handleResendCode} resendCooldownSeconds={30} />
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: authTheme.bg }}>
      <AuthHeader onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 26, color: authTheme.ink, marginBottom: 4 }}>
            Create Account
          </Text>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: authTheme.chipBg,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontFamily: 'WorkSans-SemiBold', fontSize: 12, color: authTheme.ink }}>
              Signing up as {roleLabel}
            </Text>
          </View>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 15, color: authTheme.textSecondary, marginBottom: 28 }}>
            Start your celebration journey with the finest curators.
          </Text>

          {/* Form */}
          <View style={{ gap: 18 }}>
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
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: authTheme.border,
                  backgroundColor: tips ? authTheme.ink : authTheme.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tips && <Ionicons name="checkmark" size={14} color={authTheme.bg} />}
              </View>
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: authTheme.ink }}>
                Send me planning tips and vendor offers
              </Text>
            </Pressable>

            {error ? (
              <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: authTheme.danger }}>{error}</Text>
            ) : null}

            <AuthButton
              label={loading ? 'Creating...' : 'Create Account'}
              onPress={handleEmailSignUp}
              loading={loading}
              disabled={!isValidEmail(email) || password.length < 8}
            />
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
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
              or
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
              onPress={handleGoogleSignUp}
            />
            <AppleSignInButton role={role} onSuccess={() => router.replace('/')} onError={setError} />
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: authTheme.textSecondary }}>
              Already have an account?{' '}
              <Text
                style={{ fontFamily: 'WorkSans-SemiBold', color: authTheme.accent }}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                Log in
              </Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Terms of Use"
                onPress={() => WebBrowser.openBrowserAsync('https://opusfesta.com/terms-of-use')}
              >
                <Text
                  style={{
                    fontFamily: 'WorkSans-SemiBold',
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: authTheme.textSecondary,
                    textDecorationLine: 'underline',
                  }}
                >
                  Terms
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Privacy Policy"
                onPress={() => WebBrowser.openBrowserAsync('https://opusfesta.com/privacy-policy')}
              >
                <Text
                  style={{
                    fontFamily: 'WorkSans-SemiBold',
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: authTheme.textSecondary,
                    textDecorationLine: 'underline',
                  }}
                >
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
