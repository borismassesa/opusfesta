import type { ReactNode } from 'react'

export function CodeBlock({
  children,
  label,
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <div className="my-5">
      {label && <p className="micro text-gray-400 mb-2">{label}</p>}
      <pre className="mono text-sm bg-[#0f0f0f] text-white rounded-2xl p-5 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  )
}
