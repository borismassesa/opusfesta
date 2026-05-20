import Link from 'next/link'
import { loadHomepageInfoContent } from '@/lib/cms/homepage-info'

export async function InfoSection() {
  const content = await loadHomepageInfoContent()
  return (
    <div className="bg-[#f4ecf8]/60 py-16 mt-12 text-gray-800">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-gray-900">{content.title}</h2>
          <p className="text-[15px] text-gray-700 max-w-2xl mx-auto leading-relaxed">{content.lead}</p>
        </div>

        <div className="space-y-10 text-left max-w-2xl mx-auto mb-16">
          {content.paragraphs.map((para) => (
            <div key={para.id}>
              <h3 className="font-medium text-lg text-gray-900 mb-2">{para.heading}</h3>
              <p className="leading-relaxed text-[15px]">{para.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-6">{content.closing_heading}</h3>
          <Link
            href={content.cta_href}
            className="inline-flex border border-gray-900 text-gray-900 font-medium px-6 py-2.5 rounded-full hover:shadow-md transition bg-transparent hover:bg-white"
          >
            {content.cta_label}
          </Link>
        </div>
      </div>
    </div>
  )
}
