import { useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

export interface OpusFestaUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: 'couple' | 'vendor' | 'admin';
  onboardingComplete: boolean;
}

const hasClerkKey = !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Hook that maps Clerk user to OpusFesta domain user.
 * Returns mock guest state when Clerk is not configured (dev preview mode).
 */
export function useOpusFestaAuth() {
  if (!hasClerkKey) {
    return {
      user: null,
      isSignedIn: false as const,
      isLoaded: true,
      signOut: async () => {},
    };
  }

  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  const opusUser: OpusFestaUser | null =
    isSignedIn && user
      ? {
          id: (user.publicMetadata?.supabaseUserId as string) ?? user.id,
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          name: user.fullName,
          imageUrl: user.imageUrl,
          role:
            (user.publicMetadata?.userType as OpusFestaUser['role']) ?? 'couple',
          onboardingComplete:
            (user.publicMetadata?.onboardingComplete as boolean) ||
            (user.unsafeMetadata?.onboardingComplete as boolean) ||
            false,
        }
      : null;

  return { user: opusUser, isSignedIn, isLoaded, signOut };
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
