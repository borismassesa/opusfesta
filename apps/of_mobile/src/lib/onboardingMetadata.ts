// Pure Clerk-metadata parsing, split out from auth.ts so it can be
// unit-tested without pulling in @clerk/clerk-expo, which only loads under
// the React Native/Metro toolchain and can't run under plain Node.

type Metadata = Record<string, unknown> | null | undefined;

export type UserType = 'couple' | 'vendor' | 'unknown';

/**
 * Checks publicMetadata (set by the complete-onboarding backend) first, then
 * unsafeMetadata (set by the client) as a fallback, including the legacy
 * `user_type` key used before the metadata shape was standardized.
 */
export function resolveUserType(publicMetadata: Metadata, unsafeMetadata: Metadata): UserType {
  const raw =
    (publicMetadata?.userType as string | undefined) ??
    (unsafeMetadata?.userType as string | undefined) ??
    (unsafeMetadata?.user_type as string | undefined);

  if (raw === 'vendor') return 'vendor';
  if (raw === 'couple') return 'couple';
  return 'unknown';
}

export function resolveOnboardingComplete(publicMetadata: Metadata, unsafeMetadata: Metadata): boolean {
  return Boolean(publicMetadata?.onboardingComplete) || Boolean(unsafeMetadata?.onboardingComplete);
}
