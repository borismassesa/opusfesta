import { Feather } from 'lucide-react'
import NewDraftButton from './NewDraftButton'

export default function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-gray-100 bg-white px-8 py-14 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0E8F6] text-[#5B2D8E]">
        <Feather className="h-5 w-5" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-gray-950">Write your first piece</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        Drafts you start here. The editorial team reviews and publishes.
      </p>
      <NewDraftButton className="mt-6" />
    </div>
  )
}
