'use client'

import { Toaster } from 'sonner'

// Toasts match the dashboard's clean palette: white card, hairline border,
// subtle elevation. No colored state bar — keep it quiet and on-palette.
//
// Action buttons (toast({ action: { label, onClick } }) — used e.g. on the
// product page) get the OpusPass primary look.

const TOAST_BASE =
  'group relative w-full rounded-xl border border-black/[0.08] bg-white p-4 ' +
  'shadow-[0_10px_28px_-12px_rgba(26,26,26,0.18),0_2px_6px_-2px_rgba(26,26,26,0.08)] ' +
  'text-[#1A1A1A]'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      gap={10}
      offset={20}
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
            '!left-auto !right-2 !top-2 !h-6 !w-6 !rounded-md !border-0 !bg-transparent !text-[#1A1A1A]/45 hover:!bg-black/[0.05] hover:!text-[#1A1A1A]',
        },
      }}
    />
  )
}
