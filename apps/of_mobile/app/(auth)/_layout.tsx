import { useEffect } from 'react';
import { Redirect, Stack, type ErrorBoundaryProps } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { colorScheme } from 'nativewind';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useTheme } from '@/theme/useTheme';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} retry={retry} title="Sign-in hit a snag" />;
}

export default function AuthLayout() {
  const { isSignedIn } = useAuth();
  const { preference } = useTheme();

  // Auth is light-only for v1 (its screens use a separate monochrome palette that
  // has no dark variant). Force the light scheme while this stack is mounted and
  // restore the user's real preference when they leave it (e.g. after sign-in).
  useEffect(() => {
    colorScheme.set('light');
    return () => colorScheme.set(preference);
  }, [preference]);

  // If signed in, redirect to root which handles onboarding checks
  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
  );
}
