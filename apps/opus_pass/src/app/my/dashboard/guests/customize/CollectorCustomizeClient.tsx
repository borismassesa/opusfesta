'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/dashboard/controls'
import { PageConfigFields, DeviceToggle, PREVIEW_DEVICES, type PreviewDevice } from '@/components/dashboard/page-customizer'
import { updateCollectorPageConfig } from '@/lib/dashboard/actions'
import {
  resolveCollectorPage,
  PLEDGE_PREVIEW_MESSAGE,
  PLEDGE_PREVIEW_READY,
  type PledgePageConfig,
} from '@/lib/dashboard/pledge-page'

export default function CollectorCustomizeClient({
  collectorToken,
  initialConfig,
}: {
  collectorToken: string | null
  initialConfig: PledgePageConfig
}) {
  const [cfg, setCfg] = useState<PledgePageConfig>(() => resolveCollectorPage(initialConfig))
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [pending, startTransition] = useTransition()

  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(window.location.origin), [])
  const previewUrl = collectorToken && origin ? `${origin}/collect/${collectorToken}` : null

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const cfgRef = useRef(cfg)
  cfgRef.current = cfg

  const postConfig = useCallback((c: PledgePageConfig) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: PLEDGE_PREVIEW_MESSAGE, config: c },
      window.location.origin,
    )
  }, [])

  useEffect(() => {
    postConfig(cfg)
  }, [cfg, postConfig])

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === PLEDGE_PREVIEW_READY) postConfig(cfgRef.current)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [postConfig])

  function save() {
    startTransition(async () => {
      try {
        await updateCollectorPageConfig(cfg)
        toast.success('Collector page saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save changes')
      }
    })
  }

  return (
    <div className="-mx-3 -my-6 min-h-[calc(100vh-0px)] sm:-mx-4 lg:-mx-6 lg:-my-8">
      <div className="grid lg:grid-cols-[minmax(0,440px)_1fr]">
        {/* Editor column */}
        <div className="border-b border-black/[0.06] lg:h-[calc(100vh-0px)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-black/[0.06] bg-white/90 px-5 py-3.5 backdrop-blur">
            <Link
              href="/my/dashboard/guests"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="flex items-center gap-2">
              {previewUrl ? (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#1A1A1A]/25 bg-white px-4 py-2 text-sm font-bold text-[#1A1A1A] hover:bg-black/[0.03]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Preview as guest
                </a>
              ) : null}
              <Button onClick={save} disabled={pending}>
                {pending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="px-5 py-6">
            <h1 className="font-serif text-2xl text-[#1A1A1A]">Customize your collector page</h1>
            <p className="mt-1 text-sm text-[#1A1A1A]/55">
              Edit the wording and look on the left — the preview updates as you type.
            </p>
            <div className="mt-6">
              <PageConfigFields
                cfg={cfg}
                setCfg={setCfg}
                headingPlaceholder="Would Love Your Details"
                buttonPlaceholder="Send my details"
              />
            </div>
          </div>
        </div>

        {/* Live preview column */}
        <div className="bg-[#F3F1EE]/60 lg:sticky lg:top-0 lg:h-[calc(100vh-0px)]">
          <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] bg-white/70 px-5 py-3 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wide text-[#1A1A1A]/45">Live preview</p>
            <DeviceToggle device={device} onChange={setDevice} />
          </div>
          <div className="flex justify-center overflow-auto p-4 lg:h-[calc(100vh-49px)]">
            {previewUrl ? (
              <div
                className="mx-auto w-full self-start overflow-hidden rounded-xl border border-black/[0.12] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.4)] transition-all duration-300"
                style={{ maxWidth: PREVIEW_DEVICES[device].width }}
              >
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  title="Collector page preview"
                  onLoad={() => postConfig(cfgRef.current)}
                  className="w-full bg-white"
                  style={{ height: 'calc(100vh - 90px)' }}
                />
              </div>
            ) : (
              <p className="mt-10 text-sm text-[#1A1A1A]/50">No collector link yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
