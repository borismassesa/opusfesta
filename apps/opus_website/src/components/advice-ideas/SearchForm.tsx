'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

// Small client island. The hub itself stays a server component (for
// metadata + straight-to-HTML), and this form writes ?q=… into the URL.
// The server page reads it and renders the filtered view.
//
// `action` overrides the destination path — pass '/advice-and-ideas' from
// the detail page so search always lands back on the hub.
// `iconOnly` collapses the submit button to a square icon (matches the
// detail-page top bar treatment).
export default function SearchForm({
  action,
  iconOnly = false,
}: {
  action?: string
  iconOnly?: boolean
} = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [value, setValue] = useState(initialQ)
  const target = action ?? pathname

  // Keep the input in sync if the URL changes from elsewhere (e.g. Clear link).
  useEffect(() => { setValue(initialQ) }, [initialQ])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `${target}?q=${encodeURIComponent(q)}` : target, { scroll: false })
  }

  const clear = () => {
    setValue('')
    router.push(target, { scroll: false })
  }

  return (
    <form onSubmit={submit} className="w-full sm:w-[360px] md:w-[420px]">
      <div className="flex h-11 items-center overflow-hidden rounded-full border border-slate-200 bg-white pr-1 transition-colors focus-within:border-[var(--accent-hover)] focus-within:ring-2 focus-within:ring-[var(--accent)]/30">
        {!iconOnly && (
          <Search
            size={17}
            className="ml-4 mr-2 shrink-0 text-slate-400"
            aria-hidden
          />
        )}
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search articles and inspiration"
          aria-label="Search articles"
          className={`h-full w-full min-w-0 appearance-none bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 [&::-ms-clear]:hidden [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none ${iconOnly ? 'pl-5 pr-2' : 'pr-2'}`}
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="mx-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={15} />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className={`flex h-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] ${iconOnly ? 'w-9' : 'px-5 text-[13px] font-semibold'}`}
        >
          {iconOnly ? <Search size={16} aria-hidden /> : 'Search'}
        </button>
      </div>
    </form>
  )
}
