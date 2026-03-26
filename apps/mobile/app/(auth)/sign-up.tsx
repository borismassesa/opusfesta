import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { OtpInput } from '@/components/auth/OtpInput';
import { brutalist, brutalistShadow, brutalistShadowPrimary } from '@/constants/theme';
import { BrutalistHeader } from '@/components/onboarding/BrutalistHeader';

WebBrowser.maybeCompleteAuthSession();

type VerifyMode = 'email' | 'phone' | null;

function BrutalistInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontFamily: 'WorkSans-Bold',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: brutalist.onSurfaceVariant,
          marginLeft: 2,
        }}
      >
        {label}
      </Text>
      <View style={[{ backgroundColor: '#fff', borderRadius: 12 }, brutalistShadow]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={brutalist.outlineVariant}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            fontFamily: 'WorkSans-Regular',
            fontSize: 16,
            color: brutalist.onSurface,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        />
      </View>
    </View>
  );
}

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const { role = 'couple' } = useLocalSearchParams<{ role?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyMode, setVerifyMode] = useState<VerifyMode>(null);
  const [tips, setTips] = useState(false);

  const handleEmailSignUp = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { user_type: role },
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
      const { createdSessionId, setActive: setOAuthActive, signUp } = await startOAuthFlow({
        unsafeMetadata: { user_type: role },
      } as any);
      if (createdSessionId && setOAuthActive) {
        if (signUp?.createdUserId) {
          await signUp.update({ unsafeMetadata: { user_type: role } });
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
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (verifyMode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
        <BrutalistHeader onBack={() => setVerifyMode(null)} />
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: brutalist.onSurface, marginBottom: 8 }}>
            Verify your account
          </Text>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: brutalist.onSurfaceVariant, marginBottom: 24 }}>
            We sent a 6-digit code to {email}
          </Text>
          <OtpInput onComplete={handleVerify} error={error} />
          {loading && (
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: brutalist.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
              Verifying...
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <BrutalistHeader onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 28,
            letterSpacing: -0.5,
            color: brutalist.onSurface,
            marginBottom: 8,
          }}
        >
          Create Account
        </Text>
        <Text
          style={{
            fontFamily: 'WorkSans-Medium',
            fontSize: 15,
            color: brutalist.onSurfaceVariant,
            marginBottom: 28,
          }}
        >
          Start your celebration journey with the finest curators.
        </Text>

        {/* Form */}
        <View style={{ gap: 18 }}>
          <BrutalistInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="curator@festivals.tz"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <BrutalistInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {/* Tips checkbox */}
          <Pressable
            onPress={() => setTips(!tips)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: brutalist.outlineVariant,
                backgroundColor: tips ? brutalist.primaryContainer : brutalist.surfaceContainerLow,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tips && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 13, color: brutalist.onSurface }}>
              Send me planning tips and vendor offers
            </Text>
          </Pressable>

          {error ? (
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: brutalist.error }}>{error}</Text>
          ) : null}

          {/* Create Account CTA */}
          <Pressable
            onPress={handleEmailSignUp}
            disabled={loading || !email.includes('@') || password.length < 8}
            style={[
              {
                backgroundColor: (!email.includes('@') || password.length < 8) ? brutalist.surfaceContainerHighest : brutalist.primaryContainer,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: loading ? 0.7 : 1,
              },
              (email.includes('@') && password.length >= 8) ? brutalistShadow : {},
            ]}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk-Bold',
                fontSize: 17,
                color: (!email.includes('@') || password.length < 8) ? brutalist.outline : '#fff',
                letterSpacing: 0.5,
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: brutalist.surfaceContainerHighest }} />
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: brutalist.outline,
              marginHorizontal: 16,
            }}
          >
            or
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: brutalist.surfaceContainerHighest }} />
        </View>

        {/* Social Buttons */}
        <View style={{ gap: 12 }}>
          <Pressable
            onPress={() => {}}
            style={[
              {
                backgroundColor: brutalist.onSurface,
                paddingVertical: 14,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              },
              brutalistShadowPrimary,
            ]}
          >
            <Ionicons name="logo-apple" size={20} color="#fff" />
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#fff' }}>
              Continue with Apple
            </Text>
          </Pressable>

          <Pressable
            onPress={handleGoogleSignUp}
            style={{
              backgroundColor: 'transparent',
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderWidth: 2,
              borderColor: brutalist.onSurface,
            }}
          >
            <Ionicons name="logo-google" size={18} color={brutalist.onSurface} />
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: brutalist.onSurface }}>
              Continue with Google
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 32 }}>
          <Text style={{ fontFamily: 'WorkSans-Medium', fontSize: 14, color: brutalist.onSurfaceVariant }}>
            Already have an account?{' '}
            <Text
              style={{ fontFamily: 'WorkSans-Bold', color: brutalist.onSecondaryContainer }}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              Log in
            </Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: brutalist.outline }}>
              Terms
            </Text>
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: brutalist.outline }}>
              Privacy
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
