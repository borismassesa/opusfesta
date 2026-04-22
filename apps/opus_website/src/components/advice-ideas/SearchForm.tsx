'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

// Small client island. The hub itself stays a server component (for
// metadata + straight-to-HTML), and this form writes ?q=… into the URL.
// The server page reads it and renders the filtered view.
export default function SearchForm() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [value, setValue] = useState(initialQ)

  // Keep the input in sync if the URL changes from elsewhere (e.g. Clear link).
  useEffect(() => { setValue(initialQ) }, [initialQ])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false })
  }

  const clear = () => {
    setValue('')
    router.push(pathname, { scroll: false })
  }

  return (
    <form onSubmit={submit} className="w-full max-w-xs md:max-w-sm">
      <div className="flex h-10 items-center overflow-hidden rounded-full border border-slate-200 bg-white transition-colors focus-within:border-[var(--accent-hover)]">
        <Search size={16} className="ml-3 shrink-0 text-slate-400" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search articles and inspiration"
          aria-label="Search articles"
          className="h-full w-full min-w-0 bg-transparent px-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-slate-900"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className="flex h-full shrink-0 items-center bg-[var(--accent)] px-4 text-[12px] font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          Search
        </button>
      </div>
    </form>
  )
}
