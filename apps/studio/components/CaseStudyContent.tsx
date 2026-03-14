'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/data';
import { useBookingModal } from '@/components/BookingModalProvider';

export default function CaseStudyContent({ project }: { project: Project }) {
  const { openBookingModal } = useBookingModal();

  return (
    <article className="bg-brand-bg py-16 lg:py-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-brand-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            Back to Portfolio
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 mb-12 lg:mb-14">
          <div>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-4 block">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.95] mb-5">
              {project.title}
            </h1>
            <p className="text-neutral-600 text-base lg:text-lg leading-relaxed font-light mb-8">
              {project.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-brand-border/20 bg-white p-4">
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.18em] mb-2">Client</p>
                <p className="text-lg font-bold text-brand-dark tracking-tight">{project.client}</p>
              </div>
              <div className="border border-brand-border/20 bg-white p-4">
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.18em] mb-2">Role</p>
                <p className="text-sm text-neutral-600 leading-relaxed font-light">{project.role}</p>
              </div>
            </div>
          </div>

          <div className="border border-brand-border/20 bg-brand-dark overflow-hidden">
            <video
              src={project.videoUrl}
              controls
              playsInline
              preload="metadata"
              poster={project.image}
              className="w-full h-full object-cover min-h-[320px] lg:min-h-[420px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 lg:mb-14">
          {project.stats.map((stat) => (
            <div key={stat.label} className="border border-brand-border/20 bg-white p-4 lg:p-5">
              <p className="text-2xl lg:text-3xl font-bold text-brand-dark font-mono tracking-tight mb-1">{stat.value}</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.16em]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14">
          <div className="border border-brand-border/20 bg-white p-6 lg:p-8">
            <h2 className="text-xs font-bold text-brand-dark tracking-widest uppercase font-mono mb-4">
              Project Overview
            </h2>
            <p className="text-neutral-600 text-base lg:text-lg leading-relaxed font-light">
              {project.fullDescription}
            </p>
          </div>

          <div className="border border-brand-border/20 bg-brand-panel/40 p-6 lg:p-8">
            <h2 className="text-xs font-bold text-brand-dark tracking-widest uppercase font-mono mb-5">
              Key Highlights
            </h2>
            <ul className="space-y-4">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-brand-accent mt-2 shrink-0"></span>
                  <span className="text-neutral-600 font-light leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 lg:mt-14 border border-brand-border/20 bg-white p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-brand-dark tracking-tighter mb-2">
              Ready for your own production?
            </h3>
            <p className="text-neutral-500 font-light">
              Tell us your vision and we&apos;ll shape it into a complete visual story.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openBookingModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border border-brand-dark hover:bg-brand-accent hover:border-brand-accent transition-colors"
            >
              Start Project
            </button>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-brand-dark uppercase tracking-widest border border-brand-border/40 hover:border-brand-accent hover:text-brand-accent transition-colors"
            >
              More Work
            </Link>
          </div>
        </div>

        <div className="mt-12 border border-brand-border/20 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            width={1920}
            height={1080}
            className="w-full h-auto object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </article>
  );
}
