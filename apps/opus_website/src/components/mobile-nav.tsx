import Logo from '@/components/ui/Logo'
import { ArrowRight } from 'lucide-react'
import { navItems } from '@/components/navbar'

/**
 * Mobile navigation — uses native HTML <details>/<summary> elements
 * for expand/collapse. No JavaScript required for toggling, which
 * avoids issues with Lenis smooth-scroll blocking touch events.
 */
export default function MobileNav() {
  return (
    <div className="lg:hidden border-b border-gray-100">
      {/* ─── Top bar ─── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <Logo className="h-8 w-auto" />
        <a
          href="#"
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-5 py-2 rounded-full font-bold text-sm"
        >
          Sign up
        </a>
      </div>

      {/* ─── Scrollable nav tabs ─── */}
      <nav className="border-t border-gray-100">
        {/* Horizontal scrollable category row */}
        <div className="flex overflow-x-auto hide-scrollbar gap-1 px-3 py-2 bg-gray-50/80">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`#nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="shrink-0 px-3.5 py-2 rounded-full text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 active:bg-[var(--accent)] active:text-[var(--on-accent)] active:border-[var(--accent)]"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Expandable sections using native <details> */}
        <div className="bg-white">
          {navItems.map((item) => (
            <details
              key={item.label}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="group border-b border-gray-100"
            >
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-bold text-[15px] text-[#1A1A1A]">{item.label}</span>
                <svg
                  className="w-4 h-4 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <div className="px-4 pb-4">
                {/* Card preview */}
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-3"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.card.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1A1A1A] truncate">
                      {item.card.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-snug mt-0.5">
                      {item.card.description}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 shrink-0" />
                </a>

                {/* Link columns */}
                {item.columns.map((col, idx) => (
                  <div key={idx} className="mb-3 last:mb-0">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                      {col.title}
                    </p>
                    <div className="space-y-0.5">
                      {col.links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href="#"
                          className="flex items-center gap-3 px-1 py-2 rounded-lg"
                        >
                          {link.Icon && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-[#1A1A1A] flex items-center justify-center shrink-0">
                              <link.Icon size={15} />
                            </div>
                          )}
                          <span className="font-semibold text-sm text-[#1A1A1A] leading-tight">
                            {link.label}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        {/* Log in link */}
        <div className="px-4 py-4 bg-gray-50/80 flex items-center justify-center">
          <a href="#" className="text-sm font-semibold text-[#1A1A1A] underline underline-offset-4">
            Already have an account? Log in
          </a>
        </div>
      </nav>
    </div>
  )
}
