'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { deleteAdvicePost, togglePostPublished } from './actions'

type Props = { id: string; slug: string; published: boolean }

export default function PostsTableActions({ id, slug, published }: Props) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? ''

  const onTogglePublished = () =>
    startTransition(async () => {
      await togglePostPublished(id, !published)
      router.refresh()
    })
  const onDelete = () => {
    if (!confirm('Delete this article? This cannot be undone.')) return
    startTransition(async () => {
      await deleteAdvicePost(id)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton title={published ? 'Unpublish' : 'Publish'} onClick={onTogglePublished} disabled={pending}>
        {published ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
      </IconButton>
      {websiteUrl && (
        <a
          href={`${websiteUrl}/advice-and-ideas/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open on live site"
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
      <Link
        href={`/cms/advice-and-ideas/posts/${id}`}
        title="Edit"
        className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <IconButton title="Delete" onClick={onDelete} disabled={pending} danger>
        <Trash2 className="w-4 h-4" />
      </IconButton>
    </div>
  )
}

function IconButton({
  children,
  title,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${
        danger
          ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}
