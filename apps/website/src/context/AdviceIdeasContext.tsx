'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { adviceIdeasPosts, type AdviceIdeasPost } from '@/data/advice-ideas-posts'

interface AdviceIdeasContextValue {
  posts: AdviceIdeasPost[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const AdviceIdeasContext = createContext<AdviceIdeasContextValue | null>(null)

const normalizePosts = (posts: AdviceIdeasPost[]) =>
  posts.map(post => {
    if (post.publishedAt) {
      return post
    }
    if (!post.date) {
      return post
    }
    const parsedDate = new Date(post.date)
    return {
      ...post,
      publishedAt: Number.isNaN(parsedDate.getTime()) ? post.publishedAt : parsedDate.toISOString(),
    }
  })

export function AdviceIdeasProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<AdviceIdeasPost[]>(normalizePosts(adviceIdeasPosts))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/advice-ideas/posts?limit=200')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      if (Array.isArray(data?.posts) && data.posts.length) {
        setPosts(normalizePosts(data.posts))
      } else {
        setPosts(normalizePosts(adviceIdeasPosts))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load posts')
      setPosts(normalizePosts(adviceIdeasPosts))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  const value = useMemo(
    () => ({
      posts,
      loading,
      error,
      refresh: fetchPosts,
    }),
    [posts, loading, error, fetchPosts],
  )

  return <AdviceIdeasContext.Provider value={value}>{children}</AdviceIdeasContext.Provider>
}

export const useAdviceIdeas = () => {
  const context = useContext(AdviceIdeasContext)
  if (!context) {
    throw new Error('useAdviceIdeas must be used within AdviceIdeasProvider')
  }
  return context
}
