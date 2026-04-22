import type { MDXComponents } from 'mdx/types'
import { Kicker } from '@/components/Kicker'
import { Showcase } from '@/components/Showcase'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'
import { CodeBlock } from '@/components/CodeBlock'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-black uppercase tracking-tighter text-4xl md:text-6xl lg:text-[72px] leading-[0.9] text-ink mt-0 mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-4 text-ink">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-bold text-lg mt-10 mb-3 text-ink">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-base md:text-lg text-gray-600 font-medium leading-relaxed mb-5 max-w-3xl">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-5 max-w-3xl">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 text-gray-700 space-y-2 mb-5 max-w-3xl">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ children, href }) => (
      <a
        href={href}
        className="font-bold underline underline-offset-4 hover:text-gray-600"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="font-mono text-[0.88em] bg-gray-100 text-ink rounded-md px-1.5 py-0.5">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="font-mono text-sm bg-[#0f0f0f] text-white rounded-2xl p-6 overflow-x-auto mb-5">
        {children}
      </pre>
    ),
    hr: () => <hr className="border-t border-gray-200 my-14" />,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--accent)] pl-5 text-gray-700 italic my-6">
        {children}
      </blockquote>
    ),
    Kicker,
    Showcase,
    DosAndDonts,
    Do,
    Dont,
    CodeBlock,
    ...components,
  }
}
