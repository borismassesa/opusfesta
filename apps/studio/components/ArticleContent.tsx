'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/lib/data';

export default function ArticleContent({ article }: { article: Article }) {
  return (
    <article className="bg-brand-bg">
      {/* Hero */}
      <div className="relative h-[40vh] lg:h-[60vh] overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="max-w-[900px] mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                {article.date}
              </span>
              <span className="w-1 h-1 bg-white/30"></span>
              <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest">
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[1]">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Meta bar */}
      <div className="border-b-4 border-brand-border bg-brand-bg">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-brand-dark uppercase tracking-widest font-mono">
              {article.author}
            </span>
          </div>
          <Link
            href="/journal"
            className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-widest font-mono hover:text-brand-accent transition-colors"
          >
            All Articles
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[900px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="space-y-6">
          {article.body.map((paragraph, i) => (
            <p
              key={i}
              className={`text-neutral-600 leading-relaxed font-light ${
                i === 0 ? 'text-lg lg:text-xl' : 'text-base lg:text-lg'
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t-4 border-brand-border">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/journal"
            className="inline-flex items-center gap-3 px-6 py-3 text-xs font-bold text-brand-dark uppercase tracking-widest border-4 border-brand-border shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m7-7l-7 7l7 7"></path>
            </svg>
            Back to Journal
          </Link>
        </div>
      </div>
    </article>
  );
}
