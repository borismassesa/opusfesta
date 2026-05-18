import { loadAttireAccessoriesContent } from '@/lib/cms/attire-accessories'

export async function PillCategories() {
  const content = await loadAttireAccessoriesContent()

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full pt-0 md:pt-2">
        <h2 className="text-xl font-medium mb-6 text-gray-900">{content.heading}</h2>
        <div className="flex flex-nowrap gap-3 lg:gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          {content.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-none items-center gap-3 bg-white p-2 pr-4 lg:pr-6 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 group whitespace-nowrap"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-violet-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="text-sm font-medium text-gray-900 group-hover:underline">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
