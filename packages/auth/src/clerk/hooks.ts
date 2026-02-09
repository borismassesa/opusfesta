"use client";

import { useUser, useAuth, useClerk } from "@clerk/nextjs";
import { mapRoleToUserType } from "../roles";
import type { UserType, UserRole, OpusFestaUser } from "../types";

/**
 * Unified auth hook for OpusFesta apps.
 * Wraps Clerk hooks and maps to OpusFesta types.
 */
export function useOpusFestaAuth() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const { signOut } = useClerk();

  const isLoaded = isUserLoaded && isAuthLoaded;

  const role = (user?.publicMetadata?.role as UserRole) || "user";
  const userType: UserType = mapRoleToUserType(role);

  const opusFestaUser: OpusFestaUser | null =
    user && isSignedIn
      ? {
          id: (user.publicMetadata?.supabase_uuid as string) || user.id,
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName,
          role,
          userType,
          imageUrl: user.imageUrl,
        }
      : null;

  return {
    user: opusFestaUser,
    clerkUser: user,
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    userId,
    role,
    userType,
    getToken,
    signOut,
  };
}
