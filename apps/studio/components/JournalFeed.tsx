"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudioArticle } from '@/lib/studio-types';

interface JournalFeedProps {
  articles?: StudioArticle[];
}

export default function JournalFeed({ articles = [] }: JournalFeedProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(articles.map((a) => a.category));
    return ['All', ...Array.from(cats).sort()];
  }, [articles]);

  const posts = useMemo(() => articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    date: a.published_at ? new Date(a.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
    readTime: `${Math.max(1, Math.ceil((a.body_html?.length || 0) / 1500))} min read`,
    imageUrl: a.cover_image,
  })), [articles]);

  const filteredPosts = posts.filter(post =>
    activeCategory === 'All' || post.category === activeCategory
  );

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const standardPosts = filteredPosts.slice(1);

  return (
    <div className="w-full bg-[#FDF5F3] min-h-screen pb-32">
      {/* Hero Header */}
      <section className="pt-40 pb-16 px-6 md:px-12 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-[#8A7662] mb-6 block font-mono">
            OpusStudio
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-[#171717] tracking-tighter leading-[1.1] mb-8">
            The Journal
          </h1>
          <p className="text-lg md:text-xl text-[#171717]/70 font-light max-w-2xl leading-relaxed">
            Insights, methodology, and creative thinking from our team. A look behind the curtain of experiential design.
          </p>
        </motion.div>
      </section>

      {/* Filter Navigation */}
      <section className="px-6 md:px-12 lg:px-24 mb-16">
        <div className="flex flex-nowrap overflow-x-auto gap-8 pb-4 border-b border-[#171717]/10 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap pb-4 relative text-sm uppercase tracking-[0.2em] transition-colors duration-500 ${
                activeCategory === category ? 'text-[#171717]' : 'text-[#8A7662] hover:text-[#171717]'
              }`}
            >
              {category}
              {activeCategory === category && (
                <motion.div 
                  layoutId="journalFilterIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#171717]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Feed Layout */}
      <section className="px-6 md:px-12 lg:px-24 pt-8">
        {filteredPosts.length === 0 ? (
          <div className="py-32 text-center text-[#8A7662] text-sm uppercase tracking-widest">
            No articles found in this category.
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            
            {/* Featured Post (Full Width) */}
            {featuredPost && (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group w-full"
              >
                <Link href={`/journal/${featuredPost.slug}`} className="block">
                  <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#EBE5DE] overflow-hidden mb-8">
                    <Image 
                      src={featuredPost.imageUrl} 
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 100vw"
                      priority
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-8">
                      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-[#8A7662] mb-4">
                        <span>{featuredPost.category}</span>
                        <span className="w-1 h-1 bg-[#8A7662]/30 rounded-full"></span>
                        <span>{featuredPost.readTime}</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-light text-[#171717] tracking-tight mb-4 group-hover:text-[#D6492A] transition-colors duration-500">
                        {featuredPost.title}
                      </h2>
                    </div>
                    <div className="md:col-span-4 flex flex-col justify-end">
                      <p className="text-[#171717]/70 font-light leading-relaxed mb-6">
                        {featuredPost.excerpt}
                      </p>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#171717] font-medium flex items-center gap-2">
                        Read Article 
                        <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Asymmetrical Grid for remaining posts */}
            {standardPosts.length > 0 && (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                <AnimatePresence mode="popLayout">
                  {standardPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`group ${index % 3 === 0 ? 'md:col-span-2' : 'md:col-span-1'}`}
                    >
                      <Link href={`/journal/${post.slug}`} className="h-full flex flex-col">
                        <div className={`relative w-full bg-[#EBE5DE] overflow-hidden mb-6 ${index % 3 === 0 ? 'aspect-[21/9]' : 'aspect-[4/5] md:aspect-square'}`}>
                          <Image 
                            src={post.imageUrl} 
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                            sizes={index % 3 === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                          />
                        </div>
                        <div className="flex items-center gap-4 text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#8A7662] mb-3">
                          <span>{post.category}</span>
                          <span className="w-1 h-1 bg-[#8A7662]/30 rounded-full"></span>
                          <span>{post.date}</span>
                        </div>
                        <h3 className={`font-light text-[#171717] tracking-tight mb-3 group-hover:text-[#D6492A] transition-colors duration-500 ${index % 3 === 0 ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
                          {post.title}
                        </h3>
                        {index % 3 === 0 && (
                          <p className="text-[#171717]/70 font-light leading-relaxed mb-6 max-w-2xl">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="mt-auto text-xs uppercase tracking-[0.2em] text-[#171717] font-medium flex items-center gap-2 pt-4">
                          Read <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

          </div>
        )}
      </section>
    </div>
  );
}
