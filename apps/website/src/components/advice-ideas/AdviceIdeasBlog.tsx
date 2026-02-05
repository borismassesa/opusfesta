'use client'

import type { KeyboardEvent } from 'react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, ArrowRightIcon, CalendarDaysIcon, ClockIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { adviceIdeasPosts, ADVICE_IDEAS_PATH, categoryToId, type AdviceIdeasPost } from '@/data/advice-ideas-posts'

const BlogGrid = ({ posts, onCategoryClick }: { posts: AdviceIdeasPost[]; onCategoryClick: (category: string) => void }) => {
  const router = useRouter()

  const handleCardClick = (post: AdviceIdeasPost) => {
    router.push(`${ADVICE_IDEAS_PATH}/${post.slug}`)
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, post: AdviceIdeasPost) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick(post)
    }
  }

  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {posts.map(post => (
        <Card
          key={post.id}
          className='group h-full cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
          onClick={() => handleCardClick(post)}
          onKeyDown={event => handleCardKeyDown(event, post)}
          role='link'
          tabIndex={0}
        >
          <CardContent className='flex h-full flex-col gap-4 p-5'>
            <div className='relative overflow-hidden rounded-xl bg-surface'>
              <img
                src={post.imageUrl}
                alt={post.imageAlt}
                className='aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
              />
            </div>
            <div className='flex items-center justify-between gap-2 text-xs font-medium text-secondary'>
              <div className='flex items-center gap-2'>
                <CalendarDaysIcon className='size-4' />
                <span>{post.date}</span>
                <ClockIcon className='ml-3 size-4' />
                <span>{post.readTime} min read</span>
              </div>
              <Badge
                className='rounded-full border-0 bg-primary/10 px-3 py-1 text-xs text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
                onClick={e => {
                  e.stopPropagation()
                  onCategoryClick(post.category)
                  router.push(`${ADVICE_IDEAS_PATH}#category-${categoryToId(post.category)}`)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onCategoryClick(post.category)
                    router.push(`${ADVICE_IDEAS_PATH}#category-${categoryToId(post.category)}`)
                  }
                }}
                role='button'
                tabIndex={0}
              >
                {post.category}
              </Badge>
            </div>
            <h3 className='line-clamp-2 text-lg font-semibold text-primary md:text-xl'>{post.title}</h3>
            <p className='text-secondary line-clamp-2 text-sm leading-relaxed'>{post.description}</p>
            <div className='mt-auto flex items-center justify-between pt-2'>
              <div className='flex items-center gap-2 text-sm font-medium text-secondary'>
                <img src={post.avatarUrl} alt={post.author} className='size-7 rounded-full object-cover' />
                <span>{post.author}</span>
              </div>
              <div className='bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-full shadow-sm'>
                <ArrowRightIcon className='size-4 -rotate-45' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AdviceIdeasBlog() {
  const [selectedTab, setSelectedTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const nonFeaturedPosts = useMemo(
    () => adviceIdeasPosts.filter(post => !post.featured).sort((a, b) => b.id - a.id),
    [],
  )
  const uniqueCategories = useMemo(() => [...new Set(nonFeaturedPosts.map(post => post.category))], [nonFeaturedPosts])
  const categories = useMemo(() => ['All', ...uniqueCategories.sort()], [uniqueCategories])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) {
      return nonFeaturedPosts
    }
    return nonFeaturedPosts.filter(post => {
      const haystack = `${post.title} ${post.description} ${post.category} ${post.author}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [nonFeaturedPosts, normalizedQuery])

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    const hash = tab === 'All' ? '#categories' : `#category-${categoryToId(tab)}`
    router.push(`${ADVICE_IDEAS_PATH}${hash}`)
  }

  const visiblePosts =
    selectedTab === 'All' ? filteredPosts : filteredPosts.filter(post => post.category === selectedTab)

  return (
    <section className='bg-muted/40 dark:bg-muted/20 py-8 sm:py-16 lg:py-24' id='categories'>
      <div className='mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-16 lg:px-8'>
        <div className='space-y-4'>
          {selectedTab === 'All' && <p className='text-sm'>Advice</p>}
          {selectedTab !== 'All' && (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`${ADVICE_IDEAS_PATH}#categories`}>Advice</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{selectedTab}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}

          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Wedding advice for every part of the day.</h2>

          <p className='text-muted-foreground text-lg md:text-xl'>
            Timelines, budgets, style, and guest experience to guide you from planning to celebration.
          </p>
        </div>

        <Tabs defaultValue='All' value={selectedTab} onValueChange={handleTabChange} className='gap-8 lg:gap-16'>
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <ScrollArea className='bg-muted w-full rounded-lg sm:w-auto'>
              <TabsList className='h-auto gap-1'>
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    id={`category-${categoryToId(category)}`}
                    className='hover:bg-primary/10 cursor-pointer rounded-lg px-4 text-base'
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>

            <div className='relative max-md:w-full'>
              <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                <SearchIcon className='size-4' />
                <span className='sr-only'>Search</span>
              </div>
              <Input
                type='search'
                placeholder='Search ideas'
                aria-label='Search advice and ideas'
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className='peer h-10 px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none'
              />
            </div>
          </div>

          <TabsContent value='All'>
            {visiblePosts.length ? (
              <BlogGrid posts={visiblePosts} onCategoryClick={handleTabChange} />
            ) : (
              <div className='rounded-2xl border border-dashed border-border/70 bg-background p-10 text-center'>
                <p className='text-lg font-semibold text-primary'>No results found.</p>
                <p className='text-muted-foreground mt-2'>
                  Try a different search or clear filters to see more articles.
                </p>
                <Button
                  className='mt-4'
                  variant='outline'
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTab('All')
                    router.push(`${ADVICE_IDEAS_PATH}#categories`)
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </TabsContent>

          {categories.slice(1).map((category, index) => (
            <TabsContent key={index} value={category}>
              {filteredPosts.filter(post => post.category === category).length ? (
                <BlogGrid
                  posts={filteredPosts.filter(post => post.category === category)}
                  onCategoryClick={handleTabChange}
                />
              ) : (
                <div className='rounded-2xl border border-dashed border-border/70 bg-background p-10 text-center'>
                  <p className='text-lg font-semibold text-primary'>No results in this category.</p>
                  <p className='text-muted-foreground mt-2'>Try a different search or check back soon.</p>
                  <Button
                    className='mt-4'
                    variant='outline'
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedTab('All')
                      router.push(`${ADVICE_IDEAS_PATH}#categories`)
                    }}
                  >
                    View all articles
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
