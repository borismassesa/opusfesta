import { useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { resolveOnboardingComplete, resolveUserType, type UserType } from './onboardingMetadata';

export interface OpusFestaUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  onboardingComplete: boolean;
}

const hasClerkKey = !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Hook that maps Clerk user to OpusFesta domain user.
 * Returns mock guest state when Clerk is not configured (dev preview mode).
 */
export function useOpusFestaAuth() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  if (!hasClerkKey) {
    return {
      user: null,
      isSignedIn: false as const,
      isLoaded: true,
      signOut: async () => {},
    };
  }

  const opusUser: OpusFestaUser | null =
    isSignedIn && user
      ? {
          id: (user.publicMetadata?.supabaseUserId as string) ?? user.id,
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          name: user.fullName,
          imageUrl: user.imageUrl,
          onboardingComplete: resolveOnboardingComplete(user.publicMetadata, user.unsafeMetadata),
        }
      : null;

  return { user: opusUser, isSignedIn, isLoaded, signOut };
}

export type OnboardingState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'incomplete'; userType: UserType }
  | { status: 'couple' }
  | { status: 'vendor' };

/**
 * Single source of truth for "where should this signed-in user land" — the
 * onboardingComplete/userType Clerk-metadata OR-chain used to be duplicated
 * across app/index.tsx, app/(tabs)/_layout.tsx, and app/(onboarding)/_layout.tsx.
 * A post-onboarding 'unknown' userType (accounts predating metadata
 * standardization) is folded into 'couple' here, matching the app's
 * historical implicit behavior — only the pre-onboarding-complete branch
 * needs to distinguish 'unknown' to avoid routing into the wrong wizard.
 */
export function useOnboardingState(): OnboardingState {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return { status: 'loading' };
  if (!isSignedIn) return { status: 'signed-out' };

  const onboardingComplete = resolveOnboardingComplete(user?.publicMetadata, user?.unsafeMetadata);
  const userType = resolveUserType(user?.publicMetadata, user?.unsafeMetadata);

  if (!onboardingComplete) return { status: 'incomplete', userType };
  return userType === 'vendor' ? { status: 'vendor' } : { status: 'couple' };
}

/**
 * Secure token cache for Clerk using expo-secure-store.
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail — secure store may not be available in dev
    }
  },
};
