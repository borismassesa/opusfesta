import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { MOCK_JOURNAL_POSTS } from '@/app/(public)/journal/data';

export function generateStaticParams() {
  return MOCK_JOURNAL_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = MOCK_JOURNAL_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: 'Not Found | OpusFesta Studio' };
  
  return {
    title: `${post.title} | OpusFesta Studio Journal`,
    description: post.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = MOCK_JOURNAL_POSTS.find((p) => p.slug === slug);
  
  if (!post) notFound();

  return (
    <PageLayout>
      <article className="w-full bg-[#FFF8F1] min-h-screen pb-32">
        
        {/* Full Screen Immersive Hero */}
        <div className="relative w-full h-[75vh] min-h-[500px] mb-16 md:mb-24 flex items-end pb-12 md:pb-24">
          {/* Background Image */}
          <div className="absolute inset-0 bg-[#171717]">
            <Image 
              src={post.imageUrl} 
              alt={post.title}
              fill
              className="object-cover opacity-60"
              sizes="100vw"
              priority
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/90 via-[#171717]/40 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 pt-32">
            <Link 
              href="/journal" 
              className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors mb-8 inline-flex items-center gap-2 drop-shadow-sm"
            >
              <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">←</span> Back to Journal
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-[#FF8800] mb-6 mt-4">
              <span className="bg-[#FF8800]/20 px-3 py-1 text-white border border-[#FF8800]/30 backdrop-blur-sm">{post.category}</span>
              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
              <span className="text-white/80">{post.date}</span>
              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
              <span className="text-white/80">{post.readTime}</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.1] mb-6 drop-shadow-md max-w-4xl">
              {post.title}
            </h1>

            <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-3xl drop-shadow-md">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-4xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Author Sidebar (Desktop) / Top (Mobile) */}
          <aside className="md:col-span-3 lg:col-span-3">
            <div className="sticky top-32">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A7662] block mb-4 border-b border-[#171717]/10 pb-4">
                Written By
              </span>
              <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-4 pt-2">
                <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden bg-[#EBE5DE] ring-1 ring-[#171717]/5 p-1">
                  <Image 
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    fill
                    className="object-cover rounded-full"
                    sizes="(max-width: 768px) 56px, 80px"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#171717]">{post.author.name}</div>
                  <div className="text-[11px] uppercase tracking-wider text-[#FF8800] mt-1">{post.author.role}</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-9 lg:col-span-8">
            <div className="prose prose-lg md:prose-xl prose-headings:font-light prose-headings:tracking-tight prose-headings:text-[#171717] prose-p:text-[#171717]/80 prose-p:font-light prose-p:leading-relaxed prose-a:text-[#FF8800] prose-a:no-underline hover:prose-a:underline prose-strong:font-medium prose-strong:text-[#171717] prose-blockquote:border-l-[#FF8800] prose-blockquote:bg-[#FF8800]/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-[#171717]/90 prose-blockquote:font-light prose-blockquote:italic max-w-none shadow-[0_0_0_1px_rgba(23,23,23,0.05)] bg-white p-6 md:p-12 rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Share / Footer actions (Mocked) */}
            <div className="mt-16 pt-8 border-t border-[#171717]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                 <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A7662]">Share this</span>
                 <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-[#EBE5DE] flex items-center justify-center text-[#171717] hover:bg-[#FF8800] hover:text-white transition-colors text-xs">X</button>
                    <button className="w-8 h-8 rounded-full bg-[#EBE5DE] flex items-center justify-center text-[#171717] hover:bg-[#FF8800] hover:text-white transition-colors text-xs">in</button>
                 </div>
               </div>
               
               <Link href="/journal" className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#171717] hover:text-[#FF8800] transition-colors font-medium">
                  Next Article <span className="transition-transform group-hover:translate-x-1">→</span>
               </Link>
            </div>
          </div>

        </div>
      </article>
    </PageLayout>
  );
}
