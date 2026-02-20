import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DynamicToc } from '@/components/advice-ideas/DynamicToc'
import { AdviceIdeasRelatedPosts } from '@/components/advice-ideas/AdviceIdeasRelatedPosts'
import { AdviceIdeasCTA } from '@/components/advice-ideas/AdviceIdeasCTA'
import { AdviceIdeasPostViewTracker } from '@/components/advice-ideas/AdviceIdeasPostViewTracker'
import { AdviceIdeasPageContentProvider } from '@/context/AdviceIdeasPageContentContext'
import { adviceIdeasPosts, ADVICE_IDEAS_PATH, type AdviceIdeasPost } from '@/data/advice-ideas-posts'
import { fetchAdviceIdeasPostBySlug, fetchAdviceIdeasPosts, getAdviceIdeasSiteUrl } from '@/lib/advice-ideas/server'
import { AdviceIdeasDetailClient } from './AdviceIdeasDetailClient'

export async function generateStaticParams() {
  return adviceIdeasPosts.map(post => ({ slug: post.slug }))
}

function PostNavigation({ currentPost, posts }: { currentPost: AdviceIdeasPost; posts: AdviceIdeasPost[] }) {
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.publishedAt || a.date).getTime() - new Date(b.publishedAt || b.date).getTime(),
  )
  const currentIndex = sortedPosts.findIndex(post => post.id === currentPost.id)
  const previousPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null

  return (
    <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      {previousPost ? (
        <Link className='w-full sm:w-auto' href={`${ADVICE_IDEAS_PATH}/${previousPost.slug}`}>
          <Button className='w-full rounded-[8px] sm:w-auto' variant='outline'>
            <ChevronLeftIcon className='size-4' />
            Previous Article
          </Button>
        </Link>
      ) : (
        <Button className='w-full rounded-[8px] sm:w-auto' variant='outline' disabled>
          <ChevronLeftIcon className='size-4' />
          Previous Article
        </Button>
      )}

      {nextPost ? (
        <Link className='w-full sm:ml-auto sm:w-auto' href={`${ADVICE_IDEAS_PATH}/${nextPost.slug}`}>
          <Button
            className='w-full rounded-[8px] bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 focus-visible:ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:hover:bg-emerald-400/20 dark:focus-visible:ring-emerald-400/40 sm:w-auto'
            variant='outline'
          >
            Next Article
            <ChevronRightIcon className='size-4' />
          </Button>
        </Link>
      ) : (
        <Button
          className='w-full rounded-[8px] bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 focus-visible:ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:hover:bg-emerald-400/20 dark:focus-visible:ring-emerald-400/40 sm:ml-auto sm:w-auto'
          variant='outline'
          disabled
        >
          Next Article
          <ChevronRightIcon className='size-4' />
        </Button>
      )}
    </div>
  )
}

export default async function AdviceIdeasSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post: AdviceIdeasPost | null = null
  let allPosts = [] as AdviceIdeasPost[]

  try {
    post = await fetchAdviceIdeasPostBySlug(slug)
    if (post) {
      allPosts = await fetchAdviceIdeasPosts({ limit: 200 })
    }
  } catch (error) {
    post = null
  }

  if (!post) {
    post = adviceIdeasPosts.find(p => p.slug === slug) || null
  }

  if (!allPosts.length) {
    allPosts = adviceIdeasPosts
  }

  if (!post) {
    notFound()
  }

  const sameCategoryPosts = allPosts.filter(p => p.category === post.category && p.slug !== post.slug)
  const otherPosts = allPosts.filter(p => p.category !== post.category && p.slug !== post.slug)
  const relatedPosts = [...sameCategoryPosts, ...otherPosts].slice(0, 3)
  const siteUrl = getAdviceIdeasSiteUrl()
  const parsedDate = new Date(post.publishedAt || post.date)
  const datePublished = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString()
  const postStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${siteUrl}${post.imageUrl}`,
    datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'OPUS FESTA',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/opengraph.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${ADVICE_IDEAS_PATH}/${post.slug}`,
    },
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Script
        id='advice-ideas-post-jsonld'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postStructuredData) }}
      />
      <AdviceIdeasPostViewTracker slug={post.slug} />
      <AdviceIdeasPageContentProvider>
        <AdviceIdeasDetailClient>
          <section className='relative overflow-hidden bg-muted/40 pt-24 pb-12 sm:pt-28 sm:pb-12'>
            <div className='pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl' />
            <div className='pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl' />
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              <div className='grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center'>
                <div className='space-y-6'>
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href='/'>Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href={`${ADVICE_IDEAS_PATH}#categories`}>Advice</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{post.category}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  <h1 className='text-foreground text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl'>
                    {post.title}
                  </h1>

                  <p className='text-muted-foreground text-lg sm:text-xl'>{post.description}</p>

                  <div className='flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-sm'>
                    <Avatar className='size-9'>
                      <AvatarImage src={post.avatarUrl} alt={post.author} />
                      <AvatarFallback className='text-xs'>
                        {post.author
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='text-sm'>
                      <p className='text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.2em]'>
                        Written by
                      </p>
                      <p className='font-medium text-foreground'>{post.author}</p>
                    </div>
                    <div className='h-8 w-px bg-border/70' />
                    <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                      <span className='flex items-center gap-1.5'>
                        <CalendarDaysIcon className='size-4' />
                        {post.date}
                      </span>
                      <span className='h-1 w-1 rounded-full bg-border' />
                      <span className='flex items-center gap-1.5'>
                        <ClockIcon className='size-4' />
                        {post.readTime} minute read
                      </span>
                    </div>
                  </div>
                </div>

                <div className='relative'>
                  <div className='absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-full bg-primary/10 blur-2xl lg:block' />
                  <div className='overflow-hidden rounded-3xl border border-border/70 bg-background shadow-lg'>
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      className='aspect-[4/3] w-full object-cover sm:aspect-[5/4]'
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className='py-10 sm:py-14'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              <div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]'>
                <div className='space-y-8'>
                  <div className='rounded-2xl border border-border/70 bg-background p-6 shadow-sm sm:p-8'>
                    <article
                      id='content'
                      className='prose prose-lg dark:prose-invert max-w-none space-y-10 prose-headings:scroll-mt-28 prose-headings:text-foreground prose-h2:mt-10 prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-black prose-h2:tracking-tight prose-h3:mt-6 prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:font-bold prose-p:text-muted-foreground prose-a:text-primary prose-li:marker:text-primary'
                      dangerouslySetInnerHTML={{
                        __html: post.content ?? `<p>${post.description}</p>`,
                      }}
                    />
                  </div>

                  <div className='rounded-2xl border border-border/70 bg-background p-5 shadow-sm'>
                    <PostNavigation currentPost={post} posts={allPosts} />
                  </div>
                </div>

                <aside className='space-y-6'>
                  <div className='sticky top-24 space-y-6'>
                    <DynamicToc
                      sticky={false}
                      className='rounded-2xl border border-border/70 bg-background p-5 shadow-sm'
                    />
                    <div className='rounded-2xl border border-border/70 bg-muted/40 p-5'>
                      <h3 className='text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.2em]'>
                        Planning checklist
                      </h3>
                      <ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
                        <li>Confirm vendors and final timeline.</li>
                        <li>Share key details with your VIPs.</li>
                        <li>Pack day-of essentials and backups.</li>
                        <li>Review seating, signage, and guest flow.</li>
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <AdviceIdeasRelatedPosts blogPosts={relatedPosts} />
          <AdviceIdeasCTA />
        </AdviceIdeasDetailClient>
      </AdviceIdeasPageContentProvider>
    </div>
  )
}
