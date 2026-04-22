'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (val: string[]) => void
  placeholder?: string
}

export default function StringListEditor({ value, onChange, placeholder = 'Add item...' }: Props) {
  const update = (i: number, v: string) => {
    const next = [...value]
    next[i] = v
    onChange(next)
  }

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, ''])

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1"
      >
        <Plus className="w-4 h-4" />
        Add item
      </button>
    </div>
  )
}
