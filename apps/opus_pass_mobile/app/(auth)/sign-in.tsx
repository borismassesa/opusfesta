import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/navigation/BackButton';
import { getErrorMessage } from '@/lib/errors';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Step =
  | { name: 'identifier' }
  | { name: 'password' }
  | { name: 'email_code'; emailAddressId: string };

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>({ name: 'identifier' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finishSignIn = async (createdSessionId: string) => {
    if (!setActive) return;
    await setActive({ session: createdSessionId });
    router.replace('/');
  };

  const handleContinue = async () => {
    if (!isLoaded || !signIn || !isValidEmail(email) || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email });
      if (result.status === 'complete' && result.createdSessionId) {
        await finishSignIn(result.createdSessionId);
        return;
      }

      const factors = result.supportedFirstFactors ?? [];
      if (factors.some((f) => f.strategy === 'password')) {
        setStep({ name: 'password' });
        return;
      }

      const emailCodeFactor = factors.find((f) => f.strategy === 'email_code');
      if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setStep({ name: 'email_code', emailAddressId: emailCodeFactor.emailAddressId });
        return;
      }

      setError("This account signs in a way that isn't supported here yet. Try the web app instead.");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't find that account"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!isLoaded || !signIn || password.length === 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'password', password });
      if (result.status === 'complete' && result.createdSessionId) {
        await finishSignIn(result.createdSessionId);
      } else {
        setError("This account needs an extra verification step that isn't supported here yet.");
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Incorrect password'));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!isLoaded || !signIn || code.length === 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code });
      if (result.status === 'complete' && result.createdSessionId) {
        await finishSignIn(result.createdSessionId);
      } else {
        setError("That code didn't work. Please try again.");
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signIn || step.name !== 'email_code' || loading) return;
    setError('');
    try {
      await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: step.emailAddressId });
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't resend the code"));
    }
  };

  const heading =
    step.name === 'identifier'
      ? 'Welcome back'
      : step.name === 'password'
        ? 'Enter your password'
        : 'Check your email';

  const subheading =
    step.name === 'identifier'
      ? 'Sign in to see your wedding dashboard.'
      : step.name === 'password'
        ? `Signing in as ${email}.`
        : `We sent a 6-digit code to ${email}.`;

  return (
    <SafeAreaView className="flex-1 bg-ed-bg">
      <View className="px-4 pt-2">
        <BackButton />
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-dancing-script-bold text-4xl text-ed-on-surface">OpusPass</Text>
          <Text className="mt-2 font-work-sans-semibold text-2xl text-ed-on-surface">{heading}</Text>
          <Text className="mt-1 font-work-sans text-sm text-ed-on-surface-variant">{subheading}</Text>

          <View className="mt-8 gap-4">
            {step.name === 'identifier' ? (
              <View>
                <Text className="mb-1.5 font-work-sans-medium text-xs uppercase tracking-wide text-ed-on-surface-variant">
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                  className="rounded-xl border border-ed-outline-variant bg-ed-surface px-4 py-3 font-work-sans text-base text-ed-on-surface"
                />
              </View>
            ) : null}

            {step.name === 'password' ? (
              <View>
                <Text className="mb-1.5 font-work-sans-medium text-xs uppercase tracking-wide text-ed-on-surface-variant">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  autoFocus
                  className="rounded-xl border border-ed-outline-variant bg-ed-surface px-4 py-3 font-work-sans text-base text-ed-on-surface"
                />
              </View>
            ) : null}

            {step.name === 'email_code' ? (
              <View>
                <Text className="mb-1.5 font-work-sans-medium text-xs uppercase tracking-wide text-ed-on-surface-variant">
                  Verification code
                </Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  className="rounded-xl border border-ed-outline-variant bg-ed-surface px-4 py-3 font-work-sans text-base tracking-[4px] text-ed-on-surface"
                />
                <Pressable onPress={handleResendCode} className="mt-2 self-start">
                  <Text className="font-work-sans-medium text-sm text-ed-secondary">Resend code</Text>
                </Pressable>
              </View>
            ) : null}

            {error ? <Text className="font-work-sans text-sm text-ed-error">{error}</Text> : null}

            <Pressable
              onPress={
                step.name === 'identifier'
                  ? handleContinue
                  : step.name === 'password'
                    ? handlePasswordSubmit
                    : handleCodeSubmit
              }
              disabled={loading}
              className={`mt-2 items-center rounded-xl bg-ed-primary-container py-3.5 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              <Text className="font-work-sans-semibold text-base text-ed-on-primary">
                {loading ? 'Please wait…' : step.name === 'identifier' ? 'Continue' : 'Sign in'}
              </Text>
            </Pressable>

            {step.name !== 'identifier' ? (
              <Pressable
                onPress={() => {
                  setStep({ name: 'identifier' });
                  setError('');
                  setPassword('');
                  setCode('');
                }}
                className="items-center py-2"
              >
                <Text className="font-work-sans-medium text-sm text-ed-on-surface-variant">
                  Use a different email
                </Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
