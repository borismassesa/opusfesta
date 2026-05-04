'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteAdviceAuthor } from './actions'

export default function AuthorsRowActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const onDelete = () => {
    if (!confirm('Delete this author? Articles referencing them keep their stored name/role.')) return
    startTransition(async () => {
      await deleteAdviceAuthor(id)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/operations/authors/${id}`}
        title="Edit"
        className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        title="Delete"
        className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
