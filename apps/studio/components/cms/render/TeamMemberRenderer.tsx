import OptimizedImage from '../OptimizedImage';
import PreviewBanner from './PreviewBanner';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import type { StudioAsset } from '@/lib/cms/assets';

interface TeamMemberContent {
  name: string;
  role: string;
  bio?: string;
  avatar?: { asset_id: string } | null;
  legacy_avatar_url?: string;
  social_twitter?: string;
  social_instagram?: string;
  social_linkedin?: string;
  social_website?: string;
}

interface TeamMemberRendererProps {
  content: TeamMemberContent;
  isDraft: boolean;
}

async function fetchAsset(assetId: string | undefined): Promise<StudioAsset | null> {
  if (!assetId) return null;
  const sb = getStudioSupabaseAdmin();
  const { data } = await sb.from('studio_assets').select('*').eq('id', assetId).single();
  return (data as StudioAsset | null) ?? null;
}

function initials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return '?';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export default async function TeamMemberRenderer({ content, isDraft }: TeamMemberRendererProps) {
  const avatarAsset = await fetchAsset(content.avatar?.asset_id);
  const name = content.name?.trim() || 'Unnamed Team Member';
  const role = content.role?.trim() || 'Studio Team';
  const bio =
    content.bio?.trim() ||
    'This team member profile is still being written, but the presentation should already feel like part of the studio experience.';

  const socials = [
    { label: 'Twitter / X', url: content.social_twitter },
    { label: 'Instagram', url: content.social_instagram },
    { label: 'LinkedIn', url: content.social_linkedin },
    { label: 'Website', url: content.social_website },
  ].filter((item) => item.url);

  return (
    <div className="bg-brand-bg">
      {isDraft && <PreviewBanner />}

      <section className="relative overflow-hidden border-b-4 border-brand-border bg-brand-dark pt-24 lg:pt-28">
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none">
          <div className="text-[5rem] sm:text-[8rem] lg:text-[12rem] xl:text-[15rem] font-bold text-white/[0.04] leading-none tracking-tighter">
            TEAM
          </div>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-end">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">
                Studio Profile
              </span>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter text-white leading-[0.9]">
                {name}
              </h1>

              <div className="w-20 h-1 bg-brand-accent mt-6 mb-6" />

              <p className="text-xl lg:text-2xl text-white/78 font-light tracking-[0.12em] uppercase mb-6">
                {role}
              </p>

              <p className="max-w-2xl text-white/60 text-base lg:text-lg leading-relaxed font-light">
                {bio}
              </p>
            </div>

            <div className="lg:justify-self-end w-full max-w-[520px]">
              <div className="border-4 border-white/15 bg-white/5 overflow-hidden shadow-brutal">
                <div className="aspect-[4/5] bg-brand-panel/40">
                  {avatarAsset ? (
                    <OptimizedImage
                      asset={avatarAsset}
                      width={1000}
                      height={1250}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : content.legacy_avatar_url ? (
                    // Legacy backfill URLs may point to arbitrary remote hosts.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={content.legacy_avatar_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-accent flex items-center justify-center">
                      <span className="text-8xl sm:text-9xl font-bold text-white">{initials(name)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-4 border-white/10 px-6 py-5 bg-brand-dark">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest font-mono mb-1">
                        Team Member
                      </p>
                      <p className="text-white text-lg font-bold tracking-tight">{name}</p>
                    </div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-brand-accent">
                      OpusStudio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 border-b-4 border-brand-border bg-brand-bg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14">
            <div className="border-4 border-brand-border bg-white p-8 lg:p-10 shadow-brutal-sm">
              <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest font-mono mb-4">
                About
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-brand-dark leading-[0.95] mb-6">
                A key part of the team behind the work.
              </h2>
              <p className="text-neutral-600 text-base lg:text-lg leading-relaxed font-light whitespace-pre-wrap">
                {bio}
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="border-4 border-brand-border bg-brand-panel p-6 lg:p-8">
                <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest font-mono mb-3">
                  Position
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-brand-dark tracking-tight">
                  {role}
                </p>
              </div>

              <div className="border-4 border-brand-border bg-white p-6 lg:p-8">
                <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest font-mono mb-4">
                  Connect
                </p>
                {socials.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-5 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 leading-relaxed font-light">
                    Social links have not been added for this profile yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14 lg:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono mb-2">
                Team Preview
              </p>
              <p className="text-white text-2xl lg:text-3xl font-bold tracking-tight">
                {name}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <span className="text-xs font-mono text-white/70 uppercase tracking-widest">
                OpusStudio
              </span>
              <span className="text-xs font-mono text-white/45 uppercase tracking-widest">
                Team Member
              </span>
              <span className="text-xs font-mono text-brand-accent uppercase tracking-widest">
                Draft Preview
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
