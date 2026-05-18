import { loadAttireStandoutStylesContent } from '@/lib/cms/attire-standout-styles'

export async function StandoutStyles() {
  const content = await loadAttireStandoutStylesContent()

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 w-full">
      <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">{content.heading}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {content.items.map((style) => (
          <div key={style.id} className="group cursor-pointer flex flex-col">
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-2xl mb-3 shadow-sm border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={style.img} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="font-medium text-gray-900 group-hover:underline">{style.name}</h3>
            <p className="text-sm text-gray-600">{style.discount}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
