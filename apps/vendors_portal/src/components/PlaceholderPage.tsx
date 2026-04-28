import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function PlaceholderPage({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="p-8 pb-12">
      <div className="max-w-[700px] mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-6">
            Coming soon
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mt-2">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            {copy}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 mt-6 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
