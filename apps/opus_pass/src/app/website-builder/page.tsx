import type { Metadata } from 'next'
import WebsiteBuilderClient from './WebsiteBuilderClient'

export const metadata: Metadata = {
  title: 'Website Builder | OpusPass',
  description:
    'Design your wedding website with the OpusPass editor — drag-and-drop layouts, live preview, RSVP and registry widgets, all bilingual.',
}

export default function WebsiteBuilderPage() {
  return <WebsiteBuilderClient />
}
