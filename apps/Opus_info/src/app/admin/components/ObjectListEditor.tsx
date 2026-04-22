'use client'

import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Field {
  key: string
  label: string
  type?: 'text' | 'textarea'
  nullable?: boolean
}

interface Props {
  value: Record<string, unknown>[]
  onChange: (val: Record<string, unknown>[]) => void
  fields: Field[]
  addLabel?: string
}

export default function ObjectListEditor({ value, onChange, fields, addLabel = 'Add item' }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0)

  const update = (i: number, key: string, v: string) => {
    const next = value.map((item, idx) =>
      idx === i ? { ...item, [key]: v === '' && fields.find(f => f.key === key)?.nullable ? null : v } : item
    )
    onChange(next)
  }

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
    setExpanded(null)
  }

  const add = () => {
    const empty: Record<string, unknown> = {}
    for (const f of fields) empty[f.key] = f.nullable ? null : ''
    onChange([...value, empty])
    setExpanded(value.length)
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => {
        const isOpen = expanded === i
        const previewKey = fields[0]?.key
        const preview = previewKey ? String(item[previewKey] ?? '').slice(0, 40) || `Item ${i + 1}` : `Item ${i + 1}`

        return (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span className="text-sm font-medium text-gray-700 truncate">{preview}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(i) }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="p-4 space-y-3 bg-white">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={item[field.key] === null ? '' : String(item[field.key] ?? '')}
                        onChange={(e) => update(i, field.key, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 resize-none"
                      />
                    ) : (
                      <input
                        value={item[field.key] === null ? '' : String(item[field.key] ?? '')}
                        onChange={(e) => update(i, field.key, e.target.value)}
                        placeholder={field.nullable ? 'Leave empty for ∞ icon' : ''}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
  )
}
