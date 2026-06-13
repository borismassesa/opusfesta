'use client'

import { Toaster } from 'sonner'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

// Toasts match the dashboard's clean palette: white card, hairline border,
// subtle elevation. State is signaled by a small colored icon on the left:
//   success → brand green  (#3C9A5F)
//   error   → soft rose    (#A04450)
//   warning → amber        (#C99A2E)
//   info    → neutral

const TOAST_BASE =
  'group flex w-full items-start gap-3 rounded-xl border border-black/[0.08] bg-white p-4 ' +
  'shadow-[0_10px_28px_-12px_rgba(26,26,26,0.18),0_2px_6px_-2px_rgba(26,26,26,0.08)] ' +
  'text-[#1A1A1A]'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      gap={10}
      offset={20}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3C9A5F]" aria-hidden="true" />,
        error: <AlertCircle className="h-5 w-5 shrink-0 text-[#A04450]" aria-hidden="true" />,
        warning: <AlertTriangle className="h-5 w-5 shrink-0 text-[#C99A2E]" aria-hidden="true" />,
        info: <Info className="h-5 w-5 shrink-0 text-[#1A1A1A]/55" aria-hidden="true" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: TOAST_BASE,
          title: 'text-sm font-semibold leading-snug',
          description: 'mt-0.5 text-xs text-[#1A1A1A]/65 leading-snug',
          actionButton:
            '!bg-[#1A1A1A] !text-white !rounded-full !px-3.5 !py-1.5 !text-xs !font-semibold hover:!bg-[#1A1A1A]/85',
          cancelButton:
            '!bg-transparent !text-[#1A1A1A]/65 !rounded-full !px-3 !py-1.5 !text-xs !font-semibold hover:!bg-black/[0.05]',
          closeButton:
            '!left-auto !right-2.5 !top-2.5 !h-6 !w-6 !rounded-full !border-0 !bg-transparent !text-[#1A1A1A]/45 hover:!bg-black/[0.05] hover:!text-[#1A1A1A]',
        },
      }}
    />
  )
}
