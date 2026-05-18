import { loadAttireBlogContent } from '@/lib/cms/attire-blog'

export async function BlogSection() {
  const content = await loadAttireBlogContent()

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
      <h2 className="text-2xl font-serif font-medium text-gray-900 mb-8 flex items-center group cursor-pointer w-fit">
        {content.heading} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.articles.map((article) => (
          <div key={article.id} className="group cursor-pointer flex flex-col items-center border border-gray-200 hover:shadow-lg transition-shadow bg-white rounded-t-2xl">
            <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden rounded-t-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-grow items-center text-center">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">{article.tag}</span>
              <h3 className="font-serif text-xl text-gray-900 mb-3 group-hover:underline">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed w-[90%]">{article.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
