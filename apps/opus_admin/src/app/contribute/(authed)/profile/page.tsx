import { getContributorProfile } from '@/lib/contribute/profile'
import { initialsFromName } from '@/lib/cms/advice-ideas'
import ProfileEditor from './ProfileEditor'

export const dynamic = 'force-dynamic'

export default async function ContributorProfilePage() {
  const { profile, identity } = await getContributorProfile()

  // Pre-fill the form from the existing row if present, otherwise from
  // sensible Clerk defaults so the form isn't empty on first visit.
  const initial = {
    name: profile?.name ?? identity.name ?? '',
    role: profile?.role ?? '',
    bio: profile?.bio ?? '',
    initials:
      profile?.initials || initialsFromName(profile?.name ?? identity.name ?? ''),
    avatar_url: profile?.avatar_url ?? '',
  }

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {profile
            ? 'This is the byline readers see on every article you publish. Admins see the same row from the operations side.'
            : 'Set up your byline. Once saved, this is what readers see on every article you publish.'}
        </p>
      </div>

      <ProfileEditor
        initial={initial}
        email={identity.email}
        existingId={profile?.id ?? null}
      />
    </div>
  )
}
