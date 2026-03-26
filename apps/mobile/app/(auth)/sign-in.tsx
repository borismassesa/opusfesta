import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { OtpInput } from '@/components/auth/OtpInput';
import { brutalist, brutalistShadow } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

function BrutalistInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightLabel,
  onRightPress,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  rightLabel?: string;
  onRightPress?: () => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
        <Text
          style={{
            fontFamily: 'WorkSans-Bold',
            fontSize: 11,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: brutalist.onSurfaceVariant,
          }}
        >
          {label}
        </Text>
        {rightLabel && (
          <Pressable onPress={onRightPress}>
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: brutalist.secondary }}>
              {rightLabel}
            </Text>
          </Pressable>
        )}
      </View>
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

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brutalist.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, marginBottom: 32 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={brutalist.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* Editorial Header */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 36,
            lineHeight: 40,
            letterSpacing: -1.5,
            color: brutalist.onSurface,
            marginBottom: 8,
          }}
        >
          Welcome Back.
        </Text>
        <Text
          style={{
            fontFamily: 'WorkSans-Regular',
            fontSize: 17,
            lineHeight: 24,
            color: brutalist.onSurfaceVariant,
            marginBottom: 36,
          }}
        >
          Curating your next great celebration begins here.
        </Text>

        {/* Form */}
        <View style={{ gap: 20 }}>
          <BrutalistInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="name@celebrate.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <BrutalistInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            rightLabel="Forgot password?"
          />

          {error ? (
            <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 13, color: brutalist.error }}>{error}</Text>
          ) : null}

          {/* Login CTA */}
          <Pressable
            onPress={handleEmailSignIn}
            disabled={loading || !email.includes('@') || password.length === 0}
            style={[
              {
                backgroundColor: brutalist.primaryContainer,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
              },
              brutalistShadow,
            ]}
          >
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#fff' }}>
              {loading ? 'Signing in...' : 'Log In'}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: brutalist.surfaceContainerHighest }} />
          <Text
            style={{
              fontFamily: 'WorkSans-Bold',
              fontSize: 9,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: brutalist.outline,
              marginHorizontal: 16,
            }}
          >
            Or continue with
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: brutalist.surfaceContainerHighest }} />
        </View>

        {/* Social Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: brutalist.surfaceContainerHigh,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Ionicons name="logo-apple" size={18} color={brutalist.onSurface} />
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: brutalist.onSurface }}>Apple</Text>
          </Pressable>
          <Pressable
            onPress={handleGoogleSignIn}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: brutalist.surfaceContainerHigh,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Ionicons name="logo-google" size={16} color={brutalist.onSurface} />
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: brutalist.onSurface }}>Google</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 32 }}>
          <Text style={{ fontFamily: 'WorkSans-Regular', fontSize: 14, color: brutalist.onSurfaceVariant }}>
            Don't have an account?{' '}
            <Text
              style={{ fontFamily: 'WorkSans-Bold', color: brutalist.primaryContainer, textDecorationLine: 'underline' }}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
