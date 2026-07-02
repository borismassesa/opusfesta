import { Redirect, Stack, type ErrorBoundaryProps } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ErrorFallback } from '@/components/ErrorFallback';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} retry={retry} title="Sign-in hit a snag" />;
}

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  // If signed in, redirect to root which handles onboarding checks
  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
  );
}
