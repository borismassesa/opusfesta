import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
      <div className="text-center">
        <h1 className="text-[120px] font-black tracking-tighter text-[#1A1A1A] leading-none mb-4">404</h1>
        <p className="text-gray-600 font-medium text-lg mb-8">We couldn&apos;t find the page you&apos;re looking for</p>
        <Link
          href="/"
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-8 py-3 rounded-full font-bold transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
