import Image from 'next/image';
import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';

const team = [
  {
    name: 'Mila Jordan',
    role: 'Executive Producer',
    bio: 'Leads studio operations, client partnerships, and production planning across campaigns and long-form projects.',
    image:
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/79b36b7a-a9b2-4eb8-a45d-27fe69423a98_3840w.jpg',
  },
  {
    name: 'Rafi Okello',
    role: 'Creative Director',
    bio: 'Shapes narrative direction, visual language, and concept development from treatment through final cut.',
    image:
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/71087bc3-4cb0-48eb-b49a-6a1587f575d7_3840w.jpg',
  },
  {
    name: 'Nia Fraser',
    role: 'Head of Post',
    bio: 'Runs editorial, color, motion graphics, and finishing with a focus on speed, consistency, and craft.',
    image:
      'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d2607b57-3a19-48e4-8ad4-bdcf6e69b207_3840w.webp',
  },
];

const partners = [
  'Northline Electric',
  'Blue Current Foundation',
  'Pulse FM',
  'Aether Mobility',
  'Atlas Hotels',
  'Nova Energy',
  'Sora Spirits',
  'Meridian Bank',
];

export const metadata: Metadata = {
  title: 'About | OpusFesta Studio',
  description: 'Meet the team behind OpusFesta Studio and learn how we approach production partnerships.',
};

export default function AboutPage() {
  return (
    <PageLayout>
      <section className="py-20 lg:py-24 bg-brand-bg border-b-4 border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">About</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            THE TEAM<br />
            <span className="text-stroke">BEHIND THE WORK.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-neutral-500 text-base lg:text-lg leading-relaxed font-light">
            OpusFesta Studio is a production company built on long-term collaboration. We combine creative direction, technical execution, and production management to deliver work that is cinematic and commercially effective.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-brand-dark">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <article key={member.name} className="border-4 border-white/15 bg-brand-dark/60 overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image src={member.image} alt={member.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest mb-2">{member.role}</p>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-3">{member.name}</h2>
                <p className="text-white/60 font-light leading-relaxed">{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-brand-bg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="mt-4 border-4 border-brand-border p-6 sm:p-8 bg-white">
            <p className="text-[10px] font-bold text-brand-dark uppercase tracking-[0.2em] mb-5">Notable Clients & Partners</p>
            <div className="flex flex-wrap gap-3">
              {partners.map((partner) => (
                <span key={partner} className="px-4 py-2 border-2 border-brand-border text-[11px] font-bold uppercase tracking-widest text-brand-dark">
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
