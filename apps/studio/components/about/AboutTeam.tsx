'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { StudioTeamMember } from '@/lib/studio-types';

interface AboutTeamProps {
  teamMembers: StudioTeamMember[];
}

export default function AboutTeam({ teamMembers }: AboutTeamProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) refs.current.set(id, el);
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Array.from(refs.current.entries()).find(
              ([, el]) => el === entry.target
            )?.[0];
            if (id) setVisibleItems((prev) => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (teamMembers.length === 0) return null;

  const [featured, ...rest] = teamMembers;

  return (
    <section className="bg-brand-dark py-24 lg:py-32 border-y-4 border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section heading */}
        <div
          ref={setRef('team-heading')}
          className={`mb-16 transition-all duration-700 ${
            visibleItems.has('team-heading')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">
            The People
          </span>
          <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter text-white leading-[0.9]">
            THE <span className="text-stroke-light text-transparent">TEAM.</span>
          </h2>
        </div>

        {/* Featured member */}
        <div
          ref={setRef('team-featured')}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-0 border-4 border-white/15 mb-12 transition-all duration-700 delay-150 ${
            visibleItems.has('team-featured')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          {featured.avatar_url ? (
            <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[500px]">
              <Image
                src={featured.avatar_url}
                alt={featured.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[4/5] lg:aspect-auto lg:min-h-[500px] bg-white/5 flex items-center justify-center">
              <span className="text-8xl font-bold text-white/10">{featured.name.charAt(0)}</span>
            </div>
          )}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest mb-3">
              {featured.role}
            </p>
            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tighter mb-4">
              {featured.name}
            </h3>
            {featured.bio && (
              <p className="text-white/60 font-light leading-relaxed text-base lg:text-lg max-w-lg">
                {featured.bio}
              </p>
            )}
            {featured.social_links && Object.keys(featured.social_links).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4">
                {Object.entries(featured.social_links).map(
                  ([platform, url]) =>
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-brand-accent transition-colors"
                      >
                        {platform}
                      </a>
                    )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Remaining members grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((member, index) => (
              <article
                key={member.id}
                ref={setRef(`team-${member.id}`)}
                className={`border-4 border-white/15 bg-brand-dark/60 overflow-hidden transition-all duration-700 ${
                  visibleItems.has(`team-${member.id}`)
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
                style={{
                  transitionDelay: `${(index + 1) * 100}ms`,
                  transform: `translateY(${index % 2 === 1 ? '2rem' : '0'})`,
                }}
              >
                {member.avatar_url ? (
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={member.avatar_url}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/5] bg-white/5 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white/20">{member.name.charAt(0)}</span>
                  </div>
                )}
                <div className="p-6">
                  <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest mb-2">
                    {member.role}
                  </p>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-3">
                    {member.name}
                  </h3>
                  {member.bio && (
                    <p className="text-white/60 font-light leading-relaxed text-sm">
                      {member.bio}
                    </p>
                  )}
                  {member.social_links && Object.keys(member.social_links).length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {Object.entries(member.social_links).map(
                        ([platform, url]) =>
                          url && (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-brand-accent transition-colors"
                            >
                              {platform}
                            </a>
                          )
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
