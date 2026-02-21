'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/data';
import { useBookingModal } from '@/components/BookingModalProvider';

export default function CaseStudyContent({ project }: { project: Project }) {
  const { openBookingModal } = useBookingModal();

  return (
    <article className="bg-brand-bg">
      {/* Hero */}
      <div className="relative h-[50vh] lg:h-[70vh] overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <span className="h-[2px] w-8 bg-brand-accent"></span>
              <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
                {project.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white tracking-tighter leading-[0.9]">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-brand-dark border-b border-white/10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {project.stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-8 px-6 lg:px-12 text-center ${
                i < 3 ? 'border-r border-white/10' : ''
              }`}
            >
              <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16">
          <div>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
              Case Study #{project.number}
            </span>
            <p className="text-lg lg:text-xl text-neutral-600 leading-relaxed font-light">
              {project.fullDescription}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-brand-dark tracking-widest uppercase font-mono mb-6">
              Highlights
            </h3>
            <ul className="space-y-4">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-4">
                  <span className="w-2 h-2 bg-brand-accent mt-2 shrink-0"></span>
                  <span className="text-neutral-600 font-light leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t-4 border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold text-brand-dark tracking-tighter mb-2">
              Inspired by this project?
            </h3>
            <p className="text-neutral-500 font-light">
              Let&apos;s create something just as extraordinary for your event.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => openBookingModal()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-dark shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
            >
              Book Now
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-7-7l7 7l-7 7"></path>
              </svg>
            </button>
            <Link
              href="/portfolio"
              className="inline-flex items-center px-8 py-4 text-xs font-bold text-brand-dark uppercase tracking-widest border-4 border-brand-border shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
            >
              All Projects
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
